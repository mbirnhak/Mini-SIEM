/**
 * Extract value from potentially nested object or return fallback
 */
export function extractValue(obj: any, fallback = 'N/A'): string {
    if (!obj) return fallback;

    // If the property is an object with an 'id' or 'name' field, use that
    if (typeof obj === 'object') {
        if (obj.id) return obj.id;
        if (obj.name) return obj.name;

        // Try stringifying but limit it to avoid overwhelming the UI
        try {
            const str = JSON.stringify(obj);
            if (str.length < 50) return str;
            return '[Complex Object]';
        } catch (e) {
            return '[Object]';
        }
    }

    return String(obj);
}

/**
 * Format a timestamp from Unix seconds to local date and time
 */
export function formatTimestamp(timestamp: number | undefined | null): string {
    return timestamp ? new Date(timestamp * 1000).toLocaleString() : 'N/A';
}