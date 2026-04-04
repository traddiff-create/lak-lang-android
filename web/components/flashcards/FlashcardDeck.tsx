import { useState } from 'react';
import { useVocabulary, useCategories } from '../../hooks/useVocabulary';
import { FlashCard } from './FlashCard';
import { CategoryFilter } from './CategoryFilter';

export function FlashcardDeck() {
  const [category, setCategory] = useState<string | undefined>(undefined);
  const [currentIndex, setCurrentIndex] = useState(0);

  const { items, loading, error } = useVocabulary(category);
  const { categories } = useCategories();

  // Reset to first card when category changes
  const handleCategoryChange = (cat: string | undefined) => {
    setCategory(cat);
    setCurrentIndex(0);
  };

  const goNext = () => {
    if (currentIndex < items.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const goPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Failed to load vocabulary: {error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 text-center mb-6">
          Vocabulary Flashcards
        </h2>
        <CategoryFilter
          categories={categories}
          selected={category}
          onSelect={handleCategoryChange}
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          No vocabulary items found.
        </div>
      ) : (
        <>
          {/* Progress */}
          <div className="text-center text-sm text-gray-500 mb-4">
            {currentIndex + 1} of {items.length}
          </div>

          {/* Card */}
          <FlashCard key={items[currentIndex].id} item={items[currentIndex]} />

          {/* Navigation */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <button
              onClick={goPrev}
              disabled={currentIndex === 0}
              className="px-5 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-30 disabled:cursor-not-allowed bg-gray-100 text-gray-700 hover:bg-gray-200"
            >
              Previous
            </button>
            <button
              onClick={goNext}
              disabled={currentIndex === items.length - 1}
              className="px-5 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-30 disabled:cursor-not-allowed bg-gray-100 text-gray-700 hover:bg-gray-200"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}
