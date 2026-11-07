'use client';

import React, { useMemo } from 'react';
import { marked } from 'marked';

interface MarkdownRendererProps {
  content: string;
  className?: string;
  style?: React.CSSProperties;
}

// Configure marked for GitHub Flavored Markdown with line breaks
marked.setOptions({
  gfm: true,
  breaks: true,
});

export default function MarkdownRenderer({ content, className = '', style = {} }: MarkdownRendererProps) {
  const htmlContent = useMemo(() => {
    if (!content) return '';
    try {
      // Synchronous parse in marked v18+
      const parsed = marked.parse(content);
      return typeof parsed === 'string' ? parsed : '';
    } catch (err) {
      console.error('Error parsing markdown:', err);
      // Fallback: replace line breaks with <br /> if markdown parsing fails
      return content.replace(/\n/g, '<br />');
    }
  }, [content]);

  return (
    <div
      className={`markdown-content ${className}`}
      style={{
        lineHeight: 1.75,
        fontSize: '1.05rem',
        color: '#1E293B',
        ...style,
      }}
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
}
