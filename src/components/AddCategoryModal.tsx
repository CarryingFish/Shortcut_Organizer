import { useState } from 'react';
import { useShortcutContext } from '@/contexts/shortcutContext';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface AddCategoryModalProps {
  onClose: () => void;
}

// 预设颜色（减少为 7 个）
const COLOR_OPTIONS = [
  "bg-blue-500", "bg-green-500", "bg-red-500", "bg-yellow-500",
  "bg-purple-500", "bg-pink-500", "bg-indigo-500"
];

// Predefined icon options
const ICON_OPTIONS = [
  "fa-briefcase", "fa-code", "fa-film", "fa-music", "fa-gamepad", 
  "fa-calculator", "fa-file-text", "fa-image", "fa-chart-bar", "fa-envelope"
];

export default function AddCategoryModal({ onClose }: AddCategoryModalProps) {
  const { addCategory, categories } = useShortcutContext();
  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLOR_OPTIONS[0]);
  const [selectedIcon, setSelectedIcon] = useState(ICON_OPTIONS[0]);
  const [customColor, setCustomColor] = useState<string>('#3B82F6');
  const [useCustom, setUseCustom] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error("请输入分类名称");
      return;
    }
    
    if (categories.some(cat => cat.name.toLowerCase() === name.toLowerCase())) {
      toast.error("已存在同名分类");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const colorToSave = useCustom ? customColor : selectedColor;
      addCategory(name.trim(), selectedIcon, colorToSave);
      toast.success(`分类 "${name}" 创建成功`);
      onClose();
      
      // Reset form
      setName('');
      setSelectedColor(COLOR_OPTIONS[0]);
      setSelectedIcon(ICON_OPTIONS[0]);
    } catch (error) {
      toast.error("创建分类失败，请重试");
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
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">新建分类</h2>
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
                分类名称
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="如：效率、开发"
                disabled={isSubmitting}
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                图标
              </label>
              <div className="grid grid-cols-5 gap-3 mt-2">
                {ICON_OPTIONS.map(icon => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => setSelectedIcon(icon)}
                    className={`p-3 rounded-lg transition-all ${
                      selectedIcon === icon 
                        ? "bg-blue-100 dark:bg-blue-900 border-2 border-blue-500" 
                        : "bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
                    }`}
                    disabled={isSubmitting}
                  >
                    <i className={`fa ${icon} text-xl`}></i>
                  </button>
                ))}
              </div>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                颜色
              </label>
              <div className="flex flex-wrap gap-3 mt-2">
                {COLOR_OPTIONS.map(color => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => { setUseCustom(false); setSelectedColor(color); }}
                    className={`w-10 h-10 rounded-full transition-transform ${
                      selectedColor === color ? "ring-2 ring-blue-500 transform scale-110" : ""
                    } ${color}`}
                    disabled={isSubmitting}
                    aria-label={`选择颜色 ${color}`}
                  />
                ))}
              </div>

              {/* 自定义颜色 */}
              <div className="mt-3 flex items-center gap-3">
                <label className="text-sm text-gray-600 dark:text-gray-300">自定义</label>
                <input
                  type="color"
                  value={customColor}
                  onChange={(e) => { setUseCustom(true); setCustomColor(e.target.value); }}
                  className="h-8 w-12 p-0 border border-gray-300 dark:border-gray-600 rounded cursor-pointer bg-transparent"
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => setUseCustom(true)}
                  className={`px-3 py-1 rounded border text-sm ${useCustom ? 'border-blue-500 text-blue-600' : 'border-gray-300 text-gray-600 dark:border-gray-600 dark:text-gray-300'}`}
                  disabled={isSubmitting}
                >
                  使用自定义
                </button>
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
                    <i className="fa fa-spinner fa-spin"></i> 正在创建...
                  </>
                ) : (
                  <>
                    <i className="fa fa-plus"></i> 创建分类
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