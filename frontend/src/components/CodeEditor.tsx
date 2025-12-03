import React, { useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { setCode, setSuggestion } from '../store/roomSlice';
import { websocketService } from '../services/websocket';
import { getAutocomplete } from '../services/api';
import { executeCode, ExecutionResult } from '../services/codeExecutor';

const CodeEditor: React.FC<{ isDark: boolean }> = ({ isDark }) => {
  const dispatch = useDispatch();
  const { code, language, roomId, isConnected, suggestion } = useSelector(
    (state: RootState) => state.room
  );
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const autocompleteTimeoutRef = useRef<NodeJS.Timeout>();
  const [showSuggestion, setShowSuggestion] = useState(false);
  const [suggestionPosition, setSuggestionPosition] = useState({
    top: 0,
    left: 0,
  });
  const [executionResult, setExecutionResult] = useState<ExecutionResult | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);

  const handleCodeChange = (value: string) => {
    dispatch(setCode(value));

    // Trigger real-time autocomplete
    triggerAutocomplete(value);

    if (isConnected && roomId) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        websocketService.send({
          type: 'code_update',
          roomId,
          data: { code: value, language },
        });
      }, 300);
    }
  };

  const triggerAutocomplete = (currentCode: string) => {
    if (!textareaRef.current) return;

    clearTimeout(autocompleteTimeoutRef.current);
    autocompleteTimeoutRef.current = setTimeout(async () => {
      try {
        const cursorPosition = textareaRef.current!.selectionStart;
        
        // Get immediate syntax suggestions first
        const syntaxSuggestion = getImmediateSuggestion(currentCode, cursorPosition);
        if (syntaxSuggestion) {
          dispatch(setSuggestion(syntaxSuggestion));
          updateSuggestionPosition();
          setShowSuggestion(true);
          setTimeout(() => setShowSuggestion(false), 3000);
          return;
        }

        // Fallback to API suggestions
        const response = await getAutocomplete({
          code: currentCode,
          cursorPosition,
          language,
        });

        if (response.suggestion && response.suggestion.trim()) {
          dispatch(setSuggestion(response.suggestion));
          updateSuggestionPosition();
          setShowSuggestion(true);
          setTimeout(() => setShowSuggestion(false), 5000);
        }
      } catch (error) {
        console.error('Autocomplete error:', error);
      }
    }, 200); // Faster trigger
  };

  const getImmediateSuggestion = (code: string, cursorPos: number): string => {
    const beforeCursor = code.slice(0, cursorPos);
    const lines = beforeCursor.split('\n');
    const currentLine = lines[lines.length - 1];
    
    if (language === 'python') {
      // Missing closing parentheses
      const openParens = (beforeCursor.match(/\(/g) || []).length;
      const closeParens = (beforeCursor.match(/\)/g) || []).length;
      if (openParens > closeParens) {
        return ')'.repeat(openParens - closeParens);
      }
      
      // Common Python completions
      if (currentLine.includes('print(') && !currentLine.includes(')')) {
        return ')';
      }
      if (currentLine.trim() === 'def') {
        return ' function_name():';
      }
      if (currentLine.trim() === 'for') {
        return ' item in items:';
      }
      if (currentLine.trim() === 'if') {
        return ' condition:';
      }
      if (currentLine.trim() === 'while') {
        return ' condition:';
      }
      if (currentLine.includes('import') && !currentLine.includes(' ')) {
        return ' os';
      }
    }
    
    if (language === 'cpp') {
      // Missing closing parentheses
      const openParens = (beforeCursor.match(/\(/g) || []).length;
      const closeParens = (beforeCursor.match(/\)/g) || []).length;
      if (openParens > closeParens) {
        return ')'.repeat(openParens - closeParens);
      }
      
      // Missing semicolons
      if (currentLine.trim() && !currentLine.trim().endsWith(';') && !currentLine.trim().endsWith('{') && !currentLine.trim().endsWith('}')) {
        return ';';
      }
      
      // Common C++ completions
      if (currentLine.includes('#include')) {
        return ' <iostream>';
      }
      if (currentLine.trim() === 'int main') {
        return '() {\n    return 0;\n}';
      }
      if (currentLine.includes('cout')) {
        return ' << "Hello World" << endl;';
      }
    }
    
    return '';
  };

  const updateSuggestionPosition = () => {
    if (!textareaRef.current) return;

    const textarea = textareaRef.current;
    const rect = textarea.getBoundingClientRect();
    
    // Position on the right side of the editor, vertically centered
    setSuggestionPosition({
      top: rect.height / 2 - 100, // Center vertically with offset
      left: rect.width - 20, // Right side with small margin
    });
  };

  const handleAutocomplete = async () => {
    if (!textareaRef.current) return;

    try {
      const cursorPosition = textareaRef.current.selectionStart;
      const response = await getAutocomplete({
        code,
        cursorPosition,
        language,
      });
      dispatch(setSuggestion(response.suggestion));
      setShowSuggestion(true);
      updateSuggestionPosition();
    } catch (error) {
      console.error('Autocomplete error:', error);
    }
  };

  const applySuggestion = () => {
    if (!textareaRef.current || !suggestion) return;

    const textarea = textareaRef.current;
    const cursorPosition = textarea.selectionStart;
    const newCode =
      code.slice(0, cursorPosition) + suggestion + code.slice(cursorPosition);

    handleCodeChange(newCode);
    setShowSuggestion(false);
    dispatch(setSuggestion(''));

    // Move cursor to end of inserted suggestion
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        cursorPosition + suggestion.length,
        cursorPosition + suggestion.length
      );
    }, 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Tab' && showSuggestion && suggestion) {
      e.preventDefault();
      applySuggestion();
    } else if (e.key === 'Escape') {
      setShowSuggestion(false);
    } else if (e.ctrlKey && e.key === 'Enter') {
      e.preventDefault();
      handleRunCode();
    } else {
      // Handle auto-closing brackets and quotes
      handleAutoClose(e);
    }
  };

  const handleAutoClose = (e: React.KeyboardEvent) => {
    if (!textareaRef.current) return;

    const textarea = textareaRef.current;
    const { selectionStart, selectionEnd, value } = textarea;
    const key = e.key;

    // Auto-close brackets, parentheses, braces, and quotes
    const pairs: { [key: string]: string } = {
      '(': ')',
      '[': ']',
      '{': '}',
      '"': '"',
      "'": "'",
    };

    if (pairs[key]) {
      e.preventDefault();
      const before = value.slice(0, selectionStart);
      const after = value.slice(selectionEnd);
      const newValue = before + key + pairs[key] + after;
      
      handleCodeChange(newValue);
      
      // Position cursor between the pair
      setTimeout(() => {
        textarea.setSelectionRange(selectionStart + 1, selectionStart + 1);
      }, 0);
    }
    
    // Auto-close on Enter for Python colons
    else if (key === 'Enter' && language === 'python') {
      const currentLine = value.slice(0, selectionStart).split('\n').pop() || '';
      if (currentLine.trim().endsWith(':')) {
        e.preventDefault();
        const indent = '    '; // 4 spaces for Python
        const newValue = value.slice(0, selectionStart) + '\n' + indent + value.slice(selectionEnd);
        handleCodeChange(newValue);
        
        setTimeout(() => {
          textarea.setSelectionRange(selectionStart + 1 + indent.length, selectionStart + 1 + indent.length);
        }, 0);
      }
    }
    
    // Skip closing bracket if next character is the same
    else if ([')', ']', '}', '"', "'"].includes(key)) {
      const nextChar = value.charAt(selectionStart);
      if (nextChar === key) {
        e.preventDefault();
        textarea.setSelectionRange(selectionStart + 1, selectionStart + 1);
      }
    }
  };

  const handleRunCode = async () => {
    if (!code.trim()) return;
    
    // Check if user is in a room
    if (!roomId || !isConnected) {
      setExecutionResult({
        output: '',
        error: 'Please join a room first before running code. The compiler requires an active room connection.',
        executionTime: 0,
      });
      return;
    }
    
    setIsExecuting(true);
    try {
      const result = await executeCode(code, language);
      setExecutionResult(result);
    } catch (error) {
      setExecutionResult({
        output: '',
        error: error instanceof Error ? error.message : 'Execution failed',
        executionTime: 0,
      });
    } finally {
      setIsExecuting(false);
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (lineNumbersRef.current && textareaRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
      lineNumbersRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  };



  return (
    <div
      className={`h-full flex flex-col backdrop-blur-xl rounded-xl shadow-2xl p-2 transition-all duration-300 ${
        isDark
          ? 'bg-gradient-to-br from-white/10 to-white/5 border border-white/20 shadow-black/20'
          : 'bg-white/90 border border-gray-200 shadow-gray-200/50'
      }`}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-2 flex-shrink-0 gap-2">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex gap-1 sm:gap-2">
            <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-gradient-to-r from-red-400 to-red-500 shadow-lg"></div>
            <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-500 shadow-lg"></div>
            <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-gradient-to-r from-green-400 to-green-500 shadow-lg"></div>
          </div>
          <span
            className={`text-xs sm:text-sm font-semibold ${
              isDark ? 'text-gray-200' : 'text-gray-700'
            }`}
          >
            Code Editor
          </span>
        </div>
        <div className="flex items-center gap-1 sm:gap-2 w-full sm:w-auto">
          <button
            onClick={handleRunCode}
            disabled={!code.trim() || isExecuting}
            className={`flex items-center px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-lg sm:rounded-xl backdrop-blur-sm transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex-1 sm:flex-initial justify-center ${
              isDark
                ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg hover:shadow-green-500/25'
                : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg hover:shadow-green-500/25'
            }`}
            title="Run Code (Ctrl+Enter)"
          >
            {isExecuting ? (
              <svg className="w-4 h-4 mr-2 animate-spin" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
            )}
            <span className="whitespace-nowrap">{isExecuting ? 'Running...' : 'Run'}</span>
          </button>
          <button
            onClick={handleAutocomplete}
            disabled={!code}
            className={`flex items-center px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-lg sm:rounded-xl backdrop-blur-sm transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex-1 sm:flex-initial justify-center ${
              isDark
                ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg hover:shadow-purple-500/25'
                : 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg hover:shadow-purple-500/25'
            }`}
          >
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732L14.146 12.8l-1.179 4.456a1 1 0 01-1.934 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732L9.854 7.2l1.179-4.456A1 1 0 0112 2z"
                clipRule="evenodd"
              />
            </svg>
            <span className="whitespace-nowrap">AI</span>
          </button>
        </div>
      </div>

      {suggestion && (
        <div className="mb-4 p-3 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-lg">
          <div className="flex items-start gap-2">
            <svg
              className="text-yellow-400 text-sm w-4 h-4"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.477.859h4z" />
            </svg>
            <div className="flex-1">
              <p className="text-xs text-gray-400 mb-1">AI Suggestion:</p>
              <code className="text-sm text-yellow-200 font-mono">
                {suggestion}
              </code>
            </div>
          </div>
        </div>
      )}

      <div className="relative flex-1 flex overflow-hidden">
        {/* Line numbers */}
        <div 
          ref={lineNumbersRef}
          className={`flex-shrink-0 w-12 font-mono text-xs p-3 pr-2 rounded-l-lg border-r select-none overflow-y-hidden ${
            isDark
              ? 'bg-black/30 text-gray-400 border-white/10'
              : 'bg-gray-100 text-gray-500 border-gray-300'
          }`} 
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {code.split('\n').map((_, index) => (
            <div key={index} className="leading-5 text-right">
              {index + 1}
            </div>
          ))}
        </div>
        
        {/* Code textarea */}
        <textarea
          ref={textareaRef}
          value={code}
          onChange={e => handleCodeChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onScroll={handleScroll}
          placeholder={language === 'python' ? 
            '# Start typing your Python code here...\n# Auto-complete with brackets, quotes, and colons\n# Press Tab to accept AI suggestions' :
            '// Start typing your C++ code here...\n// Auto-complete with brackets and semicolons\n// Press Tab to accept AI suggestions'
          }
          className={`horizontal-scroll flex-1 h-full font-mono text-sm p-3 pl-2 rounded-r-lg backdrop-blur-sm transition-all duration-300 focus:outline-none resize-none leading-5 ${
            isDark
              ? 'bg-black/20 text-gray-100 border border-l-0 border-white/10 placeholder-gray-500 shadow-inner'
              : 'bg-gray-50 text-gray-900 border border-l-0 border-gray-300 placeholder-gray-400'
          }`}
          spellCheck={false}
          wrap="off"
          style={{ whiteSpace: 'pre' }}
        />

        {/* Floating suggestion popup */}
        {showSuggestion && suggestion && (
          <div
            className="absolute z-10 bg-slate-800 border border-purple-500/50 rounded-lg p-3 shadow-2xl w-64"
            style={{
              top: suggestionPosition.top,
              right: 10,
              transform: 'translateY(-50%)',
            }}
          >
            <div className="flex items-start gap-2 mb-2">
              <span className="text-purple-400 text-xs flex items-center gap-1">
                <svg
                  className="w-3 h-3"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.477.859h4z" />
                </svg>{' '}
                AI Suggestion
              </span>
              <button
                onClick={() => setShowSuggestion(false)}
                className="text-gray-400 hover:text-white text-xs ml-auto"
              >
                <svg
                  className="w-3 h-3"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
            <code className="text-xs text-green-300 font-mono block mb-2 whitespace-pre-wrap">
              {suggestion}
            </code>
            <div className="flex gap-2">
              <button
                onClick={applySuggestion}
                className="px-2 py-1 bg-purple-600 text-white text-xs rounded hover:bg-purple-700 transition"
              >
                Apply (Tab)
              </button>
              <button
                onClick={() => setShowSuggestion(false)}
                className="px-2 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700 transition"
              >
                Dismiss (Esc)
              </button>
            </div>
          </div>
        )}
      </div>

      {executionResult && (
        <div className={`mt-2 p-3 rounded-lg backdrop-blur-sm max-h-32 overflow-hidden ${
          isDark ? 'bg-black/20 border border-white/10' : 'bg-gray-50 border border-gray-200'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className={`text-xs font-medium ${
              isDark ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Output ({executionResult.executionTime}ms)
            </span>
            <button
              onClick={() => setExecutionResult(null)}
              className={`text-xs px-2 py-1 rounded transition-colors ${
                isDark ? 'text-gray-400 hover:text-white hover:bg-white/10' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'
              }`}
            >
              Clear
            </button>
          </div>
          <div className="overflow-y-auto max-h-20">
            {executionResult.error ? (
              <pre className="text-xs text-red-400 font-mono whitespace-pre-wrap">
                Error: {executionResult.error}
              </pre>
            ) : (
              <pre className={`text-xs font-mono whitespace-pre-wrap ${
                isDark ? 'text-green-300' : 'text-green-700'
              }`}>
                {executionResult.output || '(no output)'}
              </pre>
            )}
          </div>
        </div>
      )}

      <div
        className={`mt-2 flex items-center justify-between text-xs flex-shrink-0 p-2 rounded-lg ${
          isDark
            ? 'bg-white/5 backdrop-blur-sm text-gray-300'
            : 'bg-gray-50 text-gray-600'
        }`}
      >
        <div className="flex items-center gap-4">
          <span
            className={`px-2 py-1 rounded-lg text-xs font-medium ${
              isDark
                ? 'bg-purple-500/20 text-purple-300'
                : 'bg-purple-100 text-purple-700'
            }`}
          >
            {language}
          </span>
          <span className="text-xs">{code.split('\n').length} lines</span>
          <span className="text-xs opacity-60">Ctrl+Enter to run</span>
        </div>
        {isConnected && (
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 animate-pulse shadow-lg"></div>
            <span
              className={`text-xs font-medium ${isDark ? 'text-green-300' : 'text-green-600'}`}
            >
              Live Sync
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default CodeEditor;
