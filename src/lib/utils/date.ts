// Date formatting and manipulation utilities

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

// Get today's date in YYYY-MM-DD format
export function getTodayDate(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Format date for input fields (MM-DD-YYYY)
export function formatDateForInput(date: string): string {
  const [year, month, day] = date.split('-');
  return `${month}-${day}-${year}`;
}

// Parse input date format (MM-DD-YYYY) to standard format (YYYY-MM-DD)
export function parseInputDate(inputDate: string): string {
  const [month, day, year] = inputDate.split('-');
  return `${year}-${month}-${day}`;
}

// Check if date is valid
export function isValidDate(dateString: string): boolean {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
}

// Get relative time (e.g., "2 hours ago")
export function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  
  return date.toLocaleDateString();
} 