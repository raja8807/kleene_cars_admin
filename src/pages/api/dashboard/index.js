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
        // Parallelize detailed queries
        const [ordersCountRes, pendingCountRes, usersCountRes, completedOrdersRes, recentOrdersRes] = await Promise.all([
            supabase.from('orders').select('*', { count: 'exact', head: true }),
            supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'Pending'),
            supabase.from('users').select('*', { count: 'exact', head: true }),
            supabase.from('orders').select('total_amount, created_at').eq('status', 'Completed'),
            supabase.from('orders')
                .select(`id, status, total_amount, created_at, users (full_name)`)
                .order('created_at', { ascending: false })
                .limit(5)
        ]);

        // Check for errors
        if (ordersCountRes.error) throw ordersCountRes.error;
        if (pendingCountRes.error) throw pendingCountRes.error;
        if (usersCountRes.error) throw usersCountRes.error;
        if (completedOrdersRes.error) throw completedOrdersRes.error;
        if (recentOrdersRes.error) throw recentOrdersRes.error;

        const ordersCount = ordersCountRes.count;
        const pendingCount = pendingCountRes.count;
        const usersCount = usersCountRes.count;
        const revData = completedOrdersRes.data;
        const recentData = recentOrdersRes.data;

        // Calculate limit and revenue data
        let totalRevenue = 0;
        let revenueData = [];

        if (revData) {
            totalRevenue = revData.reduce((acc, curr) => acc + (curr.total_amount || 0), 0);

            // Process Weekly Data
            const last7Days = [...Array(7)].map((_, i) => {
                const d = new Date();
                d.setDate(d.getDate() - i);
                return {
                    date: d.toLocaleDateString('en-US', { weekday: 'short' }),
                    fullDate: d.toISOString().split('T')[0],
                    revenue: 0
                };
            }).reverse();

            revData.forEach(order => {
                const orderDate = order.created_at.split('T')[0];
                const day = last7Days.find(d => d.fullDate === orderDate);
                if (day) day.revenue += order.total_amount;
            });
            revenueData = last7Days;
        }

        return res.status(200).json({
            stats: {
                totalRevenue,
                totalOrders: ordersCount || 0,
                activeUsers: usersCount || 0,
                pendingOrders: pendingCount || 0
            },
            revenueData,
            recentOrders: recentData || []
        });

    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        return res.status(500).json({ error: error.message });
    }
}
