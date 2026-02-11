import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

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

    try {
        const { data, error } = await supabase
            .from('orders')
            .select(`
        *,
        users (full_name, phone),
        vehicles (brand, model, number, type),
        addresses (house, street, area, city, pincode),
        order_items (name, price, item_type)
      `)
            .order('created_at', { ascending: false });

        if (error) throw error;

        return res.status(200).json(data);
    } catch (error) {
        console.error('Error fetching orders:', error);
        return res.status(500).json({ error: error.message });
    }
}
