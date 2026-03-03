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

            {/* Settings controls */}
            <div style={{ position: 'absolute', top: 20, right: 32, display: 'flex', gap: 12, alignItems: 'center', zIndex: 10 }}>
                <button
                    className="lang-toggle"
                    onClick={() => dispatch({ type: 'TOGGLE_SFX' })}
                    title="Toggle Sound"
                >
                    {state.sfxEnabled ? '🔊' : '🔇'}
                </button>
                <select
                    className="lang-toggle"
                    style={{ appearance: 'none', cursor: 'pointer' }}
                    value={state.theme}
                    onChange={(e) => dispatch({ type: 'SET_THEME', theme: e.target.value })}
                    title="Theme"
                >
                    <option value="default">🌙 Adventure</option>
                    {state.totalStars >= 10 ? <option value="dracula">🦇 Dracula</option> : <option disabled>🦇 Dracula (10⭐)</option>}
                    {state.totalStars >= 20 ? <option value="gruvbox">📦 Gruvbox</option> : <option disabled>📦 Gruvbox (20⭐)</option>}
                    {state.totalStars >= 30 ? <option value="nord">❄️ Nord</option> : <option disabled>❄️ Nord (30⭐)</option>}
                </select>
                <button
                    className="lang-toggle"
                    onClick={toggleLocale}
                    title="Switch language"
                >
                    {t('lang.switch')}
                </button>
            </div>

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
