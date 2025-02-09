import { useEffect, useRef, useState } from "react";
import { PlaceholdersAndVanishInput } from "./ui/placeholders-and-vanish-input";
import { formatResponse } from "../utils/formatResponse";
import WalletIcon from "./WalletIcon";

interface Message {
  role: "user" | "assistant" | "tool-response" | "error";
  content: string;
}

export default function Chat() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [ws, setWs] = useState<WebSocket | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [wsError, setWsError] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        console.log("Initializing WebSocket connection...");
        const connectWebSocket = () => {
            const websocket = new WebSocket("ws://localhost:3000");

            websocket.onopen = () => {
                console.log("✅ WebSocket connection established");
                setWs(websocket);
                setWsError(null);
            };

            websocket.onmessage = (event) => {
                console.log("📩 Received message from server:", event.data);
                setIsLoading(false);
                try {
                    const data = JSON.parse(event.data);
                    setMessages((prev) => [
                        ...prev,
                        {
                            role: data.type,
                            content: formatResponse(data.content),
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
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

  

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        console.log("Form submitted");

        // Get the message from the form
        const form = e.target as HTMLFormElement;
        const formData = new FormData(form);
        const message = formData.get("message") as string;

        console.log("Message to send:", message);

   

        if (message && ws && ws.readyState === WebSocket.OPEN) {
            console.log("📤 Sending message to WebSocket");
            setIsLoading(true);
            setMessages((prev) => [...prev, { role: "user", content: message }]);
            ws.send(message);
            form.reset();
        } else {
            console.error("❌ WebSocket not ready:", {
                message: !!message,
                ws: !!ws,
                readyState: ws?.readyState,
            });
            setWsError("Connection lost. Please try again.");
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        // Process the input change if needed
        console.log('Input changed:', e.target.value);
    };

    const placeholders = [
            "Check my wallet balance on Ethereum",
            "What's the current gas price?",
            "Send 0.1 ETH to 0x...",
            "Check my token approvals",
        ];

        return (
          <div className="w-full min-h-screen bg-zinc-950 flex justify-center">
            <div className="absolute top-10 text-white">
              <WalletIcon />
            </div>
            <div className="w-[50%] mx-auto bg-zinc-900 max-w-4xl px-4 md:px-6 h-screen flex flex-col">
              {wsError && (
                <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-2 rounded-md mt-2">
                  {wsError}
                </div>
              )}
              <div className="flex-1 overflow-y-auto py-4 space-y-4">
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-lg ${
                      msg.role === "user"
                        ? "bg-zinc-800 ml-auto max-w-[80%]"
                        : "bg-zinc-700 mr-auto max-w-[80%]"
                    }`}
                  >
                    <pre className="whitespace-pre-wrap text-white font-mono text-sm">
                      {msg.content}
                    </pre>
                  </div>
                ))}
                {isLoading && (
                  <div className="bg-zinc-700 mr-auto max-w-[80%] p-4 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                      <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                      <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce"></div>
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

