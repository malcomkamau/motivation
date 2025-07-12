// utils/ensureQuotesFetched.js
import { fetchQuotesFromAPI } from './fetchQuotesFromAPI';
import { getQuotes } from '../database/quotesDb';
import NetInfo from '@react-native-community/netinfo';

export async function ensureQuotesFetched() {
  try {
    const quotes = await getQuotes();
    const net = await NetInfo.fetch();

    if (quotes.length < 100 && net.isConnected) {
      await fetchQuotesFromAPI(); // This should also handle saving internally
      console.log('[Quotes] Fresh quotes fetched from API.');
    } else {
      console.log('[Quotes] Fetch skipped: either offline or already have enough quotes.');
    }
  } catch (err) {
    console.error('[Quotes] Error ensuring quotes fetched:', err);
  }
}
