import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    // Initialize client with user's token for RLS, or use service role if this is strictly admin-only and RLS blocks it.
    // For admin panel, usually safe to use service role OR standard client if user is admin.
    // Prompt asked for "Workers List Page" -> "Use dummy data for now" originally, but now we are replacing it.
    // We'll use the standard client pattern here, assuming RLS allows read.
    // However, since we might need to read all workers regardless of the user's specific context (as an admin),
    // and we haven't set up complex RLS policies yet, using the anon key + RLS or service role depends on security posture.
    // Let's stick to the pattern used in other API routes (createClient per request with auth header).

    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        {
            global: {
                headers: {
                    Authorization: req.headers.authorization,
                },
            },
        }
    );

    try {
        const { data, error } = await supabase
            .from('workers')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        return res.status(200).json(data);
    } catch (error) {
        console.error("Error fetching workers:", error);
        return res.status(500).json({ error: error.message });
    }
}
