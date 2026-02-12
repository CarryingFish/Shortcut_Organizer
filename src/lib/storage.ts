// 存储服务 - 使用Electron文件系统API进行数据持久化

export interface StorageService {
  save: (key: string, data: any) => Promise<boolean>;
  load: (key: string) => Promise<any>;
  delete: (key: string) => Promise<boolean>;
}

// Electron存储服务实现
class ElectronStorageService implements StorageService {
  async save(key: string, data: any): Promise<boolean> {
    try {
      if (window.electronAPI?.saveData) {
        const result = await window.electronAPI.saveData(key, data);
        return result.success;
      }
      return false;
    } catch (error) {
      console.error('Electron存储保存失败:', error);
      return false;
    }
  }

  async load(key: string): Promise<any> {
    try {
      if (window.electronAPI?.loadData) {
        return await window.electronAPI.loadData(key);
      }
      return null;
    } catch (error) {
      console.error('Electron存储加载失败:', error);
      return null;
    }
  }

  async delete(key: string): Promise<boolean> {
    try {
      if (window.electronAPI?.deleteData) {
        const result = await window.electronAPI.deleteData(key);
        return result.success;
      }
      return false;
    } catch (error) {
      console.error('Electron存储删除失败:', error);
      return false;
    }
  }
}

// 本地存储服务实现（作为备选方案）
class LocalStorageService implements StorageService {
  async save(key: string, data: any): Promise<boolean> {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('localStorage保存失败:', error);
      return false;
    }
  }

  async load(key: string): Promise<any> {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('localStorage加载失败:', error);
      return null;
    }
  }

  async delete(key: string): Promise<boolean> {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('localStorage删除失败:', error);
      return false;
    }
  }
}

// 存储服务工厂
export function createStorageService(): StorageService {
  // 优先使用Electron存储，如果不可用则回退到localStorage
  if (window.electronAPI?.saveData) {
    console.log('使用Electron文件系统存储');
    return new ElectronStorageService();
  } else {
    console.log('使用localStorage存储（备选方案）');
    return new LocalStorageService();
  }
}

// 默认存储服务实例
export const storageService = createStorageService();

// 存储键常量
export const STORAGE_KEYS = {
  CATEGORIES: 'shortcutCategories',
  SHORTCUTS: 'shortcuts',
  ACTIVE_CATEGORY: 'activeCategory',
  SETTINGS: 'settings'
} as const;
