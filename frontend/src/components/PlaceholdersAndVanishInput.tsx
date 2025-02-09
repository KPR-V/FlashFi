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
    "What's the first rule of Fight Club?",
    "Who is Tyler Durden?", 
    "Where is Andrew Laeddis Hiding?",
    "Write a Javascript method to reverse a string",
    "How to assemble your own PC?",
  ];

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    console.log(e.target.value);
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const chatId = generateChatId();
    navigate(`/chat/${chatId}`);
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