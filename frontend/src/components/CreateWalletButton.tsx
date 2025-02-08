import { useState } from "react";

export default function CreateWalletButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
    } catch (err) {
      setError("Failed to create wallet. Check backend connection.");
      console.error("Creation error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mb-4">
      <button
        onClick={createWallet}
        disabled={loading}
        className={`px-4 py-2 rounded ${
          loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
        } text-white`}
      >
        {loading ? "Creating..." : "Create Server Wallet"}
      </button>

      {error && <div className="mt-2 text-red-600">{error}</div>}
    </div>
  );
}
