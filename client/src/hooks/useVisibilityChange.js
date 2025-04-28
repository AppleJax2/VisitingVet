import { useState, useEffect } from 'react';

/**
 * Custom hook to track document visibility state.
 * Returns true if the document is currently visible, false otherwise.
 */
export function useVisibilityChange() {
    const [isVisible, setIsVisible] = useState(!document.hidden);

    useEffect(() => {
        const handleVisibilityChange = () => {
            setIsVisible(!document.hidden);
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        // Initial check in case the state changes before the listener is attached
        setIsVisible(!document.hidden);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, []);

    return isVisible;
} 