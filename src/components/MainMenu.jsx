import { useState, useCallback } from 'react';
import { useGameState } from '../hooks/useGameState';
import { useLocale } from '../hooks/useLocale';
import { useKonamiCode } from '../hooks/useKonamiCode';
import Particles from './Particles';

function MainMenu() {
    const { state, dispatch } = useGameState();
    const { t, toggleLocale } = useLocale();
    const hasProgress = Object.keys(state.progress).length > 0;
    const [konamiActive, setKonamiActive] = useState(false);

    const handleKonami = useCallback(() => {
        dispatch({ type: 'KONAMI_UNLOCK' });
        setKonamiActive(true);
        setTimeout(() => setKonamiActive(false), 3000);
    }, [dispatch]);

    useKonamiCode(handleKonami);

    return (
        <div className="main-menu">
            <Particles />

            {/* Language toggle */}
            <button
                className="lang-toggle"
                onClick={toggleLocale}
                title="Switch language"
            >
                {t('lang.switch')}
            </button>

            <div className="menu-logo">
                <span className="menu-icon">⚔️</span>
                <h1 className="menu-title">{t('menu.title')}</h1>
                <p className="menu-subtitle">{t('menu.subtitle')}</p>
            </div>
            <div className="menu-actions">
                {hasProgress ? (
                    <>
                        <button
                            className="btn btn-primary"
                            onClick={() => dispatch({ type: 'NAVIGATE', screen: 'map' })}
                        >
                            {t('menu.continue')}
                        </button>
                        <button
                            className="btn"
                            onClick={() => {
                                dispatch({ type: 'RESET_PROGRESS' });
                                dispatch({ type: 'NAVIGATE', screen: 'map' });
                            }}
                        >
                            {t('menu.newGame')}
                        </button>
                    </>
                ) : (
                    <button
                        className="btn btn-primary"
                        onClick={() => dispatch({ type: 'NAVIGATE', screen: 'map' })}
                    >
                        {t('menu.begin')}
                    </button>
                )}
            </div>

            {hasProgress && (
                <div style={{ marginTop: 32, animation: 'fadeIn 1s ease-out 0.9s both' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: 14, fontFamily: 'var(--font-mono)' }}>
                        ⭐ {state.totalStars} {t('menu.starsCollected')}
                    </span>
                </div>
            )}

            {konamiActive && (
                <div className="konami-toast">
                    {t('menu.konamiUnlocked')}
                </div>
            )}
        </div>
    );
}

export default MainMenu;
