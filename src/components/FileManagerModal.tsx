import React, { useEffect, useState } from 'react';
import { api, StoredFileItem } from '../services/api';
import {
  HardDrive,
  Upload,
  Download,
  Trash2,
  FileText,
  FileCode,
  FileJson,
  Image,
  File,
  X,
  RefreshCw,
  FolderOpen,
} from 'lucide-react';

interface FileManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenFile: (filename: string, url: string) => void;
  onRefreshConfig: () => void;
}

export const FileManagerModal: React.FC<FileManagerModalProps> = ({
  isOpen,
  onClose,
  onOpenFile,
  onRefreshConfig,
}) => {
  const [files, setFiles] = useState<StoredFileItem[]>([]);
  const [folderPath, setFolderPath] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const loadFiles = async () => {
    try {
      setLoading(true);
      const res = await api.listStorageFiles();
      if (res.success) {
        setFiles(res.files);
        setFolderPath(res.folder);
      }
    } catch (err) {
      console.error('Failed to load files:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadFiles();
    }
  }, [isOpen]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    try {
      setUploading(true);
      await api.uploadFiles(e.target.files, 'screen-1');
      await loadFiles();
      onRefreshConfig();
    } catch (err) {
      console.error('Upload failed:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (filename: string) => {
    if (!window.confirm(`Delete '${filename}' from internal launcher storage?`)) return;
    try {
      await api.deleteStorageFile(filename);
      await loadFiles();
      onRefreshConfig();
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const getFileIcon = (name: string) => {
    if (name.endsWith('.md') || name.endsWith('.txt')) return <FileText className="w-5 h-5 text-cyan-400" />;
    if (name.endsWith('.json')) return <FileJson className="w-5 h-5 text-amber-400" />;
    if (name.match(/\.(ts|js|jsx|tsx|css|html)$/i)) return <FileCode className="w-5 h-5 text-indigo-400" />;
    if (name.match(/\.(png|jpg|jpeg|gif|webp|svg)$/i)) return <Image className="w-5 h-5 text-pink-400" />;
    return <File className="w-5 h-5 text-slate-400" />;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden text-slate-100">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-950/80 border border-cyan-700/40 text-cyan-400">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Launcher Dedicated Storage Folder</h2>
              <div className="text-xs text-slate-400 font-mono flex items-center gap-1.5 mt-0.5">
                <FolderOpen className="w-3.5 h-3.5 text-cyan-500" />
                <span className="truncate max-w-[340px]">{folderPath || '/data/storage_folder'}</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Bar */}
        <div className="px-6 py-3 border-b border-slate-800/80 bg-slate-900/60 flex items-center justify-between text-xs">
          <div className="text-slate-400">
            Total Files: <span className="font-semibold text-slate-200">{files.length}</span> · Total Size:{' '}
            <span className="font-semibold text-slate-200">
              {(files.reduce((acc, f) => acc + f.size, 0) / 1024).toFixed(1)} KB
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadFiles}
              disabled={loading}
              className="px-2.5 py-1.5 rounded-lg border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>

            <label className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium cursor-pointer flex items-center gap-1.5 shadow-sm transition-colors">
              <Upload className="w-3.5 h-3.5" />
              <span>{uploading ? 'Copying...' : 'Copy New File'}</span>
              <input type="file" multiple onChange={handleUpload} className="hidden" />
            </label>
          </div>
        </div>

        {/* File List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-2">
          {files.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-sm">
              No files in the launcher folder yet. Drag &amp; drop files onto the desktop or click &quot;Copy New File&quot;.
            </div>
          ) : (
            files.map((file) => (
              <div
                key={file.filename}
                className="flex items-center justify-between p-3 rounded-2xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 transition-colors group"
              >
                <div
                  onClick={() => onOpenFile(file.filename, file.url)}
                  className="flex items-center gap-3 cursor-pointer min-w-0 flex-1"
                >
                  <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-700/60 shrink-0">
                    {getFileIcon(file.filename)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold text-slate-200 group-hover:text-white truncate">
                      {file.filename}
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono flex items-center gap-2 mt-0.5">
                      <span>{(file.size / 1024).toFixed(1)} KB</span>
                      <span aria-hidden="true">·</span>
                      <span>{new Date(file.modifiedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 ml-3">
                  <a
                    href={file.url}
                    download={file.filename}
                    title="Download file"
                    className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-700/60 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                  <button
                    onClick={() => handleDelete(file.filename)}
                    title="Delete file"
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer info */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/60 text-xs text-slate-400 flex items-center justify-between">
          <span>Files are safely copied to launcher internal folder and served locally.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
