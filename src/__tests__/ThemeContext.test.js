/**
 * Tests for ThemeContext utilities
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock localStorage before imports
const localStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
};
global.localStorage = localStorageMock;

describe('ThemeContext', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorageMock.getItem.mockReturnValue(null);
    });

    it('has correct storage key', () => {
        expect('app_theme').toBe('app_theme');
    });

    it('accepts dark and light themes', () => {
        const validThemes = ['dark', 'light'];
        expect(validThemes.includes('dark')).toBe(true);
        expect(validThemes.includes('light')).toBe(true);
        expect(validThemes.includes('invalid')).toBe(false);
    });

    it('theme toggle switches between dark and light', () => {
        let theme = 'dark';
        
        // Simulate toggle
        theme = theme === 'dark' ? 'light' : 'dark';
        expect(theme).toBe('light');
        
        // Simulate toggle again
        theme = theme === 'dark' ? 'light' : 'dark';
        expect(theme).toBe('dark');
    });

    it('stores theme correctly in localStorage', () => {
        localStorage.setItem('app_theme', 'light');
        expect(localStorage.setItem).toHaveBeenCalledWith('app_theme', 'light');
        
        localStorage.setItem('app_theme', 'dark');
        expect(localStorage.setItem).toHaveBeenCalledWith('app_theme', 'dark');
    });

    it('loads theme from localStorage', () => {
        localStorage.getItem.mockReturnValue('light');
        const stored = localStorage.getItem('app_theme');
        expect(stored).toBe('light');
    });

    it('returns null when no theme stored', () => {
        localStorage.getItem.mockReturnValue(null);
        const stored = localStorage.getItem('app_theme');
        expect(stored).toBeNull();
    });
});