import AsyncStorage from '@react-native-async-storage/async-storage';

interface CacheEntry<T> {
    data: T;
    timestamp: number;
    ttlMs: number;
}

// In-memory cache map for zero-latency synchronous access
const memoryCache = new Map<string, CacheEntry<any>>();

// Standard default TTLs (Time-to-Live) in milliseconds
export const CACHE_TTL = {
    SHORT: 2 * 60 * 1000,      // 2 minutes (orders, reviews)
    MEDIUM: 10 * 60 * 1000,    // 10 minutes (products, categories)
    LONG: 60 * 60 * 1000,      // 1 hour (profile, images)
    DAY: 24 * 60 * 60 * 1000,   // 24 hours
};

const ASYNC_STORAGE_PREFIX = '@nwanma_cache:';

export const cacheManager = {
    /**
     * Set a cache entry in memory and persist to AsyncStorage
     */
    async set<T>(key: string, data: T, ttlMs: number = CACHE_TTL.MEDIUM): Promise<void> {
        const entry: CacheEntry<T> = {
            data,
            timestamp: Date.now(),
            ttlMs,
        };

        // Store in memory
        memoryCache.set(key, entry);

        // Persist in AsyncStorage asynchronously
        try {
            await AsyncStorage.setItem(
                `${ASYNC_STORAGE_PREFIX}${key}`,
                JSON.stringify(entry)
            );
        } catch (e) {
            console.warn(`[cacheManager] Error persisting key "${key}":`, e);
        }
    },

    /**
     * Get cached data synchronously from memory if available
     */
    getMemory<T>(key: string): { data: T | null; isStale: boolean } {
        const entry = memoryCache.get(key);
        if (!entry) {
            return { data: null, isStale: true };
        }

        const age = Date.now() - entry.timestamp;
        const isStale = age > entry.ttlMs;
        return { data: entry.data, isStale };
    },

    /**
     * Get cached data asynchronously (checks memory first, then AsyncStorage)
     */
    async get<T>(key: string): Promise<{ data: T | null; isStale: boolean }> {
        // 1. Check memory cache first
        const memResult = this.getMemory<T>(key);
        if (memResult.data !== null) {
            return memResult;
        }

        // 2. Fallback to AsyncStorage
        try {
            const storedJson = await AsyncStorage.getItem(`${ASYNC_STORAGE_PREFIX}${key}`);
            if (!storedJson) {
                return { data: null, isStale: true };
            }

            const entry: CacheEntry<T> = JSON.parse(storedJson);
            // Repopulate memory cache
            memoryCache.set(key, entry);

            const age = Date.now() - entry.timestamp;
            const isStale = age > entry.ttlMs;

            return { data: entry.data, isStale };
        } catch (e) {
            console.warn(`[cacheManager] Error reading cache key "${key}":`, e);
            return { data: null, isStale: true };
        }
    },

    /**
     * Invalidate specific cache key from memory and AsyncStorage
     */
    async invalidate(key: string): Promise<void> {
        memoryCache.delete(key);
        try {
            await AsyncStorage.removeItem(`${ASYNC_STORAGE_PREFIX}${key}`);
        } catch (e) {
            console.warn(`[cacheManager] Error removing cache key "${key}":`, e);
        }
    },

    /**
     * Invalidate multiple cache keys matching a prefix or pattern
     */
    async invalidatePrefix(prefix: string): Promise<void> {
        // Clear matching keys from memory
        Array.from(memoryCache.keys()).forEach(key => {
            if (key.startsWith(prefix)) {
                memoryCache.delete(key);
            }
        });

        // Clear matching keys from AsyncStorage
        try {
            const allKeys = await AsyncStorage.getAllKeys();
            const matchingKeys = allKeys.filter(k => k.startsWith(`${ASYNC_STORAGE_PREFIX}${prefix}`));
            if (matchingKeys.length > 0) {
                await AsyncStorage.multiRemove(matchingKeys);
            }
        } catch (e) {
            console.warn(`[cacheManager] Error invalidating prefix "${prefix}":`, e);
        }
    },

    /**
     * Clear all app caches
     */
    async clearAll(): Promise<void> {
        memoryCache.clear();
        try {
            const allKeys = await AsyncStorage.getAllKeys();
            const cacheKeys = allKeys.filter(k => k.startsWith(ASYNC_STORAGE_PREFIX));
            if (cacheKeys.length > 0) {
                await AsyncStorage.multiRemove(cacheKeys);
            }
        } catch (e) {
            console.warn('[cacheManager] Error clearing all caches:', e);
        }
    },
};
