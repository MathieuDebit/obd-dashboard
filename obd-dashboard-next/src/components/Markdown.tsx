'use client'
import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'

interface MarkdownProps {
  content: string
}

export function Markdown({ content }: MarkdownProps) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeRaw]}
      components={{
        p: ({ node, ...props }) => <p className="mb-2" {...props} />,
        li: ({ node, ...props }) => <li className="list-disc ml-6" {...props} />,
      }}
    >
      {content}
    </ReactMarkdown>
  )
}
