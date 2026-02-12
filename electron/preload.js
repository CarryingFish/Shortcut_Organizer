const { contextBridge, ipcRenderer } = require('electron');

// 暴露安全的 API 给渲染进程
contextBridge.exposeInMainWorld('electronAPI', {
  launchApp: (appPath) => ipcRenderer.invoke('launch-app', appPath),
  forceQuit: () => ipcRenderer.invoke('force-quit'),
  
  // 数据存储API（备选方案）
  saveData: (key, data) => ipcRenderer.invoke('save-data', key, data),
  loadData: (key) => ipcRenderer.invoke('load-data', key),
  deleteData: (key) => ipcRenderer.invoke('delete-data', key),
  
  // 数据库API（主要方案）
  dbGetCategories: () => ipcRenderer.invoke('db-get-categories'),
  dbAddCategory: (category) => ipcRenderer.invoke('db-add-category', category),
  dbUpdateCategory: (category) => ipcRenderer.invoke('db-update-category', category),
  dbDeleteCategory: (categoryId) => ipcRenderer.invoke('db-delete-category', categoryId),
  
  dbGetShortcuts: () => ipcRenderer.invoke('db-get-shortcuts'),
  dbGetShortcutsByCategory: (categoryId) => ipcRenderer.invoke('db-get-shortcuts-by-category', categoryId),
  dbAddShortcut: (shortcut) => ipcRenderer.invoke('db-add-shortcut', shortcut),
  dbUpdateShortcut: (shortcut) => ipcRenderer.invoke('db-update-shortcut', shortcut),
  dbDeleteShortcut: (shortcutId) => ipcRenderer.invoke('db-delete-shortcut', shortcutId),
  
  dbGetSetting: (key) => ipcRenderer.invoke('db-get-setting', key),
  dbSetSetting: (key, value) => ipcRenderer.invoke('db-set-setting', key, value),
  
  // 版本管理API
  versionGetInfo: () => ipcRenderer.invoke('version-get-info'),
  versionIsFirstRun: () => ipcRenderer.invoke('version-is-first-run'),
  versionReset: () => ipcRenderer.invoke('version-reset')
});
