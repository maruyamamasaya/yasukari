import React, { useState } from "react";
import { FaComments } from "react-icons/fa";
import ChatBot from "./ChatBot";

type ChatBotWidgetProps = {
  visible?: boolean;
};

export default function ChatBotWidget({ visible = true }: ChatBotWidgetProps) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="fixed bottom-4 right-4 z-50 flex flex-col items-end"
      hidden={!visible}
      aria-hidden={!visible}
    >
      {open && (
        <div>
          {/* Mobile full-screen overlay */}
          <div className="fixed inset-0 bg-white z-50 flex flex-col sm:hidden">
            <ChatBot className="flex-1" fullScreen onClose={() => setOpen(false)} />
          </div>
          {/* Desktop popup */}
          <div className="hidden sm:block relative mb-2 shadow-xl">
            <button
              onClick={() => setOpen(false)}
              className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full w-8 h-8 text-lg flex items-center justify-center shadow-md"
            >
              ×
            </button>
            <ChatBot className="w-[25rem] sm:w-[32rem]" onClose={() => setOpen(false)} />
          </div>
        </div>
      )}
      <button
        onClick={() => setOpen(!open)}
        className="bg-red-600 text-white p-3 sm:p-4 rounded-full shadow-lg"
      >
        <FaComments className="h-6 w-6 sm:h-8 sm:w-8" />
      </button>
    </div>
  );
}
