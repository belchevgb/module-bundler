const PATTERNS = {
    QUOTES: /['"]+/img
};

export function removeQuotes(text: string) {
    return text.replace(PATTERNS.QUOTES, "");
}