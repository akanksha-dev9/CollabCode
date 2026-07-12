function OutputPanel({ output, error, loading, onClose }) {
  return (
    <div className="h-48 bg-[#181825] border-t border-[#313244] flex flex-col">
      
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-[#313244]">
        <span className="text-[#cba6f7] text-sm font-semibold">Output</span>
        <button
          onClick={onClose}
          className="text-[#6c7086] hover:text-[#cdd6f4] text-xs transition-colors"
        >
          Close
        </button>
      </div>

      {/* Output Content */}
      <div className="flex-1 overflow-y-auto p-3 font-mono text-sm">
        {loading && (
          <div className="flex items-center gap-2 text-[#cba6f7]">
            <div className="w-3 h-3 border-2 border-[#cba6f7] border-t-transparent rounded-full animate-spin"/>
            Running...
          </div>
        )}

        {!loading && !output && (
          <p className="text-[#6c7086] text-xs">Run your code to see output here</p>
        )}

        {!loading && output && (
          <pre className={`whitespace-pre-wrap ${error ? 'text-[#f38ba8]' : 'text-[#a6e3a1]'}`}>
            {output}
          </pre>
        )}
      </div>

    </div>
  );
}

export default OutputPanel;