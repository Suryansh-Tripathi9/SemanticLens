import React, { useState } from 'react';
import { FileCode, FileText, Database, Filter, Eye, Download, Share, Trash, Loader, Search, RefreshCw, Plus, Sparkles, Brain } from 'lucide-react';
import { useFileOperations } from '../hooks/useFileOperations';
import { useSearch } from '../hooks/useSearch';

const ResultsList = ({ results = [], query, isSearching, onResultSelect, onSummaryGenerated }) => {
  const [hoveredCard, setHoveredCard] = useState(null);
  const [isSummarizing, setIsSummarizing] = useState({});
  const { indexFile, reindexFile, removeFile, isProcessing } = useFileOperations();
  const { askAI } = useSearch();

  const getFileIcon = (type) => {
    switch (type) {
      case 'code':
        return FileCode;
      case 'document':
        return FileText;
      case 'data':
        return Database;
      default:
        return FileCode;
    }
  };

  const getFileColor = (type) => {
    switch (type) {
      case 'code':
        return 'from-indigo-500 to-indigo-600';
      case 'document':
        return 'from-cyan-500 to-blue-600';
      case 'data':
        return 'from-purple-500 to-purple-600';
      default:
        return 'from-indigo-500 to-cyan-500';
    }
  };

  const getMatchColor = (matchPercentage) => {
    if (matchPercentage >= 90) return 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20';
    if (matchPercentage >= 75) return 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-400 border border-indigo-500/20';
    return 'bg-slate-500/15 text-slate-700 dark:text-slate-400 border border-slate-500/20';
  };

  const showContextMenu = (cardId) => {
    setHoveredCard(cardId);
  };

  const hideContextMenu = () => {
    setHoveredCard(null);
  };

  const handleFileOperation = async (operation, filePath, fileName) => {
    let result;
    let actionName;

    switch (operation) {
      case 'reindex':
        result = await reindexFile(filePath);
        actionName = 'reindexed';
        break;
      case 'remove':
        if (window.confirm(`Are you sure you want to remove "${fileName}" from the index?`)) {
          result = await removeFile(filePath);
          actionName = 'removed';
        } else {
          return;
        }
        break;
      case 'index':
        result = await indexFile(filePath);
        actionName = 'indexed';
        break;
      default:
        console.error('Unknown file operation:', operation);
        return;
    }

    if (result && result.success) {
      console.log(`File ${actionName} successfully`);
    } else {
      console.error(`Failed to ${operation} file:`, result?.error);
    }
  };

  const handleSummarize = async (filePath, fileName) => {
    const fileKey = filePath;
    setIsSummarizing(prev => ({ ...prev, [fileKey]: true }));
    
    try {
      const result = await askAI('Summarize this document', 5, filePath);
      
      if (result.success) {
        onSummaryGenerated && onSummaryGenerated(filePath, fileName, result.answer || result.summary);
      } else {
        console.error('Summary failed:', result.error);
      }
    } catch (error) {
      console.error('Summary error:', error);
    } finally {
      setIsSummarizing(prev => ({ ...prev, [fileKey]: false }));
    }
  };

  const displayResults = results.length > 0 ? results : [];

  // Show different content based on search state
  const showEmptyState = query && !isSearching && results.length === 0;
  const showSearching = isSearching;
  const showResults = !isSearching && results.length > 0;
  const showInitialState = !query && !isSearching && results.length === 0;

  return (
    <main className="w-[720px] glass border-r border-white/10 dark:border-white/5 flex flex-col transition-colors duration-300">
      {/* Search Results Header */}
      <div className="p-4 border-b border-white/10 dark:border-white/5 flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-gray-800 dark:text-gray-100 flex items-center space-x-2">
            <span>
              {showSearching ? 'Searching Workspace' :
               showResults ? 'Search Results' :
               showEmptyState ? 'No Matches Found' :
               'Semantic Explorer'}
            </span>
            {showResults && (
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-600 dark:bg-indigo-400/15 dark:text-indigo-400 border border-indigo-500/20">
                {displayResults.length} {displayResults.length === 1 ? 'match' : 'matches'}
              </span>
            )}
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {showSearching ? `Finding semantic connections for "${query}"` : 
             showResults ? `Ranked by contextual vector similarity` :
             showInitialState ? 'Type keywords or ideas in natural language' : 
             `No matching documents for "${query}"`}
          </p>
        </div>
        
        {!isSearching && showResults && (
          <button 
            className="p-2 rounded-xl glass hover:bg-black/5 dark:hover:bg-white/10 text-gray-500 dark:text-gray-400 transition-colors"
            title="Filter results"
          >
            <Filter className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Loading State */}
      {showSearching && (
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center max-w-sm">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto mb-4 animate-pulse">
              <Loader className="w-6 h-6 animate-spin text-indigo-600 dark:text-indigo-400" />
            </div>
            <h3 className="font-semibold text-gray-800 dark:text-gray-200 text-sm mb-1">Searching Vectors</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Embedding query and calculating cosine similarity across indexed documents...
            </p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {showEmptyState && (
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center max-w-md">
            <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4 text-gray-400">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-gray-800 dark:text-gray-200 text-sm mb-1">No semantic matches</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
              We couldn't find documents closely matching "{query}". Try broader conceptual keywords or index additional folders.
            </p>
            <div className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Tip: Natural language queries like "database design" work best</span>
            </div>
          </div>
        </div>
      )}

      {/* Initial State - Ready to search */}
      {showInitialState && (
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center max-w-md">
            <div className="relative inline-block mb-4">
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-indigo-500/25">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-indigo-500 text-white flex items-center justify-center shadow-md animate-pulse">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
            </div>
            <h3 className="text-base font-bold text-gray-800 dark:text-gray-100 mb-1.5">
              Meaning-Based Document Search
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-6">
              Search by concept, topic, or memory rather than exact filenames.
            </p>
            
            <div className="space-y-2 text-left">
              <div className="p-2.5 rounded-xl glass border border-black/5 dark:border-white/5 flex items-center space-x-3">
                <div className="w-6 h-6 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center flex-shrink-0">
                  <Search className="w-3.5 h-3.5" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-700 dark:text-gray-300">Machine learning algorithms</p>
                  <p className="text-[10px] text-gray-400 dark:text-gray-500">Finds papers, notebooks, or implementations</p>
                </div>
              </div>
              <div className="p-2.5 rounded-xl glass border border-black/5 dark:border-white/5 flex items-center space-x-3">
                <div className="w-6 h-6 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center flex-shrink-0">
                  <Brain className="w-3.5 h-3.5" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-700 dark:text-gray-300">Database optimization techniques</p>
                  <p className="text-[10px] text-gray-400 dark:text-gray-500">Finds SQL schemas, indexing docs, or configs</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Results List */}
      {showResults && (
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {displayResults.map((result) => {
            const IconComponent = getFileIcon(result.type);
            return (
              <div 
                key={result.id}
                className="glass rounded-2xl p-4 transition-all duration-200 cursor-pointer relative group border border-black/5 dark:border-white/10 hover:border-indigo-500/40 hover:shadow-xl hover:-translate-y-0.5" 
                onMouseEnter={() => showContextMenu(result.id)} 
                onMouseLeave={hideContextMenu}
                onClick={() => onResultSelect && onResultSelect(result)}
              >
                <div className="flex items-start justify-between mb-2.5">
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${getFileColor(result.type)} flex items-center justify-center flex-shrink-0 shadow-md shadow-indigo-500/10`}>
                      <IconComponent className="w-5 h-5 text-white" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-sm text-gray-800 dark:text-gray-100 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {result.filename}
                      </h3>
                      <p className="text-[11px] text-gray-400 dark:text-gray-500 truncate font-mono">
                        {result.filePath}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 flex-shrink-0">
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${getMatchColor(result.match)} flex items-center space-x-1`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-75"></span>
                      <span>{result.match}% match</span>
                    </span>
                  </div>
                </div>

                {/* File Preview Snippet if available */}
                {result.preview && (
                  <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2 my-2 bg-black/[0.02] dark:bg-white/[0.02] p-2 rounded-lg border border-black/5 dark:border-white/5">
                    {result.preview}
                  </p>
                )}
                
                {/* Actions Bar */}
                <div className="flex items-center justify-between pt-2 border-t border-black/5 dark:border-white/5 mt-3">
                  <div className="flex items-center space-x-2">
                    <button 
                      className="px-3 py-1 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-semibold border border-indigo-500/20 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        onResultSelect && onResultSelect(result);
                      }}
                    >
                      Open Preview
                    </button>
                    <button 
                      className="px-3 py-1 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-400 text-xs font-semibold border border-purple-500/20 transition-colors flex items-center space-x-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSummarize(result.filePath, result.filename);
                      }}
                      disabled={isSummarizing[result.filePath]}
                    >
                      {isSummarizing[result.filePath] ? (
                        <>
                          <Loader className="w-3 h-3 animate-spin" />
                          <span>Summarizing...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3 h-3" />
                          <span>Summarize</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Quick Card Toolbar */}
                  <div className="flex items-center space-x-1 opacity-60 group-hover:opacity-100 transition-opacity">
                    <button 
                      className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-gray-400 hover:text-indigo-500 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        onResultSelect && onResultSelect(result);
                      }}
                      title="Preview file"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-gray-400 hover:text-rose-500 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleFileOperation('remove', result.filePath, result.filename);
                      }}
                      disabled={isProcessing}
                      title="Remove from index"
                    >
                      <Trash className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
};

export default ResultsList;
