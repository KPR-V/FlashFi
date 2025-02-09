// frontend/src/components/CreateWalletPolicyModal.tsx
import React, { useState } from 'react';
import { Switch } from '@headlessui/react';

interface PolicyModalProps {
  walletId: string;
  onClose: () => void;
  onCreatePolicy: (policy: any) => void;
}

const PolicyInfo = {
  allowlist: {
    title: "Allowlist Contract",
    description: "Only allow transactions to specific contract addresses.",
    example: "Example: 0x1234...5678 (Contract address on desired network)"
  },
  denylist: {
    title: "Denylist Address",
    description: "Block transactions to specific addresses.",
    example: "Example: 0x1234...5678 (Address to block)"
  },
  nativeLimit: {
    title: "Native Token Limit",
    description: "Set a maximum transfer amount for the native token (e.g., ETH).",
    example: "Example: 1.5 (for 1.5 ETH)"
  },
  erc20Limit: {
    title: "ERC20 Transfer Limit",
    description: "Limit transfers for a specific ERC20 token.",
    example: "Contract: 0x1234...5678, Chain ID: 1 (Ethereum), Max: 100 (in token units)"
  },
};

export default function CreateWalletPolicyModal({ 
  walletId, 
  onClose,
  onCreatePolicy
}: PolicyModalProps) {
  const [policyName, setPolicyName] = useState('');
  const [allowlistEnabled, setAllowlistEnabled] = useState(false);
  const [denylistEnabled, setDenylistEnabled] = useState(false);
  const [nativeLimitEnabled, setNativeLimitEnabled] = useState(false);
  const [erc20LimitEnabled, setErc20LimitEnabled] = useState(false);
  const [allowlistAddress, setAllowlistAddress] = useState('');
  const [denylistAddress, setDenylistAddress] = useState('');
  const [nativeMax, setNativeMax] = useState('');
  const [erc20Config, setErc20Config] = useState({
    contractAddress: '',
    chainId: '',
    maxAmount: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreatePolicy = async () => {
    try {
      setLoading(true);
      setError('');

      const policyData = {
        walletId,
        policyName,
        allowlist: allowlistEnabled ? { address: allowlistAddress } : null,
        denylist: denylistEnabled ? { address: denylistAddress } : null,
        nativeLimit: nativeLimitEnabled ? { max: nativeMax } : null,
        erc20Limit: erc20LimitEnabled ? erc20Config : null,
      };

      const response = await fetch('http://localhost:3001/create-policy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(policyData)
      });

      if (!response.ok) throw new Error(await response.text());
      
      const policy = await response.json();
      onCreatePolicy(policy);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Policy creation failed');
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 ">
      <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6 w-full max-w-md shadow-xl overflow-y-auto h-[450px] no-scrollbar">
        <h2 className="text-2xl font-bold mb-6 text-white">Create Wallet Policy</h2>
        
        <div className="mb-4">
          <div className="block text-sm font-medium text-left text-zinc-300 italic underline">
            Wallet ID
          </div>
          <div className="w-full text-left text-sm text-white"
          >{walletId}</div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            Policy Name
          </label>
          <input
            type="text"
            value={policyName}
            onChange={(e) => setPolicyName(e.target.value)}
            className="w-full py-2 px-4 rounded-lg bg-zinc-800 border border-zinc-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-white"
            placeholder="Enter a descriptive name for your policy"
          />
        </div>

        <div className="space-y-4">
          <PolicyToggle
            title="Allowlist Contract"
            enabled={allowlistEnabled}
            setEnabled={setAllowlistEnabled}
            info={PolicyInfo.allowlist}
          >
            {allowlistEnabled && (
              <input
                type="text"
                value={allowlistAddress}
                onChange={(e) => setAllowlistAddress(e.target.value)}
                className="w-full py-2 px-4 rounded-lg bg-zinc-800 border border-zinc-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-white"
                placeholder="0x... (Contract address to allow)"
              />
            )}
          </PolicyToggle>

          <PolicyToggle
            title="Denylist Address"
            enabled={denylistEnabled}
            setEnabled={setDenylistEnabled}
            info={PolicyInfo.denylist}
          >
            {denylistEnabled && (
              <input
                type="text"
                value={denylistAddress}
                onChange={(e) => setDenylistAddress(e.target.value)}
                className="w-full py-2 px-4 rounded-lg bg-zinc-800 border border-zinc-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-white"
                placeholder="0x... (Address to block)"
              />
            )}
          </PolicyToggle>

          <PolicyToggle
            title="Native Token Limit"
            enabled={nativeLimitEnabled}
            setEnabled={setNativeLimitEnabled}
            info={PolicyInfo.nativeLimit}
          >
            {nativeLimitEnabled && (
              <input
                type="number"
                value={nativeMax}
                onChange={(e) => setNativeMax(e.target.value)}
                className="w-full py-2 px-4 rounded-lg bg-zinc-800 border border-zinc-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-white"
                placeholder="e.g., 1.5 for 1.5 ETH"
                step="0.000000001"
              />
            )}
          </PolicyToggle>

          <PolicyToggle
            title="ERC20 Transfer Limit"
            enabled={erc20LimitEnabled}
            setEnabled={setErc20LimitEnabled}
            info={PolicyInfo.erc20Limit}
          >
            {erc20LimitEnabled && (
              <div className="space-y-2">
                <input
                  type="text"
                  value={erc20Config.contractAddress}
                  onChange={(e) => setErc20Config({...erc20Config, contractAddress: e.target.value})}
                  className="w-full py-2 px-4 rounded-lg bg-zinc-800 border border-zinc-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-white"
                  placeholder="0x... (ERC20 token address)"
                />
                <input
                  type="text"
                  value={erc20Config.chainId}
                  onChange={(e) => setErc20Config({...erc20Config, chainId: e.target.value})}
                  className="w-full py-2 px-4 rounded-lg bg-zinc-800 border border-zinc-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-white"
                  placeholder="Chain ID (e.g., 1 for Ethereum mainnet)"
                />
                <input
                  type="number"
                  value={erc20Config.maxAmount}
                  onChange={(e) => setErc20Config({...erc20Config, maxAmount: e.target.value})}
                  className="w-full py-2 px-4 rounded-lg bg-zinc-800 border border-zinc-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-white"
                  placeholder="Max amount in token units"
                />
              </div>
            )}
          </PolicyToggle>
        </div>

        {error && <div className="text-red-500 text-sm mb-4">{error}</div>}

        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-zinc-300 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleCreatePolicy}
            disabled={loading}
            className={`px-4 py-2 rounded-lg ${
              loading ? 'bg-pink-400' : 'bg-pink-400 hover:bg-pink-500'
            } text-white transition-colors`}
          >
            {loading ? 'Creating...' : 'Create Policy'}
          </button>
        </div>
      </div>
    </div>
  );
}

interface PolicyToggleProps {
  title: string;
  enabled: boolean;
  setEnabled: (enabled: boolean) => void;
  info: {
    title: string;
    description: string;
    example: string;
  };
  children?: React.ReactNode;
}

function PolicyToggle({ title, enabled, setEnabled, children }: PolicyToggleProps) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <span className="text-sm font-medium text-zinc-300">{title}</span>
        </div>
        <Switch
      checked={enabled}
      onChange={setEnabled}
      className="group relative flex h-7 w-14 cursor-pointer rounded-full bg-white/10 p-1 transition-colors duration-200 ease-in-out focus:outline-none data-[focus]:outline-1 data-[focus]:outline-white data-[checked]:bg-white/10"
    >
      <span
        aria-hidden="true"
        className={`${
                enabled ? 'translate-x-3 bg-green-500' : '-translate-x-3 bg-pink-400'
              }     pointer-events-none inline-block size-5 translate-x-0 rounded-full ring-0 shadow-lg transition duration-200 ease-in-out group-data-[checked]:translate-x-7`}
      />
    </Switch>
      </div>
      
      {enabled && children && <div className="mt-2">{children}</div>}
    </div>


  );
}
