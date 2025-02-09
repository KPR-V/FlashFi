import { useEffect, useRef, useState } from "react";
import { PlaceholdersAndVanishInput } from "./ui/placeholders-and-vanish-input";
import { formatResponse } from "../utils/formatResponse";
import WalletIcon from "./WalletIcon";
import { TypewriterText } from './ui/TypeWriterText';
import { useLocation } from "react-router-dom";
import logo from '../../Images/FlashFiLogo.png'
import CreateWalletButton from "./CreateWalletButton";



interface Message {
  role: "user" | "assistant" | "tool-response" | "error";
  content: string;
}

export default function Chat() {
    const location = useLocation();
    const initialMessage = location.state?.initialMessage;

    const [messages, setMessages] = useState<Message[]>([]);
    const [ws, setWs] = useState<WebSocket | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [wsError, setWsError] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const initialMessageSent = useRef(false);
    useEffect(() => {
        console.log("Initializing WebSocket connection...");
        const connectWebSocket = () => {
            const websocket = new WebSocket("ws://localhost:3000");

            websocket.onopen = () => {
              console.log("✅ WebSocket connection established");
              setWs(websocket);
              setWsError(null);
              if (initialMessage && !initialMessageSent.current) {
                  const cleanInitialMessage = initialMessage.trim();
                  console.log("Sending initial message:", cleanInitialMessage);
                  websocket.send(cleanInitialMessage);
                  setMessages([{ role: "user", content: cleanInitialMessage }]);
                  setIsLoading(true);
                  initialMessageSent.current = true;
              }
          };



          websocket.onmessage = (event) => {
            console.log("📩 Received message from server:", event.data);
            setIsLoading(false);
            try {
                const data = JSON.parse(event.data);
                const formattedContent = formatResponse(data.content);
                console.log("Formatted content:", formattedContent); // Debug log
                setMessages((prev) => [
                    ...prev,
                    {
                        role: data.type,
                        content: formattedContent,
                    },
                ]);
            } catch (error) {
                console.error("❌ Failed to parse message:", error);
            }
        };

      websocket.onclose = () => {
        console.log("Disconnected from server");
        setWs(null);
        setWsError("Connection lost. Retrying...");
        setTimeout(connectWebSocket, 3000); // Retry connection after 3 seconds
      };

      websocket.onerror = (error) => {
        console.error("WebSocket error:", error);
        setWsError("Connection error occurred");
      };
    };

    connectWebSocket();

        return () => {
            if (ws) {
                ws.close();
            }
        };
    }, [initialMessage]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      console.log("Form submitted");
  
      const form = e.target as HTMLFormElement;
      const formData = new FormData(form);
      const message = formData.get("message") as string;
  
      // Trim the message but preserve all characters
      const cleanMessage = message.trim();
  
      console.log("Message to send:", cleanMessage);
  
      if (cleanMessage && ws && ws.readyState === WebSocket.OPEN) {
          console.log("📤 Sending message to WebSocket");
          setIsLoading(true);
          // Add the exact message to the messages array
          setMessages((prev) => [...prev, { role: "user", content: cleanMessage }]);
          // Send the exact message through WebSocket
          ws.send(cleanMessage);
          form.reset();
      } else {
          console.error("❌ WebSocket not ready:", {
              message: !!cleanMessage,
              ws: !!ws,
              readyState: ws?.readyState,
          });
          setWsError("Connection lost. Please try again.");
      }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    // Process the input change if needed
    console.log("Input changed:", e.target.value);
  };

    const placeholders = [
            "Check my wallet balance on Ethereum",
            "What's the current gas price?",
            "Send 0.1 ETH to 0x...",
            "Check my token approvals",
        ];
        
        const formatBulletPoints = (text: string) => {
          return text.split('• ').map((point, index) => {
            if (index === 0 && !point.trim()) return null;
            return point.trim() && `• ${point.trim()}`;
          }).filter(Boolean).join('\n');
        };
        
        

        return (
          <div className="w-full min-h-screen bg-zinc-950 flex justify-center Highest">
              <img src={logo} alt="" className='absolute top-6 left-8 w-16' />
              <div className="absolute top-10 right-28 bg-transparent text-pink-400 border-[1px] border-pink-300  py-2 px-4 rounded-xl focus:outline-none focus:shadow-outline">
                <CreateWalletButton/>
              </div>
            <div className="absolute top-10 text-white">
              <WalletIcon />
            </div>
           
            <div className="w-[50%] mx-auto bg-zinc-700 max-w-4xl px-4 md:px-6 h-screen flex flex-col">
              {wsError && (
                <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-2 rounded-md mt-2">
                  {wsError}
                </div>
              )}
              <div className="flex-1 overflow-y-auto py-4 space-y-4 no-scrollbar font-CabinetGrotesk">
              {messages.map((msg, idx) => (
  <div
    key={idx}
    className={`p-4 rounded-lg ${
      msg.role === "user"
        ? "bg-pink-300 ml-auto max-w-[80%]"
        : "bg-zinc-900 mr-auto max-w-[80%]"
    }`}
  >
    <div 
      className={`whitespace-pre-line text-sm ${
        msg.role === "user" ? "text-black" : "text-white"
      }`}
    >
      <TypewriterText 
        text={msg.role === "user" 
          ? msg.content 
          : formatBulletPoints(msg.content)
        } 
      />
    </div>
  </div>
))}
                {isLoading && (
                  <div className="bg-zinc-700 mr-auto max-w-[80%] p-4 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-pink-300 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                      <div className="w-2 h-2 bg-pink-300 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                      <div className="w-2 h-2 bg-pink-300 rounded-full animate-bounce"></div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

        <div className="py-4 relative"></div>

        <PlaceholdersAndVanishInput
          placeholders={placeholders}
          onChange={handleInputChange}
          onSubmit={handleSubmit}
          disabled={isLoading || !ws || ws.readyState !== WebSocket.OPEN}
        />
      </div>
    </div>
  );
}
