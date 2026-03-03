import { useMemo } from 'react';

function VimEditor({ lines, cursor, mode, goalPositions, currentGoalIndex }) {
    const goalSet = useMemo(() => {
        const set = new Map();
        if (goalPositions) {
            goalPositions.forEach((g, idx) => {
                if (g.type === 'cursor_position' && idx >= currentGoalIndex) {
                    const key = `${g.line}-${g.col}`;
                    set.set(key, idx === currentGoalIndex ? 'current' : 'future');
                }
            });
        }
        return set;
    }, [goalPositions, currentGoalIndex]);

    return (
        <div className="vim-editor">
            <div className="vim-editor-bar">
                <span className="vim-editor-dot" />
                <span className="vim-editor-dot" />
                <span className="vim-editor-dot" />
                <span>vim-odyssey</span>
                <span className={`vim-editor-mode ${mode === 'insert' ? 'mode-insert' : 'mode-normal'}`}>
                    {mode === 'insert' ? '-- INSERT --' : 'NORMAL'}
                </span>
            </div>

            <div className="vim-lines">
                {lines.map((line, lineIdx) => (
                    <div key={lineIdx} className="vim-line">
                        <span className="vim-line-number">{lineIdx + 1}</span>
                        <span className="vim-line-content">
                            {(line.length === 0 ? [' '] : line.split('')).map((char, colIdx) => {
                                const isCursor = cursor.line === lineIdx && cursor.col === colIdx;
                                const goalKey = `${lineIdx}-${colIdx}`;
                                const goalType = goalSet.get(goalKey);
                                const isGoal = goalType === 'current';

                                let className = 'vim-char';
                                if (isCursor) className += ' vim-cursor';
                                if (isGoal) className += ' vim-goal-highlight';

                                return (
                                    <span key={colIdx} className={className}>
                                        {char}
                                    </span>
                                );
                            })}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default VimEditor;
