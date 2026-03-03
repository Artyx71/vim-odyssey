
export function createVimState(textContent, cursorStart) {
    return {
        lines: [...textContent],
        cursor: { ...cursorStart },
        mode: 'normal', // 'normal' | 'insert' | 'pending'
        pendingKey: null, // for multi-key commands like 'f{char}', 'gg', 'dd', etc.
        register: null,   // yanked text
        keystrokeCount: 0,
        insertBuffer: '',
        history: [],
    };
}

export function clampCursor(state) {
    const { lines, cursor } = state;
    const line = Math.max(0, Math.min(cursor.line, lines.length - 1));
    const maxCol = Math.max(0, (lines[line]?.length || 1) - 1);
    const col = Math.max(0, Math.min(cursor.col, maxCol));
    return { ...state, cursor: { line, col } };
}

function findWordForward(line, col) {
    let i = col;
    // skip current word chars
    while (i < line.length && line[i] !== ' ') i++;
    // skip spaces
    while (i < line.length && line[i] === ' ') i++;
    return Math.min(i, line.length - 1);
}

function findWordBackward(line, col) {
    let i = col;
    // skip spaces before
    if (i > 0) i--;
    while (i > 0 && line[i] === ' ') i--;
    // skip word chars
    while (i > 0 && line[i - 1] !== ' ') i--;
    return Math.max(0, i);
}

function findWordEnd(line, col) {
    let i = col;
    if (i < line.length - 1) i++;
    // skip spaces
    while (i < line.length && line[i] === ' ') i++;
    // go to end of word
    while (i < line.length - 1 && line[i + 1] !== ' ') i++;
    return Math.min(i, line.length - 1);
}

function findCharForward(line, col, char) {
    for (let i = col + 1; i < line.length; i++) {
        if (line[i] === char) return i;
    }
    return col; // not found
}

function findCharBackward(line, col, char) {
    for (let i = col - 1; i >= 0; i--) {
        if (line[i] === char) return i;
    }
    return col; // not found
}

function findTilForward(line, col, char) {
    const pos = findCharForward(line, col, char);
    return pos > col ? pos - 1 : col;
}

function findTilBackward(line, col, char) {
    const pos = findCharBackward(line, col, char);
    return pos < col ? pos + 1 : col;
}

const MATCHING_PAIRS = { '(': ')', '{': '}', '[': ']', '"': '"', "'": "'" };
const CLOSING_TO_OPENING = { ')': '(', '}': '{', ']': '[' };

function findTextObjectBounds(line, col, openChar) {
    const closeChar = MATCHING_PAIRS[openChar] || openChar;

    // Find opening
    let start = -1;
    if (openChar === '"' || openChar === "'") {
        // For quotes, find first occurrence before or at col, then next after
        let firstQuote = -1;
        let secondQuote = -1;
        for (let i = 0; i < line.length; i++) {
            if (line[i] === openChar) {
                if (firstQuote === -1) {
                    firstQuote = i;
                } else if (secondQuote === -1) {
                    secondQuote = i;
                    if (col >= firstQuote && col <= secondQuote) {
                        return { start: firstQuote + 1, end: secondQuote - 1 };
                    }
                    firstQuote = -1;
                    secondQuote = -1;
                }
            }
        }
        return null;
    }

    // For brackets
    let depth = 0;
    for (let i = col; i >= 0; i--) {
        if (line[i] === closeChar && i !== col) depth++;
        if (line[i] === openChar) {
            if (depth === 0) { start = i; break; }
            depth--;
        }
    }
    if (start === -1) return null;

    depth = 0;
    for (let i = start + 1; i < line.length; i++) {
        if (line[i] === openChar) depth++;
        if (line[i] === closeChar) {
            if (depth === 0) return { start: start + 1, end: i - 1 };
            depth--;
        }
    }
    return null;
}

export function processKeystroke(state, key, allowedKeys = []) {
    let newState = { ...state, lines: [...state.lines], cursor: { ...state.cursor } };

    // Handle ESC key
    if (key === 'Escape') {
        if (newState.mode === 'insert') {
            newState.mode = 'normal';
            newState.keystrokeCount++;
            return clampCursor(newState);
        }
        newState.pendingKey = null;
        return newState;
    }

    // Handle insert mode
    if (newState.mode === 'insert') {
        if (key === 'Backspace') {
            const { line, col } = newState.cursor;
            if (col > 0) {
                const l = newState.lines[line];
                newState.lines[line] = l.slice(0, col - 1) + l.slice(col);
                newState.cursor.col = col - 1;
            }
        } else if (key.length === 1) {
            const { line, col } = newState.cursor;
            const l = newState.lines[line];
            newState.lines[line] = l.slice(0, col) + key + l.slice(col);
            newState.cursor.col = col + 1;
        }
        newState.keystrokeCount++;
        return newState;
    }

    // Handle pending keys for multi-char commands
    if (newState.pendingKey) {
        const pending = newState.pendingKey;
        newState.pendingKey = null;
        newState.keystrokeCount++;

        if (pending === 'f' && key.length === 1) {
            newState.cursor.col = findCharForward(newState.lines[newState.cursor.line], newState.cursor.col, key);
            return clampCursor(newState);
        }
        if (pending === 'F' && key.length === 1) {
            newState.cursor.col = findCharBackward(newState.lines[newState.cursor.line], newState.cursor.col, key);
            return clampCursor(newState);
        }
        if (pending === 't' && key.length === 1) {
            newState.cursor.col = findTilForward(newState.lines[newState.cursor.line], newState.cursor.col, key);
            return clampCursor(newState);
        }
        if (pending === 'T' && key.length === 1) {
            newState.cursor.col = findTilBackward(newState.lines[newState.cursor.line], newState.cursor.col, key);
            return clampCursor(newState);
        }
        if (pending === 'g' && key === 'g') {
            newState.cursor = { line: 0, col: 0 };
            return newState;
        }
        if (pending === 'd' && key === 'd') {
            // dd — delete line
            if (newState.lines.length > 1) {
                newState.register = { type: 'line', text: newState.lines[newState.cursor.line] };
                newState.lines.splice(newState.cursor.line, 1);
                if (newState.cursor.line >= newState.lines.length) {
                    newState.cursor.line = newState.lines.length - 1;
                }
            } else {
                newState.register = { type: 'line', text: newState.lines[0] };
                newState.lines[0] = '';
            }
            newState.cursor.col = 0;
            return clampCursor(newState);
        }
        if (pending === 'y' && key === 'y') {
            newState.register = { type: 'line', text: newState.lines[newState.cursor.line] };
            return newState;
        }
        // Text object commands: ci(, di", yi{, etc.
        if ((pending === 'ci' || pending === 'di' || pending === 'yi') && key.length === 1) {
            const openChar = CLOSING_TO_OPENING[key] || key;
            const bounds = findTextObjectBounds(newState.lines[newState.cursor.line], newState.cursor.col, openChar);
            if (bounds && bounds.start <= bounds.end) {
                const line = newState.lines[newState.cursor.line];
                const innerText = line.slice(bounds.start, bounds.end + 1);

                if (pending === 'di' || pending === 'ci') {
                    newState.lines[newState.cursor.line] = line.slice(0, bounds.start) + line.slice(bounds.end + 1);
                    newState.cursor.col = bounds.start;
                    newState.register = { type: 'text', text: innerText };
                }
                if (pending === 'yi') {
                    newState.register = { type: 'text', text: innerText };
                }
                if (pending === 'ci') {
                    newState.mode = 'insert';
                }
            }
            return clampCursor(newState);
        }
        // c or d pending waiting for 'i' (for ci, di text objects)
        if (pending === 'c' && key === 'i') {
            newState.pendingKey = 'ci';
            return newState;
        }
        if (pending === 'd' && key === 'i') {
            newState.pendingKey = 'di';
            return newState;
        }
        if (pending === 'y' && key === 'i') {
            newState.pendingKey = 'yi';
            return newState;
        }

        return newState; // unknown combo, ignore
    }

    newState.keystrokeCount++;

    // Normal mode single-key commands
    switch (key) {
        case 'h':
            newState.cursor.col = Math.max(0, newState.cursor.col - 1);
            break;
        case 'l':
            newState.cursor.col = Math.min((newState.lines[newState.cursor.line]?.length || 1) - 1, newState.cursor.col + 1);
            break;
        case 'j':
            newState.cursor.line = Math.min(newState.lines.length - 1, newState.cursor.line + 1);
            break;
        case 'k':
            newState.cursor.line = Math.max(0, newState.cursor.line - 1);
            break;
        case 'w':
            newState.cursor.col = findWordForward(newState.lines[newState.cursor.line], newState.cursor.col);
            break;
        case 'b':
            newState.cursor.col = findWordBackward(newState.lines[newState.cursor.line], newState.cursor.col);
            break;
        case 'e':
            newState.cursor.col = findWordEnd(newState.lines[newState.cursor.line], newState.cursor.col);
            break;
        case '0':
            newState.cursor.col = 0;
            break;
        case '$':
            newState.cursor.col = Math.max(0, (newState.lines[newState.cursor.line]?.length || 1) - 1);
            break;
        case '^': {
            const ln = newState.lines[newState.cursor.line] || '';
            const match = ln.match(/\S/);
            newState.cursor.col = match ? ln.indexOf(match[0]) : 0;
            break;
        }
        case 'G':
            newState.cursor.line = newState.lines.length - 1;
            newState.cursor.col = 0;
            break;
        case 'x': {
            const { line, col } = newState.cursor;
            const l = newState.lines[line];
            if (l.length > 0) {
                newState.lines[line] = l.slice(0, col) + l.slice(col + 1);
                if (newState.cursor.col >= newState.lines[line].length && newState.cursor.col > 0) {
                    newState.cursor.col--;
                }
            }
            break;
        }
        case 'p': {
            if (newState.register) {
                if (newState.register.type === 'line') {
                    newState.lines.splice(newState.cursor.line + 1, 0, newState.register.text);
                    newState.cursor.line++;
                    newState.cursor.col = 0;
                } else {
                    const { line, col } = newState.cursor;
                    const l = newState.lines[line];
                    newState.lines[line] = l.slice(0, col + 1) + newState.register.text + l.slice(col + 1);
                    newState.cursor.col = col + newState.register.text.length;
                }
            }
            break;
        }
        case 'i':
            newState.mode = 'insert';
            break;
        // Multi-key commands start pending
        case 'f':
        case 'F':
        case 't':
        case 'T':
        case 'g':
        case 'd':
        case 'y':
        case 'c':
            newState.pendingKey = key;
            newState.keystrokeCount--; // don't count the first key of a pair
            break;
        default:
            // Ctrl+d / Ctrl+u
            if (key === 'Ctrl+d') {
                newState.cursor.line = Math.min(newState.lines.length - 1, newState.cursor.line + 5);
            } else if (key === 'Ctrl+u') {
                newState.cursor.line = Math.max(0, newState.cursor.line - 5);
            }
            break;
    }

    return clampCursor(newState);
}
