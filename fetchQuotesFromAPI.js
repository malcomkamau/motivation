// fetchQuotesFromAPI.js
import uuid from 'react-native-uuid';

export const fetchQuotesFromAPI = async () => {
  const API_URL = 'https://zenquotes.io/api/quotes';

  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error('Failed to fetch quotes');

    const data = await response.json();

    return data.map(q => ({
      id: uuid.v4(),
      text: q.q,
      author: q.a || 'Unknown',
      category: categorizeQuote(q.q),
    }));
    
  } catch (err) {
    console.error('❌ Error fetching quotes:', err);
    return [];
  }
};

const categorizeQuote = (text = '') => {
  const t = text.toLowerCase();
  if (t.includes('success') || t.includes('goal')) return 'success';
  if (t.includes('love')) return 'love';
  if (t.includes('life') || t.includes('journey')) return 'life';
  if (t.includes('mind') || t.includes('believe')) return 'mindset';
  if (t.includes('dream') || t.includes('passion')) return 'dreams';
  return 'inspiration';
};
