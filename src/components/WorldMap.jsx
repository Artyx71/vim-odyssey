import { useGameState } from '../hooks/useGameState';
import { useLocale } from '../hooks/useLocale';
import { WORLDS, ADVANCED_WORLDS } from '../data/levels';
import Particles from './Particles';

const WORLD_COLORS = {
    'enchanted-forest': 'var(--forest)',
    'crystal-caves': 'var(--caves)',
    'dragons-peak': 'var(--mountain)',
    'mystic-river': 'var(--river)',
    'shadow-ruins': 'var(--ruins)',
    'storm-citadel': 'var(--storm)',
    'frozen-wastes': 'var(--ice)',
    'final-temple': 'var(--temple)',
    'insert-mastery': '#a78bfa',
    'operator-dojo': '#f59e0b',
    'search-sanctum': '#8b5cf6',
    'visual-arena': '#ef4444',
};

function WorldSection({ title, worlds, state, dispatch, t }) {
    const getWorldProgress = (world) => {
        let completed = 0;
        let stars = 0;
        world.challenges.forEach(c => {
            if (state.progress[c.id]) {
                completed++;
                stars += state.progress[c.id].stars;
            }
        });
        return { completed, total: world.challenges.length, stars, maxStars: world.challenges.length * 3 };
    };

    return (
        <div className="map-section">
            <h3 className="map-section-title">{title}</h3>
            <div className="map-grid">
                {worlds.map((world) => {
                    const unlocked = state.unlockedWorlds.includes(world.id);
                    const progress = getWorldProgress(world);

                    return (
                        <div
                            key={world.id}
                            className={`world-card ${!unlocked ? 'world-locked' : ''}`}
                            style={{ '--world-color': WORLD_COLORS[world.id] || 'var(--gold)' }}
                            onClick={() => {
                                if (unlocked) dispatch({ type: 'SELECT_WORLD', worldId: world.id });
                            }}
                        >
                            {!unlocked && <span className="lock-icon">🔒</span>}
                            <span className="world-card-icon">{world.icon}</span>
                            <h3 className="world-card-name">{t(`world.${world.id}`) || world.name}</h3>
                            <p className="world-card-desc">{t(`world.${world.id}.desc`) || world.description}</p>

                            <div className="world-card-motions">
                                {world.motions.map(m => (
                                    <span key={m} className="motion-tag">{m}</span>
                                ))}
                            </div>

                            <div className="world-card-progress">
                                <div className="world-progress-bar">
                                    <div
                                        className="world-progress-fill"
                                        style={{ width: `${(progress.completed / progress.total) * 100}%` }}
                                    />
                                </div>
                                <span>{progress.completed}/{progress.total}</span>
                                <span>⭐ {progress.stars}</span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function WorldMap() {
    const { state, dispatch } = useGameState();
    const { t, toggleLocale } = useLocale();

    return (
        <div className="world-map">
            <Particles />

            <div className="map-header">
                <h2 className="map-header-title">🗺️ {t('map.title')}</h2>
                <div className="map-stars-total">
                    ⭐ {state.totalStars} {t('map.stars')}
                </div>
                <button className="lang-toggle lang-toggle-inline" onClick={toggleLocale}>
                    {t('lang.switch')}
                </button>
                <button
                    className="back-btn"
                    onClick={() => dispatch({ type: 'NAVIGATE', screen: 'menu' })}
                >
                    {t('map.menu')}
                </button>
            </div>

            <div className="map-content">
                <WorldSection
                    title={t('map.basicTitle')}
                    worlds={WORLDS}
                    state={state}
                    dispatch={dispatch}
                    t={t}
                />

                <WorldSection
                    title={t('map.advancedTitle')}
                    worlds={ADVANCED_WORLDS}
                    state={state}
                    dispatch={dispatch}
                    t={t}
                />

                {/* Auto-Generate Button */}
                <div className="map-section">
                    <h3 className="map-section-title">{t('map.autoGenTitle')}</h3>
                    <div className="map-grid">
                        <div
                            className="world-card auto-gen-card"
                            onClick={() => dispatch({ type: 'NAVIGATE', screen: 'auto-game' })}
                        >
                            <span className="world-card-icon">🎲</span>
                            <h3 className="world-card-name">{t('map.autoGenName')}</h3>
                            <p className="world-card-desc">{t('map.autoGenDesc')}</p>
                            <div className="auto-gen-badge">{t('map.autoGenBadge')}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default WorldMap;
