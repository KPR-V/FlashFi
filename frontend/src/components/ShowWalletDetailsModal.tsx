interface ShowWalletDetailsModalProps {
    wallet: {
      id: string;
      address: string;
    };
    onClose: () => void;
  }
  
  const ShowWalletDetailsModal = ({ wallet, onClose }: ShowWalletDetailsModalProps) => {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div className="bg-zinc-900 rounded-lg p-6 w-full max-w-md">
          <h2 className="text-xl font-semibold mb-4 text-white">Wallet Created Successfully!</h2>
          
          <div className="space-y-4 mb-6">
            <div className="bg-zinc-800 p-4 rounded-lg">
              <p className="text-gray-400 text-sm mb-1">Wallet ID:</p>
              <p className="text-white font-mono break-all">{wallet.id}</p>
            </div>
            
            <div className="bg-zinc-800 p-4 rounded-lg">
              <p className="text-gray-400 text-sm mb-1">Wallet Address:</p>
              <p className="text-white font-mono break-all">{wallet.address}</p>
            </div>
          </div>
  
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  export default ShowWalletDetailsModal;