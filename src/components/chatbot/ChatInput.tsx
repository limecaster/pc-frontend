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
    <div className="flex items-center space-x-2 p-2 border-t">
      <input
        type="text"
        className="flex-1 p-2 border rounded-lg text-zinc-900"
        placeholder="Hãy hỏi tôi điều gì đó..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSend()}
      />
      <button className="p-2 bg-primary text-white rounded-lg" onClick={handleSend}>
        Gửi
      </button>
      <button className="p-2 bg-primary text-white rounded-lg" onClick={handleVoice}>
        {isListening ? "Dừng" : "Mic"}
      </button>
    </div>
  );
}
