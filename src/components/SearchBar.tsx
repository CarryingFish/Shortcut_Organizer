import { cn } from '@/lib/utils';

interface SearchBarProps {
  query: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function SearchBar({ query, onChange, placeholder = "搜索快捷方式..." }: SearchBarProps) {
  return (
    <div className="px-4 pb-3">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <i className="fa fa-search text-gray-400"></i>
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={cn(
            "block w-full pl-10 pr-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all",
            query ? "text-gray-900 dark:text-white" : "text-gray-500 dark:text-gray-400"
          )}
        />
        {query && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          >
            <i className="fa fa-times-circle"></i>
          </button>
        )}
      </div>
    </div>
  );
}