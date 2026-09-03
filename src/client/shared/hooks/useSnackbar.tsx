'use client';

import { useState, useCallback } from 'react';

type SnackbarType = 'success' | 'error' | 'warning' | 'info';

interface SnackbarState {
    isVisible: boolean;
    message: string;
    type: SnackbarType;
}

export function useSnackbar() {
    const [snackbar, setSnackbar] = useState<SnackbarState>({
        isVisible: false,
        message: '',
        type: 'info',
    });

    const showSnackbar = useCallback((message: string, type: SnackbarType = 'info') => {
        setSnackbar({
            isVisible: true,
            message,
            type,
        });
    }, []);

    const hideSnackbar = useCallback(() => {
        setSnackbar((prev) => ({ ...prev, isVisible: false }));
    }, []);

    const snackbarSuccess = useCallback(
        (message: string) => showSnackbar(message, 'success'),
        [showSnackbar]
    );

    const snackbarError = useCallback(
        (message: string) => showSnackbar(message, 'error'),
        [showSnackbar]
    );

    const snackbarWarning = useCallback(
        (message: string) => showSnackbar(message, 'warning'),
        [showSnackbar]
    );

    return {
        snackbar,
        snackbarSuccess,
        snackbarError,
        snackbarWarning,
        showSnackbar,
        hideSnackbar,
    };
}