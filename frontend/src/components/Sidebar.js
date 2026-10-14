import React, { useState } from 'react';
import { Folder, Code, FileText, Image, Brain, ChevronDown, AlertCircle, FolderPlus, FolderOpen, Trash2, CheckCircle, Loader } from 'lucide-react';
import { useDirectories } from '../hooks/useDirectories';

const Sidebar = ({ 
  coPilotActive, 
  onToggleCoPilot, 
  collapsedSections, 
  onToggleSection 
}) => {
  const { directories, isLoading, error, addDirectory, removeDirectory } = useDirectories();
  const [newDirectoryPath, setNewDirectoryPath] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [feedback, setFeedback] = useState({ message: '', type: '', visible: false });

  const showFeedback = (message, type = 'info') => {
    setFeedback({ message, type, visible: true });
    setTimeout(() => {
      setFeedback(prev => ({ ...prev, visible: false }));
    }, 3000);
  };

  const handleAddDirectory = async () => {
    if (!newDirectoryPath.trim()) {
      showFeedback('Please enter a directory path', 'error');
      return;
    }

    setIsAdding(true);
    try {
      const result = await addDirectory(newDirectoryPath.trim());
      
      if (result.success) {
        setNewDirectoryPath('');
        showFeedback('Directory added successfully!', 'success');
      } else {
        showFeedback(result.error || 'Failed to add directory', 'error');
      }
    } catch (err) {
      showFeedback('Failed to add directory', 'error');
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemoveDirectory = async (path) => {
    if (window.confirm(`Are you sure you want to remove "${path}" from being watched?`)) {
      try {
        const result = await removeDirectory(path);
        
        if (result.success) {
          showFeedback('Directory removed successfully!', 'success');
        } else {
          showFeedback(result.error || 'Failed to remove directory', 'error');
        }
      } catch (err) {
        showFeedback('Failed to remove directory', 'error');
      }
    }
  };

  const handleBrowseDirectory = async () => {
    // Check if we're running in Electron
    if (window.electron && window.electron.selectDirectory) {
      // Use Electron's native directory picker
      try {
        const directoryPath = await window.electron.selectDirectory();
        if (directoryPath) {
          setNewDirectoryPath(directoryPath);
        }
      } catch (error) {
        console.error('Failed to open directory picker:', error);
        showFeedback('Failed to open directory picker', 'error');
      }
    } else {
      // Fallback for web: Create a hidden file input for directory selection
      const input = document.createElement('input');
      input.type = 'file';
      input.webkitdirectory = true; // This allows directory selection
      input.multiple = true;
      
      input.onchange = (e) => {
        const files = e.target.files;
        if (files && files.length > 0) {
          // Get the directory path from the first file
          const firstFile = files[0];
          
          // Try to extract directory path from file path
          if (firstFile.path) {
            // If we have the full path, extract directory
            const directoryPath = firstFile.path.replace(/[^/\\]*$/, '').replace(/[/\\]$/, '');
            setNewDirectoryPath(directoryPath);
          } else {
            // Fallback: use webkitRelativePath to construct path
            const pathParts = firstFile.webkitRelativePath.split('/');
            if (pathParts.length > 1) {
              const directoryName = pathParts[0];
              setNewDirectoryPath(directoryName);
              showFeedback('Directory selected. You may need to adjust the full path.', 'info');
            }
          }
        }
      };
      
      input.click();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !isAdding) {
      handleAddDirectory();
    }
  };

  return (
    <aside className="w-72 glass-dark border-r border-white/10 dark:border-white/5 flex flex-col transition-colors duration-300">
      {/* Feedback Message */}
      {feedback.visible && (
        <div className={`mx-4 mt-3 p-3 rounded-xl flex items-center space-x-2.5 transition-all duration-300 shadow-sm ${
          feedback.type === 'success' ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20' :
          feedback.type === 'error' ? 'bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-500/20' :
          'bg-indigo-500/15 text-indigo-700 dark:text-indigo-400 border border-indigo-500/20'
        }`}>
          {feedback.type === 'success' && <CheckCircle className="w-4 h-4 flex-shrink-0" />}
          {feedback.type === 'error' && <AlertCircle className="w-4 h-4 flex-shrink-0" />}
          {feedback.type === 'info' && <AlertCircle className="w-4 h-4 flex-shrink-0" />}
          <span className="text-xs font-medium">{feedback.message}</span>
        </div>
      )}

      {/* Add Directory Section */}
      <div className="p-4 border-b border-white/10 dark:border-white/5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold tracking-wider uppercase text-gray-500 dark:text-gray-400 flex items-center">
            <FolderPlus className="w-3.5 h-3.5 mr-1.5 text-indigo-500 dark:text-indigo-400" />
            Index New Folder
          </h3>
          <button 
            className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors" 
            onClick={() => onToggleSection('addDirectory')}
          >
            <ChevronDown 
              className={`w-3.5 h-3.5 transition-transform duration-300 ${
                collapsedSections.addDirectory ? '-rotate-90' : ''
              }`} 
            />
          </button>
        </div>
        
        {!collapsedSections.addDirectory && (
          <div className="space-y-2.5">
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="Enter folder path..."
                value={newDirectoryPath}
                onChange={(e) => setNewDirectoryPath(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1 px-3 py-1.5 rounded-lg text-xs glass border border-black/10 dark:border-white/10 text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
                disabled={isAdding}
              />
              <button
                onClick={handleBrowseDirectory}
                className="px-2.5 py-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 transition-all text-xs"
                disabled={isAdding}
                title="Browse for folder"
              >
                <FolderOpen className="w-3.5 h-3.5" />
              </button>
            </div>
            
            <button
              onClick={handleAddDirectory}
              disabled={isAdding || !newDirectoryPath.trim()}
              className="w-full px-3 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-xs font-semibold shadow-md shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-1.5"
            >
              {isAdding ? (
                <>
                  <Loader className="w-3.5 h-3.5 animate-spin" />
                  <span>Indexing...</span>
                </>
              ) : (
                <>
                  <FolderPlus className="w-3.5 h-3.5" />
                  <span>Watch & Index Folder</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Watched Directories Section */}
      <div className="p-4 border-b border-white/10 dark:border-white/5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <h3 className="text-xs font-bold tracking-wider uppercase text-gray-500 dark:text-gray-400">
              Watched Folders
            </h3>
            {directories.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-semibold bg-gray-200 dark:bg-slate-800 text-gray-600 dark:text-gray-400">
                {directories.length}
              </span>
            )}
          </div>
          <button 
            className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors" 
            onClick={() => onToggleSection('projects')}
          >
            <ChevronDown 
              className={`w-3.5 h-3.5 transition-transform duration-300 ${
                collapsedSections.projects ? '-rotate-90' : ''
              }`} 
            />
          </button>
        </div>
        
        {!collapsedSections.projects && (
          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            {isLoading ? (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-indigo-500 border-t-transparent"></div>
              </div>
            ) : error ? (
              <div className="flex items-center space-x-2 p-2 rounded-lg bg-rose-500/15 text-rose-500 text-xs">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>Failed to load folders</span>
              </div>
            ) : directories.length > 0 ? (
              directories.map((dir) => (
                <div key={dir.path} className="flex items-center space-x-2.5 p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer transition-all duration-200 group border border-transparent hover:border-black/5 dark:hover:border-white/5">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shadow-sm flex-shrink-0">
                    <Folder className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 truncate">
                      {dir.path.split(/[/\\]/).pop() || dir.path}
                    </p>
                    <p className="text-[11px] text-gray-400 dark:text-gray-500 truncate">
                      {dir.path.length > 28 ? '...' + dir.path.slice(-25) : dir.path}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveDirectory(dir.path);
                    }}
                    className="p-1 rounded-md text-gray-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0"
                    title="Remove folder"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            ) : (
              <div className="text-center py-4 px-2 rounded-xl border border-dashed border-gray-200 dark:border-white/10">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">No folders watched</p>
                <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">Add a folder above to start searching</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Memory Lane Section */}
      <div className="p-4 border-b border-white/10 dark:border-white/5 flex-1">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold tracking-wider uppercase text-gray-500 dark:text-gray-400">
            Recent Memory
          </h3>
          <button 
            className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors" 
            onClick={() => onToggleSection('memory')}
          >
            <ChevronDown 
              className={`w-3.5 h-3.5 transition-transform duration-300 ${
                collapsedSections.memory ? '-rotate-90' : ''
              }`} 
            />
          </button>
        </div>
        
        {!collapsedSections.memory && (
          <div className="space-y-2">
            <div className="flex items-start space-x-2.5 p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer transition-all duration-200 group border border-transparent hover:border-black/5 dark:hover:border-white/5">
              <div className="w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mt-0.5 shadow-sm flex-shrink-0">
                <FileText className="w-3 h-3" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 truncate">research_notes.md</p>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-1 mt-0.5">Semantic search concepts and vector benchmarks...</p>
                <span className="text-[10px] text-indigo-500 dark:text-indigo-400 font-medium">Indexed 2m ago</span>
              </div>
            </div>
            <div className="flex items-start space-x-2.5 p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer transition-all duration-200 group border border-transparent hover:border-black/5 dark:hover:border-white/5">
              <div className="w-6 h-6 rounded-lg bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center mt-0.5 shadow-sm flex-shrink-0">
                <Image className="w-3 h-3" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 truncate">architecture.png</p>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-1 mt-0.5">System diagram showing vector DB and pipeline...</p>
                <span className="text-[10px] text-purple-500 dark:text-purple-400 font-medium">Indexed 15m ago</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Co-Pilot Mode Toggle */}
      <div className="p-4 bg-black/[0.02] dark:bg-white/[0.02] border-t border-white/10 dark:border-white/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className={`w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-md ${
              coPilotActive ? 'animate-pulse-glow shadow-indigo-500/30' : 'opacity-80'
            }`}>
              <Brain className="w-3.5 h-3.5 text-white" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">Co-Pilot Assistant</p>
              <p className="text-[10px] text-gray-400 dark:text-gray-500">Autonomous context analysis</p>
            </div>
          </div>
          <button 
            className={`relative w-10 h-5 rounded-full transition-colors duration-200 focus:outline-none ${
              coPilotActive ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-slate-700'
            }`} 
            onClick={onToggleCoPilot}
            title={coPilotActive ? 'Disable Co-Pilot' : 'Enable Co-Pilot'}
          >
            <div 
              className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 ${
                coPilotActive ? 'transform translate-x-5' : ''
              }`} 
            />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
