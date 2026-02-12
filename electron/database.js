import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import { app } from 'electron';
import os from 'os';
import fs from 'fs';
import versionManager from './versionManager.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class DatabaseService {
  constructor() {
    this.db = null;
    this.init();
  }

  init() {
    try {
      // 创建应用数据目录
      const appDataDir = path.join(os.homedir(), '.shortcut-organizer');
      if (!fs.existsSync(appDataDir)) {
        fs.mkdirSync(appDataDir, { recursive: true });
      }

      // 数据库文件路径 - 根据环境使用不同的数据库文件
      const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
      const dbFileName = isDev ? 'shortcuts-dev.db' : 'shortcuts.db';
      const dbPath = path.join(appDataDir, dbFileName);
      console.log('数据库路径:', dbPath);
      console.log('数据库环境:', isDev ? '开发环境' : '生产环境');

      // 检查版本信息
      const versionCheck = versionManager.checkVersion();
      
      // 如果是新安装，删除现有数据库文件
      if (versionCheck.isNewInstall) {
        if (fs.existsSync(dbPath)) {
          fs.unlinkSync(dbPath);
          console.log('新安装检测到，已清理旧数据库文件');
        }
      }

      // 初始化数据库
      this.db = new Database(dbPath);
      
      // 启用WAL模式以提高性能
      this.db.pragma('journal_mode = WAL');
      
      // 创建表
      this.createTables();
      
      // 如果是新安装，初始化默认数据
      if (versionCheck.isNewInstall) {
        this.initializeDefaultData();
      }
      
      console.log('数据库初始化成功');
      console.log(`安装类型: ${versionCheck.isNewInstall ? '新安装' : versionCheck.isUpdate ? '版本更新' : '正常启动'}`);
    } catch (error) {
      console.error('数据库初始化失败:', error);
    }
  }

  createTables() {
    try {
      // 创建分类表
      this.db.exec(`
        CREATE TABLE IF NOT EXISTS categories (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          icon TEXT NOT NULL,
          color TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // 创建快捷方式表
      this.db.exec(`
        CREATE TABLE IF NOT EXISTS shortcuts (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          path TEXT NOT NULL,
          icon TEXT NOT NULL,
          category_id TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE CASCADE
        )
      `);

      // 创建设置表
      this.db.exec(`
        CREATE TABLE IF NOT EXISTS settings (
          key TEXT PRIMARY KEY,
          value TEXT NOT NULL,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      console.log('数据库表创建成功');
    } catch (error) {
      console.error('创建数据库表失败:', error);
    }
  }

  // 分类相关操作
  getAllCategories() {
    try {
      const stmt = this.db.prepare('SELECT * FROM categories ORDER BY created_at ASC');
      return stmt.all();
    } catch (error) {
      console.error('获取所有分类失败:', error);
      return [];
    }
  }

  addCategory(category) {
    try {
      const stmt = this.db.prepare(`
        INSERT INTO categories (id, name, icon, color)
        VALUES (?, ?, ?, ?)
      `);
      stmt.run(category.id, category.name, category.icon, category.color);
      console.log('分类添加成功:', category.name);
      return true;
    } catch (error) {
      console.error('添加分类失败:', error);
      return false;
    }
  }

  updateCategory(category) {
    try {
      const stmt = this.db.prepare(`
        UPDATE categories 
        SET name = ?, icon = ?, color = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `);
      stmt.run(category.name, category.icon, category.color, category.id);
      console.log('分类更新成功:', category.name);
      return true;
    } catch (error) {
      console.error('更新分类失败:', error);
      return false;
    }
  }

  deleteCategory(categoryId) {
    try {
      const stmt = this.db.prepare('DELETE FROM categories WHERE id = ?');
      stmt.run(categoryId);
      console.log('分类删除成功:', categoryId);
      return true;
    } catch (error) {
      console.error('删除分类失败:', error);
      return false;
    }
  }

  // 快捷方式相关操作
  getAllShortcuts() {
    try {
      const stmt = this.db.prepare('SELECT * FROM shortcuts ORDER BY created_at ASC');
      return stmt.all();
    } catch (error) {
      console.error('获取所有快捷方式失败:', error);
      return [];
    }
  }

  getShortcutsByCategory(categoryId) {
    try {
      const stmt = this.db.prepare('SELECT * FROM shortcuts WHERE category_id = ? ORDER BY created_at ASC');
      return stmt.all(categoryId);
    } catch (error) {
      console.error('获取分类快捷方式失败:', error);
      return [];
    }
  }

  addShortcut(shortcut) {
    try {
      const stmt = this.db.prepare(`
        INSERT INTO shortcuts (id, name, path, icon, category_id)
        VALUES (?, ?, ?, ?, ?)
      `);
      stmt.run(shortcut.id, shortcut.name, shortcut.path, shortcut.icon, shortcut.categoryId);
      console.log('快捷方式添加成功:', shortcut.name);
      return true;
    } catch (error) {
      console.error('添加快捷方式失败:', error);
      return false;
    }
  }

  updateShortcut(shortcut) {
    try {
      const stmt = this.db.prepare(`
        UPDATE shortcuts 
        SET name = ?, path = ?, icon = ?, category_id = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `);
      stmt.run(shortcut.name, shortcut.path, shortcut.icon, shortcut.categoryId, shortcut.id);
      console.log('快捷方式更新成功:', shortcut.name);
      return true;
    } catch (error) {
      console.error('更新快捷方式失败:', error);
      return false;
    }
  }

  deleteShortcut(shortcutId) {
    try {
      const stmt = this.db.prepare('DELETE FROM shortcuts WHERE id = ?');
      stmt.run(shortcutId);
      console.log('快捷方式删除成功:', shortcutId);
      return true;
    } catch (error) {
      console.error('删除快捷方式失败:', error);
      return false;
    }
  }

  // 设置相关操作
  getSetting(key) {
    try {
      const stmt = this.db.prepare('SELECT value FROM settings WHERE key = ?');
      const result = stmt.get(key);
      return result ? result.value : null;
    } catch (error) {
      console.error('获取设置失败:', error);
      return null;
    }
  }

  setSetting(key, value) {
    try {
      const stmt = this.db.prepare(`
        INSERT OR REPLACE INTO settings (key, value, updated_at)
        VALUES (?, ?, CURRENT_TIMESTAMP)
      `);
      stmt.run(key, value);
      console.log('设置保存成功:', key);
      return true;
    } catch (error) {
      console.error('保存设置失败:', error);
      return false;
    }
  }

  // 初始化默认数据
  initializeDefaultData() {
    try {
      console.log('初始化默认数据...');
      
      // 创建默认分类
      const defaultCategories = [
        {
          id: 'default-1',
          name: '常用软件',
          icon: 'fas fa-desktop',
          color: '#3B82F6'
        },
        {
          id: 'default-2',
          name: '开发工具',
          icon: 'fas fa-code',
          color: '#10B981'
        },
        {
          id: 'default-3',
          name: '办公软件',
          icon: 'fas fa-file-alt',
          color: '#F59E0B'
        }
      ];

      for (const category of defaultCategories) {
        this.addCategory(category);
      }

      console.log('默认数据初始化完成');
    } catch (error) {
      console.error('初始化默认数据失败:', error);
    }
  }

  // 关闭数据库连接
  close() {
    if (this.db) {
      this.db.close();
      console.log('数据库连接已关闭');
    }
  }
}

// 创建全局数据库实例
const databaseService = new DatabaseService();

// 应用退出时关闭数据库
app.on('before-quit', () => {
  databaseService.close();
});

export default databaseService;
