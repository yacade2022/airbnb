'use server'

import db from './db'
import { getSupabase } from "@/lib/supabase"
import { categoryHouses } from '@/lib/categoryHouses';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

type AddHomeValues = { title: string; location: string; description: string; price: string };

// values are sent back so the form can keep what the user typed (React resets it after the action)
export type AddHomeState = { error?: string; values?: AddHomeValues };

// Keep in sync with experimental.serverActions.bodySizeLimit in next.config.ts
const MAX_IMAGE_SIZE = 4 * 1024 * 1024;

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
        return { error: 'Please choose a valid category.', values };
    }
    if (!location) return { error: 'Please enter a location.', values };
    if (!description) return { error: 'Please enter a description.', values };
    if (!Number.isInteger(price) || price <= 0) {
        return { error: 'Price must be a whole number greater than 0.', values };
    }
    // An empty file input still submits a File with size 0
    if (!(imageFile instanceof File) || imageFile.size === 0) {
        return { error: 'Please choose an image.', values };
    }
    if (!imageFile.type.startsWith('image/')) {
        return { error: 'The uploaded file must be an image.', values };
    }
    if (imageFile.size > MAX_IMAGE_SIZE) {
        return { error: 'Image must be 4 MB or smaller.', values };
    }

    const supabase = getSupabase();
    let uploadedPath: string | undefined;

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

        await db.home.create({
            data: {
                location,
                title,
                description,
                price,
                photo: imageUrl
            }
        });
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
    redirect('/');
}

export const fetchAllHome = async (category?: string) => {
    const allHome = await db.home.findMany({
        // Home.title stores the category title chosen in the add-home form
        where: category ? { title: category } : undefined,
        orderBy: {
            createdAt: 'desc',
        },
    });
    return allHome;
}
