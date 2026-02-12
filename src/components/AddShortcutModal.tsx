import { useState } from 'react';
import { useShortcutContext } from '@/contexts/shortcutContext';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface AddShortcutModalProps {
  categoryId: string;
  onClose: () => void;
}

// 预设图标（去重且更丰富）
// 使用 Font Awesome 常用基础图标，避免品牌/不可用图标导致的方框占位
const ICON_OPTIONS = [
  "fa-file-word", "fa-file-excel", "fa-file-powerpoint", "fa-code",
  "fa-globe", "fa-compass", "fa-rocket", "fa-file-pdf", "fa-image",
  "fa-music", "fa-film", "fa-gamepad", "fa-briefcase", "fa-envelope",
  "fa-terminal", "fa-desktop", "fa-database", "fa-cogs", "fa-cloud",
  "fa-camera", "fa-video-camera", "fa-book", "fa-bolt", "fa-wrench",
  "fa-user", "fa-users", "fa-comment", "fa-comments", "fa-key",
  "fa-lock", "fa-shield", "fa-print", "fa-shopping-cart",
  "fa-map", "fa-paper-plane"
];
const UNIQUE_ICON_OPTIONS = Array.from(new Set(ICON_OPTIONS));

export default function AddShortcutModal({ categoryId, onClose }: AddShortcutModalProps) {
  const { addShortcut, shortcuts, categories } = useShortcutContext();
  const [name, setName] = useState('');
  const [path, setPath] = useState('');
  const [selectedIcon, setSelectedIcon] = useState(UNIQUE_ICON_OPTIONS[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Find the category name for display
  const category = categories.find(cat => cat.id === categoryId);
  const categoryName = category?.name || "选中的分类";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error("请输入快捷方式名称");
      return;
    }
    
    if (!path.trim()) {
      toast.error("请输入应用路径");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      addShortcut(name.trim(), selectedIcon, path.trim(), categoryId);
      toast.success(`已将 "${name}" 添加到 ${categoryName}`);
      onClose();
      
      // Reset form
      setName('');
      setPath('');
      setSelectedIcon(ICON_OPTIONS[0]);
    } catch (error) {
      toast.error("添加快捷方式失败，请重试");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md transform transition-all duration-300 scale-100">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">新建快捷方式</h2>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            >
              <i className="fa fa-times text-xl"></i>
            </button>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                应用名称
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="如：Microsoft Word、Visual Studio Code"
                disabled={isSubmitting}
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                应用路径
              </label>
              <input
                type="text"
                value={path}
                onChange={(e) => setPath(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="例如：C:\\Program Files\\Application\\app.exe"
                disabled={isSubmitting}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                请输入应用可执行文件的完整路径
              </p>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                选择图标
              </label>
              <div className="grid grid-cols-7 gap-3 mt-2">
                {UNIQUE_ICON_OPTIONS.map(icon => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => setSelectedIcon(icon)}
                    className={`p-2 rounded-lg transition-all ${
                      selectedIcon === icon 
                        ? "bg-blue-100 dark:bg-blue-900 border-2 border-blue-500" 
                        : "bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
                    }`}
                    disabled={isSubmitting}
                  >
                    <i className={`fa ${icon} text-lg`}></i>
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                disabled={isSubmitting}
              >
                取消
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <i className="fa fa-spinner fa-spin"></i> 正在添加...
                  </>
                ) : (
                  <>
                    <i className="fa fa-plus"></i> 添加快捷方式
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}