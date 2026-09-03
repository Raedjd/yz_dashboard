// components/ui/Snackbar.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, AlertTriangle, X } from 'lucide-react';

type SnackbarType = 'success' | 'error' | 'warning' | 'info';

interface SnackbarProps {
    message: string;
    type: SnackbarType;
    isVisible: boolean;
    onClose: () => void;
    duration?: number;
}

export default function Snackbar({
                                     message,
                                     type,
                                     isVisible,
                                     onClose,
                                     duration = 4000,
                                 }: SnackbarProps) {
    const [show, setShow] = useState(isVisible);

    useEffect(() => {
        setShow(isVisible);
        if (isVisible && duration > 0) {
            const timer = setTimeout(() => {
                setShow(false);
                onClose();
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [isVisible, duration, onClose]);

    if (!show) return null;

    const typeStyles = {
        success: 'bg-green-50 border-green-200 text-green-800',
        error: 'bg-red-50 border-red-200 text-red-800',
        warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
        info: 'bg-blue-50 border-blue-200 text-blue-800',
    };

    const icons = {
        success: <CheckCircle className="w-5 h-5" />,
        error: <XCircle className="w-5 h-5" />,
        warning: <AlertTriangle className="w-5 h-5" />,
        info: <AlertTriangle className="w-5 h-5" />,
    };

    return (
        <div className="fixed top-6 right-6 z-50 animate-in slide-in-from-right-10 duration-300">
            <div
                className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg min-w-[300px] max-w-md ${typeStyles[type]}`}
            >
                <div className="flex-shrink-0">{icons[type]}</div>
                <div className="flex-1 text-sm font-medium">{message}</div>
                <button
                    onClick={() => {
                        setShow(false);
                        onClose();
                    }}
                    className="flex-shrink-0 p-1 hover:opacity-70 transition-opacity"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}