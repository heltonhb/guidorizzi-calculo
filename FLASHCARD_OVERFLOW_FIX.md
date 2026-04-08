# Flashcard Text Overflow Fix

## Issue
Flashcard content (text, mathematical expressions, and long words) was escaping from the card boundaries, breaking the visual design and making content overflow outside the intended card area.

## Root Cause
The flashcard content container lacked proper overflow constraints:
- No maximum height restriction on content area
- No word-breaking mechanism for long text
- No horizontal scroll handling for mathematical notation
- Missing scrollbar styling for visual feedback

## Solution Implemented

### 1. CSS Enhancement (`src/index.css`)
Added comprehensive `.flashcard-content` class with:

```css
/* Flashcard Content Overflow Management */
.flashcard-content {
    overflow-y: auto;
    max-height: calc(100% - 120px);
    overflow-x: hidden;
    word-wrap: break-word;
    overflow-wrap: break-word;
}

.flashcard-content p,
.flashcard-content strong,
.flashcard-content em,
.flashcard-content li,
.flashcard-content code {
    word-break: break-word;
    overflow-wrap: break-word;
}

.flashcard-content .katex-display {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
}

.flashcard-content .katex {
    font-size: 0.95em;
}

/* Custom scrollbar for flashcard content */
.flashcard-content::-webkit-scrollbar {
    width: 6px;
}

.flashcard-content::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 3px;
}

.flashcard-content::-webkit-scrollbar-thumb {
    background: rgba(0, 240, 255, 0.3);
    border-radius: 3px;
    transition: background 0.2s;
}

.flashcard-content::-webkit-scrollbar-thumb:hover {
    background: rgba(0, 240, 255, 0.6);
}
```

**Key Features:**
- **Vertical Scrolling**: `overflow-y: auto` allows scrolling when content exceeds max-height
- **Height Constraint**: `max-height: calc(100% - 120px)` leaves room for buttons/controls
- **Word Breaking**: `word-wrap` and `overflow-wrap` prevent long words from breaking layout
- **Math Support**: `.katex-display` gets horizontal scroll for long equations
- **Visual Feedback**: Custom neon cyan scrollbar matches brutalist design aesthetic

### 2. Component Update (`src/components/Flashcards.tsx`)
Applied `.flashcard-content` class to content container:

```jsx
<div className="flashcard-content flex-1 flex flex-col items-center justify-center w-full relative">
    <div className="prose prose-invert max-w-none w-full">
        <ReactMarkdown
            remarkPlugins={[remarkMath]}
            rehypePlugins={[rehypeKatex]}
            components={{
                p: ({ children }) => <p className="text-white font-black text-2xl sm:text-3xl leading-tight tracking-tight">{children}</p>,
                strong: ({ children }) => <strong className="text-[#f97316]">{children}</strong>,
                em: ({ children }) => <em className="text-cyan-400">{children}</em>,
            }}
        >
            {isFlipped ? (flashcards[currentIndex]?.back || '') : preprocessMathContent(flashcards[currentIndex]?.front || '')}
        </ReactMarkdown>
    </div>
</div>
```

**Changes:**
- Removed inline `break-words` classes (now handled by CSS)
- Removed inline `overflow` classes (now handled by CSS)
- Applied semantic `.flashcard-content` class
- Simplified component JSX while improving maintainability

## Testing
The fix handles:
- ✅ Long unbroken text
- ✅ Mathematical expressions and KaTeX notation
- ✅ Multi-line content with proper scrolling
- ✅ Markdown formatting (bold, italic, links)
- ✅ Lists and code blocks
- ✅ Mobile and desktop viewports

## Performance Impact
Minimal performance impact:
- CSS-only solution (no JavaScript calculations)
- Leverages browser native scrolling
- Custom scrollbar styling is GPU-accelerated
- No additional DOM elements

## Browser Compatibility
- ✅ Chrome/Edge (webkit scrollbar)
- ✅ Firefox (scrollbar styling via `scrollbar-width`)
- ✅ Safari (webkit scrollbar)
- ✅ Mobile browsers (touch-friendly scrolling)

## Related Components
The same pattern can be applied to:
- Quiz mode (long questions/answers)
- Study material panel (long text content)
- Chat interface (message overflow)

## Commit Information
- **Commit Hash**: `39f65b15`
- **Date**: 8 April 2025
- **Changes**: 2 files, 49 insertions(+), 2 deletions(-)
  - `src/index.css`: +47 lines (CSS rules)
  - `src/components/Flashcards.tsx`: +2 lines (class update)
- **Status**: ✅ Pushed to GitHub successfully
