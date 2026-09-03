"use client";
import React, { useState } from 'react'
import {useThemeStore} from "@/stores/theme";
import {useRouter} from "next/navigation";
import {useSnackbar} from "@/client@/shared/hooks/useSnackbar";
import {loginAdmin, loginUser} from "@/services/authorization/auth";

import Snackbar from "@/client/shared/components/Snackbar";




const SunIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
)

const MoonIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
    </svg>
)

const ShieldIcon = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
)

export function AdminLoginForm() {
    const { resolvedTheme, toggleTheme } = useThemeStore()
    const [error, setError] = useState("");
    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const {
        snackbar,
        snackbarError,
        hideSnackbar,
    } = useSnackbar();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!identifier.trim() || !password.trim()) {
            setError("Please fill in all fields");
            return;
        }

        setError("");

        try {
            setLoading(true);
            const result = await loginAdmin(identifier, password);
            if(result.error != 401 && result.success && result.token)
            {
                setLoading(false);
                router.push("/dashboard-admin");

            }else if (result.error == 401)
            {
                setLoading(false);
                setError("Invalid username or password!");
            } else {
                setLoading(false);
                snackbarError("An unexpected error occurred. Please try again.");
            }
        } catch (err) {
            setLoading(false);
            snackbarError("An unexpected error occurred. Please try again.");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-neutral-100 dark:bg-neutral-900 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl animate-float" />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-red-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '3s' }} />
            </div>

            {/* Theme toggle */}
            <button
                onClick={toggleTheme}
                className="absolute top-6 right-6 p-3 rounded-xl bg-white dark:bg-neutral-800 shadow-card hover:shadow-card-hover transition-all duration-300 hover:scale-105"
                aria-label={resolvedTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
                {resolvedTheme === 'dark' ? <SunIcon /> : <MoonIcon />}
            </button>

            {/* Login Card */}
            <div className="relative z-10 w-full max-w-md mx-4">
                <div className="card card-glass p-8">
                    {/* Admin Badge */}
                    <div className="flex items-center justify-center gap-2 mb-6">
                        <div className="flex items-center gap-2 px-4 py-2 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full text-sm font-medium">
                            <ShieldIcon />
                            <span>Platform Admin</span>
                        </div>
                    </div>

                    {/* Welcome Text */}
                    <div className="text-center mb-6">
                        <h1 className="text-2xl font-bold text-neutral-800 dark:text-neutral-100">
                            Admin Console
                        </h1>
                        <p className="text-neutral-500 dark:text-neutral-400 mt-1">
                            Sign in with your super admin credentials
                        </p>
                    </div>

                    {/* Login Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <div className="bg-error-light text-error-dark p-4 rounded-xl text-sm flex items-center gap-2">
                                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {error}
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                                Username or Email
                            </label>
                            <input
                                type="text"
                                value={identifier}
                                onChange={(e) => setIdentifier(e.target.value)}
                                className="input"
                                placeholder="admin"
                                autoComplete="username"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                                Password
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="input"
                                placeholder="Enter your password"
                                autoComplete="current-password"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn w-full py-3 bg-amber-600 hover:bg-amber-700 text-white"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Signing in...
                </span>
                            ) : (
                                'Sign In to Admin Console'
                            )}
                        </button>
                    </form>

                    {/* Footer */}
                    <p className="text-center text-sm text-neutral-500 dark:text-neutral-400 mt-6">
                        QAVerse Platform Administration
                    </p>
                </div>
            </div>
            {/* ========== SNACKBAR ========== */}
            <Snackbar
                message={snackbar.message}
                type={snackbar.type}
                isVisible={snackbar.isVisible}
                onClose={hideSnackbar}
            />
        </div>
    )
}

