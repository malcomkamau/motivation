// quotesDb.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuidv4 } from 'uuid';

const QUOTES_KEY = 'QUOTES_DATA';

export const saveQuotes = async (quotesArray) => {
  try {
    await AsyncStorage.setItem(QUOTES_KEY, JSON.stringify(quotesArray));
  } catch (error) {
    console.error('Failed to save quotes:', error);
  }
};

export const getQuotes = async () => {
  try {
    const json = await AsyncStorage.getItem(QUOTES_KEY);
    return json != null ? JSON.parse(json) : [];
  } catch (error) {
    console.error('Failed to load quotes:', error);
    return [];
  }
};

export const addQuote = async (newQuote) => {
  const quotes = await getQuotes();

  const quoteWithId = {
    id: newQuote.id || uuidv4(),
    text: newQuote.text,
    author: newQuote.author || 'Unknown',
    category: newQuote.category || 'inspiration',
  };

  const updated = [...quotes, quoteWithId];
  await saveQuotes(updated);
};

export const replaceQuotes = async (newQuotes) => {
  const quotesWithIds = newQuotes.map(q => ({
    id: q.id || uuidv4(),
    text: q.text,
    author: q.author || 'Unknown',
    category: q.category || 'inspiration',
  }));

  await saveQuotes(quotesWithIds);
};

export const getAvailableCategories = async () => {
  const quotes = await getQuotes();
  const allCategories = quotes.map(q => q.category).filter(Boolean);
  const uniqueCategories = Array.from(new Set(allCategories));
  return uniqueCategories;
};

export const getQuotesCountByCategory = async () => {
  const quotes = await getQuotes();
  return quotes.reduce((acc, q) => {
    const cat = q.category;
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});
};

export const updateQuote = async (id, changes) => {
  const quotes = await getQuotes();
  const updated = quotes.map(q => q.id === id ? { ...q, ...changes } : q);
  await saveQuotes(updated);
};

export const deleteQuote = async (id) => {
  const quotes = await getQuotes();
  const updated = quotes.filter(q => q.id !== id);
  await saveQuotes(updated);
};

export const getFavorites = async (email) => {
  try {
    const data = await AsyncStorage.getItem(`favorites_${email}`);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting favorites:', error);
    return [];
  }
};

export const addFavorite = async (email, quote) => {
  try {
    const currentFavorites = await getFavorites(email);
    const exists = currentFavorites.some(q => q.id === quote.id);
    if (!exists) {
      const updated = [...currentFavorites, quote];
      await AsyncStorage.setItem(`favorites_${email}`, JSON.stringify(updated));
    }
  } catch (error) {
    console.error('Error adding favorite:', error);
  }
};

export const removeFavorite = async (email, quoteId) => {
  try {
    const currentFavorites = await getFavorites(email);
    const updated = currentFavorites.filter(q => q.id !== quoteId);
    await AsyncStorage.setItem(`favorites_${email}`, JSON.stringify(updated));
  } catch (error) {
    console.error('Error removing favorite:', error);
  }
};

