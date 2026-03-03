import { useState, useEffect, useCallback, useRef } from 'react';
import { useGameState } from '../hooks/useGameState';
import { useLocale } from '../hooks/useLocale';
import { generateRandomLevel } from '../engine/levelGenerator';
import { createVimState, processKeystroke } from '../engine/vimEngine';
import { checkGoals, calculateStars } from '../engine/goalChecker';
import VimEditor from './VimEditor';

function AutoGameScreen() {
    const { dispatch } = useGameState();
    const { t, locale } = useLocale();
    const [challenge, setChallenge] = useState(null);
    const [vimState, setVimState] = useState(null);
    const [currentGoalIndex, setCurrentGoalIndex] = useState(0);
    const [showHint, setShowHint] = useState(false);
    const [lastKey, setLastKey] = useState(null);
    const [completed, setCompleted] = useState(false);
    const [stars, setStars] = useState(0);
    const keyFlashRef = useRef(null);

    const generateNew = useCallback(() => {
        const level = generateRandomLevel();
        setChallenge(level);
        setVimState(createVimState(level.textContent, level.cursorStart));
        setCurrentGoalIndex(0);
        setShowHint(false);
        setCompleted(false);
        setStars(0);
        setLastKey(null);
    }, []);

    useEffect(() => {
        generateNew();
    }, [generateNew]);

    useEffect(() => {
        if (!challenge) return;
        const timer = setTimeout(() => setShowHint(true), 5000);
        return () => clearTimeout(timer);
    }, [challenge?.id]);

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
            if (e.key === 'Backspace') key = 'Backspace';
            else if (e.key.length === 1) key = e.key;
        } else if (vimState.pendingKey) {
            if (e.key.length === 1) key = e.key;
        } else {
            if (e.key.length === 1) key = e.key;
        }

        if (key === null) return;
        e.preventDefault();

        setLastKey(key);
        if (keyFlashRef.current) clearTimeout(keyFlashRef.current);
        keyFlashRef.current = setTimeout(() => setLastKey(null), 400);

        const newState = processKeystroke(vimState, key, challenge.allowedKeys);
        setVimState(newState);

        const result = checkGoals(newState, challenge.goals, currentGoalIndex);
        if (result.goalAdvanced) {
            if (result.completed) {
                setCompleted(true);
                const s = calculateStars(newState.keystrokeCount, challenge.maxKeystrokes);
                setStars(s);
            } else {
                setCurrentGoalIndex(prev => prev + 1);
            }
        }
    }, [vimState, challenge, currentGoalIndex, completed]);

    useEffect(() => {
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [handleKey]);

    if (!challenge || !vimState) return null;

    const title = typeof challenge.title === 'object' ? challenge.title[locale] : challenge.title;
    const desc = typeof challenge.description === 'object' ? challenge.description[locale] : challenge.description;
    const story = typeof challenge.storyText === 'object' ? challenge.storyText[locale] : challenge.storyText;

    return (
        <div className="game-screen">
            <div className="game-header">
                <button
                    className="back-btn"
                    onClick={() => dispatch({ type: 'NAVIGATE', screen: 'map' })}
                >
                    {t('game.back')}
                </button>
                <div className="game-header-info">
                    <h2 className="game-header-title">🎲 {title}</h2>
                    <p className="game-header-desc">{desc}</p>
                </div>
                <div className="game-stats">
                    <div className="game-stat">
                        <span>⌨️</span>
                        <span className="game-stat-value">{vimState.keystrokeCount}</span>
                    </div>
                    <div className="game-stat">
                        <span>🎯</span>
                        <span className="game-stat-value">{currentGoalIndex}/{challenge.goals.length}</span>
                    </div>
                </div>
            </div>

            <div className="game-story">{story}</div>

            <div className="game-body">
                <VimEditor
                    lines={vimState.lines}
                    cursor={vimState.cursor}
                    mode={vimState.mode}
                    goalPositions={challenge.goals}
                    currentGoalIndex={currentGoalIndex}
                />
            </div>

            {completed && (
                <div className="auto-complete-overlay">
                    <div className="auto-complete-content">
                        <div className="complete-icon">{stars === 3 ? '🏆' : stars === 2 ? '⚔️' : '🗡️'}</div>
                        <h2 className="complete-title">{t(`complete.title.${stars}`)}</h2>
                        <div className="complete-stars">
                            {[1, 2, 3].map(s => (
                                <span key={s} className="complete-star" style={{ opacity: s <= stars ? 1 : 0.2 }}>⭐</span>
                            ))}
                        </div>
                        <div className="complete-actions" style={{ marginTop: 24 }}>
                            <button className="btn btn-small" onClick={() => dispatch({ type: 'NAVIGATE', screen: 'map' })}>
                                {t('complete.worldMap')}
                            </button>
                            <button className="btn btn-primary btn-small" onClick={generateNew}>
                                {t('auto.again')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="game-bottom">
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
                                <span className="key-badge-info">{(t(`key.${k}`).split(' — ')[1]) || k}</span>
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            {lastKey && (
                <div key={Date.now()} className="key-flash">{lastKey}</div>
            )}
        </div>
    );
}

export default AutoGameScreen;
