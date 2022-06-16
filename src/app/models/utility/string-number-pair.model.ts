export class StringNumberPair {
    value: number;
    text: string;

    constructor(value?: number, text?: string) {
        if (value !== undefined)
            this.value = value;

        if (text !== undefined)
            this.text = text;
    }
}    
