import React, { useState } from "react";
import { FaComments } from "react-icons/fa";
import ChatBot from "./ChatBot";

export default function ChatBotWidget() {
  const [open, setOpen] = useState(false);
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end">
      {open && (
        <div>
          {/* Mobile full-screen overlay */}
          <div className="fixed inset-0 bg-white z-50 flex flex-col sm:hidden">
            <button
              onClick={() => setOpen(false)}
              className="absolute top-4 right-4 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center"
            >
              ×
            </button>
            <ChatBot className="flex-1" fullScreen onClose={() => setOpen(false)} />
          </div>
          {/* Desktop popup */}
          <div className="hidden sm:block relative mb-2 shadow-xl">
            <button
              onClick={() => setOpen(false)}
              className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
            >
              ×
            </button>
            <ChatBot className="w-80 sm:w-96" onClose={() => setOpen(false)} />
          </div>
        </div>
      )}
      <button
        onClick={() => setOpen(!open)}
        className="bg-red-600 text-white p-4 rounded-full shadow-lg"
      >
        <FaComments className="w-8 h-8" />
      </button>
    </div>
  );
}
