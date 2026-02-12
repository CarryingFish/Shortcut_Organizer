import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import os from 'os';
import { app } from 'electron';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class VersionManager {
  constructor() {
    this.appDataDir = path.join(os.homedir(), '.shortcut-organizer');
    
    // 根据环境使用不同的版本文件
    const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
    const versionFileName = isDev ? 'version-dev.json' : 'version.json';
    this.versionFile = path.join(this.appDataDir, versionFileName);
    
    this.currentVersion = '0.0.1'; // 当前应用版本
    this.init();
  }

  init() {
    try {
      // 创建应用数据目录
      if (!fs.existsSync(this.appDataDir)) {
        fs.mkdirSync(this.appDataDir, { recursive: true });
      }

      // 检查版本信息
      this.checkVersion();
    } catch (error) {
      console.error('版本管理器初始化失败:', error);
    }
  }

  // 检查版本信息
  checkVersion() {
    try {
      let versionInfo = this.getVersionInfo();
      const isNewInstall = !versionInfo;

      if (isNewInstall) {
        // 新安装：创建版本信息
        versionInfo = {
          version: this.currentVersion,
          installDate: new Date().toISOString(),
          lastUpdateDate: new Date().toISOString(),
          isFirstRun: true
        };
        this.saveVersionInfo(versionInfo);
        console.log('新安装检测到，版本信息已创建');
        return { isNewInstall: true, versionInfo };
      } else {
        // 检查是否为更新
        const isUpdate = versionInfo.version !== this.currentVersion;
        
        if (isUpdate) {
          // 更新：保留数据，更新版本信息
          const oldVersion = versionInfo.version;
          versionInfo.version = this.currentVersion;
          versionInfo.lastUpdateDate = new Date().toISOString();
          versionInfo.previousVersion = oldVersion;
          versionInfo.isFirstRun = false;
          this.saveVersionInfo(versionInfo);
          console.log(`检测到版本更新: ${oldVersion} -> ${this.currentVersion}`);
          return { isNewInstall: false, isUpdate: true, versionInfo };
        } else {
          // 相同版本：正常启动
          versionInfo.isFirstRun = false;
          this.saveVersionInfo(versionInfo);
          console.log('正常启动，版本相同');
          return { isNewInstall: false, isUpdate: false, versionInfo };
        }
      }
    } catch (error) {
      console.error('版本检查失败:', error);
      return { isNewInstall: true, versionInfo: null };
    }
  }

  // 获取版本信息
  getVersionInfo() {
    try {
      if (fs.existsSync(this.versionFile)) {
        const data = fs.readFileSync(this.versionFile, 'utf8');
        return JSON.parse(data);
      }
      return null;
    } catch (error) {
      console.error('读取版本信息失败:', error);
      return null;
    }
  }

  // 保存版本信息
  saveVersionInfo(versionInfo) {
    try {
      fs.writeFileSync(this.versionFile, JSON.stringify(versionInfo, null, 2), 'utf8');
      console.log('版本信息保存成功');
    } catch (error) {
      console.error('保存版本信息失败:', error);
    }
  }

  // 检查是否为首次运行
  isFirstRun() {
    const versionInfo = this.getVersionInfo();
    return versionInfo ? versionInfo.isFirstRun : true;
  }

  // 获取安装日期
  getInstallDate() {
    const versionInfo = this.getVersionInfo();
    return versionInfo ? versionInfo.installDate : null;
  }

  // 获取最后更新日期
  getLastUpdateDate() {
    const versionInfo = this.getVersionInfo();
    return versionInfo ? versionInfo.lastUpdateDate : null;
  }

  // 获取当前版本
  getCurrentVersion() {
    return this.currentVersion;
  }

  // 获取之前版本
  getPreviousVersion() {
    const versionInfo = this.getVersionInfo();
    return versionInfo ? versionInfo.previousVersion : null;
  }

  // 清理数据（用于测试或重置）
  clearData() {
    try {
      const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
      const files = fs.readdirSync(this.appDataDir);
      
      for (const file of files) {
        const filePath = path.join(this.appDataDir, file);
        
        // 只清理对应环境的数据文件
        if (isDev) {
          // 开发环境：清理 dev- 前缀的文件和开发数据库
          if (file.startsWith('dev-') || file === 'shortcuts-dev.db') {
            if (fs.statSync(filePath).isFile()) {
              fs.unlinkSync(filePath);
              console.log(`清理开发环境文件: ${file}`);
            }
          }
        } else {
          // 生产环境：清理没有 dev- 前缀的文件和生产数据库
          if (!file.startsWith('dev-') && file !== 'shortcuts-dev.db' && 
              file !== 'version-dev.json' && file !== this.versionFile.split('/').pop()) {
            if (fs.statSync(filePath).isFile()) {
              fs.unlinkSync(filePath);
              console.log(`清理生产环境文件: ${file}`);
            }
          }
        }
      }
      console.log('数据清理完成');
      return true;
    } catch (error) {
      console.error('数据清理失败:', error);
      return false;
    }
  }

  // 重置为新安装状态
  resetToNewInstall() {
    try {
      // 删除版本文件
      if (fs.existsSync(this.versionFile)) {
        fs.unlinkSync(this.versionFile);
      }
      
      // 清理所有数据
      this.clearData();
      
      // 重新初始化
      this.init();
      
      console.log('已重置为新安装状态');
      return true;
    } catch (error) {
      console.error('重置失败:', error);
      return false;
    }
  }
}

// 创建全局版本管理实例
const versionManager = new VersionManager();

export default versionManager;
