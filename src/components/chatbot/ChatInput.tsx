import { useState, useRef } from "react";

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

type SpeechRecognition = typeof window.SpeechRecognition | typeof window.webkitSpeechRecognition;

export default function ChatInput({ onSend }: { onSend: (message: string) => void }) {
  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const handleSend = () => {
    if (input.trim()) {
      onSend(input);
      setInput("");
    }
  };

  const handleVoice = () => {
    if (!('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      alert('Trình duyệt không hỗ trợ nhận diện giọng nói.');
      return;
    }
    if (!recognitionRef.current) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.lang = "vi-VN";
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[event.results.length - 1][0].transcript;
        setInput((prev) => prev + transcript);
      };
      recognitionRef.current.onend = () => {
        setIsListening(false);
        if (input.trim()) {
          handleSend();
        }
      };
    }
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
    setIsListening(!isListening);
  };

  return (
    <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-b-lg">
      <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-700 rounded-full pr-2">
        <input
          type="text"
          className="flex-1 py-3 px-4 bg-transparent border-none focus:outline-none focus:ring-0 text-gray-900 dark:text-white rounded-full"
          placeholder="Hãy hỏi tôi điều gì đó..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        
        <button 
          className="p-2.5 rounded-full bg-primary text-white hover:bg-primary-dark transition-colors focus:outline-none"
          onClick={handleSend}
          title="Gửi"
          disabled={!input.trim()}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path d="M15.964.686a.5.5 0 0 0-.65-.65L.767 5.855H.766l-.452.18a.5.5 0 0 0-.082.887l.41.26.001.002 4.995 3.178 3.178 4.995.002.002.26.41a.5.5 0 0 0 .886-.083l6-15Zm-1.833 1.89L6.637 10.07l-.215-.338a.5.5 0 0 0-.154-.154l-.338-.215 7.494-7.494 1.178-.471-.47 1.178Z"/>
          </svg>
        </button>
        
        <button 
          className={`p-2.5 rounded-full ${isListening ? 'bg-red-500 animate-pulse' : 'bg-primary hover:bg-primary-dark'} text-white transition-colors focus:outline-none`}
          onClick={handleVoice}
          title={isListening ? "Dừng ghi âm" : "Bắt đầu ghi âm"}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path d="M3.5 6.5A.5.5 0 0 1 4 7v1a4 4 0 0 0 8 0V7a.5.5 0 0 1 1 0v1a5 5 0 0 1-4.5 4.975V15h3a.5.5 0 0 1 0 1h-7a.5.5 0 0 1 0-1h3v-2.025A5 5 0 0 1 3 8V7a.5.5 0 0 1 .5-.5z"/>
            <path d="M10 8a2 2 0 1 1-4 0V3a2 2 0 1 1 4 0v5zM8 0a3 3 0 0 0-3 3v5a3 3 0 0 0 6 0V3a3 3 0 0 0-3-3z"/>
          </svg>
        </button>
      </div>
      {isListening && (
        <div className="text-xs text-center mt-1 text-primary animate-pulse">
          Đang nghe... Nói điều bạn muốn hỏi
        </div>
      )}
    </div>
  );
}
