import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownRendererProps {
  content: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  return (
    <div className="markdown-content text-gray-200 leading-relaxed text-sm">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Header Styling
          h1: ({node, ...props}) => <h1 className="text-xl font-bold text-white mt-6 mb-3 border-b border-[#2A3342] pb-2" {...props} />,
          h2: ({node, ...props}) => <h2 className="text-lg font-bold text-[#4A90E2] mt-5 mb-2" {...props} />,
          h3: ({node, ...props}) => <h3 className="text-base font-bold text-gray-100 mt-4 mb-2" {...props} />,
          
          // Emphasis (Fluorescent Effect)
          strong: ({node, ...props}) => (
            <span className="font-bold text-[#FFD700] bg-[#FFD700]/10 px-1 rounded-sm mx-0.5 box-decoration-clone" {...props} />
          ),
          
          // Lists
          ul: ({node, ...props}) => <ul className="list-disc pl-5 my-2 space-y-1 text-gray-300" {...props} />,
          ol: ({node, ...props}) => <ol className="list-decimal pl-5 my-2 space-y-1 text-gray-300" {...props} />,
          li: ({node, ...props}) => <li className="pl-1 marker:text-[#4A90E2]" {...props} />,

          // Blockquotes (Infographic Card Style)
          blockquote: ({node, ...props}) => (
            <div className="border-l-4 border-[#4A90E2] bg-[#2A3342]/50 pl-4 py-3 my-4 rounded-r-lg italic text-gray-300 shadow-sm" {...props} />
          ),

          // Code Blocks
          code: ({node, className, children, ...props}: any) => {
            const match = /language-(\w+)/.exec(className || '')
            return !className?.includes('language-') ? (
              <code className="bg-[#0A1628] text-[#FF6B6B] px-1.5 py-0.5 rounded text-xs font-mono border border-[#2A3342]" {...props}>
                {children}
              </code>
            ) : (
               <div className="bg-[#0A1628] p-3 rounded-lg border border-[#2A3342] my-2 overflow-x-auto">
                 <code className={className} {...props}>
                   {children}
                 </code>
               </div>
            )
          },

          // Tables
          table: ({node, ...props}) => (
            <div className="overflow-x-auto my-4 rounded-lg border border-[#2A3342]">
              <table className="min-w-full divide-y divide-[#2A3342]" {...props} />
            </div>
          ),
          th: ({node, ...props}) => <th className="bg-[#2A3342] px-3 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider" {...props} />,
          td: ({node, ...props}) => <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-300 border-t border-[#2A3342]" {...props} />,
          
          // Paragraphs
          p: ({node, ...props}) => <p className="mb-3 last:mb-0" {...props} />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;