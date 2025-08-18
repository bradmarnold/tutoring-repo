"use client";
import { useEffect, useRef } from 'react';

// Simple MathMD component for rendering Markdown with KaTeX
// This is a simplified version - in production you'd use a proper library
export default function MathMD({ children, className = "" }) {
  const contentRef = useRef(null);

  useEffect(() => {
    if (!contentRef.current || !children) return;

    // Simple markdown-like rendering
    let html = children
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code>$1</code>')
      .replace(/\n/g, '<br>');

    // For now, just display LaTeX as-is (wrapped in spans for styling)
    // In a real implementation, you'd use KaTeX here
    html = html
      .replace(/\$\$(.*?)\$\$/g, '<span class="math-display">$$$$1$$</span>')
      .replace(/\$(.*?)\$/g, '<span class="math-inline">$$$1$$</span>');

    contentRef.current.innerHTML = html;
  }, [children]);

  return (
    <div 
      ref={contentRef} 
      className={`math-content ${className}`}
      style={{
        lineHeight: '1.6'
      }}
    />
  );
}