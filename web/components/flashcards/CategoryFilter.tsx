import type { CategoryCount } from '../../lib/api';

interface CategoryFilterProps {
  categories: CategoryCount[];
  selected: string | undefined;
  onSelect: (category: string | undefined) => void;
}

export function CategoryFilter({
  categories,
  selected,
  onSelect,
}: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2 justify-center">
      <button
        className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
          !selected
            ? 'bg-gray-900 text-white'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}
        onClick={() => onSelect(undefined)}
      >
        All
      </button>
      {categories.map((cat) => (
        <button
          key={cat.category}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
            selected === cat.category
              ? 'bg-gray-900 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
          onClick={() => onSelect(cat.category ?? undefined)}
        >
          {cat.category}
          <span className="ml-1.5 text-xs opacity-70">{cat.count}</span>
        </button>
      ))}
    </div>
  );
}
