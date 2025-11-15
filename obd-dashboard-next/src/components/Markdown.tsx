'use client'

/**
 * @file Wraps react-markdown to safely render Markdown content within the app.
 */
import React from 'react'
import ReactMarkdown from 'react-markdown'
import rehypeSanitize from 'rehype-sanitize'
import remarkGfm from 'remark-gfm'

interface MarkdownProps {
  content: string
}

/**
 * Markdown renders sanitized Markdown content with opinionated typography
 * helpers for paragraphs and list items.
 *
 * @param props.content - Markdown string to render.
 * @returns React node tree generated from the Markdown input.
 */
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
