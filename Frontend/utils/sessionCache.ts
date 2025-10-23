/**
 * Session Storage Cache Utility
 * 
 * Provides helper functions for managing temporary session data.
 * Data is automatically cleared when the browser is closed.
 * 
 * This is a temporary solution until backend API is integrated.
 */

const STORAGE_KEYS = {
    AUTH_USER: 'auth_user',
    ATTENDANCE_REQUESTS: 'attendance_requests',
} as const;

/**
 * Save data to sessionStorage with error handling
 */
export const saveToSession = <T>(key: string, data: T): boolean => {
    try {
        sessionStorage.setItem(key, JSON.stringify(data));
        return true;
    } catch (error) {
        console.error(`Failed to save to sessionStorage (key: ${key}):`, error);
        return false;
    }
};

/**
 * Load data from sessionStorage with error handling
 */
export const loadFromSession = <T>(key: string, defaultValue: T): T => {
    try {
        const stored = sessionStorage.getItem(key);
        return stored ? JSON.parse(stored) : defaultValue;
    } catch (error) {
        console.error(`Failed to load from sessionStorage (key: ${key}):`, error);
        return defaultValue;
    }
};

/**
 * Remove specific item from sessionStorage
 */
export const removeFromSession = (key: string): boolean => {
    try {
        sessionStorage.removeItem(key);
        return true;
    } catch (error) {
        console.error(`Failed to remove from sessionStorage (key: ${key}):`, error);
        return false;
    }
};

/**
 * Clear all session storage
 */
export const clearSession = (): boolean => {
    try {
        sessionStorage.clear();
        return true;
    } catch (error) {
        console.error('Failed to clear sessionStorage:', error);
        return false;
    }
};

/**
 * Check if sessionStorage is available
 */
export const isSessionStorageAvailable = (): boolean => {
    try {
        const test = '__test__';
        sessionStorage.setItem(test, test);
        sessionStorage.removeItem(test);
        return true;
    } catch {
        return false;
    }
};

// Export storage keys for consistent usage
export { STORAGE_KEYS };
