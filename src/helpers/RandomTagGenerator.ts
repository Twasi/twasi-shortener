// @ts-ignore
import * as RandomWordGenerator from 'random-words';

const generateRandomWords = (options: {
    min?: number,
    max?: number,
    exactly?: number,
    join?: string,
    maxLength?: number,
    wordsPerString?: number,
    formatter?: (word: string) => string
}): Array<string> => (RandomWordGenerator.default as any)(options);

const getRandomInt = (min: number, max: number): number => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}

const random = (chance: number = .5): boolean => {
    if (chance < 1) chance *= 100;
    return getRandomInt(0, 100) <= chance;
}

const increasingRandomNumber = (chance: number, start: number, max: number): number => {
    for (let i = start; i < max; i++) {
        if (random(chance)) return i;
    }
    return max;
}

const generateRandomWord = (parts: number): string => {
    let outWord = '';
    for (let i = 0; i < parts; i++) outWord += (random(.03) ? getRandomInt(0, 10) : '') + generateRandomWords({
        exactly: 1,
        maxLength: increasingRandomNumber(.3, 2, 6),
        wordsPerString: 1,
    })[0] + (random(.03) ? getRandomInt(0, 10) : '');
    return outWord;
}

const leets: { [key: string]: string } = {
    'o': '0',
    'i': '1',
    'l': '1',
    'e': '3',
    'a': '4',
    's': '5',
    'b': '6',
    't': '7',
    'p': '9'
};

export const createRandomTag = (): string => {
    const word = generateRandomWord(increasingRandomNumber(.7, 1, 4));
    let outWord = '';
    for (let i = 0; i < word.length; i++) {
        let char = (random(.2) ? word.charAt(i).toUpperCase() : word.charAt(i).toLowerCase());
        if (random(.3) && Object.keys(leets).includes(char.toLowerCase())) char = leets[char.toLowerCase()];
        outWord += char;
    }
    return outWord;
}
