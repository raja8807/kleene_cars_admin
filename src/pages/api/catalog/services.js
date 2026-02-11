import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res) {
    // Create a new supabase client for each request
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
    )

    if (req.method === 'GET') {
        try {
            const { data, error } = await supabase
                .from('services')
                .select(`*, categories(name)`)
                .order('name');

            if (error) throw error;
            return res.status(200).json(data);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    if (req.method === 'POST') {
        try {
            const { data, error } = await supabase
                .from('services')
                .insert([req.body])
                .select();

            if (error) throw error;
            return res.status(201).json(data[0]);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    if (req.method === 'PUT') {
        try {
            const { id, ...updates } = req.body;
            const { data, error } = await supabase
                .from('services')
                .update(updates)
                .eq('id', id)
                .select();

            if (error) throw error;
            return res.status(200).json(data[0]);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    if (req.method === 'DELETE') {
        try {
            const { id } = req.query;
            const { error } = await supabase
                .from('services')
                .delete()
                .eq('id', id);

            if (error) throw error;
            return res.status(200).json({ message: 'Deleted successfully' });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    return res.status(405).json({ message: 'Method not allowed' });
}
