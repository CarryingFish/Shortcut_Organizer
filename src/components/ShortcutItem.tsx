import { useState, useRef } from 'react';
import { Shortcut, Category } from '@/types';
import { useShortcutContext } from '@/contexts/shortcutContext';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface ShortcutItemProps {
  shortcut: Shortcut;
  onEdit: (shortcut: Shortcut) => void;
}

export default function ShortcutItem({ shortcut, onEdit }: ShortcutItemProps) {
  const { deleteShortcut, updateShortcut, categories } = useShortcutContext();
  const [isHovered, setIsHovered] = useState(false);
  const [showContextMenu, setShowContextMenu] = useState(false);
  const contextMenuRef = useRef<HTMLDivElement>(null);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowContextMenu(true);
  };

  const handleDelete = () => {
    if (confirm(`确定要删除快捷方式 "${shortcut.name}" 吗？`)) {
      deleteShortcut(shortcut.id);
      toast.success(`快捷方式 "${shortcut.name}" 删除成功`);
      setShowContextMenu(false);
    }
  };

  const handleEdit = () => {
    onEdit(shortcut);
    setShowContextMenu(false);
  };

  const handleChangeCategory = async (newCategoryId: string) => {
    try {
      // 创建更新后的快捷方式对象
      const updatedShortcut = { ...shortcut, categoryId: newCategoryId };
      
      // 调用更新函数
      await updateShortcut(updatedShortcut);
      
      toast.success(`快捷方式已移动到新分类`);
      setShowContextMenu(false);
    } catch (error) {
      console.error('移动快捷方式失败:', error);
      toast.error('移动快捷方式失败，请重试');
    }
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

  const handleRun = async () => {
    try {
      // 检查是否在 Electron 环境中
      if (window.electronAPI) {
        // 显示启动中的提示
        toast.info(`正在启动 ${shortcut.name}...`);
        
        // 使用 Electron API 启动程序
        const result = await window.electronAPI.launchApp(shortcut.path);
        
        if (result && result.success) {
          toast.success(`成功启动 ${shortcut.name}`);
        } else {
          toast.error(`启动 ${shortcut.name} 失败`);
        }
      } else {
        // 在浏览器环境中，尝试使用其他方法
        // 注意：由于浏览器安全限制，无法直接启动本地程序
        toast.error('无法启动程序：当前环境不支持程序启动');
        console.log(`尝试启动程序: ${shortcut.path}`);
      }
    } catch (error) {
      console.error('启动程序失败:', error);
      toast.error(`启动 ${shortcut.name} 失败: ${error.message}`);
    }
  };

  return (
    <div className="relative">
      <div 
        onClick={handleRun}
        onContextMenu={handleContextMenu}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={cn(
          "bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 transition-all duration-300 flex flex-col items-center text-center",
          isHovered ? "transform scale-[1.02] shadow-lg cursor-pointer" : "shadow-sm"
        )}
      >
        <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mb-3 text-blue-600 dark:text-blue-400">
          <i className={`fa ${shortcut.icon} text-2xl`}></i>
        </div>
        
        <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-1 truncate w-full">{shortcut.name}</h3>
        
        <div className="text-xs text-gray-500 dark:text-gray-400 truncate w-full mb-3">
          {shortcut.path.length > 30 
            ? `${shortcut.path.substring(0, 15)}...${shortcut.path.substring(shortcut.path.length - 15)}`
            : shortcut.path}
        </div>
      </div>

      {/* 右键菜单 */}
      {showContextMenu && (
        <div 
          ref={contextMenuRef}
          className="absolute top-full left-0 z-50 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1 min-w-[140px]"
        >
          <button
            onClick={handleEdit}
            className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <i className="fa fa-edit mr-2"></i>
            编辑快捷方式
          </button>
          
          <div className="border-t border-gray-200 dark:border-gray-600">
            <div className="px-4 py-2 text-xs text-gray-500 dark:text-gray-400">
              移动到分类:
            </div>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleChangeCategory(category.id)}
                className={cn(
                  "w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors",
                  shortcut.categoryId === category.id 
                    ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900" 
                    : "text-gray-700 dark:text-gray-200"
                )}
              >
                <i className={`fa ${category.icon} mr-2`}></i>
                {category.name}
              </button>
            ))}
          </div>
          
          <div className="border-t border-gray-200 dark:border-gray-600">
            <button
              onClick={handleDelete}
              className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <i className="fa fa-trash-o mr-2"></i>
              删除快捷方式
            </button>
          </div>
        </div>
      )}
    </div>
  );
}