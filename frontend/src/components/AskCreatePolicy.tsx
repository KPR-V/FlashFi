import { useState } from 'react';
import CreateWalletPolicyModal from './CreateWalletPolicies';
import ShowWalletDetailsModal from './ShowWalletDetailsModal';

interface AskCreatePolicyProps {
  wallet: {
    id: string;
    address: string;
  };
  onClose: () => void;
}

const AskCreatePolicy = ({ wallet, onClose }: AskCreatePolicyProps) => {
  const [showPolicyModal, setShowPolicyModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const handleYes = () => {
    setShowPolicyModal(true);
  };

  const handleNo = () => {
    setShowDetailsModal(true);
  };

  const handlePolicyCreated = (policy: any) => {
    console.log('Policy created:', policy);
    setShowDetailsModal(true);
    setShowPolicyModal(false);
  };

  if (showDetailsModal) {
    return <ShowWalletDetailsModal wallet={wallet} onClose={onClose} />;
  }

  return (
    <>
      {!showPolicyModal ? (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-zinc-900 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4 text-white">Create Wallet Policies</h2>
            <p className="text-gray-300 mb-6">
              Do you want to create Policies for this Wallet?
            </p>
            
            <div className="flex justify-end gap-4">
              <button
                onClick={handleNo}
                className="px-4 py-2 text-white bg-zinc-700 hover:bg-zinc-600 rounded-lg transition-colors"
              >
                No
              </button>
              <button
                onClick={handleYes}
                className="px-4 py-2 text-white bg-pink-500 hover:bg-pink-600 rounded-lg transition-colors"
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      ) : (
        <CreateWalletPolicyModal
          walletId={wallet.id}
          onClose={onClose}
          onCreatePolicy={handlePolicyCreated}
        />
      )}
    </>
  );
};

export default AskCreatePolicy;