import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateRoomCode(): string {
  // Generate a 5-digit code
  return Math.floor(10000 + Math.random() * 90000).toString();
}

export function generateUUID(): string {
  return crypto.randomUUID();
}

/**
 * Remove recursively keys with undefined values from an object or array.
 * Firestore throws error if a field is undefined.
 */
export function removeUndefined(obj: any): any {
  if (obj === undefined) {
    return null;
  }
  if (Array.isArray(obj)) {
    return obj.map(removeUndefined);
  }
  if (obj !== null && typeof obj === 'object') {
    return Object.entries(obj).reduce((acc, [key, value]) => {
      if (value !== undefined) {
        acc[key] = removeUndefined(value);
      }
      return acc;
    }, {} as any);
  }
  return obj;
}
