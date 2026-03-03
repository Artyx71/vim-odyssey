import { useGameState } from '../hooks/useGameState';
import { useLocale } from '../hooks/useLocale';
import { ALL_WORLDS } from '../data/levels';

function LevelSelect() {
    const { state, dispatch } = useGameState();
    const { t } = useLocale();
    const world = ALL_WORLDS.find(w => w.id === state.currentWorldId);

    if (!world) return null;

    const isChallengeUnlocked = (idx) => {
        if (idx === 0) return true;
        const prevChallenge = world.challenges[idx - 1];
        return !!state.progress[prevChallenge.id]?.completed;
    };

    return (
        <div className="level-select">
            <div className="level-header">
                <button
                    className="back-btn"
                    onClick={() => dispatch({ type: 'BACK_TO_MAP' })}
                >
                    {t('map.back')}
                </button>
                <div className="level-header-info">
                    <h2 className="level-header-title">
                        <span>{world.icon}</span> {t(`world.${world.id}`)}
                    </h2>
                    <p className="level-header-subtitle">{t(`world.${world.id}.desc`)}</p>
                </div>
            </div>

            <div className="level-story">
                {t(`world.${world.id}.story`)}
            </div>

            <div className="level-list">
                {world.challenges.map((challenge, idx) => {
                    const unlocked = isChallengeUnlocked(idx);
                    const progress = state.progress[challenge.id];

                    return (
                        <div
                            key={challenge.id}
                            className={`challenge-card ${!unlocked ? 'challenge-locked' : ''} ${progress?.completed ? 'challenge-completed' : ''}`}
                            style={{ animationDelay: `${idx * 0.08}s` }}
                            onClick={() => {
                                if (unlocked) dispatch({ type: 'START_CHALLENGE', challengeId: challenge.id });
                            }}
                        >
                            <div className="challenge-number">
                                {!unlocked ? '🔒' : progress?.completed ? '✓' : idx + 1}
                            </div>
                            <div className="challenge-info">
                                <h3 className="challenge-title">{t(`challenge.${challenge.id}.title`)}</h3>
                                <p className="challenge-desc">{t(`challenge.${challenge.id}.desc`)}</p>
                            </div>
                            <div className="challenge-stars">
                                {[1, 2, 3].map(s => (
                                    <span
                                        key={s}
                                        className={s <= (progress?.stars || 0) ? 'star-filled' : 'star-empty'}
                                    >
                                        ★
                                    </span>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default LevelSelect;
