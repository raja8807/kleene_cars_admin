import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/router";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [role, setRole] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Initial Load
        const initSession = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (session?.user) {
                    await fetchProfile(session.user.id, session.user);
                } else {
                    setLoading(false);
                }
            } catch (err) {
                console.error("Session check failed", err);
                setLoading(false);
            }
        };

        initSession();

        // Listen for changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            if (session?.user) {
                // Only fetch if user changed or role not set
                if (session.user.id !== user?.id) {
                    await fetchProfile(session.user.id, session.user);
                }

                console.log(session);


            } else {
                setUser(null);
                setRole(null);
                setLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const fetchProfile = async (userId, authUser) => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const response = await fetch('/api/auth/profile', {
                headers: {
                    'Authorization': `Bearer ${session?.access_token}`
                }
            });

            if (response.ok) {
                const profile = await response.json();
                setUser(authUser);
                setRole(profile?.role || 'customer');
            } else {
                console.warn("Profile fetch failed");
                setUser(authUser);
                setRole('customer');
            }
        } catch (err) {
            console.error("Profile fetch error:", err);
            setUser(authUser);
            setRole('customer');
        } finally {
            setLoading(false);
        }
    };

    const signIn = async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        return data;
    };

    const signOut = async () => {
        await supabase.auth.signOut();
        setUser(null);
        setRole(null);
        window.location.href = '/login'; // Hard redirect to clear any state
    };

    const value = {
        user,
        role,
        loading,
        isAdmin: role === 'admin',
        signIn,
        signOut,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);

export const AuthGuard = ({ children }) => {
    const { user, role, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading) {
            if (!user) {
                router.push('/login');
            } else if (role !== 'admin') {
                // Prevent non-admins
                // Optional: signOut() to force them to login as admin?
                // Or just show Access Denied
            }
        }
    }, [user, role, loading, router]);

    if (loading) {
        return <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'white' }}>Loading...</div>;
    }

    if (!user || role !== 'admin') {
        // If redirect hasn't happened yet (useEffect lag), show nothing or denied msg
        if (!user) return null;
        return (
            <div style={{ padding: 40, color: 'white', textAlign: 'center' }}>
                <h1>Access Denied</h1>
                <p>You do not have permission to view this page.</p>
                <button onClick={() => supabase.auth.signOut().then(() => router.push('/login'))} style={{ marginTop: 20, padding: '10px 20px' }}>
                    Go to Login
                </button>
            </div>
        );
    }

    return children;
};
