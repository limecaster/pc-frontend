import ChatbotPCConfig from "./ChatPCConfig";

export default function ChatbotMessage({ message }: { message: any }) {
    const data = message.data;
    const type = message.type;
    const sender = message.sender;

    return (
        <div className={`flex ${
            message.sender === 'bot' ? 'justify-start' : 'justify-end'
        }`}>
            <div
                className={`max-w-sm p-3 rounded-lg ${
                    sender === 'bot'
                        ? 'bg-gray-200 text-gray-900'
                        : 'bg-primary text-white'
                }`}
            >
                {type === 'pc_config' ? (
                    <ChatbotPCConfig config={data} />
                ) : type === 'faq' ? (
                    <p style={{ whiteSpace: "pre-wrap" }}>
                        {typeof data === 'object' && data !== null ? data?.text : data}
                    </p>
                ) : (
                    <p>
                        {typeof data === 'object' && data !== null ? data?.text : data} 
                    </p>
                )}
            </div>
        </div>
    );
}
