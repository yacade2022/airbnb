'use server'

import db from './db'
import { getSupabase } from "@/lib/supabase"
import { categoryHouses } from '@/lib/categoryHouses';
import { MAX_DESCRIPTION_LENGTH, MAX_IMAGE_SIZE, MAX_LOCATION_LENGTH } from '@/lib/listingRules';
import { MAX_GUESTS, MAX_NIGHTS, addDays, nightsBetween, parseDateInput } from '@/lib/reservationRules';
import { getGuestId, getOrCreateGuestId } from '@/lib/guest';
import { Prisma } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

type AddHomeValues = { title: string; location: string; description: string; price: string };
export type AddHomeField = keyof AddHomeValues | 'image';

// values are sent back so the form can keep what the user typed (React resets it after the action);
// field names the input the error belongs to, so the form can highlight and focus it
export type AddHomeState = { error?: string; field?: AddHomeField; values?: AddHomeValues };

export async function addHomeToList(
    _prevState: AddHomeState,
    formData: FormData
): Promise<AddHomeState> {
    const title = String(formData.get('title') ?? '').trim();
    const location = String(formData.get('location') ?? '').trim();
    const description = String(formData.get('description') ?? '').trim();
    const priceInput = String(formData.get('price') ?? '').trim();
    const price = Number(priceInput);
    const imageFile = formData.get('image');
    const values = { title, location, description, price: priceInput };

    // Validate on the server - client-side `required` attributes can be bypassed
    if (!categoryHouses.some((category) => category.title === title)) {
        return { error: 'Please choose a valid category.', field: 'title', values };
    }
    if (!location) return { error: 'Please enter a location.', field: 'location', values };
    if (location.length > MAX_LOCATION_LENGTH) {
        return { error: `Location must be ${MAX_LOCATION_LENGTH} characters or fewer.`, field: 'location', values };
    }
    if (!description) return { error: 'Please enter a description.', field: 'description', values };
    if (description.length > MAX_DESCRIPTION_LENGTH) {
        return { error: `Description must be ${MAX_DESCRIPTION_LENGTH} characters or fewer.`, field: 'description', values };
    }
    if (!Number.isInteger(price) || price <= 0) {
        return { error: 'Price must be a whole number greater than 0.', field: 'price', values };
    }
    // An empty file input still submits a File with size 0
    if (!(imageFile instanceof File) || imageFile.size === 0) {
        return { error: 'Please choose an image.', field: 'image', values };
    }
    if (!imageFile.type.startsWith('image/')) {
        return { error: 'The uploaded file must be an image.', field: 'image', values };
    }
    if (imageFile.size > MAX_IMAGE_SIZE) {
        return { error: 'Image must be 4 MB or smaller.', field: 'image', values };
    }

    const supabase = getSupabase();
    let uploadedPath: string | undefined;
    let homeId: string;

    try {
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
            return { error: 'Image upload failed. Please try again.', values };
        }
        uploadedPath = imageData.path;

        const imageUrl = supabase.storage.from('image').getPublicUrl(uploadedPath).data.publicUrl;

        const home = await db.home.create({
            data: {
                location,
                title,
                description,
                price,
                photo: imageUrl
            }
        });
        homeId = home.id;
    } catch (error) {
        console.error('Error adding home to list:', error);
        // Don't leave an orphaned image behind if the database write failed
        if (uploadedPath) {
            await supabase.storage.from('image').remove([uploadedPath]);
        }
        return { error: 'Something went wrong while saving your home. Please try again.', values };
    }

    // redirect() throws internally, so it must stay outside the try/catch
    revalidatePath('/');
    // created=1 lets the listing page show a confirmation that the home was saved
    redirect(`/homes/${homeId}?created=1`);
}

export const fetchAllHome = async (category?: string, search?: string) => {
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
    };
    const allHome = await db.home.findMany({
        where: Object.keys(where).length ? where : undefined,
        orderBy: {
            createdAt: 'desc',
        },
    });
    return allHome;
}

export const fetchHomeById = async (id: string) => {
    return db.home.findUnique({ where: { id } });
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

    try {
        // Serializable so two people booking the same dates at once can't both pass the overlap check
        const result = await db.$transaction(async (tx) => {
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

        if ('error' in result) return { error: result.error, field: 'checkIn', values };
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
