import { useState, useEffect } from 'react';
import { useShortcutContext } from '@/contexts/shortcutContext';
import { Category, Shortcut } from '@/types';
import CategoryCard from '@/components/CategoryCard';
import ShortcutItem from '@/components/ShortcutItem';
import AddCategoryModal from '@/components/AddCategoryModal';
import AddShortcutModal from '@/components/AddShortcutModal';
import EditCategoryModal from '@/components/EditCategoryModal';
import EditShortcutModal from '@/components/EditShortcutModal';
import SearchBar from '@/components/SearchBar';
import { Empty } from '@/components/Empty';
import { useTheme } from '@/hooks/useTheme';
import { cn } from '@/lib/utils';

export default function Home() {
  const { categories, shortcuts, activeCategory, setActiveCategory, getShortcutsByCategory } = useShortcutContext();
  const { theme, toggleTheme } = useTheme();
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [showAddShortcutModal, setShowAddShortcutModal] = useState(false);
  const [showEditCategoryModal, setShowEditCategoryModal] = useState(false);
  const [showEditShortcutModal, setShowEditShortcutModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingShortcut, setEditingShortcut] = useState<Shortcut | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const activeShortcuts = activeCategory 
    ? getShortcutsByCategory(activeCategory)
    : [];

  const isSearching = searchQuery.trim().length > 0;
  const sourceShortcuts = isSearching ? shortcuts : activeShortcuts;

  // Filter shortcuts based on search query
  const filteredShortcuts = sourceShortcuts.filter(shortcut => 
    shortcut.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    shortcut.path.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // 计算标题中分类名的高亮颜色（与分类标签联动）
  const activeCat = categories.find(c => c.id === activeCategory);
  const isCustomTitleColor = !!activeCat && /^#|^rgb\(/i.test(activeCat.color || '');
  const tailwindTextColorMap: Record<string, string> = {
    'bg-blue-500': 'text-blue-600',
    'bg-green-500': 'text-green-600',
    'bg-red-500': 'text-red-600',
    'bg-yellow-500': 'text-yellow-600',
    'bg-purple-500': 'text-purple-600',
    'bg-pink-500': 'text-pink-600',
    'bg-indigo-500': 'text-indigo-600',
  };
  const titleTextClass = activeCat && !isCustomTitleColor ? (tailwindTextColorMap[activeCat.color] || 'text-blue-600') : '';

  // Apply Windows 11 theme to document
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    setIsInitialLoad(false);
  }, [theme]);

  // If no active category but there are categories, set the first one as active
  useEffect(() => {
    if (categories.length > 0 && !activeCategory) {
      setActiveCategory(categories[0].id);
    }
  }, [categories, activeCategory, setActiveCategory]);

  return (
    <div className={cn(
      "min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300",
      isInitialLoad ? "opacity-0" : "opacity-100"
    )}>
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 transition-all duration-300">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <i className="fa fa-th-large text-xl"></i>
            </div>
            <h1 className="text-xl font-semibold">快捷方式管理器</h1>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              aria-label={theme === 'dark' ? "Switch to light theme" : "Switch to dark theme"}
            >
              <i className={theme === 'dark' ? "fa fa-sun" : "fa fa-moon"}></i>
            </button>
            
            <button 
              onClick={() => setShowAddCategoryModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
            >
              <i className="fa fa-plus"></i>
              <span>分类</span>
            </button>
            
            {activeCategory && (
              <button 
                onClick={() => setShowAddShortcutModal(true)}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
              >
                <i className="fa fa-plus"></i>
                <span>快捷方式</span>
              </button>
            )}
          </div>
        </div>
        
        {/* Search Bar */}
        <SearchBar 
          query={searchQuery} 
          onChange={setSearchQuery} 
          placeholder="搜索快捷方式..." 
        />
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Categories Section (hidden while searching) */}
        {!isSearching && (
          <section className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium">分类</h2>
              <span className="text-sm text-gray-500 dark:text-gray-400">{categories.length} 个分类</span>
            </div>
            
            {categories.length > 0 ? (
              <div className="flex flex-wrap gap-4">
                {categories.map(category => (
                  <CategoryCard 
                    key={category.id}
                    category={category}
                    isActive={activeCategory === category.id}
                    onClick={() => setActiveCategory(category.id)}
                    onEdit={(category) => {
                      setEditingCategory(category);
                      setShowEditCategoryModal(true);
                    }}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center border border-dashed border-gray-300 dark:border-gray-700">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600 dark:text-blue-400">
                  <i className="fa fa-folder-open text-2xl"></i>
                </div>
                <h3 className="text-lg font-medium mb-2">暂无分类</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">创建你的第一个分类来管理快捷方式</p>
                <button 
                  onClick={() => setShowAddCategoryModal(true)}
                  className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <i className="fa fa-plus"></i>
                  <span>创建分类</span>
                </button>
              </div>
            )}
          </section>
        )}

        {/* Shortcuts Section */}
        <section>
          {isSearching ? (
            <>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium">搜索结果</h2>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  共 {filteredShortcuts.length} 条
                </span>
              </div>
              {filteredShortcuts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {filteredShortcuts.map(shortcut => (
                    <ShortcutItem 
                      key={shortcut.id} 
                      shortcut={shortcut}
                      onEdit={(shortcut) => {
                        setEditingShortcut(shortcut);
                        setShowEditShortcutModal(true);
                      }}
                    />
                  ))}
                </div>
              ) : (
                <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center border border-gray-200 dark:border-gray-700">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-500 dark:text-gray-400">
                    <i className="fa fa-search text-2xl"></i>
                  </div>
                  <h3 className="text-lg font-medium mb-2">未找到结果</h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">没有符合条件的快捷方式</p>
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                  >
                    <i className="fa fa-times"></i>
                    <span>清除搜索</span>
                  </button>
                </div>
              )}
            </>
          ) : activeCategory ? (
            <>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium">
                  <span
                    className={cn(titleTextClass)}
                    style={isCustomTitleColor ? { color: activeCat?.color as unknown as string } : undefined}
                  >
                    {activeCat?.name}
                  </span>
                  <span className="ml-1"> 分类下的快捷方式</span>
                </h2>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {filteredShortcuts.length} / {activeShortcuts.length} 个快捷方式
                </span>
              </div>
              
              {filteredShortcuts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {filteredShortcuts.map(shortcut => (
                    <ShortcutItem 
                      key={shortcut.id} 
                      shortcut={shortcut}
                      onEdit={(shortcut) => {
                        setEditingShortcut(shortcut);
                        setShowEditShortcutModal(true);
                      }}
                    />
                  ))}
                </div>
              ) : searchQuery ? (
                <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center border border-gray-200 dark:border-gray-700">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-500 dark:text-gray-400">
                    <i className="fa fa-search text-2xl"></i>
                  </div>
                  <h3 className="text-lg font-medium mb-2">未找到结果</h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">没有符合条件的快捷方式</p>
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                  >
                    <i className="fa fa-times"></i>
                    <span>清除搜索</span>
                  </button>
                </div>
              ) : (
                <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center border border-dashed border-gray-300 dark:border-gray-700">
                  <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600 dark:text-blue-400">
                    <i className="fa fa-link text-2xl"></i>
                  </div>
                  <h3 className="text-lg font-medium mb-2">该分类暂无快捷方式</h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">添加你的第一个快捷方式</p>
                  <button 
                    onClick={() => setShowAddShortcutModal(true)}
                    className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    <i className="fa fa-plus"></i>
                    <span>添加快捷方式</span>
                  </button>
                </div>
              )}
            </>
          ) : categories.length === 0 ? null : (
            <Empty />
          )}
        </section>
      </main>

      {/* Modals */}
      {showAddCategoryModal && (
        <AddCategoryModal 
          onClose={() => setShowAddCategoryModal(false)} 
        />
      )}
      
      {showAddShortcutModal && (
        <AddShortcutModal 
          categoryId={activeCategory!}
          onClose={() => setShowAddShortcutModal(false)} 
        />
      )}

      {showEditCategoryModal && (
        <EditCategoryModal 
          category={editingCategory}
          onClose={() => {
            setShowEditCategoryModal(false);
            setEditingCategory(null);
          }} 
        />
      )}

      {showEditShortcutModal && (
        <EditShortcutModal 
          shortcut={editingShortcut}
          onClose={() => {
            setShowEditShortcutModal(false);
            setEditingShortcut(null);
          }} 
        />
      )}
    </div>
  );
}