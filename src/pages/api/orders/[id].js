import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
    const { id } = req.query;

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
    );

    if (req.method === 'GET') {
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
                .eq('id', id)
                .single();

            if (error) throw error;
            return res.status(200).json(data);
        } catch (error) {
            console.error('Error fetching order:', error);
            return res.status(500).json({ error: error.message });
        }
    }

    if (req.method === 'PUT' || req.method === 'PATCH') {
        try {
            const { status, worker_id } = req.body;

            // Handle Worker Assignment
            if (worker_id) {
                // 1. Insert into worker_assignments
                const { error: assignError } = await supabase
                    .from('worker_assignments')
                    .insert({
                        order_id: id,
                        worker_id: worker_id,
                        status: 'Assigned'
                    });

                if (assignError) throw assignError;

                // 2. Update Order Status
                const { data, error: updateError } = await supabase
                    .from('orders')
                    .update({
                        status: 'Worker Assigned',
                        // worker_id: worker_id // Optional: if orders table has worker_id column for direct access
                    })
                    .eq('id', id)
                    .select();

                if (updateError) throw updateError;

                // 3. (Optional) Increment worker assigned count
                // This would typically require a stored procedure or separate query if not using triggers

                return res.status(200).json(data[0]);
            }

            // If we are just updating status
            if (status) {
                const { data, error } = await supabase
                    .from('orders')
                    .update({ status })
                    .eq('id', id)
                    .select();

                if (error) throw error;
                return res.status(200).json(data[0]);
            }

            // Generic update if body contains other fields
            const { data, error } = await supabase
                .from('orders')
                .update(req.body)
                .eq('id', id)
                .select();

            if (error) throw error;
            return res.status(200).json(data[0]);

        } catch (error) {
            console.error('Error updating order:', error);
            return res.status(500).json({ error: error.message });
        }
    }

    return res.status(405).json({ message: 'Method not allowed' });
}
