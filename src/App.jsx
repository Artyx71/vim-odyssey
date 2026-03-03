import { useEffect } from 'react';
import { GameProvider, useGameState } from './hooks/useGameState';
import { LocaleProvider } from './hooks/useLocale';
import MainMenu from './components/MainMenu';
import WorldMap from './components/WorldMap';
import LevelSelect from './components/LevelSelect';
import GameScreen from './components/GameScreen';
import LevelComplete from './components/LevelComplete';
import AutoGameScreen from './components/AutoGameScreen';
import { audioEngine } from './engine/audioEngine';

function AppContent() {
    const { state } = useGameState();

    useEffect(() => {
        const html = document.documentElement;
        html.className = html.className.replace(/\btheme-\S+/g, '').trim();
        if (state.theme && state.theme !== 'default') {
            html.classList.add(`theme-${state.theme}`);
        }
        audioEngine.setEnabled(state.sfxEnabled);
    }, [state.theme, state.sfxEnabled]);

    switch (state.screen) {
        case 'menu':
            return <MainMenu />;
        case 'map':
            return <WorldMap />;
        case 'level-select':
            return <LevelSelect />;
        case 'game':
            return <GameScreen />;
        case 'complete':
            return <LevelComplete />;
        case 'auto-game':
            return <AutoGameScreen />;
        default:
            return <MainMenu />;
    }
}

function App() {
    return (
        <LocaleProvider>
            <GameProvider>
                <div className="app">
                    <AppContent />
                </div>
            </GameProvider>
        </LocaleProvider>
    );
}

export default App;
