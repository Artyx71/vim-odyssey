import { useState, useEffect, useCallback, useRef } from 'react';
import { useGameState } from '../hooks/useGameState';
import { useLocale } from '../hooks/useLocale';
import { ALL_WORLDS } from '../data/levels';
import { createVimState, processKeystroke } from '../engine/vimEngine';
import { checkGoals, calculateStars } from '../engine/goalChecker';
import { audioEngine } from '../engine/audioEngine';
import VimEditor from './VimEditor';

function GameScreen() {
    const { state: gameState, dispatch } = useGameState();
    const { t } = useLocale();
    const world = ALL_WORLDS.find(w => w.id === gameState.currentWorldId);
    const challenge = world?.challenges.find(c => c.id === gameState.currentChallengeId);

    const [vimState, setVimState] = useState(null);
    const [currentGoalIndex, setCurrentGoalIndex] = useState(0);
    const [showHint, setShowHint] = useState(false);
    const [lastKey, setLastKey] = useState(null);
    const [completed, setCompleted] = useState(false);
    const keyFlashRef = useRef(null);

    // Initialize vim state when challenge changes
    useEffect(() => {
        if (challenge) {
            setVimState(createVimState(challenge.textContent, challenge.cursorStart));
            setCurrentGoalIndex(0);
            setShowHint(false);
            setCompleted(false);
            setLastKey(null);
        }
    }, [challenge?.id]);

    // Show hint after delay
    useEffect(() => {
        if (!challenge) return;
        const timer = setTimeout(() => setShowHint(true), 5000);
        return () => clearTimeout(timer);
    }, [challenge?.id]);

    // Key handler
    const handleKey = useCallback((e) => {
        if (!vimState || completed || !challenge) return;

        let key = null;

        if (e.key === 'Escape') {
            key = 'Escape';
        } else if (e.ctrlKey && e.key === 'd') {
            e.preventDefault();
            key = 'Ctrl+d';
        } else if (e.ctrlKey && e.key === 'u') {
            e.preventDefault();
            key = 'Ctrl+u';
        } else if (vimState.mode === 'insert') {
            if (e.key === 'Backspace') {
                key = 'Backspace';
            } else if (e.key.length === 1) {
                key = e.key;
            }
        } else if (vimState.pendingKey) {
            if (e.key.length === 1) {
                key = e.key;
            }
        } else {
            if (e.key.length === 1) {
                key = e.key;
            }
        }

        if (key === null) return;
        e.preventDefault();

        setLastKey(key);
        if (keyFlashRef.current) clearTimeout(keyFlashRef.current);
        keyFlashRef.current = setTimeout(() => setLastKey(null), 400);

        const newState = processKeystroke(vimState, key, challenge.allowedKeys);
        setVimState(newState);

        // Play click sound for any valid registered keystroke
        if (newState !== vimState) {
            audioEngine.playKeystroke();
        } else {
            audioEngine.playError();
        }

        // Check goals
        if (newState.mode !== 'insert') {
            const result = checkGoals(newState, challenge.goals, currentGoalIndex);
            if (result.goalAdvanced) {
                audioEngine.playSuccess();
                if (result.completed) {
                    setCompleted(true);
                    const stars = calculateStars(newState.keystrokeCount, challenge.maxKeystrokes);
                    setTimeout(() => {
                        dispatch({ type: 'COMPLETE_CHALLENGE', challengeId: challenge.id, stars });
                    }, 600);
                } else {
                    setCurrentGoalIndex(prev => prev + 1);
                }
            }
        }
        if (challenge.goals[currentGoalIndex]?.type === 'text_match' ||
            challenge.goals[currentGoalIndex]?.type === 'text_content') {
            const result = checkGoals(newState, challenge.goals, currentGoalIndex);
            if (result.goalAdvanced) {
                audioEngine.playSuccess();
                if (result.completed) {
                    setCompleted(true);
                    const stars = calculateStars(newState.keystrokeCount, challenge.maxKeystrokes);
                    setTimeout(() => {
                        dispatch({ type: 'COMPLETE_CHALLENGE', challengeId: challenge.id, stars });
                    }, 600);
                } else {
                    setCurrentGoalIndex(prev => prev + 1);
                }
            }
        }
    }, [vimState, challenge, currentGoalIndex, completed, dispatch]);

    useEffect(() => {
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [handleKey]);

    if (!challenge || !vimState) return null;

    const goalCount = challenge.goals.length;

    return (
        <div className="game-screen">
            {/* Header */}
            <div className="game-header">
                <button
                    className="back-btn"
                    onClick={() => dispatch({ type: 'BACK_TO_LEVELS' })}
                >
                    {t('game.back')}
                </button>
                <div className="game-header-info">
                    <h2 className="game-header-title">{t(`challenge.${challenge.id}.title`)}</h2>
                    <p className="game-header-desc">{t(`challenge.${challenge.id}.desc`)}</p>
                </div>
                <div className="game-stats">
                    <div className="game-stat">
                        <span>⌨️</span>
                        <span className="game-stat-value">{vimState.keystrokeCount}</span>
                    </div>
                    <div className="game-stat">
                        <span>🎯</span>
                        <span className="game-stat-value">{currentGoalIndex}/{goalCount}</span>
                    </div>
                    {vimState.mode === 'insert' && (
                        <div className="game-stat">
                            <span className="vim-editor-mode mode-insert" style={{ fontSize: 11 }}>INSERT</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Story text */}
            <div className="game-story">{t(`challenge.${challenge.id}.story`)}</div>

            {/* Game body */}
            <div className="game-body">
                <VimEditor
                    lines={vimState.lines}
                    cursor={vimState.cursor}
                    mode={vimState.mode}
                    goalPositions={challenge.goals}
                    currentGoalIndex={currentGoalIndex}
                />
            </div>

            {/* Bottom panel */}
            <div className="game-bottom">
                {/* Key instructions with descriptions */}
                <div className="game-keys-section">
                    <div className="game-keys-label">{t('game.availableMotions')}</div>
                    <div className="game-keys-list">
                        {challenge.allowedKeys.map(k => (
                            <span
                                key={k}
                                className={`key-badge-desc ${lastKey === k ? 'key-pressed' : ''}`}
                                title={t(`key.${k}`)}
                            >
                                <span className="key-badge-key">{k}</span>
                                <span className="key-badge-info">{t(`key.${k}`).split(' — ')[1] || k}</span>
                            </span>
                        ))}
                    </div>
                </div>

                {showHint && (
                    <div className="game-hint">
                        <span className="hint-icon">💡</span>
                        <span>{t(`hint.${challenge.id}`)}</span>
                    </div>
                )}

                {goalCount > 1 && (
                    <div className="game-goal-indicator">
                        <span>{t('game.goals')}:</span>
                        {challenge.goals.map((_, idx) => (
                            <span
                                key={idx}
                                className={`goal-step ${idx < currentGoalIndex ? 'goal-done' : ''} ${idx === currentGoalIndex ? 'goal-current' : ''}`}
                            >
                                {idx < currentGoalIndex ? '✓' : idx + 1}
                            </span>
                        ))}
                    </div>
                )}
            </div>

            {lastKey && (
                <div key={Date.now()} className="key-flash">{lastKey}</div>
            )}
        </div>
    );
}

export default GameScreen;
