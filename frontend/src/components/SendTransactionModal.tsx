import { useState } from "react";

interface SendTransactionModalProps {
  walletId: string;
  isOpen: boolean;
  onClose: () => void;
  onSend: (txData: {
    to: string;
    value: string;
    chainId: string;
  }) => Promise<void>;
}

export default function SendTransactionModal({
  walletId,
  isOpen,
  onClose,
  onSend,
}: SendTransactionModalProps) {
  const [toAddress, setToAddress] = useState("");
  const [value, setValue] = useState("");
  const [chainId, setChainId] = useState("1");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const chainOptions = [
    { value: "1", label: "Ethereum Mainnet", symbol: "ETH" },
    { value: "11155111", label: "Sepolia Testnet", symbol: "SepoliaETH" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await onSend({ to: toAddress, value, chainId });
      onClose();
    } catch (err: any) {
      setError(`Transaction failed: ${err.message}`);
      console.error("Submit error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-zinc-900 rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4 text-white">
          Send Transaction
        </h2>
        <p className="text-sm text-gray-400 mb-4">Wallet ID: {walletId}</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-white">
              Recipient Address
            </label>
            <input
              type="text"
              value={toAddress}
              onChange={(e) => setToAddress(e.target.value)}
              className="w-full bg-zinc-800 rounded p-2 text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-white">
              Amount ({chainOptions.find((c) => c.value === chainId)?.symbol})
            </label>
            <input
              type="number"
              step="0.0000001"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="w-full bg-zinc-800 rounded p-2 text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-white">
              Network
            </label>
            <select
              value={chainId}
              onChange={(e) => setChainId(e.target.value)}
              className="w-full bg-zinc-800 rounded p-2 text-white"
            >
              {chainOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {error && <div className="text-red-500 text-sm">{error}</div>}

          <div className="flex justify-end gap-2 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-4 py-2 rounded ${
                loading ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
              } text-white`}
            >
              {loading ? "Sending..." : "Send Transaction"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
