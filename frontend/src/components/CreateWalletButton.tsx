import { useState } from "react";
import ShinyText from "./ui/ShinyText";
import AskCreatePolicy from "./AskCreatePolicy";

export default function CreateWalletButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [createdWallet, setCreatedWallet] = useState<null | { id: string; address: string }>(null);
  const [showPolicyModal, setShowPolicyModal] = useState(false);

  const createWallet = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await fetch("http://localhost:3000/create-wallet", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const wallet = await response.json();
      console.log("Created wallet:", wallet);
      setCreatedWallet(wallet);
      setShowPolicyModal(true);
    } catch (err) {
      setError("Failed to create wallet. Check backend connection.");
      console.error("Creation error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={createWallet}
        disabled={loading}
        className={``}
      >
        <ShinyText 
          text={loading ? "Creating..." : "Create Server Wallet"} 
          disabled={loading} 
          speed={3} 
          className="text-sm font-CabinetGrotesk font-medium text-pink-600"
        />
      </button>

      {error && <div className="mt-2 text-red-600">{error}</div>}
      
      {showPolicyModal && createdWallet && (
        <AskCreatePolicy 
          wallet={createdWallet} 
          onClose={() => {
            setShowPolicyModal(false);
            setCreatedWallet(null);
          }} 
        />
      )}
    </div>
  );
}