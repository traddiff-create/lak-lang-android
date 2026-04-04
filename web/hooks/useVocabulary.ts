import { useState, useEffect } from 'react';
import {
  fetchVocabulary,
  fetchCategories,
  type VocabularyItem,
  type CategoryCount,
} from '../lib/api';

export function useVocabulary(category?: string) {
  const [items, setItems] = useState<VocabularyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    const params = category ? { category } : undefined;
    fetchVocabulary(params)
      .then(setItems)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [category]);

  return { items, loading, error };
}

export function useCategories() {
  const [categories, setCategories] = useState<CategoryCount[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories()
      .then(setCategories)
      .catch(() => setCategories([]))
      .finally(() => setLoading(false));
  }, []);

  return { categories, loading };
}
