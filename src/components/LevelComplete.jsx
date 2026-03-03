import { useGameState } from '../hooks/useGameState';
import { useLocale } from '../hooks/useLocale';
import { ALL_WORLDS } from '../data/levels';

function LevelComplete() {
    const { state, dispatch } = useGameState();
    const { t } = useLocale();
    const world = ALL_WORLDS.find(w => w.id === state.currentWorldId);
    const challenge = world?.challenges.find(c => c.id === state.currentChallengeId);
    const progress = state.progress[state.currentChallengeId];

    if (!challenge || !progress) return null;

    const stars = progress.stars;
    const isLastChallenge = world.challenges[world.challenges.length - 1].id === challenge.id;

    const worldComplete = world.challenges.every(c => state.progress[c.id]?.completed);
    const currentWorldIdx = ALL_WORLDS.findIndex(w => w.id === world.id);
    const nextWorld = currentWorldIdx < ALL_WORLDS.length - 1 ? ALL_WORLDS[currentWorldIdx + 1] : null;

    return (
        <div className="level-complete">
            <div className="complete-content">
                <div className="complete-icon">
                    {stars === 3 ? '🏆' : stars === 2 ? '⚔️' : '🗡️'}
                </div>

                <h2 className="complete-title">{t(`complete.title.${stars}`)}</h2>
                <p className="complete-subtitle">{t(`complete.subtitle.${stars}`)}</p>

                <div className="complete-stars">
                    {[1, 2, 3].map(s => (
                        <span
                            key={s}
                            className="complete-star"
                            style={{ opacity: s <= stars ? 1 : 0.2 }}
                        >
                            ⭐
                        </span>
                    ))}
                </div>

                <div className="complete-stats">
                    <div>
                        <span className="complete-stat-value">{progress.stars}</span>
                        {t('complete.stars')}
                    </div>
                </div>

                {worldComplete && nextWorld && (
                    <p style={{
                        color: 'var(--emerald)',
                        marginBottom: 24,
                        fontFamily: 'var(--font-display)',
                        fontSize: 16,
                        animation: 'fadeIn 0.8s ease-out 1.2s both'
                    }}>
                        🔓 {t(`world.${nextWorld.id}`)} {t('complete.worldUnlocked')}
                    </p>
                )}

                <div className="complete-actions">
                    <button
                        className="btn btn-small"
                        onClick={() => dispatch({ type: 'BACK_TO_LEVELS' })}
                    >
                        {t('complete.levelSelect')}
                    </button>
                    {!isLastChallenge ? (
                        <button
                            className="btn btn-primary btn-small"
                            onClick={() => dispatch({ type: 'NEXT_CHALLENGE' })}
                        >
                            {t('complete.next')}
                        </button>
                    ) : (
                        <button
                            className="btn btn-primary btn-small"
                            onClick={() => dispatch({ type: 'BACK_TO_MAP' })}
                        >
                            {t('complete.worldMap')}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

export default LevelComplete;
