import { useParams } from 'react-router-dom';
import { PlaceholdersAndVanishInput } from './ui/placeholders-and-vanish-input';

const ChatPage = () => {
  const { chatId } = useParams();

  // Placeholder data for testing scroll
  const dummyResponse = `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.`.repeat(10);

  const placeholders = [
    "Ask a follow-up question...",
    "Need more details? Ask away...",
    "What else would you like to know?",
  ];

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    console.log(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Follow-up submitted");
  };

  return (
    <div className="w-full min-h-screen bg-zinc-950 flex justify-center">
      <div className="w-[50%] mx-auto bg-zinc-900 max-w-4xl px-4 md:px-6 h-screen flex flex-col">
        {/* Main content container */}
        <div className="flex-1 flex flex-col h-full max-h-screen pt-6 pb-4">
          {/* Prompt section */}
          <div className="flex-shrink-0 mb-6 mt-10">
            <div className="bg-zinc-950 text-white px-6 py-3 rounded-2xl w-full md:w-3/4 lg:w-2/3">
              <p className="text-base md:text-normal">
                {/* Replace with actual prompt */}
                How do I implement a binary search tree in JavaScript?
              </p>
            </div>
          </div>

          {/* AI Response section - Scrollable */}
          <div className="flex-1 min-h-0 mb-4">
            <div className="h-full bg-gradient-to-t from-zinc-900 to-zinc-800 rounded-t-2xl shadow-normal shadow-zinc-700 flex flex-col">
              {/* Response content - Scrollable */}
              <div className="flex-1 overflow-y-auto p-6 text-white no-scrollbar">
                <h2 className="text-sm text-zinc-400 mb-2">Claude's response</h2>
                <div className="prose prose-invert max-w-none">
                  {dummyResponse}
                </div>
              </div>
            </div>
          </div>

          {/* Input section - Fixed at bottom */}
          <div className="flex-shrink-0 mt-auto">
            <div className="bg-zinc-900 rounded-lg">
              <PlaceholdersAndVanishInput
                placeholders={placeholders}
                onChange={handleChange}
                onSubmit={handleSubmit}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;