'use client'
import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeSanitize from 'rehype-sanitize'

interface MarkdownProps {
  content: string
}

export function Markdown({ content }: MarkdownProps) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeSanitize]}
      components={{
        p: ({ node, ...props }) => {
          void node;
          return <p className="mb-2" {...props} />;
        },
        li: ({ node, ...props }) => {
          void node;
          return <li className="ml-6 list-disc" {...props} />;
        },
      }}
    >
      {content}
    </ReactMarkdown>
  )
}
