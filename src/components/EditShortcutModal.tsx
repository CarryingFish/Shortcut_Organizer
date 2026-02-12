import { useState, useEffect } from 'react';
import { Shortcut, Category } from '@/types';
import { useShortcutContext } from '@/contexts/shortcutContext';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface EditShortcutModalProps {
  shortcut: Shortcut | null;
  onClose: () => void;
}

// Predefined icon options
// 选择一组 Font Awesome 4/5 通用且稳定的图标，避免品牌图标导致的缺失
const ICON_OPTIONS = [
  "fa-file-word", "fa-file-excel", "fa-file-powerpoint", "fa-code",
  // 将品牌图标替换为通用图标，确保在当前依赖下可正常显示
  "fa-globe", "fa-compass", "fa-rocket", "fa-file-pdf", "fa-image",
  "fa-music", "fa-film", "fa-gamepad", "fa-briefcase", "fa-envelope"
];

export default function EditShortcutModal({ shortcut, onClose }: EditShortcutModalProps) {
  const { updateShortcut, deleteShortcut, categories } = useShortcutContext();
  const [name, setName] = useState('');
  const [path, setPath] = useState('');
  const [selectedIcon, setSelectedIcon] = useState(ICON_OPTIONS[0]);
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (shortcut) {
      setName(shortcut.name);
      setPath(shortcut.path);
      setSelectedIcon(shortcut.icon);
      setSelectedCategoryId(shortcut.categoryId);
    }
  }, [shortcut]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!shortcut) return;
    
    if (!name.trim()) {
      toast.error("请输入快捷方式名称");
      return;
    }
    
    if (!path.trim()) {
      toast.error("请输入程序路径");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const updatedShortcut: Shortcut = {
        ...shortcut,
        name: name.trim(),
        path: path.trim(),
        icon: selectedIcon,
        categoryId: selectedCategoryId
      };
      
      await updateShortcut(updatedShortcut);
      toast.success(`快捷方式 "${name}" 更新成功`);
      onClose();
    } catch (error) {
      toast.error("更新快捷方式失败，请重试");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!shortcut) return;
    
    if (confirm(`确定要删除快捷方式 "${shortcut.name}" 吗？`)) {
      setIsSubmitting(true);
      
      try {
        await deleteShortcut(shortcut.id);
        toast.success(`快捷方式 "${shortcut.name}" 删除成功`);
        onClose();
      } catch (error) {
        toast.error("删除快捷方式失败，请重试");
        console.error(error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  if (!shortcut) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md transform transition-all duration-300 scale-100">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">编辑快捷方式</h2>
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
                输入应用程序可执行文件的完整路径
              </p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                所属分类
              </label>
              <select
                value={selectedCategoryId}
                onChange={(e) => setSelectedCategoryId(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                disabled={isSubmitting}
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                选择图标
              </label>
              <div className="grid grid-cols-7 gap-3 mt-2">
                {ICON_OPTIONS.map(icon => (
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
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                disabled={isSubmitting}
              >
                <i className="fa fa-trash-o"></i>
                删除
              </button>
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
                    <i className="fa fa-spinner fa-spin"></i> 保存中...
                  </>
                ) : (
                  <>
                    <i className="fa fa-save"></i> 保存更改
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
