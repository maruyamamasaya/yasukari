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
      className="fixed bottom-[46px] right-4 z-50 flex flex-col items-end sm:bottom-4"
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
          <div className="hidden sm:block relative mb-2 shadow-2xl">
            <ChatBot
              className="w-[560px] min-w-[480px] h-[90vh] max-h-[900px]"
              onClose={() => setOpen(false)}
            />
          </div>
        </div>
      )}
      <button
        onClick={() => setOpen(!open)}
        className="bg-red-600 text-white p-2.5 sm:p-4 rounded-full shadow-xl hover:shadow-2xl transition"
      >
        <FaComments className="h-5 w-5 sm:h-8 sm:w-8" />
      </button>
    </div>
  );
}
