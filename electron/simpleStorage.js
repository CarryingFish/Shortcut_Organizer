// 简单文件存储系统 - 作为SQLite的备选方案
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import os from 'os';
import { app } from 'electron';
import versionManager from './versionManager.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class SimpleStorageService {
  constructor() {
    this.appDataDir = path.join(os.homedir(), '.shortcut-organizer');
    this.lastWriteTime = {}; // 记录每个文件的最后写入时间
    this.writeDebounceMs = 100; // 100ms内的重复写入将被忽略
    this.init();
  }

  init() {
    try {
      // 创建应用数据目录
      if (!fs.existsSync(this.appDataDir)) {
        fs.mkdirSync(this.appDataDir, { recursive: true });
      }

      // 检查版本信息
      const versionCheck = versionManager.checkVersion();
      
      // 如果是新安装，清理现有数据文件
      if (versionCheck.isNewInstall) {
        this.clearAllData();
        console.log('新安装检测到，已清理旧数据文件');
      }

      console.log('简单存储系统初始化成功');
      console.log(`安装类型: ${versionCheck.isNewInstall ? '新安装' : versionCheck.isUpdate ? '版本更新' : '正常启动'}`);
    } catch (error) {
      console.error('简单存储系统初始化失败:', error);
    }
  }

  // 获取文件路径 - 根据环境使用不同的文件前缀
  getFilePath(filename) {
    const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
    const prefix = isDev ? 'dev-' : '';
    return path.join(this.appDataDir, `${prefix}${filename}.json`);
  }

  // 读取数据
  readData(filename) {
    try {
      const filePath = this.getFilePath(filename);
      if (fs.existsSync(filePath)) {
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data);
      }
      return null;
    } catch (error) {
      console.error(`读取数据失败 ${filename}:`, error);
      return null;
    }
  }

  // 写入数据
  writeData(filename, data) {
    try {
      const now = Date.now();
      const lastWrite = this.lastWriteTime[filename] || 0;
      
      // 防重复写入：如果距离上次写入时间太短，则跳过
      if (now - lastWrite < this.writeDebounceMs) {
        return true; // 静默跳过，不报错
      }
      
      const filePath = this.getFilePath(filename);
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
      
      // 更新最后写入时间
      this.lastWriteTime[filename] = now;
      
      // 减少日志输出，只在开发模式下显示
      if (process.env.NODE_ENV === 'development') {
        console.log(`数据写入成功: ${filename}`);
      }
      return true;
    } catch (error) {
      console.error(`写入数据失败 ${filename}:`, error);
      return false;
    }
  }

  // 删除数据
  deleteData(filename) {
    try {
      const filePath = this.getFilePath(filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`数据删除成功: ${filename}`);
        return true;
      }
      return false;
    } catch (error) {
      console.error(`删除数据失败 ${filename}:`, error);
      return false;
    }
  }

  // 清理所有数据文件（保留版本信息）
  clearAllData() {
    try {
      const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
      const files = fs.readdirSync(this.appDataDir);
      
      for (const file of files) {
        if (file.endsWith('.json')) {
          const filePath = path.join(this.appDataDir, file);
          
          // 只清理对应环境的数据文件
          if (isDev) {
            // 开发环境：清理 dev- 前缀的文件
            if (file.startsWith('dev-')) {
              fs.unlinkSync(filePath);
              console.log(`清理开发环境数据文件: ${file}`);
            }
          } else {
            // 生产环境：清理没有 dev- 前缀的文件，但保留版本文件
            if (!file.startsWith('dev-') && !file.includes('version')) {
              fs.unlinkSync(filePath);
              console.log(`清理生产环境数据文件: ${file}`);
            }
          }
        }
      }
      console.log('数据文件清理完成');
      return true;
    } catch (error) {
      console.error('清理数据文件失败:', error);
      return false;
    }
  }

  // 分类相关操作
  getAllCategories() {
    return this.readData('categories') || [];
  }

  addCategory(category) {
    try {
      const categories = this.getAllCategories();
      // 检查是否已存在
      const existingIndex = categories.findIndex(c => c.id === category.id);
      if (existingIndex >= 0) {
        categories[existingIndex] = category;
      } else {
        categories.push(category);
      }
      return this.writeData('categories', categories);
    } catch (error) {
      console.error('添加分类失败:', error);
      return false;
    }
  }

  updateCategory(category) {
    return this.addCategory(category); // 复用添加逻辑
  }

  deleteCategory(categoryId) {
    try {
      const categories = this.getAllCategories();
      const filteredCategories = categories.filter(c => c.id !== categoryId);
      return this.writeData('categories', filteredCategories);
    } catch (error) {
      console.error('删除分类失败:', error);
      return false;
    }
  }

  // 快捷方式相关操作
  getAllShortcuts() {
    return this.readData('shortcuts') || [];
  }

  getShortcutsByCategory(categoryId) {
    const shortcuts = this.getAllShortcuts();
    return shortcuts.filter(s => s.categoryId === categoryId);
  }

  addShortcut(shortcut) {
    try {
      const shortcuts = this.getAllShortcuts();
      // 检查是否已存在
      const existingIndex = shortcuts.findIndex(s => s.id === shortcut.id);
      if (existingIndex >= 0) {
        shortcuts[existingIndex] = shortcut;
      } else {
        shortcuts.push(shortcut);
      }
      return this.writeData('shortcuts', shortcuts);
    } catch (error) {
      console.error('添加快捷方式失败:', error);
      return false;
    }
  }

  updateShortcut(shortcut) {
    return this.addShortcut(shortcut); // 复用添加逻辑
  }

  deleteShortcut(shortcutId) {
    try {
      const shortcuts = this.getAllShortcuts();
      const filteredShortcuts = shortcuts.filter(s => s.id !== shortcutId);
      return this.writeData('shortcuts', filteredShortcuts);
    } catch (error) {
      console.error('删除快捷方式失败:', error);
      return false;
    }
  }

  // 设置相关操作
  getSetting(key) {
    try {
      const settings = this.readData('settings') || {};
      return settings[key] || null;
    } catch (error) {
      console.error('获取设置失败:', error);
      return null;
    }
  }

  setSetting(key, value) {
    try {
      const settings = this.readData('settings') || {};
      settings[key] = value;
      return this.writeData('settings', settings);
    } catch (error) {
      console.error('保存设置失败:', error);
      return false;
    }
  }
}

// 创建全局存储实例
const simpleStorageService = new SimpleStorageService();

export default simpleStorageService;
