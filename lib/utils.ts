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
