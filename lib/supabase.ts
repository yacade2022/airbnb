import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let client: SupabaseClient | undefined

// Created lazily so builds don't require the env vars, and only on the server
// (these vars have no NEXT_PUBLIC_ prefix, so they're never sent to the browser)
export function getSupabase() {
    if (!client) {
        const url = process.env.SUPABASE_URL
        const key = process.env.SUPABASE_ANON_KEY
        if (!url || !key) {
            throw new Error('SUPABASE_URL and SUPABASE_ANON_KEY must be set in .env')
        }
        client = createClient(url, key)
    }
    return client
}
