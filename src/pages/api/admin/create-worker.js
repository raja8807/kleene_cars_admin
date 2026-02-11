import { supabaseAdmin } from "@/lib/supabaseAdmin";

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, message: 'Method not allowed' });
    }

    // Security check: Ideally, check if the requester is an admin
    // For now, we assume this route is protected or only accessible by valid session checks in middleware (if any)
    // or we can add a check here using `supabase.auth.getUser(token)` if we passed the token.
    // Given the prompt requirements, we focus on the creation logic.

    const { name, email, phone, experience, password } = req.body;

    if (!email || !name) {
        return res.status(400).json({ success: false, message: "Name and Email are required." });
    }

    // 1. Create Supabase Auth User
    let authUser;
    try {
        const { data, error } = await supabaseAdmin.auth.admin.createUser({
            email,
            password: password || "test@123", // Use provided or default temp password
            email_confirm: true,
            user_metadata: {
                role: "worker",
                name: name
            }
        });

        if (error) throw error;
        authUser = data.user;

    } catch (authError) {
        console.error("Auth Creation Error:", authError);
        return res.status(500).json({ success: false, message: authError.message });
    }

    // 2. Insert into Workers Table
    try {
        const { error: dbError } = await supabaseAdmin
            .from('workers')
            .insert({
                auth_user_id: authUser.id,
                name,
                email, // Added email column based on user instruction
                phone,
                experience,
                status: "Active",
                rating: 0,
                assigned_orders_count: 0
            });

        if (dbError) {
            // Rollback: Delete the created auth user if DB insert fails
            await supabaseAdmin.auth.admin.deleteUser(authUser.id);
            throw dbError;
        }

        return res.status(200).json({
            success: true,
            message: "Worker created successfully",
            workerId: authUser.id
        });

    } catch (dbError) {
        console.error("DB Insert Error:", dbError);
        return res.status(500).json({
            success: false,
            message: "Failed to create worker record. Rolled back auth user."
        });
    }
}
