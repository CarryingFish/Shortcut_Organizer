declare global {
  interface Window {
    electronAPI?: {
      launchApp: (path: string) => Promise<void>;
      forceQuit: () => Promise<void>;
      
      // 数据存储API（备选方案）
      saveData: (key: string, data: any) => Promise<{ success: boolean }>;
      loadData: (key: string) => Promise<any>;
      deleteData: (key: string) => Promise<{ success: boolean; message?: string }>;
      
      // 数据库API（主要方案）
      dbGetCategories: () => Promise<{ success: boolean; data?: any[]; error?: string }>;
      dbAddCategory: (category: any) => Promise<{ success: boolean; error?: string }>;
      dbUpdateCategory: (category: any) => Promise<{ success: boolean; error?: string }>;
      dbDeleteCategory: (categoryId: string) => Promise<{ success: boolean; error?: string }>;
      
      dbGetShortcuts: () => Promise<{ success: boolean; data?: any[]; error?: string }>;
      dbGetShortcutsByCategory: (categoryId: string) => Promise<{ success: boolean; data?: any[]; error?: string }>;
      dbAddShortcut: (shortcut: any) => Promise<{ success: boolean; error?: string }>;
      dbUpdateShortcut: (shortcut: any) => Promise<{ success: boolean; error?: string }>;
      dbDeleteShortcut: (shortcutId: string) => Promise<{ success: boolean; error?: string }>;
      
      dbGetSetting: (key: string) => Promise<{ success: boolean; value?: any; error?: string }>;
      dbSetSetting: (key: string, value: any) => Promise<{ success: boolean; error?: string }>;
      
      // 版本管理API
      versionGetInfo: () => Promise<{ success: boolean; data?: any; error?: string }>;
      versionIsFirstRun: () => Promise<{ success: boolean; data?: boolean; error?: string }>;
      versionReset: () => Promise<{ success: boolean; error?: string }>;
    };
  }
}

export {};
