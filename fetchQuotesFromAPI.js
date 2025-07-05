import uuid from 'react-native-uuid';
import { getQuotes, saveQuotes } from './quotesDb';

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
const mergeQuotes = async (newQuotes) => {
  const existing = await getQuotes();

  const seenTexts = new Set(existing.map(q => q.text.trim()));
  const uniqueNew = newQuotes.filter(q => !seenTexts.has(q.text.trim()));

  const updated = [...existing, ...uniqueNew];
  await saveQuotes(updated);
};

// Categorize quote text
const categorizeQuote = (text = '') => {
  const t = text.toLowerCase();
  if (t.includes('success') || t.includes('goal')) return 'success';
  if (t.includes('love')) return 'love';
  if (t.includes('life') || t.includes('journey')) return 'life';
  if (t.includes('mind') || t.includes('believe')) return 'mindset';
  if (t.includes('dream') || t.includes('passion')) return 'dreams';
  return 'inspiration';
};
