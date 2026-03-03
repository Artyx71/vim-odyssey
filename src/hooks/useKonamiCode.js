import { useState, useEffect, useCallback } from 'react';

// ↑ ↑ ↓ ↓ ← → ← → B A
const KONAMI_SEQUENCE = [
    'ArrowUp', 'ArrowUp',
    'ArrowDown', 'ArrowDown',
    'ArrowLeft', 'ArrowRight',
    'ArrowLeft', 'ArrowRight',
    'b', 'a',
];

export function useKonamiCode(onActivate) {
    const [index, setIndex] = useState(0);

    const handleKey = useCallback((e) => {
        const expected = KONAMI_SEQUENCE[index];
        if (e.key === expected || e.key.toLowerCase() === expected) {
            const nextIndex = index + 1;
            if (nextIndex === KONAMI_SEQUENCE.length) {
                setIndex(0);
                onActivate();
            } else {
                setIndex(nextIndex);
            }
        } else {
            setIndex(0);
        }
    }, [index, onActivate]);

    useEffect(() => {
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [handleKey]);
}
