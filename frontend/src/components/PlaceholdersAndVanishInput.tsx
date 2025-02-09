import { useNavigate } from 'react-router-dom';
import { PlaceholdersAndVanishInput } from "./ui/placeholders-and-vanish-input";

export default function PlaceholdersAndVanishInputDemo() {
  const navigate = useNavigate();
  
  const generateChatId = () => {
    const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
    const length = 10;
    let result = '';
    
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    
    return result;
  };

  const placeholders = [
    "what can you do for me?",
    "What's up?",
    "what is the gas price on matic-mainnet?",
    "send 0.01 eth sepolia to 0x1234567890abcdef",
    "bridge 0.1 usdc from et sepolia to arbitrum fuji", 
  ];

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    console.log(e.target.value);
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const message = formData.get("message") as string;
    const chatId = generateChatId();
    navigate(`/chat/${chatId}`, { state: { initialMessage: message } });
  };

  return (
    <div className="h-[10rem] flex flex-col justify-center items-center px-4 text-white">
      <PlaceholdersAndVanishInput
        placeholders={placeholders}
        onChange={handleChange}
        onSubmit={onSubmit}
      />
    </div>
  );
}