/**
 * Deep search utility for Guidorizzi Content.
 * Scans through topics, materials, exercises and presentations.
 */

export interface SearchResult {
    topic: string;
    score: number; // For ranking
    matches: string[]; // What matched
}

export const performDeepSearch = (query: string, content: any): string[] => {
    if (!query || query.trim() === '') return Object.keys(content);

    const normalizedQuery = query.toLowerCase().trim();
    const results: SearchResult[] = [];

    Object.entries(content).forEach(([topic, data]: [string, any]) => {
        let score = 0;
        const matches: string[] = [];

        // 1. Exact Topic Name Match (Highest priority)
        if (topic.toLowerCase() === normalizedQuery) {
            score += 100;
            matches.push('Exact match');
        } else if (topic.toLowerCase().includes(normalizedQuery)) {
            score += 50;
            matches.push('Title match');
        }

        // 2. Material Content Search
        if (data.material && data.material.toLowerCase().includes(normalizedQuery)) {
            score += 20;
            matches.push('Content match');
        }

        // 3. Exercises Search
        if (data.exercises && Array.isArray(data.exercises)) {
            const exerciseMatch = data.exercises.some((ex: any) => 
                (ex.title && ex.title.toLowerCase().includes(normalizedQuery)) || 
                (ex.content && ex.content.toLowerCase().includes(normalizedQuery))
            );
            if (exerciseMatch) {
                score += 15;
                matches.push('Exercise match');
            }
        }

        // 4. Presentation Search
        if (data.presentation && Array.isArray(data.presentation)) {
            const presentationMatch = data.presentation.some((slide: any) => 
                (slide.title && slide.title.toLowerCase().includes(normalizedQuery)) || 
                (slide.content && slide.content.toLowerCase().includes(normalizedQuery))
            );
            if (presentationMatch) {
                score += 10;
                matches.push('Presentation match');
            }
        }

        if (score > 0) {
            results.push({ topic, score, matches });
        }
    });

    // Sort by score and return topic names
    return results
        .sort((a, b) => b.score - a.score)
        .map(r => r.topic);
};
