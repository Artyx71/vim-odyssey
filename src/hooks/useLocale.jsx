import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import translations from '../data/i18n';

const LocaleContext = createContext(null);

const LOCALE_KEY = 'vim-hero-locale';

export function LocaleProvider({ children }) {
    const [locale, setLocale] = useState(() => {
        try {
            return localStorage.getItem(LOCALE_KEY) || 'ru';
        } catch {
            return 'ru';
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem(LOCALE_KEY, locale);
        } catch { /* ignore */ }
    }, [locale]);

    const toggleLocale = useCallback(() => {
        setLocale(prev => prev === 'ru' ? 'en' : 'ru');
    }, []);

    const t = useCallback((key) => {
        return translations[locale]?.[key] || translations['en']?.[key] || key;
    }, [locale]);

    return (
        <LocaleContext.Provider value={{ locale, toggleLocale, t }}>
            {children}
        </LocaleContext.Provider>
    );
}

export function useLocale() {
    const ctx = useContext(LocaleContext);
    if (!ctx) throw new Error('useLocale must be used within LocaleProvider');
    return ctx;
}
