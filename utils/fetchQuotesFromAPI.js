import uuid from 'react-native-uuid';
import { getQuotes, saveQuotes } from '../database/quotesDb';

/**
 * Fetches motivational quotes from the ZenQuotes API, formats them, assigns unique IDs,
 * categorizes each quote, and merges them into local storage ensuring uniqueness.
 * Each quote object contains:
 *   - {string} id: A unique identifier for the quote.
 *   - {string} text: The text of the quote.
 *   - {string} author: The author of the quote, or 'Unknown' if not provided.
 *   - {string} category: The category assigned to the quote.
 */
export const fetchQuotesFromAPI = async () => {
  const proxy = "https://cors-anywhere.herokuapp.com/";
  const API_URL = 'https://zenquotes.io/api/quotes';

  try {
    const response = await fetch(proxy + API_URL);
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
 */
const categorizeQuote = (text = '') => {
  const t = text.toLowerCase();

  const categories = [
    { category: 'success', keywords: ['success', 'goal', 'achievement', 'accomplish', 'results', 'win'] },
    { category: 'love', keywords: ['love', 'heart', 'compassion', 'affection', 'romance', 'care'] },
    { category: 'life', keywords: ['life', 'journey', 'existence', 'living', 'day', 'experience'] },
    { category: 'mindset', keywords: ['mind', 'believe', 'attitude', 'focus', 'thought', 'discipline'] },
    { category: 'dreams', keywords: ['dream', 'passion', 'vision', 'ambition', 'desire', 'imagine'] },
    { category: 'perseverance', keywords: ['never give up', 'keep going', 'persistence', 'grit', 'struggle', 'overcome'] },
    { category: 'happiness', keywords: ['happy', 'joy', 'gratitude', 'smile', 'cheer', 'contentment'] },
    { category: 'wisdom', keywords: ['wisdom', 'knowledge', 'truth', 'insight', 'learn', 'understand'] },
    { category: 'leadership', keywords: ['lead', 'inspire', 'influence', 'guide', 'visionary', 'empower'] },
    { category: 'courage', keywords: ['fear', 'courage', 'bravery', 'dare', 'risk', 'bold'] },
    { category: 'faith', keywords: ['faith', 'trust', 'believe', 'spirit', 'hope', 'divine'] },
    { category: 'discipline', keywords: ['habit', 'discipline', 'routine', 'self-control', 'structure'] },
    { category: 'productivity', keywords: ['focus', 'work', 'task', 'productive', 'efficiency', 'priority'] },
    { category: 'creativity', keywords: ['create', 'art', 'innovate', 'expression', 'imagination'] },
    { category: 'resilience', keywords: ['bounce back', 'resilience', 'recover', 'rebuild', 'adapt', 'strength'] },
    { category: 'change', keywords: ['change', 'transformation', 'evolve', 'shift', 'reinvent'] },
    { category: 'growth', keywords: ['grow', 'improve', 'development', 'progress', 'elevate'] },
    { category: 'freedom', keywords: ['freedom', 'liberty', 'independence', 'release'] },
    { category: 'self-love', keywords: ['self-love', 'worth', 'value', 'confidence', 'esteem', 'self-care'] },
    { category: 'focus', keywords: ['clarity', 'focus', 'attention', 'concentration'] }
  ];

  let bestCategory = 'inspiration';
  let maxScore = 0;

  for (const entry of categories) {
    let score = 0;
    for (const keyword of entry.keywords) {
      if (t.includes(keyword)) score++;
    }

    if (score > maxScore) {
      maxScore = score;
      bestCategory = entry.category;
    }
  }

  return bestCategory;
};


