
export function checkGoals(state, goals, currentGoalIndex) {
    if (!goals || currentGoalIndex >= goals.length) {
        return { completed: true, goalAdvanced: false };
    }

    const goal = goals[currentGoalIndex];

    switch (goal.type) {
        case 'cursor_position':
            if (state.cursor.line === goal.line && state.cursor.col === goal.col) {
                return {
                    completed: currentGoalIndex >= goals.length - 1,
                    goalAdvanced: true,
                };
            }
            return { completed: false, goalAdvanced: false };

        case 'text_match':
            if (state.lines[goal.line] === goal.text) {
                return {
                    completed: currentGoalIndex >= goals.length - 1,
                    goalAdvanced: true,
                };
            }
            return { completed: false, goalAdvanced: false };

        case 'text_content':
            const expected = goal.expectedLines;
            if (
                state.lines.length === expected.length &&
                state.lines.every((l, i) => l === expected[i])
            ) {
                return {
                    completed: currentGoalIndex >= goals.length - 1,
                    goalAdvanced: true,
                };
            }
            return { completed: false, goalAdvanced: false };

        default:
            return { completed: false, goalAdvanced: false };
    }
}

export function calculateStars(keystrokeCount, maxKeystrokes) {
    if (keystrokeCount <= maxKeystrokes.three) return 3;
    if (keystrokeCount <= maxKeystrokes.two) return 2;
    return 1;
}
