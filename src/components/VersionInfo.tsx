import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';

interface VersionInfo {
  version: string;
  installDate: string;
  lastUpdateDate: string;
  isFirstRun: boolean;
  previousVersion?: string;
}

const VersionInfo: React.FC = () => {
  const [versionInfo, setVersionInfo] = useState<VersionInfo | null>(null);
  const [isFirstRun, setIsFirstRun] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVersionInfo();
  }, []);

  const loadVersionInfo = async () => {
    try {
      setLoading(true);
      
      // 获取版本信息
      const versionResult = await window.electronAPI?.versionGetInfo();
      if (versionResult?.success && versionResult.data) {
        setVersionInfo(versionResult.data);
      }

      // 检查是否为首次运行
      const firstRunResult = await window.electronAPI?.versionIsFirstRun();
      if (firstRunResult?.success) {
        setIsFirstRun(firstRunResult.data);
      }
    } catch (error) {
      console.error('加载版本信息失败:', error);
      toast.error('加载版本信息失败');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    try {
      const result = await window.electronAPI?.versionReset();
      if (result?.success) {
        toast.success('已重置为新安装状态，请重启应用');
        // 重新加载版本信息
        setTimeout(() => {
          loadVersionInfo();
        }, 1000);
      } else {
        toast.error('重置失败');
      }
    } catch (error) {
      console.error('重置失败:', error);
      toast.error('重置失败');
    }
  };

  if (loading) {
    return (
      <div className="p-4 bg-white rounded-lg shadow">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2 mb-1"></div>
          <div className="h-3 bg-gray-200 rounded w-1/3"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-3 text-gray-800">版本信息</h3>
      
      {versionInfo && (
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex justify-between">
            <span>当前版本:</span>
            <span className="font-medium text-blue-600">{versionInfo.version}</span>
          </div>
          
          {versionInfo.previousVersion && (
            <div className="flex justify-between">
              <span>之前版本:</span>
              <span className="font-medium text-orange-600">{versionInfo.previousVersion}</span>
            </div>
          )}
          
          <div className="flex justify-between">
            <span>安装日期:</span>
            <span>{new Date(versionInfo.installDate).toLocaleString('zh-CN')}</span>
          </div>
          
          <div className="flex justify-between">
            <span>最后更新:</span>
            <span>{new Date(versionInfo.lastUpdateDate).toLocaleString('zh-CN')}</span>
          </div>
          
          <div className="flex justify-between">
            <span>运行状态:</span>
            <span className={`font-medium ${isFirstRun ? 'text-green-600' : 'text-gray-600'}`}>
              {isFirstRun ? '首次运行' : '正常启动'}
            </span>
          </div>
        </div>
      )}
      
      <div className="mt-4 pt-3 border-t border-gray-200">
        <button
          onClick={handleReset}
          className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
        >
          重置为新安装
        </button>
        <p className="text-xs text-gray-500 mt-1">
          注意：重置将清除所有数据并重新开始
        </p>
      </div>
    </div>
  );
};

export default VersionInfo;
