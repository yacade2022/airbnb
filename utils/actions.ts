'use server'

import db from './db'
import { getSupabase } from "@/lib/supabase"
import { categoryHouses } from '@/lib/categoryHouses';
import { MAX_DESCRIPTION_LENGTH, MAX_IMAGE_SIZE, MAX_LOCATION_LENGTH } from '@/lib/listingRules';
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
