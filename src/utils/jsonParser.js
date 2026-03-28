export function extractJSON(text) {
    if (typeof text !== 'string') return null;
    
    try {
        return JSON.parse(text);
    } catch {
        const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
        if (codeBlockMatch) {
            try {
                return JSON.parse(codeBlockMatch[1].trim());
            } catch { /* continue */ }
        }

        const jsonMatch = text.match(/(\[[\s\S]*\]|\{[\s\S]*\})/);
        if (jsonMatch) {
            try {
                return JSON.parse(jsonMatch[1]);
            } catch { /* continue */ }
        }

        return null;
    }
}
