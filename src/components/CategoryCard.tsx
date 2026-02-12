import { useState, useRef } from 'react';
import { Category } from '@/types';
import { useShortcutContext } from '@/contexts/shortcutContext';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface CategoryCardProps {
  category: Category;
  isActive: boolean;
  onClick: () => void;
  onEdit: (category: Category) => void;
}

export default function CategoryCard({ category, isActive, onClick, onEdit }: CategoryCardProps) {
  const { deleteCategory, getShortcutsByCategory } = useShortcutContext();
  const [isHovered, setIsHovered] = useState(false);
  const [showContextMenu, setShowContextMenu] = useState(false);
  const contextMenuRef = useRef<HTMLDivElement>(null);
  const shortcutsCount = getShortcutsByCategory(category.id).length;
  const isCustomColor = /^#|^rgb\(/i.test(category.color || '');

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowContextMenu(true);
  };

  const handleDelete = () => {
    if (confirm(`确定要删除分类 "${category.name}" 吗？这将同时删除该分类下的所有快捷方式。`)) {
      deleteCategory(category.id);
      toast.success(`分类 "${category.name}" 删除成功`);
      setShowContextMenu(false);
    }
  };

  const handleEdit = () => {
    onEdit(category);
    setShowContextMenu(false);
  };

  // 点击其他地方关闭右键菜单
  const handleClickOutside = (e: MouseEvent) => {
    if (contextMenuRef.current && !contextMenuRef.current.contains(e.target as Node)) {
      setShowContextMenu(false);
    }
  };

  // 添加全局点击监听
  useState(() => {
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  });

  return (
    <div className="relative">
      <div 
        onClick={onClick}
        onContextMenu={handleContextMenu}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={cn(
          "relative flex items-center p-4 rounded-xl transition-all duration-300 cursor-pointer",
          isActive 
            ? `${!isCustomColor ? category.color : ''} text-white shadow-lg shadow-opacity-20` 
            : "bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700",
          isHovered 
            ? "transform scale-[1.02] shadow-md" 
            : "transform scale-100 shadow-sm"
        )}
        style={isActive && isCustomColor ? { backgroundColor: category.color as unknown as string } : undefined}
      >
        <div
          className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center mr-3",
            isActive ? "bg-white bg-opacity-20" : `${!isCustomColor ? category.color : ''} text-white`
          )}
          style={!isActive && isCustomColor ? { backgroundColor: category.color as unknown as string } : undefined}
        >
          <i className={`fa ${category.icon} text-lg`}></i>
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-medium truncate">{category.name}</h3>
          <p className={cn(
            "text-sm",
            isActive ? "text-white text-opacity-80" : "text-gray-500 dark:text-gray-400"
          )}>
            {shortcutsCount} 个快捷方式
          </p>
        </div>
        
        {isActive && (
          <div className="absolute -right-1 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-white rounded-full"></div>
        )}
      </div>

      {/* 右键菜单 */}
      {showContextMenu && (
        <div 
          ref={contextMenuRef}
          className="absolute top-full left-0 z-50 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1 min-w-[120px]"
        >
          <button
            onClick={handleEdit}
            className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <i className="fa fa-edit mr-2"></i>
            编辑分类
          </button>
          <button
            onClick={handleDelete}
            className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <i className="fa fa-trash-o mr-2"></i>
            删除分类
          </button>
        </div>
      )}
    </div>
  );
}