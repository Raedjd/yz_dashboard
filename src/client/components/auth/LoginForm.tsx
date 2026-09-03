"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { loginUser } from "@/client/services/authorization/auth";
import { useSnackbar } from "@/client/shared/hooks/useSnackbar";
import Snackbar from "@/client/shared/components/Snackbar";


export default function LoginForm() {
    const [error, setError] = useState("");
    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");
    const [rememberMe, setRememberMe] = useState(false);
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
            const result = await loginUser(identifier, password);
            if (result.error != 401 && result.success && result.token) {
                setLoading(false);
                router.push("/dashboard");
            } else if (result.error == 401) {
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
        <div
            className="min-h-screen flex items-center relative overflow-hidden px-6 md:px-20"
            style={{
                backgroundImage:
                    "radial-gradient(circle, rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(135deg, #0b1220 0%, #0b1220 45%, #7a1350 85%, #d6146f 100%)",
                backgroundSize: "18px 18px, cover",
            }}
        >
            <div className="relative z-10 w-full flex items-center justify-between gap-16 max-w-6xl mx-auto">
                {/* Logo section */}
                <div className="hidden md:flex items-center gap-6">
                    <span className="text-white text-9xl font-light tracking-tight">Yooz</span>
                    <div className="relative w-32 h-32">
                        <div className="absolute inset-0 rotate-[-8deg] rounded-lg bg-[#2b6cb0] translate-x-4" />
                        <div className="absolute inset-0 rotate-[6deg] rounded-lg bg-[#2fbf9f] translate-y-2" />
                        <div className="absolute inset-0 rounded-lg bg-[#e11d74] flex items-center justify-center">
                            <svg className="w-14 h-14 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                                <path d="M12 3C9 6 6 9 6 13a6 6 0 0012 0c0-4-3-7-6-10z" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Login card */}
                <div className="w-full max-w-md bg-white rounded-xl shadow-2xl p-8">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <div className="rounded-lg p-3 text-sm flex items-center gap-2 bg-red-50 border border-red-200 text-red-600">
                                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {error}
                            </div>
                        )}

                        <div>
                            <label htmlFor="identifier" className="mb-2 block text-sm font-medium text-gray-500">
                                Email
                            </label>
                            <input
                                type="text"
                                id="identifier"
                                value={identifier}
                                onChange={(e) => setIdentifier(e.target.value)}
                                placeholder="Enter your email"
                                className="w-full rounded-md px-3 py-2.5 text-sm text-gray-800 border border-gray-300 outline-none transition-colors focus:border-[#e11d74] focus:ring-1 focus:ring-[#e11d74] placeholder:text-gray-400"
                                autoComplete="username"
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="mb-2 block text-sm font-medium text-gray-500">
                                Password
                            </label>
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter your password"
                                className="w-full rounded-md px-3 py-2.5 text-sm text-gray-800 border border-gray-300 outline-none transition-colors focus:border-[#e11d74] focus:ring-1 focus:ring-[#e11d74] placeholder:text-gray-400"
                                autoComplete="current-password"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full rounded-md px-4 py-3 text-sm font-bold uppercase tracking-wide text-white transition-opacity disabled:opacity-60"
                            style={{ background: "#e11d74" }}
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor"
                                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Connexion...
                                </span>
                            ) : (
                                "Connexion"
                            )}
                        </button>
                    </form>
                </div>
            </div>

            <Snackbar
                message={snackbar.message}
                type={snackbar.type}
                isVisible={snackbar.isVisible}
                onClose={hideSnackbar}
            />
        </div>
    );
}