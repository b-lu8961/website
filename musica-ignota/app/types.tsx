export interface PlayerData {
    key: string;
    label: string;
    value?: number;
    list?: number[];
    initial?: boolean;
}

export interface FontData {
    char: string;
    category: string;
    order: number;
    info: string;
}

export interface WordData {
    shape: number[];
    definition: string;
}

export interface LexData {
    contours: WordData[];
    sequences: WordData[];
    particles: WordData[];
}
