import { Copy } from 'lucide-react';
import { useState } from 'react';

interface ReceiveFundsModalProps {
  isOpen: boolean;
  onClose: () => void;
  walletAddress: string;
}

const ReceiveFundsModal = ({ isOpen, onClose, walletAddress }: ReceiveFundsModalProps) => {
  const [showCopied, setShowCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(walletAddress);
    setShowCopied(true);
    setTimeout(() => setShowCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6 w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          ✕
        </button>

        <h2 className="text-2xl text-white mb-6">Receive Funds</h2>
        
        <div className="space-y-4">
          <p className="text-gray-400">Use this address to receive funds in this wallet:</p>
          
          <div className="bg-zinc-800 p-4 rounded-lg flex items-center justify-between">
            <div className="text-white font-mono break-all">{walletAddress}</div>
            <button
              onClick={handleCopy}
              className="ml-2 p-2 hover:bg-zinc-700 rounded-lg transition-colors"
            >
              <Copy size={20} className="text-pink-300" />
            </button>
          </div>

          {showCopied && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-pink-300 text-black px-3 py-1 rounded-full text-sm">
              Address copied!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReceiveFundsModal;