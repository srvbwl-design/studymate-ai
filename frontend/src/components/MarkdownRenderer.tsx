import React from 'react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = '' }) => {
  if (!content) return null;

  // Simple, robust markdown processor that avoids external bulky heavy packages
  const renderFormatted = (text: string) => {
    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];
    let inCodeBlock = false;
    let codeBlockContent: string[] = [];

    lines.forEach((line, index) => {
      // Code block handling
      if (line.startsWith('```')) {
        if (inCodeBlock) {
          elements.push(
            <pre
              key={`code-${index}`}
              className="p-4 rounded-xl bg-slate-900 text-slate-100 dark:bg-slate-950 font-mono text-sm overflow-x-auto my-3 border border-slate-800"
            >
              <code>{codeBlockContent.join('\n')}</code>
            </pre>
          );
          codeBlockContent = [];
          inCodeBlock = false;
        } else {
          inCodeBlock = true;
        }
        return;
      }

      if (inCodeBlock) {
        codeBlockContent.push(line);
        return;
      }

      // Headings
      if (line.startsWith('# ')) {
        elements.push(
          <h1 key={index} className="text-2xl font-bold text-slate-900 dark:text-white mt-6 mb-3 pb-2 border-b border-slate-200 dark:border-slate-800">
            {formatInline(line.replace('# ', ''))}
          </h1>
        );
        return;
      }
      if (line.startsWith('## ')) {
        elements.push(
          <h2 key={index} className="text-xl font-semibold text-primary-700 dark:text-primary-400 mt-5 mb-2">
            {formatInline(line.replace('## ', ''))}
          </h2>
        );
        return;
      }
      if (line.startsWith('### ')) {
        elements.push(
          <h3 key={index} className="text-lg font-semibold text-slate-800 dark:text-slate-200 mt-4 mb-1">
            {formatInline(line.replace('### ', ''))}
          </h3>
        );
        return;
      }

      // Unordered list
      if (line.startsWith('- ') || line.startsWith('* ')) {
        elements.push(
          <li key={index} className="ml-5 list-disc text-slate-700 dark:text-slate-300 my-1 leading-relaxed">
            {formatInline(line.replace(/^[-*]\s+/, ''))}
          </li>
        );
        return;
      }

      // Ordered list
      const olMatch = line.match(/^(\d+)\.\s+(.*)/);
      if (olMatch) {
        elements.push(
          <div key={index} className="flex items-start gap-2.5 my-1.5 ml-1">
            <span className="font-semibold text-primary-600 dark:text-primary-400 text-sm w-5 shrink-0 text-right">
              {olMatch[1]}.
            </span>
            <span className="text-slate-700 dark:text-slate-300 leading-relaxed text-sm">
              {formatInline(olMatch[2])}
            </span>
          </div>
        );
        return;
      }

      // Horizontal rule
      if (line.trim() === '---' || line.trim() === '***') {
        elements.push(<hr key={index} className="my-4 border-slate-200 dark:border-slate-800" />);
        return;
      }

      // Empty line
      if (!line.trim()) {
        elements.push(<div key={index} className="h-2" />);
        return;
      }

      // Standard paragraph
      elements.push(
        <p key={index} className="text-slate-700 dark:text-slate-300 leading-relaxed my-1.5 text-sm md:text-base">
          {formatInline(line)}
        </p>
      );
    });

    return elements;
  };

  const formatInline = (text: string): React.ReactNode => {
    // Basic inline formatting: **bold**, *italic*, `code`, LaTeX-like $math$
    const parts = text.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`|\$.*?\$)/g);

    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-semibold text-slate-900 dark:text-white">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('*') && part.endsWith('*')) {
        return <em key={i} className="italic text-slate-800 dark:text-slate-200">{part.slice(1, -1)}</em>;
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code key={i} className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-primary-600 dark:text-primary-400 font-mono text-xs">
            {part.slice(1, -1)}
          </code>
        );
      }
      if (part.startsWith('$') && part.endsWith('$')) {
        return (
          <span key={i} className="px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 font-mono text-xs font-semibold">
            {part.slice(1, -1)}
          </span>
        );
      }
      return part;
    });
  };

  return <div className={`space-y-1 ${className}`}>{renderFormatted(content)}</div>;
};
