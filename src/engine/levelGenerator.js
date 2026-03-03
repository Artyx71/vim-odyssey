
const MOTION_GROUPS = {
    movement: {
        keys: ['h', 'j', 'k', 'l'],
        templates: [
            {
                make: () => {
                    const rows = 6;
                    const cols = 25;
                    const targetLine = Math.floor(Math.random() * (rows - 1)) + 1;
                    const targetCol = Math.floor(Math.random() * 15) + 5;
                    const lines = [];
                    for (let i = 0; i < rows; i++) {
                        let line = '';
                        for (let c = 0; c < cols; c++) {
                            if (i === targetLine && c === targetCol) line += '★';
                            else line += '.~·-'[Math.floor(Math.random() * 4)];
                        }
                        lines.push(line);
                    }
                    return {
                        textContent: lines,
                        cursorStart: { line: 0, col: 0 },
                        goals: [{ type: 'cursor_position', line: targetLine, col: targetCol }],
                        maxKeystrokes: { three: targetLine + targetCol + 2, two: targetLine + targetCol + 8, one: targetLine + targetCol + 16 },
                    };
                },
            },
        ],
    },
    words: {
        keys: ['w', 'b', 'e', 'j', 'k'],
        templates: [
            {
                make: () => {
                    const wordSets = [
                        ['alpha', 'bravo', 'charlie', 'delta', 'echo', 'foxtrot'],
                        ['const', 'let', 'var', 'function', 'return', 'class'],
                        ['fire', 'water', 'earth', 'wind', 'light', 'shadow'],
                        ['sword', 'shield', 'helm', 'armor', 'boots', 'ring'],
                    ];
                    const set = wordSets[Math.floor(Math.random() * wordSets.length)];
                    const lines = [];
                    for (let i = 0; i < 3; i++) {
                        const shuffled = [...set].sort(() => Math.random() - 0.5);
                        lines.push(shuffled.slice(0, 4 + Math.floor(Math.random() * 2)).join(' '));
                    }
                    const targetLine = Math.floor(Math.random() * lines.length);
                    const words = lines[targetLine].split(' ');
                    const targetWordIdx = Math.floor(Math.random() * (words.length - 1)) + 1;
                    let col = 0;
                    for (let i = 0; i < targetWordIdx; i++) col += words[i].length + 1;

                    return {
                        textContent: lines,
                        cursorStart: { line: 0, col: 0 },
                        goals: [{ type: 'cursor_position', line: targetLine, col }],
                        maxKeystrokes: { three: targetWordIdx + targetLine + 2, two: targetWordIdx + targetLine + 6, one: targetWordIdx + targetLine + 14 },
                    };
                },
            },
        ],
    },
    lineNav: {
        keys: ['0', '$', '^', 'h', 'j', 'k', 'l'],
        templates: [
            {
                make: () => {
                    const prefixes = ['    ', '      ', '  ', '        ', ''];
                    const phrases = [
                        'The ancient code compiles.', 'Dragons guard the server.', 'Debug the magic spell.',
                        'Functions return values.', 'Variables hold power.', 'Loops repeat the ritual.',
                    ];
                    const lines = [];
                    for (let i = 0; i < 4; i++) {
                        const pre = prefixes[Math.floor(Math.random() * prefixes.length)];
                        const phrase = phrases[Math.floor(Math.random() * phrases.length)];
                        lines.push(pre + phrase);
                    }
                    const targetLine = Math.floor(Math.random() * lines.length);
                    const goEnd = Math.random() > 0.5;
                    const col = goEnd ? lines[targetLine].length - 1 : lines[targetLine].search(/\S/);

                    return {
                        textContent: lines,
                        cursorStart: { line: 0, col: Math.floor(lines[0].length / 2) },
                        goals: [{ type: 'cursor_position', line: targetLine, col }],
                        maxKeystrokes: { three: 4, two: 8, one: 14 },
                    };
                },
            },
        ],
    },
    editing: {
        keys: ['x', 'dd', 'j', 'k', 'h', 'l'],
        templates: [
            {
                make: () => {
                    const goodLines = [
                        'function main() {', '  const data = fetch();', '  process(data);',
                        '  return result;', '}', 'export default main;',
                    ];
                    const badLines = [
                        '  // TODO: remove this', '  CORRUPTED_DATA;', '  // HACK: fix later',
                        '  BUG_HERE = true;', '  // DELETE ME',
                    ];
                    const lines = [];
                    const insertPositions = new Set();
                    const numBad = 2 + Math.floor(Math.random() * 2);
                    for (let i = 0; i < numBad; i++) {
                        insertPositions.add(Math.floor(Math.random() * goodLines.length) + 1);
                    }
                    let badIdx = 0;
                    for (let i = 0; i < goodLines.length; i++) {
                        if (insertPositions.has(i) && badIdx < badLines.length) {
                            lines.push(badLines[badIdx++]);
                        }
                        lines.push(goodLines[i]);
                    }
                    return {
                        textContent: lines,
                        cursorStart: { line: 0, col: 0 },
                        goals: [{ type: 'text_content', expectedLines: goodLines }],
                        maxKeystrokes: { three: numBad * 3, two: numBad * 5, one: numBad * 8 },
                    };
                },
            },
        ],
    },
    findChar: {
        keys: ['f', 't', 'l', 'h', 'j', 'k'],
        templates: [
            {
                make: () => {
                    const sentences = [
                        'The quick brown fox jumps over the lazy dog.',
                        'Vim is a powerful text editor for programmers.',
                        'Search and find characters with precision.',
                        'Navigate efficiently through code and text.',
                        'Every character has a unique position here.',
                    ];
                    const lines = [];
                    for (let i = 0; i < 3; i++) {
                        lines.push(sentences[Math.floor(Math.random() * sentences.length)]);
                    }
                    const targetLine = Math.floor(Math.random() * lines.length);
                    const line = lines[targetLine];
                    const uniqueChars = [...new Set(line.replace(/\s/g, ''))].filter(c => c.match(/[a-zA-Z]/));
                    const targetChar = uniqueChars[Math.floor(Math.random() * uniqueChars.length)];
                    const col = line.indexOf(targetChar, Math.floor(line.length / 3));

                    return {
                        textContent: lines,
                        cursorStart: { line: 0, col: 0 },
                        goals: [{ type: 'cursor_position', line: targetLine, col: col >= 0 ? col : 5 }],
                        maxKeystrokes: { three: 4, two: 7, one: 12 },
                    };
                },
            },
        ],
    },
};

const TITLES_RU = [
    'Случайное испытание', 'Тренировка навыков', 'Быстрый бой',
    'Испытание мастера', 'Арена практики', 'Дуэль Vim',
];
const TITLES_EN = [
    'Random Challenge', 'Skill Training', 'Quick Battle',
    'Master\'s Trial', 'Practice Arena', 'Vim Duel',
];
const DESCS_RU = [
    'Доберись до цели за минимум нажатий',
    'Покажи мастерство Vim motions',
    'Выполни задание используя доступные клавиши',
];
const DESCS_EN = [
    'Reach the goal with minimum keystrokes',
    'Show your Vim motion mastery',
    'Complete the task using available keys',
];

export function generateRandomLevel() {
    const groupKeys = Object.keys(MOTION_GROUPS);
    const groupName = groupKeys[Math.floor(Math.random() * groupKeys.length)];
    const group = MOTION_GROUPS[groupName];
    const template = group.templates[Math.floor(Math.random() * group.templates.length)];
    const generated = template.make();

    const titleRu = TITLES_RU[Math.floor(Math.random() * TITLES_RU.length)];
    const titleEn = TITLES_EN[Math.floor(Math.random() * TITLES_EN.length)];
    const descRu = DESCS_RU[Math.floor(Math.random() * DESCS_RU.length)];
    const descEn = DESCS_EN[Math.floor(Math.random() * DESCS_EN.length)];

    return {
        id: `generated-${Date.now()}`,
        title: { ru: titleRu, en: titleEn },
        description: { ru: descRu, en: descEn },
        storyText: {
            ru: 'Случайно сгенерированное испытание. Покажи, на что способен!',
            en: 'A randomly generated challenge. Show what you\'ve got!',
        },
        ...generated,
        allowedKeys: group.keys,
        hints: [],
        groupName,
    };
}
