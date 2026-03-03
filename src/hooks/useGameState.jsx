import { createContext, useContext, useReducer, useEffect } from 'react';
import { WORLDS, ADVANCED_WORLDS, ALL_WORLDS } from '../data/levels';

const GameContext = createContext(null);

const STORAGE_KEY = 'vim-hero-save';

function getInitialState() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            return JSON.parse(saved);
        }
    } catch (e) { /* ignore */ }

    return {
        screen: 'menu', // 'menu' | 'map' | 'level-select' | 'game' | 'complete'
        currentWorldId: null,
        currentChallengeId: null,
        // Track progress: { [challengeId]: { completed: true, stars: 3 } }
        progress: {},
        // First world is always unlocked
        unlockedWorlds: ['enchanted-forest'],
        totalStars: 0,
    };
}

function reducer(state, action) {
    switch (action.type) {
        case 'NAVIGATE':
            return { ...state, screen: action.screen };

        case 'SELECT_WORLD':
            return {
                ...state,
                screen: 'level-select',
                currentWorldId: action.worldId,
            };

        case 'START_CHALLENGE':
            return {
                ...state,
                screen: 'game',
                currentChallengeId: action.challengeId,
            };

        case 'COMPLETE_CHALLENGE': {
            const { challengeId, stars } = action;
            const prev = state.progress[challengeId];
            const bestStars = prev ? Math.max(prev.stars, stars) : stars;

            const newProgress = {
                ...state.progress,
                [challengeId]: { completed: true, stars: bestStars },
            };

            // Calculate total stars
            const totalStars = Object.values(newProgress).reduce((s, p) => s + p.stars, 0);

            // Check if current world is complete → unlock next
            const currentWorld = ALL_WORLDS.find(w => w.id === state.currentWorldId);
            const worldComplete = currentWorld?.challenges.every(
                c => newProgress[c.id]?.completed
            );

            let unlockedWorlds = [...state.unlockedWorlds];
            if (worldComplete) {
                const currentIdx = ALL_WORLDS.findIndex(w => w.id === state.currentWorldId);
                if (currentIdx < ALL_WORLDS.length - 1) {
                    const nextWorldId = ALL_WORLDS[currentIdx + 1].id;
                    if (!unlockedWorlds.includes(nextWorldId)) {
                        unlockedWorlds.push(nextWorldId);
                    }
                }
            }

            return {
                ...state,
                screen: 'complete',
                progress: newProgress,
                unlockedWorlds,
                totalStars,
            };
        }

        case 'BACK_TO_MAP':
            return { ...state, screen: 'map', currentChallengeId: null };

        case 'BACK_TO_LEVELS':
            return { ...state, screen: 'level-select', currentChallengeId: null };

        case 'NEXT_CHALLENGE': {
            const world = ALL_WORLDS.find(w => w.id === state.currentWorldId);
            if (!world) return { ...state, screen: 'map' };
            const idx = world.challenges.findIndex(c => c.id === state.currentChallengeId);
            if (idx < world.challenges.length - 1) {
                return {
                    ...state,
                    screen: 'game',
                    currentChallengeId: world.challenges[idx + 1].id,
                };
            }
            // No more challenges in this world → back to map
            return { ...state, screen: 'map', currentChallengeId: null };
        }

        case 'KONAMI_UNLOCK':
            return {
                ...state,
                unlockedWorlds: ALL_WORLDS.map(w => w.id),
            };

        case 'RESET_PROGRESS':
            localStorage.removeItem(STORAGE_KEY);
            return getInitialState();

        default:
            return state;
    }
}

export function GameProvider({ children }) {
    const [state, dispatch] = useReducer(reducer, null, getInitialState);

    // Save to localStorage on every state change
    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        } catch (e) { /* ignore */ }
    }, [state]);

    return (
        <GameContext.Provider value={{ state, dispatch }}>
            {children}
        </GameContext.Provider>
    );
}

export function useGameState() {
    const ctx = useContext(GameContext);
    if (!ctx) throw new Error('useGameState must be used within GameProvider');
    return ctx;
}
