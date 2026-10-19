import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import ws from 'ws'

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
        // supabase-js builds a realtime client up front, which throws on Node < 22
        // (no global WebSocket) unless a WebSocket implementation is passed in.
        // The cast is needed because ws's overloaded constructor types don't match supabase's
        client = createClient(url, key, { realtime: { transport: ws as unknown as typeof WebSocket } })
    }
    return client
}
