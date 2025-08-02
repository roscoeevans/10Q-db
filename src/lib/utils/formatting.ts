// Text and data formatting utilities

// Get difficulty label
export function getDifficultyLabel(difficulty: number): string {
  const labels = ['Very Easy', 'Easy', 'Medium', 'Hard', 'Very Hard'];
  return labels[difficulty - 1] || 'Unknown';
}

// Get difficulty color for styling
export function getDifficultyColor(difficulty: number): string {
  const colors = ['text-green-600', 'text-blue-600', 'text-yellow-600', 'text-orange-600', 'text-red-600'];
  return colors[difficulty - 1] || 'text-gray-600';
}

// Get difficulty background color
export function getDifficultyBgColor(difficulty: number): string {
  const colors = ['bg-green-100', 'bg-blue-100', 'bg-yellow-100', 'bg-orange-100', 'bg-red-100'];
  return colors[difficulty - 1] || 'bg-gray-100';
}

// Get card gradient based on index
export function getCardGradient(index: number): string {
  const gradients = [
    'from-blue-500 to-purple-600',
    'from-green-500 to-blue-600',
    'from-purple-500 to-pink-600',
    'from-orange-500 to-red-600',
    'from-teal-500 to-green-600',
    'from-indigo-500 to-purple-600',
    'from-pink-500 to-rose-600',
    'from-yellow-500 to-orange-600',
    'from-cyan-500 to-blue-600',
    'from-emerald-500 to-teal-600'
  ];
  return gradients[index % gradients.length];
}

// Truncate text to specified length
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

// Capitalize first letter of string
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

// Format number with commas
export function formatNumber(num: number): string {
  return num.toLocaleString();
}

// Format file size
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Format percentage
export function formatPercentage(value: number, total: number): string {
  if (total === 0) return '0%';
  return Math.round((value / total) * 100) + '%';
} 