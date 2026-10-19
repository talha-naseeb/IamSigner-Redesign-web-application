import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";

const ChatParser = ({ text }) => {
  if (!text) return null;

  return (
    <div className='chat-text-content'>
      <ReactMarkdown
        children={text}
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSanitize]}
        components={{
          a: ({ href, children }) => (
            <a href={href} target='_blank' rel='noopener noreferrer'>
              {children}
            </a>
          ),
          code: ({ inline, children }) => <code className={inline ? "inline-code" : "block-code"}>{children}</code>,
          h1: ({ children }) => <h3 className='chat-header'>{children}</h3>,
          h2: ({ children }) => <h4 className='chat-header'>{children}</h4>,
          h3: ({ children }) => <h5 className='chat-header'>{children}</h5>,
        }}
      />
    </div>
  );
};

export default ChatParser;
