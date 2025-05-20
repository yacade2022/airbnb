'use server'

import db from './db'
import { supabase } from "@/lib/supabase"
import { redirect } from 'next/navigation';

export async function addHomeToList(formData: FormData) {
    const title = formData.get('title') as string;
    const location = formData.get('location') as string;
    const description = formData.get('description') as string;
    const price = Number(formData.get('price') as string);
    const imageFile = formData.get('image') as File;

    // Add error handling for missing or invalid inputs
    if (!title || !description || isNaN(price) || !imageFile) {
        throw new Error('All fields are required and price must be a number');
    }

    try {
        // Get file content as ArrayBuffer
        const fileBuffer = await imageFile.arrayBuffer();
        
        // Sanitize the filename to remove special characters
        const sanitizedFilename = imageFile.name
            .replace(/[^a-zA-Z0-9.-]/g, '_')
            .replace(/__+/g, '_');
        
        const uniqueFilename = `${Date.now()}-${sanitizedFilename}`;

        // Handle image upload with error handling
        const { data: imageData, error } = await supabase.storage
            .from('image')
            .upload(uniqueFilename, new Uint8Array(fileBuffer), {
                contentType: imageFile.type
            });

        if (error) {
            console.error('Supabase storage error:', error);
            throw new Error(`Image upload failed: ${error.message}`);
        }

        if (!imageData?.path) {
            throw new Error('Image upload failed: No path returned');
        }

        // Get the public URL for the uploaded image
        const imageUrl = supabase.storage.from('image').getPublicUrl(imageData.path).data.publicUrl;

        // Create the database entry
        const data = await db.home.create({
            data: {
                location,
                title,
                description,
                price,
                photo: imageUrl // Store the public URL instead of just the path
            }
        });

        return redirect('/');
    } catch (error) {
        console.error('Error adding home to list:', error);
        throw error;
    }
}



export const fetchAllHome = async ()=>{
    const allHome = await db.home.findMany({
        orderBy: {
            createdAt: 'desc',
          },
        });
        return allHome;
    }

    // export const selectCategory = async () => {
    //     const category = await db.home.findUnique({
    //       where: { id: id },
    //     });
    //     return category;
    //   };
      