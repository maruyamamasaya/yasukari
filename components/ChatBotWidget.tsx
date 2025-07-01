import React, { useState } from "react";
import { FaComments } from "react-icons/fa";
import ChatBot from "./ChatBot";

export default function ChatBotWidget() {
  const [open, setOpen] = useState(false);
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end">
      {open && (
        <div className="relative mb-2 shadow-xl">
          <button
            onClick={() => setOpen(false)}
            className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
          >
            ×
          </button>
            <ChatBot className="w-80 sm:w-96" />
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
