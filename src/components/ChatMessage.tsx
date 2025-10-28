import React, { useState } from "react";
import { User, Bot, Copy, Edit3, Clock } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { motion } from "framer-motion";
import { Message } from "../types";
import { ModeSelector } from "./ModeSelector";

interface ModeData {
  prompt: string;
  features: string[];
  description: string;
}

interface ChatMessageProps {
  message: Message;
  showModeSelector?: boolean;
  onSelectMode?: (
    isCodeGenerator: boolean,
    modeName: string,
    modeData?: ModeData
  ) => void;
  isWelcome?: boolean;
  onEdit?: (messageId: string, newContent: string) => void;
  onCopy?: (content: string) => void;
  userAvatar?: string;
  userName?: string;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  showModeSelector,
  onSelectMode,
  isWelcome,
  onEdit,
  onCopy,
  userAvatar,
  userName,
}) => {
  const isUser = message.role === "user";
  const [copyStatus, setCopyStatus] = useState<"idle" | "copying" | "copied">(
    "idle"
  );

  const formatTime = (timestamp?: number) => {
    if (!timestamp) return "";
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const copyToClipboard = async (text: string) => {
    setCopyStatus("copying");
    try {
      await navigator.clipboard.writeText(text);
      setCopyStatus("copied");
      if (onCopy) onCopy(text);
      // Reset after 2 seconds
      setTimeout(() => setCopyStatus("idle"), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
      setCopyStatus("idle");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 100 }}
      className={`flex w-full items-end gap-3 px-4 py-2 ${
        isUser ? "justify-end" : "justify-start"
      }`}
    >
      {/* Avatar */}
      {!isUser && (
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center">
          <Bot size={20} />
        </div>
      )}

      {/* Message Container */}
      <div
        className={`flex flex-col ${
          isUser ? "items-end" : "items-start"
        } max-w-[75%] md:max-w-[60%]`}
      >
        {/* Message Bubble */}
        <div
          className={`relative rounded-2xl px-4 py-3 shadow-sm transition-all duration-200 ${
            isUser
              ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-br-none"
              : isWelcome
              ? "bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-100 dark:border-blue-700 rounded-bl-none"
              : "bg-gray-100 dark:bg-gray-700/70 text-gray-900 dark:text-gray-100 rounded-bl-none"
          }`}
        >
          {/* Username + Time */}
          <div className="flex items-center justify-between mb-1">
            <span
              className={`text-xs font-semibold ${
                isUser ? "text-blue-100" : "text-gray-600 dark:text-gray-400"
              }`}
            >
              {isUser ? userName || "You" : "Bro"}
            </span>
            <div
              className={`flex items-center gap-1 text-[11px] ${
                isUser ? "text-blue-200" : "text-gray-500 dark:text-gray-400"
              }`}
            >
              <Clock size={12} />
              {formatTime(message.timestamp)}
            </div>
          </div>

          {/* Message Content */}
          <div
            className={`prose dark:prose-invert max-w-none text-sm leading-relaxed ${
              isUser ? "prose-invert" : ""
            }`}
          >
            <ReactMarkdown
              components={{
                code: ({ className, children, ...props }) => {
                  const match = /language-(\w+)/.exec(className || "");
                  if (match) {
                    return (
                      <div className="relative group/code">
                        <pre className="bg-gray-900 text-gray-100 p-3 rounded-lg overflow-x-auto text-sm">
                          <code className={className} {...props}>
                            {children}
                          </code>
                        </pre>
                        <button
                          onClick={() =>
                            copyToClipboard(String(children).trim())
                          }
                          className="absolute top-2 right-2 p-2 bg-gray-800/60 hover:bg-gray-700 rounded-md opacity-0 group-hover/code:opacity-100 transition-opacity"
                          title="Copy code"
                        >
                          <Copy size={14} />
                        </button>
                      </div>
                    );
                  }
                  return (
                    <code
                      className={`${
                        isUser
                          ? "bg-blue-600 text-blue-100"
                          : "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      } px-1.5 py-0.5 rounded text-xs font-mono`}
                      {...props}
                    >
                      {children}
                    </code>
                  );
                },
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>

          {/* Mode Selector (Optional) */}
          {showModeSelector && onSelectMode && (
            <div className="mt-4">
              <ModeSelector onSelectMode={onSelectMode} />
            </div>
          )}
        </div>

        {/* Action Buttons - Always visible below user messages */}
        {isUser && !isWelcome && (
          <div className="flex gap-2 mt-2 px-2">
            {onEdit && (
              <button
                onClick={() =>
                  onEdit(
                    (message.timestamp || Date.now()).toString(),
                    message.content
                  )
                }
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg text-xs font-medium transition-colors"
                title="Edit message"
              >
                <Edit3 size={12} />
                Edit
              </button>
            )}
            <button
              onClick={() => copyToClipboard(message.content)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                copyStatus === "copied"
                  ? "bg-green-100 hover:bg-green-200 dark:bg-green-900/30 dark:hover:bg-green-900/40 text-green-700 dark:text-green-300"
                  : copyStatus === "copying"
                  ? "bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-900/40 text-blue-700 dark:text-blue-300"
                  : "bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200"
              }`}
              title={copyStatus === "copied" ? "Copied!" : "Copy message"}
            >
              {copyStatus === "copied" ? (
                <>
                  <svg
                    className="w-3 h-3"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Copied!
                </>
              ) : copyStatus === "copying" ? (
                <>
                  <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin"></div>
                  Copying...
                </>
              ) : (
                <>
                  <Copy size={12} />
                  Copy
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* User Avatar */}
      {isUser && (
        <div className="flex-shrink-0 w-10 h-10 rounded-full overflow-hidden">
          {userAvatar ? (
            <img
              src={userAvatar}
              alt={userName || "User"}
              className="w-full h-full object-cover rounded-full"
            />
          ) : (
            <div className="bg-blue-500 text-white flex items-center justify-center h-full w-full">
              <User size={20} />
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
};
