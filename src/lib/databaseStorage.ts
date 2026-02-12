// 数据库存储服务 - 使用SQLite数据库进行数据持久化

export interface DatabaseStorageService {
  // 分类操作
  getCategories: () => Promise<any[]>;
  addCategory: (category: any) => Promise<boolean>;
  updateCategory: (category: any) => Promise<boolean>;
  deleteCategory: (categoryId: string) => Promise<boolean>;
  
  // 快捷方式操作
  getShortcuts: () => Promise<any[]>;
  getShortcutsByCategory: (categoryId: string) => Promise<any[]>;
  addShortcut: (shortcut: any) => Promise<boolean>;
  updateShortcut: (shortcut: any) => Promise<boolean>;
  deleteShortcut: (shortcutId: string) => Promise<boolean>;
  
  // 设置操作
  getSetting: (key: string) => Promise<any>;
  setSetting: (key: string, value: any) => Promise<boolean>;
}

// SQLite数据库存储服务实现
class SQLiteStorageService implements DatabaseStorageService {
  async getCategories(): Promise<any[]> {
    try {
      if (window.electronAPI?.dbGetCategories) {
        const result = await window.electronAPI.dbGetCategories();
        if (result.success) {
          return result.data || [];
        }
        console.error('获取分类失败:', result.error);
        return [];
      }
      return [];
    } catch (error) {
      console.error('数据库获取分类失败:', error);
      return [];
    }
  }

  async addCategory(category: any): Promise<boolean> {
    try {
      if (window.electronAPI?.dbAddCategory) {
        const result = await window.electronAPI.dbAddCategory(category);
        return result.success;
      }
      return false;
    } catch (error) {
      console.error('数据库添加分类失败:', error);
      return false;
    }
  }

  async updateCategory(category: any): Promise<boolean> {
    try {
      if (window.electronAPI?.dbUpdateCategory) {
        const result = await window.electronAPI.dbUpdateCategory(category);
        return result.success;
      }
      return false;
    } catch (error) {
      console.error('数据库更新分类失败:', error);
      return false;
    }
  }

  async deleteCategory(categoryId: string): Promise<boolean> {
    try {
      if (window.electronAPI?.dbDeleteCategory) {
        const result = await window.electronAPI.dbDeleteCategory(categoryId);
        return result.success;
      }
      return false;
    } catch (error) {
      console.error('数据库删除分类失败:', error);
      return false;
    }
  }

  async getShortcuts(): Promise<any[]> {
    try {
      if (window.electronAPI?.dbGetShortcuts) {
        const result = await window.electronAPI.dbGetShortcuts();
        if (result.success) {
          return result.data || [];
        }
        console.error('获取快捷方式失败:', result.error);
        return [];
      }
      return [];
    } catch (error) {
      console.error('数据库获取快捷方式失败:', error);
      return [];
    }
  }

  async getShortcutsByCategory(categoryId: string): Promise<any[]> {
    try {
      if (window.electronAPI?.dbGetShortcutsByCategory) {
        const result = await window.electronAPI.dbGetShortcutsByCategory(categoryId);
        if (result.success) {
          return result.data || [];
        }
        console.error('获取分类快捷方式失败:', result.error);
        return [];
      }
      return [];
    } catch (error) {
      console.error('数据库获取分类快捷方式失败:', error);
      return [];
    }
  }

  async addShortcut(shortcut: any): Promise<boolean> {
    try {
      if (window.electronAPI?.dbAddShortcut) {
        const result = await window.electronAPI.dbAddShortcut(shortcut);
        return result.success;
      }
      return false;
    } catch (error) {
      console.error('数据库添加快捷方式失败:', error);
      return false;
    }
  }

  async updateShortcut(shortcut: any): Promise<boolean> {
    try {
      if (window.electronAPI?.dbUpdateShortcut) {
        const result = await window.electronAPI.dbUpdateShortcut(shortcut);
        return result.success;
      }
      return false;
    } catch (error) {
      console.error('数据库更新快捷方式失败:', error);
      return false;
    }
  }

  async deleteShortcut(shortcutId: string): Promise<boolean> {
    try {
      if (window.electronAPI?.dbDeleteShortcut) {
        const result = await window.electronAPI.dbDeleteShortcut(shortcutId);
        return result.success;
      }
      return false;
    } catch (error) {
      console.error('数据库删除快捷方式失败:', error);
      return false;
    }
  }

  async getSetting(key: string): Promise<any> {
    try {
      if (window.electronAPI?.dbGetSetting) {
        const result = await window.electronAPI.dbGetSetting(key);
        if (result.success) {
          return result.value;
        }
        console.error('获取设置失败:', result.error);
        return null;
      }
      return null;
    } catch (error) {
      console.error('数据库获取设置失败:', error);
      return null;
    }
  }

  async setSetting(key: string, value: any): Promise<boolean> {
    try {
      if (window.electronAPI?.dbSetSetting) {
        const result = await window.electronAPI.dbSetSetting(key, value);
        return result.success;
      }
      return false;
    } catch (error) {
      console.error('数据库保存设置失败:', error);
      return false;
    }
  }
}

// 存储服务工厂
export function createDatabaseStorageService(): DatabaseStorageService {
  // 检查是否在Electron环境中且有数据库API
  if (window.electronAPI?.dbGetCategories) {
    console.log('使用SQLite数据库存储');
    return new SQLiteStorageService();
  } else {
    console.log('SQLite数据库API不可用，回退到localStorage');
    // 这里可以返回一个localStorage的适配器
    throw new Error('SQLite数据库API不可用');
  }
}

// 默认数据库存储服务实例
export const databaseStorageService = createDatabaseStorageService();
