import uuid from 'react-native-uuid';
import { getQuotes, saveQuotes } from '../database/quotesDb';

/**
 * Fetches motivational quotes from the ZenQuotes API, formats them, assigns unique IDs,
 * categorizes each quote, and merges them into local storage ensuring uniqueness.
 *
 * @async
 * @function fetchQuotesFromAPI
 * @returns {Promise<Array<Object>>} A promise that resolves to an array of newly added quote objects.
 * Each quote object contains:
 *   - {string} id: A unique identifier for the quote.
 *   - {string} text: The text of the quote.
 *   - {string} author: The author of the quote, or 'Unknown' if not provided.
 *   - {string} category: The category assigned to the quote.
 *
 * @throws {Error} If the API request fails or the response is not OK.
 */
export const fetchQuotesFromAPI = async () => {
  const API_URL = 'https://zenquotes.io/api/quotes';

  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error('Failed to fetch quotes');

    const data = await response.json();

    // Format new quotes
    const newQuotes = data.map(q => ({
      id: uuid.v4(),
      text: q.q.trim(),
      author: q.a || 'Unknown',
      category: categorizeQuote(q.q),
    }));

    // Merge into local storage
    await mergeQuotes(newQuotes);

    console.log(`Added ${newQuotes.length} new quotes (filtered for uniqueness).`);

    return newQuotes;

  } catch (err) {
    console.error('Error fetching quotes:', err);
    return [];
  }
};

// Merge without duplicates (by quote text)
/**
 * Merges new quotes with the existing quotes, ensuring no duplicates by quote text.
 * Only quotes with unique text (after trimming) are added to the existing collection.
 * The updated list is then saved.
 *
 * @async
 * @function
 * @param {Array<{ text: string, [key: string]: any }>} newQuotes - Array of new quote objects to merge.
 * @returns {Promise<void>} Resolves when the quotes have been merged and saved.
 */
const mergeQuotes = async (newQuotes) => {
  const existing = await getQuotes();

  const seenTexts = new Set(existing.map(q => q.text.trim()));
  const uniqueNew = newQuotes.filter(q => !seenTexts.has(q.text.trim()));

  const updated = [...existing, ...uniqueNew];
  await saveQuotes(updated);
};

// Categorize quote text
/**
 * Categorizes a quote based on keywords found in the provided text.
 *
 * @param {string} [text=''] - The quote text to categorize.
 * @returns {string} The category of the quote: 'success', 'love', 'life', 'mindset', 'dreams', or 'inspiration'.
 */
const categorizeQuote = (text = '') => {
  const t = text.toLowerCase();
  if (t.includes('success') || t.includes('goal')) return 'success';
  if (t.includes('love')) return 'love';
  if (t.includes('life') || t.includes('journey')) return 'life';
  if (t.includes('mind') || t.includes('believe')) return 'mindset';
  if (t.includes('dream') || t.includes('passion')) return 'dreams';
  return 'inspiration';
};
