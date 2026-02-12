import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { databaseStorageService } from '../lib/databaseStorage';

// Types
export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string; // 支持 tailwind 类或自定义 hex/rgb
  createdAt?: Date;
}

export interface Shortcut {
  id: string;
  name: string;
  path: string;
  icon: string;
  categoryId: string;
  createdAt?: Date;
}

interface ShortcutContextType {
  categories: Category[];
  shortcuts: Shortcut[];
  activeCategory: string | null;
  setActiveCategory: (categoryId: string | null) => void;
  addCategory: (name: string, icon: string, color: string) => void;
  updateCategory: (category: Category) => Promise<void>;
  deleteCategory: (categoryId: string) => Promise<void>;
  addShortcut: (name: string, icon: string, path: string, categoryId: string) => void;
  updateShortcut: (shortcut: Shortcut) => Promise<void>;
  deleteShortcut: (shortcutId: string) => Promise<void>;
  getShortcutsByCategory: (categoryId: string) => Shortcut[];
}

// Create context with default values
const ShortcutContext = createContext<ShortcutContextType | undefined>(undefined);

// Provider component
export function ShortcutProvider({ children }: { children: ReactNode }) {
  // State
  const [categories, setCategories] = useState<Category[]>([]);
  const [shortcuts, setShortcuts] = useState<Shortcut[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  // Load data from database on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const savedCategories = await databaseStorageService.getCategories();
        const savedShortcuts = await databaseStorageService.getShortcuts();
        const savedActiveCategory = await databaseStorageService.getSetting('activeCategory');
        
        if (savedCategories) setCategories(savedCategories);
        if (savedShortcuts) setShortcuts(savedShortcuts);
        if (savedActiveCategory) setActiveCategory(savedActiveCategory);
        
        console.log('数据从数据库加载完成');
      } catch (error) {
        console.error('Failed to load data from database:', error);
      }
    };
    
    loadData();
  }, []);

  // Save data to database when state changes
  useEffect(() => {
    const saveData = async () => {
      try {
        // 保存分类数据
        for (const category of categories) {
          await databaseStorageService.addCategory(category);
        }
        
        // 保存快捷方式数据
        for (const shortcut of shortcuts) {
          await databaseStorageService.addShortcut(shortcut);
        }
        
        // 保存激活分类设置
        if (activeCategory) {
          await databaseStorageService.setSetting('activeCategory', activeCategory);
        }
        
        console.log('数据保存到数据库完成');
      } catch (error) {
        console.error('Failed to save data to database:', error);
      }
    };
    
    saveData();
  }, [categories, shortcuts, activeCategory]);

  // Get shortcuts by category
  const getShortcutsByCategory = (categoryId: string): Shortcut[] => {
    return shortcuts.filter(shortcut => shortcut.categoryId === categoryId);
  };

  // Add new category
  const addCategory = async (name: string, icon: string, color: string) => {
    const newCategory: Category = {
      id: uuidv4(),
      name,
      icon,
      color,
      createdAt: new Date()
    };
    
    try {
      // 保存到数据库
      const success = await databaseStorageService.addCategory(newCategory);
      if (success) {
        setCategories(prev => {
          const newCategories = [...prev, newCategory];
          
          // Set as active category if it's the first one
          if (prev.length === 0) {
            setActiveCategory(newCategory.id);
          }
          
          return newCategories;
        });
        console.log('分类添加成功:', name);
      } else {
        console.error('分类保存到数据库失败:', name);
      }
    } catch (error) {
      console.error('添加分类失败:', error);
    }
  };

  // Update category
  const updateCategory = async (updatedCategory: Category) => {
    try {
      // 保留原有的createdAt字段
      const existingCategory = categories.find(cat => cat.id === updatedCategory.id);
      const categoryToUpdate: Category = {
        ...updatedCategory,
        createdAt: existingCategory?.createdAt || new Date()
      };
      
      // 更新到数据库
      const success = await databaseStorageService.updateCategory(categoryToUpdate);
      if (success) {
        setCategories(prev => 
          prev.map(category => 
            category.id === updatedCategory.id ? categoryToUpdate : category
          )
        );
        console.log('分类更新成功:', updatedCategory.name);
      } else {
        console.error('分类更新到数据库失败:', updatedCategory.name);
        throw new Error('Failed to update category in database');
      }
    } catch (error) {
      console.error('更新分类失败:', error);
      throw error;
    }
  };

  // Delete category and associated shortcuts
  const deleteCategory = async (categoryId: string) => {
    try {
      // 先从数据库删除分类
      const ok = await databaseStorageService.deleteCategory(categoryId);
      if (!ok) {
        console.error('数据库删除分类失败: ', categoryId);
      }
      // 再从内存状态移除
      setCategories(prev => prev.filter(category => category.id !== categoryId));
      setShortcuts(prev => prev.filter(shortcut => shortcut.categoryId !== categoryId));
      if (activeCategory === categoryId) {
        setActiveCategory(null);
      }
    } catch (err) {
      console.error('删除分类失败: ', err);
    }
  };

  // Add new shortcut
  const addShortcut = async (name: string, icon: string, path: string, categoryId: string) => {
    const newShortcut: Shortcut = {
      id: uuidv4(),
      name,
      icon,
      path,
      categoryId,
      createdAt: new Date()
    };
    
    try {
      // 保存到数据库
      const success = await databaseStorageService.addShortcut(newShortcut);
      if (success) {
        setShortcuts(prev => [...prev, newShortcut]);
        console.log('快捷方式添加成功:', name);
      } else {
        console.error('快捷方式保存到数据库失败:', name);
      }
    } catch (error) {
      console.error('添加快捷方式失败:', error);
    }
  };

  // Update shortcut
  const updateShortcut = async (updatedShortcut: Shortcut) => {
    try {
      // 保留原有的createdAt字段
      const existingShortcut = shortcuts.find(short => short.id === updatedShortcut.id);
      const shortcutToUpdate: Shortcut = {
        ...updatedShortcut,
        createdAt: existingShortcut?.createdAt || new Date()
      };
      
      // 更新到数据库
      const success = await databaseStorageService.updateShortcut(shortcutToUpdate);
      if (success) {
        setShortcuts(prev => 
          prev.map(shortcut => 
            shortcut.id === updatedShortcut.id ? shortcutToUpdate : shortcut
          )
        );
        console.log('快捷方式更新成功:', updatedShortcut.name);
      } else {
        console.error('快捷方式更新到数据库失败:', updatedShortcut.name);
        throw new Error('Failed to update shortcut in database');
      }
    } catch (error) {
      console.error('更新快捷方式失败:', error);
      throw error;
    }
  };

  // Delete shortcut
  const deleteShortcut = async (shortcutId: string) => {
    try {
      const ok = await databaseStorageService.deleteShortcut(shortcutId);
      if (!ok) {
        console.error('数据库删除快捷方式失败: ', shortcutId);
      }
      setShortcuts(prev => prev.filter(shortcut => shortcut.id !== shortcutId));
    } catch (err) {
      console.error('删除快捷方式失败: ', err);
    }
  };

  const value = {
    categories,
    shortcuts,
    activeCategory,
    setActiveCategory,
    addCategory,
    updateCategory,
    deleteCategory,
    addShortcut,
    updateShortcut,
    deleteShortcut,
    getShortcutsByCategory
  };

  return React.createElement(ShortcutContext.Provider, { value }, children);
}

// Custom hook to use the shortcut context
export function useShortcutContext() {
  const context = useContext(ShortcutContext);
  if (context === undefined) {
    throw new Error('useShortcutContext must be used within a ShortcutProvider');
  }
  return context;
}