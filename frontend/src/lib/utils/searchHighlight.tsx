import React from 'react';

/**
 * Highlights search terms in text
 * @param text - The text to highlight
 * @param searchTerm - The search term to highlight
 * @returns React element with highlighted text
 */
export function highlightSearchTerm(text: string, searchTerm: string): React.ReactNode {
  if (!searchTerm.trim()) {
    return text;
  }

  try {
    // Escape special regex characters
    const escapedTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escapedTerm})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, index) => {
      const isMatch = regex.test(part);
      // Reset regex lastIndex for next test
      regex.lastIndex = 0;

      if (isMatch) {
        return (
          <mark
            key={index}
            className="bg-yellow-200 dark:bg-yellow-700 text-gray-900 dark:text-white px-0.5 rounded"
          >
            {part}
          </mark>
        );
      }
      return <span key={index}>{part}</span>;
    });
  } catch (error) {
    // If regex fails, return original text
    console.error('Error highlighting search term:', error);
    return text;
  }
}

/**
 * Truncates text to a maximum length while trying to show search term
 * @param text - The text to truncate
 * @param searchTerm - The search term to center on
 * @param maxLength - Maximum length of the result
 * @returns Truncated text
 */
export function truncateAroundSearchTerm(
  text: string,
  searchTerm: string,
  maxLength: number = 150
): string {
  if (text.length <= maxLength) {
    return text;
  }

  if (!searchTerm.trim()) {
    return text.substring(0, maxLength) + '...';
  }

  // Find the position of the search term
  const searchIndex = text.toLowerCase().indexOf(searchTerm.toLowerCase());

  if (searchIndex === -1) {
    return text.substring(0, maxLength) + '...';
  }

  // Calculate how much text to show before and after the search term
  const halfLength = Math.floor((maxLength - searchTerm.length) / 2);
  let start = Math.max(0, searchIndex - halfLength);
  let end = Math.min(text.length, searchIndex + searchTerm.length + halfLength);

  // Adjust if we're at the beginning or end
  if (start === 0) {
    end = Math.min(text.length, maxLength);
  } else if (end === text.length) {
    start = Math.max(0, text.length - maxLength);
  }

  let result = text.substring(start, end);

  // Add ellipsis
  if (start > 0) result = '...' + result;
  if (end < text.length) result = result + '...';

  return result;
}

