import { app, BrowserWindow, ipcMain, shell, Tray, Menu, nativeImage } from 'electron';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import simpleStorageService from './simpleStorage.js';
import versionManager from './versionManager.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// 判断是否为开发模式
const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

// 在Windows上设置编码，解决中文乱码问题
if (process.platform === 'win32') {
  // 设置环境变量强制使用UTF-8编码
  process.env.LANG = 'zh_CN.UTF-8';
  process.env.LC_ALL = 'zh_CN.UTF-8';
  process.env.LC_CTYPE = 'zh_CN.UTF-8';

  // 设置控制台编码为UTF-8
  if (process.stdout && process.stdout.setEncoding) {
    process.stdout.setEncoding('utf8');
  }
  if (process.stderr && process.stderr.setEncoding) {
    process.stderr.setEncoding('utf8');
  }

  // 设置控制台代码页为UTF-8
  try {
    const { execSync } = require('child_process');
    execSync('chcp 65001', { stdio: 'ignore' });
  } catch (error) {
    // 忽略错误，继续执行
  }
}

// 禁用自动打开DevTools
process.env.ELECTRON_AUTO_OPEN_DEVTOOLS = 'false';
process.env.ELECTRON_ALLOW_DEVTOOLS = 'false';

// 禁用菜单栏
app.on('browser-window-created', (event, window) => {
  window.setMenu(null);
});

let mainWindow;
let tray = null;
let isQuitting = false;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 960,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      // 启用localStorage支持
      webSecurity: false,
      allowRunningInsecureContent: true
    },
    icon: path.join(__dirname, 'assets/icon.png'), // 如果有图标的话
    show: false,
    // 隐藏菜单栏
    autoHideMenuBar: true,
    // 或者完全移除菜单栏
    // menuBarVisible: false
  });

  // 加载应用
  if (app.isPackaged || (process.env.NODE_ENV && process.env.NODE_ENV.includes('production'))) {
    console.log('生产模式：尝试加载本地文件');
    // 在打包后的应用中，静态文件位于 resources/static 目录
    let staticPath;
    try {
      // 首先尝试从resources目录加载（打包后的应用）
      staticPath = path.join(process.resourcesPath, 'static');
      console.log('尝试加载静态文件路径(resources):', staticPath);
      if (!fs.existsSync(path.join(staticPath, 'index.html'))) {
        // 如果resources目录不存在，尝试从dist目录加载（预览模式）
        staticPath = path.join(__dirname, '..', 'dist', 'static');
        console.log('尝试加载静态文件路径(dist目录):', staticPath);
        if (!fs.existsSync(path.join(staticPath, 'index.html'))) {
          // 最后尝试相对路径
          staticPath = path.join(__dirname, '..', 'static');
          console.log('尝试加载备用静态文件路径:', staticPath);
        }
      }
    } catch (error) {
      console.error('静态文件路径解析错误:', error);
      // 最后尝试相对路径
      staticPath = path.join(__dirname, '..', 'dist', 'static');
      console.log('尝试加载备用静态文件路径:', staticPath);
    }

    // 检查文件是否存在
    if (fs.existsSync(path.join(staticPath, 'index.html'))) {
      console.log('静态文件存在，正在加载...');
      // 使用loadFile方法加载，这样相对路径会正确解析
      mainWindow.loadFile(path.join(staticPath, 'index.html'));
    } else {
      console.error('静态文件不存在，尝试加载错误页面');
      mainWindow.loadFile(path.join(__dirname, 'assets', 'error.html'));
    }
  } else {
    console.log('开发模式：尝试加载 http://localhost:12345');
    mainWindow.loadURL('http://localhost:12345');
    // 移除自动打开DevTools，用户可以通过F12手动打开
  }

  mainWindow.once('ready-to-show', () => {
    console.log('窗口准备显示');
    mainWindow.show();
  });

  // 添加页面加载错误处理
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    console.error('页面加载失败:', {
      errorCode,
      errorDescription,
      validatedURL
    });
  });

  // 添加页面加载完成处理
  mainWindow.webContents.on('did-finish-load', () => {
    console.log('页面加载完成');
  });

  // 添加控制台消息处理
  mainWindow.webContents.on('console-message', (event, level, message, line, sourceId) => {
    console.log(`渲染进程控制台 [${level}]: ${message} (${sourceId}:${line})`);
  });

  // 当用户点击关闭按钮时，最小化到系统托盘
  mainWindow.on('close', (event) => {
    if (!isQuitting) {
      // 如果不是真正退出，则隐藏窗口并显示托盘
      event.preventDefault();
      mainWindow.hide();

              // 显示托盘通知（如果托盘创建成功）
        if (tray && tray.isDestroyed && !tray.isDestroyed()) {
          try {
            const iconPath = path.join(__dirname, 'assets', 'icon.png');
            tray.displayBalloon({
              title: 'Shortcut Organizer',
              content: '应用已最小化到系统托盘，双击托盘图标可以重新打开窗口',
              icon: iconPath
            });
          } catch (error) {
            console.log('托盘通知显示失败:', error.message);
          }
        }
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// 创建系统托盘
function createTray() {
  try {
    // 尝试加载图标文件
    const iconPath = path.join(__dirname, 'assets', 'icon.png');
    let icon;

    try {
      icon = nativeImage.createFromPath(iconPath);
      console.log('托盘图标加载成功');
    } catch (error) {
      console.log('托盘图标加载失败，使用默认图标:', error.message);
      icon = nativeImage.createEmpty();
    }

    // 创建托盘实例
    tray = new Tray(icon);

    // 设置托盘提示文本
    tray.setToolTip('Shortcut Organizer');

    // 创建托盘菜单
    const contextMenu = Menu.buildFromTemplate([
      {
        label: '显示窗口',
        click: () => {
          if (mainWindow) {
            mainWindow.show();
            mainWindow.focus();
          }
        }
      },
      {
        label: '最小化',
        click: () => {
          if (mainWindow) {
            mainWindow.minimize();
          }
        }
      },
      { type: 'separator' },
      {
        label: '退出应用',
        click: () => {
          forceQuit();
        }
      }
    ]);

    // 设置托盘菜单
    tray.setContextMenu(contextMenu);

    // 双击托盘图标显示窗口
    tray.on('double-click', () => {
      if (mainWindow) {
        mainWindow.show();
        mainWindow.focus();
      }
    });

    console.log('系统托盘创建成功');
  } catch (error) {
    console.error('创建系统托盘失败:', error);
    // 如果托盘创建失败，设置为null避免后续错误
    tray = null;
  }
}

// 存储操作功能
ipcMain.handle('db-get-categories', async () => {
  try {
    const categories = simpleStorageService.getAllCategories();
    return { success: true, data: categories };
  } catch (error) {
    console.error('获取分类失败:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('db-add-category', async (event, category) => {
  try {
    const success = simpleStorageService.addCategory(category);
    return { success };
  } catch (error) {
    console.error('添加分类失败:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('db-update-category', async (event, category) => {
  try {
    const success = simpleStorageService.updateCategory(category);
    return { success };
  } catch (error) {
    console.error('更新分类失败:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('db-delete-category', async (event, categoryId) => {
  try {
    const success = simpleStorageService.deleteCategory(categoryId);
    return { success };
  } catch (error) {
    console.error('删除分类失败:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('db-get-shortcuts', async () => {
  try {
    const shortcuts = simpleStorageService.getAllShortcuts();
    return { success: true, data: shortcuts };
  } catch (error) {
    console.error('获取快捷方式失败:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('db-get-shortcuts-by-category', async (event, categoryId) => {
  try {
    const shortcuts = simpleStorageService.getShortcutsByCategory(categoryId);
    return { success: true, data: shortcuts };
  } catch (error) {
    console.error('获取分类快捷方式失败:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('db-add-shortcut', async (event, shortcut) => {
  try {
    const success = simpleStorageService.addShortcut(shortcut);
    return { success };
  } catch (error) {
    console.error('添加快捷方式失败:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('db-update-shortcut', async (event, shortcut) => {
  try {
    const success = simpleStorageService.updateShortcut(shortcut);
    return { success };
  } catch (error) {
    console.error('更新快捷方式失败:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('db-delete-shortcut', async (event, shortcutId) => {
  try {
    const success = simpleStorageService.deleteShortcut(shortcutId);
    return { success };
  } catch (error) {
    console.error('删除快捷方式失败:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('db-get-setting', async (event, key) => {
  try {
    const value = simpleStorageService.getSetting(key);
    return { success: true, value };
  } catch (error) {
    console.error('获取设置失败:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('db-set-setting', async (event, key, value) => {
  try {
    const success = simpleStorageService.setSetting(key, value);
    return { success };
  } catch (error) {
    console.error('保存设置失败:', error);
    return { success: false, error: error.message };
  }
});

// 数据存储功能（保留作为备选方案）
ipcMain.handle('save-data', async (event, key, data) => {
  try {
    const fs = await import('fs');
    const path = await import('path');
    const os = await import('os');

    // 创建应用数据目录
    const appDataDir = path.join(os.homedir(), '.shortcut-organizer');
    if (!fs.existsSync(appDataDir)) {
      fs.mkdirSync(appDataDir, { recursive: true });
    }

    // 保存数据到文件
    const filePath = path.join(appDataDir, `${key}.json`);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');

    console.log(`数据保存成功: ${key}`);
    return { success: true };
  } catch (error) {
    console.error('保存数据失败:', error);
    throw new Error(`保存数据失败: ${error.message}`);
  }
});

ipcMain.handle('load-data', async (event, key) => {
  try {
    const fs = await import('fs');
    const path = await import('path');
    const os = await import('os');

    // 从应用数据目录加载数据
    const appDataDir = path.join(os.homedir(), '.shortcut-organizer');
    const filePath = path.join(appDataDir, `${key}.json`);

    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8');
      console.log(`数据加载成功: ${key}`);
      return JSON.parse(data);
    } else {
      console.log(`数据文件不存在: ${key}`);
      return null;
    }
  } catch (error) {
    console.error('加载数据失败:', error);
    return null;
  }
});

ipcMain.handle('delete-data', async (event, key) => {
  try {
    const fs = await import('fs');
    const path = await import('path');
    const os = await import('os');

    // 删除应用数据目录中的数据文件
    const appDataDir = path.join(os.homedir(), '.shortcut-organizer');
    const filePath = path.join(appDataDir, `${key}.json`);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`数据删除成功: ${key}`);
      return { success: true };
    } else {
      console.log(`数据文件不存在: ${key}`);
      return { success: false, message: '文件不存在' };
    }
  } catch (error) {
    console.error('删除数据失败:', error);
    throw new Error(`删除数据失败: ${error.message}`);
  }
});

// 强制退出应用
ipcMain.handle('force-quit', () => {
  forceQuit();
});

// 启动程序的功能
ipcMain.handle('launch-app', async (event, appPath) => {
  try {
    // 清理路径，移除多余的斜杠、空格和引号
    const cleanPath = appPath.trim().replace(/[\\\/]+$/, '').replace(/^["']|["']$/g, '');
    console.log('尝试启动程序:', cleanPath);

    // 检查文件是否存在
    const fs = await import('fs');
    if (!fs.existsSync(cleanPath)) {
      throw new Error(`文件不存在: ${cleanPath}`);
    }

    // 使用 Electron 的 shell API 启动程序，避免显示终端窗口
    if (process.platform === 'win32') {
      console.log('使用 Windows shell.openPath 启动:', cleanPath);

      try {
        // 使用 shell.openPath 启动程序，这是最干净的方式
        await shell.openPath(cleanPath);
        console.log('程序启动成功');
      } catch (shellError) {
        console.log('shell.openPath 失败，尝试使用 shell.openExternal:', shellError.message);

        // 如果 openPath 失败，尝试使用 openExternal（适用于某些可执行文件）
        const fileUrl = `file:///${cleanPath.replace(/\\/g, '/')}`;
        await shell.openExternal(fileUrl);
        console.log('程序启动成功（通过 openExternal）');
      }
    } else if (process.platform === 'darwin') {
      // macOS
      await shell.openPath(cleanPath);
      console.log('程序启动成功');
    } else {
      // Linux
      await shell.openPath(cleanPath);
      console.log('程序启动成功');
    }

    return { success: true };
  } catch (error) {
    console.error('启动程序失败:', error);
    throw new Error(`启动程序失败: ${error.message}`);
  }
});

app.whenReady().then(() => {
  // 创建窗口
  createWindow();

  // 创建系统托盘
  createTray();

  // 完全移除菜单栏
  mainWindow.setMenu(null);
});

app.on('window-all-closed', () => {
  // 在Windows和Linux上，当所有窗口关闭时退出应用
  if (process.platform !== 'darwin') {
    forceQuit();
  }
  // 在macOS上，保持应用运行，等待用户重新激活
});

// 应用退出前清理托盘
app.on('before-quit', () => {
  isQuitting = true;
  if (tray) {
    tray.destroy();
  }
});

// 版本管理相关IPC处理器
ipcMain.handle('version-get-info', async () => {
  try {
    const versionInfo = versionManager.getVersionInfo();
    return { success: true, data: versionInfo };
  } catch (error) {
    console.error('获取版本信息失败:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('version-is-first-run', async () => {
  try {
    const isFirstRun = versionManager.isFirstRun();
    return { success: true, data: isFirstRun };
  } catch (error) {
    console.error('检查首次运行失败:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('version-reset', async () => {
  try {
    const success = versionManager.resetToNewInstall();
    return { success };
  } catch (error) {
    console.error('重置版本失败:', error);
    return { success: false, error: error.message };
  }
});

// 强制退出处理
function forceQuit() {
  console.log('执行强制退出...');

  // 清理托盘
  if (tray) {
    tray.destroy();
    tray = null;
  }

  // 关闭主窗口
  if (mainWindow) {
    mainWindow.destroy();
    mainWindow = null;
  }

  // 在开发环境下，强制退出所有进程
  if (isDev) {
    console.log('开发模式：终止所有进程');
    // 使用 process.exit(0) 退出，concurrently --kill-others 会自动终止其他进程
    process.exit(0);
  } else {
    console.log('生产模式：正常退出');
    app.quit();
  }
}

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
