'use server'

import db from './db'
import { getSupabase } from "@/lib/supabase"
import { categoryHouses } from '@/lib/categoryHouses';
import { MAX_DESCRIPTION_LENGTH, MAX_IMAGE_SIZE, MAX_LOCATION_LENGTH } from '@/lib/listingRules';
import { MAX_GUESTS, MAX_NIGHTS, addDays, nightsBetween, parseDateInput } from '@/lib/reservationRules';
import { getGuestId, getOrCreateGuestId } from '@/lib/guest';
import { canManageHome, getCurrentUser, isAdmin } from '@/lib/auth';
import { loginPath, safeNextPath } from '@/lib/authRules';
import { Prisma } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

type AddHomeValues = { title: string; location: string; description: string; price: string };
export type AddHomeField = keyof AddHomeValues | 'image';

// values are sent back so the form can keep what the user typed (React resets it after the action);
// field names the input the error belongs to, so the form can highlight and focus it
export type AddHomeState = { error?: string; field?: AddHomeField; values?: AddHomeValues };

type ListingFields = { title: string; location: string; description: string; price: number; image?: File };

// Validate on the server - client-side `required` attributes can be bypassed.
// The image is optional when editing, where leaving it empty keeps the current photo
function parseListingForm(
    formData: FormData,
    { imageRequired }: { imageRequired: boolean }
): { fields: ListingFields; values: AddHomeValues } | { state: AddHomeState } {
    const title = String(formData.get('title') ?? '').trim();
    const location = String(formData.get('location') ?? '').trim();
    const description = String(formData.get('description') ?? '').trim();
    const priceInput = String(formData.get('price') ?? '').trim();
    const price = Number(priceInput);
    const imageFile = formData.get('image');
    const values = { title, location, description, price: priceInput };
    const fail = (error: string, field: AddHomeField) => ({ state: { error, field, values } });

    if (!categoryHouses.some((category) => category.title === title)) {
        return fail('Please choose a valid category.', 'title');
    }
    if (!location) return fail('Please enter a location.', 'location');
    if (location.length > MAX_LOCATION_LENGTH) {
        return fail(`Location must be ${MAX_LOCATION_LENGTH} characters or fewer.`, 'location');
    }
    if (!description) return fail('Please enter a description.', 'description');
    if (description.length > MAX_DESCRIPTION_LENGTH) {
        return fail(`Description must be ${MAX_DESCRIPTION_LENGTH} characters or fewer.`, 'description');
    }
    if (!Number.isInteger(price) || price <= 0) {
        return fail('Price must be a whole number greater than 0.', 'price');
    }
    // An empty file input still submits a File with size 0
    if (!(imageFile instanceof File) || imageFile.size === 0) {
        if (imageRequired) return fail('Please choose an image.', 'image');
        return { fields: { title, location, description, price }, values };
    }
    if (!imageFile.type.startsWith('image/')) {
        return fail('The uploaded file must be an image.', 'image');
    }
    if (imageFile.size > MAX_IMAGE_SIZE) {
        return fail('Image must be 4 MB or smaller.', 'image');
    }
    return { fields: { title, location, description, price, image: imageFile }, values };
}

// Returns the storage path and public URL, or undefined if the upload failed
async function uploadListingImage(imageFile: File) {
    const supabase = getSupabase();
    // Sanitize the filename to remove special characters
    const sanitizedFilename = imageFile.name
        .replace(/[^a-zA-Z0-9.-]/g, '_')
        .replace(/__+/g, '_');

    const uniqueFilename = `${Date.now()}-${sanitizedFilename}`;

    const { data: imageData, error } = await supabase.storage
        .from('image')
        .upload(uniqueFilename, new Uint8Array(await imageFile.arrayBuffer()), {
            contentType: imageFile.type
        });

    if (error || !imageData?.path) {
        console.error('Supabase storage error:', error);
        return undefined;
    }
    return {
        path: imageData.path,
        url: supabase.storage.from('image').getPublicUrl(imageData.path).data.publicUrl,
    };
}

const PUBLIC_IMAGE_PREFIX = '/storage/v1/object/public/image/';

// Takes public URLs; best effort, since a leftover image file is harmless, so failures are only logged
async function removeListingImages(photoUrls: string[]) {
    const paths = photoUrls.flatMap((url) => {
        const index = url.indexOf(PUBLIC_IMAGE_PREFIX);
        return index === -1 ? [] : [decodeURIComponent(url.slice(index + PUBLIC_IMAGE_PREFIX.length))];
    });
    if (!paths.length) return;
    try {
        const { error } = await getSupabase().storage.from('image').remove(paths);
        if (error) console.error('Supabase storage remove error:', error);
    } catch (error) {
        console.error('Supabase storage remove error:', error);
    }
}

export async function addHomeToList(
    _prevState: AddHomeState,
    formData: FormData
): Promise<AddHomeState> {
    // Checked before anything else: only logged-in users can list a home
    const user = await getCurrentUser();
    if (!user) redirect(loginPath('/addHomeToList'));

    const parsed = parseListingForm(formData, { imageRequired: true });
    if ('state' in parsed) return parsed.state;
    const { fields, values } = parsed;

    let uploadedPath: string | undefined;
    let homeId: string;

    try {
        const upload = await uploadListingImage(fields.image!);
        if (!upload) return { error: 'Image upload failed. Please try again.', values };
        uploadedPath = upload.path;

        const home = await db.home.create({
            data: {
                location: fields.location,
                title: fields.title,
                description: fields.description,
                price: fields.price,
                photo: upload.url,
                ownerId: user.id,
            }
        });
        homeId = home.id;
    } catch (error) {
        console.error('Error adding home to list:', error);
        // Don't leave an orphaned image behind if the database write failed
        if (uploadedPath) {
            await getSupabase().storage.from('image').remove([uploadedPath]);
        }
        return { error: 'Something went wrong while saving your home. Please try again.', values };
    }

    // redirect() throws internally, so it must stay outside the try/catch
    revalidatePath('/');
    // created=1 lets the listing page show a confirmation that the home was saved
    redirect(`/homes/${homeId}?created=1`);
}

// homeId comes from a hidden field, so it's only trusted after the ownership check below
export async function updateHome(
    _prevState: AddHomeState,
    formData: FormData
): Promise<AddHomeState> {
    const homeId = String(formData.get('homeId') ?? '');
    const user = await getCurrentUser();
    if (!user) redirect(loginPath(`/homes/${homeId}/edit`));

    const home = await db.home.findUnique({ where: { id: homeId }, select: { ownerId: true, photo: true } });
    if (!home) return { error: 'This listing no longer exists.' };
    if (!canManageHome(user, home)) return { error: 'You can only edit your own listings.' };

    const parsed = parseListingForm(formData, { imageRequired: false });
    if ('state' in parsed) return parsed.state;
    const { fields, values } = parsed;

    let upload: Awaited<ReturnType<typeof uploadListingImage>>;
    try {
        if (fields.image) {
            upload = await uploadListingImage(fields.image);
            if (!upload) return { error: 'Image upload failed. Please try again.', values };
        }
        // ownerId isn't in the update, so editing (even by the admin) never changes who owns a listing
        await db.home.update({
            where: { id: homeId },
            data: {
                title: fields.title,
                location: fields.location,
                description: fields.description,
                price: fields.price,
                ...(upload && { photo: upload.url }),
            },
        });
    } catch (error) {
        console.error('Error updating home:', error);
        if (upload) await removeListingImages([upload.url]);
        return { error: 'Something went wrong while saving your changes. Please try again.', values };
    }
    // The old photo is only removed once the new one is saved
    if (upload) await removeListingImages([home.photo]);

    revalidatePath('/', 'layout');
    redirect(`/homes/${homeId}?updated=1`);
}

// Bound to a home id. returnTo is where to go afterwards, needed when deleting from the listing's own page
export async function deleteHome(homeId: string, returnTo?: string) {
    const user = await getCurrentUser();
    if (!user) redirect(loginPath(`/homes/${homeId}`));

    const home = await db.home.findUnique({ where: { id: homeId }, select: { ownerId: true, photo: true } });
    if (!home || !canManageHome(user, home)) return;

    // Favorites and reservations for the home are removed with it (onDelete: Cascade)
    await db.home.delete({ where: { id: homeId } });
    await removeListingImages([home.photo]);

    revalidatePath('/', 'layout');
    if (returnTo) redirect(safeNextPath(returnTo));
}

export const fetchAllHome = async (category?: string, search?: string, dates?: { checkIn: Date; checkOut: Date }) => {
    const query = search?.trim();
    const where = {
        // Home.title stores the category title chosen in the add-home form
        ...(category && { title: category }),
        ...(query && {
            OR: [
                { location: { contains: query, mode: 'insensitive' as const } },
                { description: { contains: query, mode: 'insensitive' as const } },
            ],
        }),
        // Free for the whole stay: no reservation overlaps it (check-out days are exclusive)
        ...(dates && {
            reservations: { none: { checkIn: { lt: dates.checkOut }, checkOut: { gt: dates.checkIn } } },
        }),
    };
    const allHome = await db.home.findMany({
        where: Object.keys(where).length ? where : undefined,
        orderBy: {
            createdAt: 'desc',
        },
    });
    return allHome;
}

// Only the owner's name is public, never their email
export const fetchHomeById = async (id: string) => {
    return db.home.findUnique({ where: { id }, include: { owner: { select: { name: true } } } });
}

// ---- Listings owned by the logged-in user ----

export const fetchMyHomes = async () => {
    const user = await getCurrentUser();
    if (!user) return [];
    return db.home.findMany({ where: { ownerId: user.id }, orderBy: { createdAt: 'desc' } });
}

// ---- Admin ----
// Everything exported from a 'use server' file can be called directly from the browser,
// so each of these checks the role itself instead of relying on the admin page's guard

export const fetchAdminHomes = async () => {
    if (!isAdmin(await getCurrentUser())) return [];
    return db.home.findMany({
        include: { owner: { select: { name: true, email: true } } },
        orderBy: { createdAt: 'desc' },
    });
}

export const fetchAdminUsers = async () => {
    if (!isAdmin(await getCurrentUser())) return [];
    return db.user.findMany({
        select: { id: true, name: true, email: true, role: true, createdAt: true, _count: { select: { homes: true } } },
        orderBy: { createdAt: 'asc' },
    });
}

// Removes the account, its sessions and its listings. Admin accounts can't be deleted here,
// so the admin can't lock themselves out; admin rights are managed with scripts/make-admin.mjs
export async function deleteUser(userId: string) {
    if (!isAdmin(await getCurrentUser())) return;

    const target = await db.user.findUnique({
        where: { id: userId },
        select: { role: true, homes: { select: { photo: true } } },
    });
    if (!target || target.role === 'ADMIN') return;

    // Sessions and listings go with the account (onDelete: Cascade)
    await db.user.delete({ where: { id: userId } });
    await removeListingImages(target.homes.map((home) => home.photo));
    revalidatePath('/', 'layout');
}

// ---- Favorites ----

// Bound to a home id in FavoriteButton; adds the home if it isn't a favorite yet, otherwise removes it
export async function toggleFavorite(homeId: string) {
    const guestId = await getOrCreateGuestId();
    const where = { guestId_homeId: { guestId, homeId } };

    const existing = await db.favorite.findUnique({ where });
    if (existing) {
        await db.favorite.delete({ where });
    } else {
        if (!(await db.home.findUnique({ where: { id: homeId }, select: { id: true } }))) return;
        try {
            await db.favorite.create({ data: { guestId, homeId } });
        } catch (error) {
            // P2002: a double click already saved it, which is the result we wanted
            if (!(error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002')) throw error;
        }
    }
    // Favorite hearts show on the home grid, listing pages and /favorites
    revalidatePath('/', 'layout');
}

// Visitors without a guest cookie have no favorites yet, so nothing is queried
export const fetchFavoriteIds = async () => {
    const guestId = await getGuestId();
    if (!guestId) return new Set<string>();
    const favorites = await db.favorite.findMany({ where: { guestId }, select: { homeId: true } });
    return new Set(favorites.map((favorite) => favorite.homeId));
}

export const fetchFavoriteHomes = async () => {
    const guestId = await getGuestId();
    if (!guestId) return [];
    const favorites = await db.favorite.findMany({
        where: { guestId },
        include: { home: true },
        orderBy: { createdAt: 'desc' },
    });
    return favorites.map((favorite) => favorite.home);
}

// ---- Reservations ----

const MAX_BOOKING_ATTEMPTS = 3;

// P2034: Postgres aborted a serializable transaction because a concurrent one conflicted with it.
// Retrying re-runs the transaction's checks, which then see the other transaction's writes
async function retryOnConflict<T>(run: () => Promise<T>) {
    for (let attempt = 1; ; attempt++) {
        try {
            return await run();
        } catch (error) {
            const conflict = error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2034';
            if (!conflict || attempt >= MAX_BOOKING_ATTEMPTS) throw error;
        }
    }
}

type ReservationValues = { checkIn: string; checkOut: string; guests: string };
export type ReservationField = keyof ReservationValues;
export type ReservationState = { error?: string; field?: ReservationField; values?: ReservationValues };

// homeId comes from a hidden field (not .bind) so the form's error state also works without JavaScript;
// it's only trusted after the home is looked up below
export async function createReservation(
    _prevState: ReservationState,
    formData: FormData
): Promise<ReservationState> {
    const homeId = String(formData.get('homeId') ?? '');
    const values = {
        checkIn: String(formData.get('checkIn') ?? ''),
        checkOut: String(formData.get('checkOut') ?? ''),
        guests: String(formData.get('guests') ?? '').trim(),
    };

    // Checked before anything else: only logged-in users can book. The return link carries the
    // chosen dates and guests so the form is filled in again after logging in
    if (!(await getCurrentUser())) {
        const params = new URLSearchParams();
        for (const [key, value] of Object.entries(values)) if (value) params.set(key, value);
        const query = params.toString();
        redirect(loginPath(`/homes/${encodeURIComponent(homeId)}${query ? `?${query}` : ''}`));
    }

    const checkIn = parseDateInput(values.checkIn);
    const checkOut = parseDateInput(values.checkOut);
    const guests = Number(values.guests);

    if (!checkIn) return { error: 'Please choose a check-in date.', field: 'checkIn', values };
    // One day of slack: the visitor's "today" can be a day behind the server's UTC date
    if (checkIn < addDays(parseDateInput(new Date().toISOString().slice(0, 10))!, -1)) {
        return { error: 'Check-in can’t be in the past.', field: 'checkIn', values };
    }
    if (!checkOut) return { error: 'Please choose a check-out date.', field: 'checkOut', values };
    const nights = nightsBetween(checkIn, checkOut);
    if (nights < 1) return { error: 'Check-out must be after check-in.', field: 'checkOut', values };
    if (nights > MAX_NIGHTS) {
        return { error: `Stays can be at most ${MAX_NIGHTS} nights.`, field: 'checkOut', values };
    }
    if (!Number.isInteger(guests) || guests < 1 || guests > MAX_GUESTS) {
        return { error: `Guests must be a whole number from 1 to ${MAX_GUESTS}.`, field: 'guests', values };
    }

    const guestId = await getOrCreateGuestId();
    let reservationId: string;

    // Serializable so two people booking the same dates at once can't both pass the overlap check
    const book = () => db.$transaction(async (tx) => {
        const home = await tx.home.findUnique({ where: { id: homeId }, select: { price: true } });
        if (!home) return { error: 'This home is no longer available.' };

        // Two stays overlap when each starts before the other ends; checking out the day
        // someone else checks in is fine
        const clash = await tx.reservation.findFirst({
            where: { homeId, checkIn: { lt: checkOut }, checkOut: { gt: checkIn } },
            select: { id: true },
        });
        if (clash) return { error: 'Those dates are already booked. Please choose different dates.' };

        const reservation = await tx.reservation.create({
            data: { guestId, homeId, checkIn, checkOut, guests, totalPrice: nights * home.price },
        });
        return { id: reservation.id };
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });

    try {
        const result = await retryOnConflict(book);
        if ('error' in result) {
            // Someone else's booking may be newer than the calendar the visitor saw, so refresh it
            revalidatePath(`/homes/${homeId}`);
            return { error: result.error, field: 'checkIn', values };
        }
        reservationId = result.id;
    } catch (error) {
        console.error('Error creating reservation:', error);
        return { error: 'Something went wrong while booking. Please try again.', values };
    }

    revalidatePath('/reservations');
    revalidatePath(`/homes/${homeId}`);
    // booked lets the reservations page highlight the new booking
    redirect(`/reservations?booked=${reservationId}`);
}

// Bound to a reservation id; guestId in the filter means visitors can only cancel their own
export async function cancelReservation(reservationId: string) {
    const guestId = await getGuestId();
    if (!guestId) return;
    const { count } = await db.reservation.deleteMany({ where: { id: reservationId, guestId } });
    if (count) revalidatePath('/', 'layout');
}

export const fetchReservations = async () => {
    const guestId = await getGuestId();
    if (!guestId) return [];
    return db.reservation.findMany({
        where: { guestId },
        include: { home: true },
        orderBy: { checkIn: 'asc' },
    });
}

// Upcoming booked dates for a home, without who booked them, so the booking form can show them
export const fetchBookedDates = async (homeId: string) => {
    return db.reservation.findMany({
        where: { homeId, checkOut: { gt: new Date() } },
        select: { checkIn: true, checkOut: true },
        orderBy: { checkIn: 'asc' },
    });
}
