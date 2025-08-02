import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Utility function for merging Tailwind classes
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format date for display
export function formatDate(date: string): string {
  const [month, day, year] = date.split('-');
  const dateObj = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  return dateObj.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

// Get today's date in MM-DD-YYYY format
export function getTodayDate(): string {
  return new Date().toLocaleDateString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric'
  }).replace(/(\d+)\/(\d+)\/(\d+)/, '$1-$2-$3');
}

// Get difficulty label
export function getDifficultyLabel(difficulty: number): string {
  if (difficulty <= 25) return 'Easy';
  if (difficulty <= 50) return 'Medium';
  if (difficulty <= 75) return 'Hard';
  return 'Expert';
}

// Get difficulty color
export function getDifficultyColor(difficulty: number): string {
  if (difficulty <= 25) return 'text-ios-green';
  if (difficulty <= 50) return 'text-ios-yellow';
  if (difficulty <= 75) return 'text-ios-orange';
  return 'text-ios-red';
}

// Get difficulty background color
export function getDifficultyBgColor(difficulty: number): string {
  if (difficulty <= 25) return 'bg-ios-green/10';
  if (difficulty <= 50) return 'bg-ios-yellow/10';
  if (difficulty <= 75) return 'bg-ios-orange/10';
  return 'bg-ios-red/10';
}

// Generate a gradient background for cards
export function getCardGradient(index: number): string {
  const gradients = [
    'from-ios-blue/20 to-ios-purple/20',
    'from-ios-green/20 to-ios-blue/20',
    'from-ios-orange/20 to-ios-pink/20',
    'from-ios-purple/20 to-ios-blue/20',
    'from-ios-pink/20 to-ios-orange/20',
  ];
  return gradients[index % gradients.length];
}

// Debounce function
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Truncate text
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

// Capitalize first letter
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
} 