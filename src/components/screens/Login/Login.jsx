import React, { useState } from "react";
import styles from "./Login.module.scss";
import { useAuth } from "@/components/auth/AuthContext";
import { CarFrontFill } from "react-bootstrap-icons";
import { useRouter } from "next/router";

const Login = () => {
    const { signIn } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const { user, session } = await signIn(email, password);
            if (user) {
                // AuthGuard will handle role check and redirection, 
                // but explicit push is safer for UX response
                router.push("/");
            }
        } catch (err) {
            console.error(err);
            setError(err.message || "Failed to sign in");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.loginWrapper}>
            <div className={styles.loginCard}>
                <div className={styles.header}>
                    <CarFrontFill className={styles.icon} />
                    <h1>Admin Portal</h1>
                    <p>Login to manage Kleene Cars</p>
                </div>

                {error && <div className={styles.error}>{error}</div>}

                <form onSubmit={handleLogin}>
                    <div className={styles.formGroup}>
                        <label>Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="admin@kleenecars.com"
                            required
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <button type="submit" className={styles.submitBtn} disabled={loading}>
                        {loading ? "Signing in..." : "Sign In"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
