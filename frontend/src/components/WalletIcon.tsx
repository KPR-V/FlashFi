import { useState, useEffect, useRef } from "react";
import {
  Wallet,
  ChevronDown,
  Check,
  Eye,
  EyeOff,
  MoveUpRight,
  ScanQrCode,
  Cog,
  Copy,
} from "lucide-react";
import { InfiniteMovingCardsDemo } from "./InfiniteMovingCardsDemo";
import SendTransactionModal from "./SendTransactionModal";

interface Wallet {
  id: string;
  address: string;
  chainType: string;
  createdAt: string;
}

interface WalletBalance {
  balance: number;
}

const WalletIcon = () => {
  const [isWalletOpen, setIsWalletOpen] = useState(false);
  const [isAccountSelectorOpen, setIsAccountSelectorOpen] = useState(false);
  const [isShowWalletAmount, setIsShowWalletAmount] = useState(true);
  const [hoveredAction, setHoveredAction] = useState<
    "moveUpRight" | "scanQr" | "settings" | null
  >(null);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeWalletId, setActiveWalletId] = useState<string | null>(null);
  const [selectedWallet, setSelectedWallet] = useState<Wallet | null>(null);
  const [showSendModal, setShowSendModal] = useState(false);
  const [showCopied, setShowCopied] = useState(false);
  const [walletBalances, setWalletBalances] = useState<Record<string, number>>(
    {}
  );
  const [loadingBalances, setLoadingBalances] = useState<
    Record<string, boolean>
  >({});
  const [balanceErrors, setBalanceErrors] = useState<Record<string, string>>(
    {}
  );
  const [chainId, setChainId] = useState<string>("11155111"); // Default to Sepolia testnet

  const walletRef = useRef<HTMLDivElement>(null);
  const accountSelectorRef = useRef<HTMLDivElement>(null);

  // Close wallet manager when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        walletRef.current &&
        !walletRef.current.contains(event.target as Node)
      ) {
        setIsWalletOpen(false);
        setIsAccountSelectorOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Prevent closing when clicking inside wallet manager or account selector
  const handleContainerClick = (event: React.MouseEvent) => {
    event.stopPropagation();
  };

  const fetchWallets = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await fetch("http://localhost:3000/get-wallets");

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setWallets(data);
      console.log("Fetched wallets:", data);
    } catch (err) {
      setError(
        "Failed to connect to the server. Make sure the backend is running."
      );
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWallets();
  }, []);

  const fetchWalletBalance = async (address: string) => {
    try {
      setLoadingBalances((prev) => ({ ...prev, [address]: true }));
      setBalanceErrors((prev) => ({ ...prev, [address]: "" }));
      const response = await fetch(
        `http://localhost:3000/wallet-balance/${address}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch balance");
      }

      const data: WalletBalance = await response.json();
      setWalletBalances((prev) => ({ ...prev, [address]: data.balance }));
    } catch (err) {
      setBalanceErrors((prev) => ({
        ...prev,
        [address]: "Failed to fetch balance",
      }));
      console.error("Balance fetch error:", err);
    } finally {
      setLoadingBalances((prev) => ({ ...prev, [address]: false }));
    }
  };

  useEffect(() => {
    if (wallets.length > 0) {
      wallets.forEach((wallet) => {
        fetchWalletBalance(wallet.address);
      });
    }
  }, [wallets]);

  const handleActivate = (wallet: Wallet) => {
    setSelectedWallet(wallet);
    setActiveWalletId(wallet.id);
    fetchWalletBalance(wallet.address);
  };

  return (
    <div className="fixed top-10 right-10 z-40">
      <div
        ref={walletRef}
        className="relative"
        onClick={() => setIsWalletOpen(!isWalletOpen)}
      >
        <Wallet size={32} />

        {isWalletOpen && (
          <div
            className={`absolute right-0 mt-2 w-96 bg-zinc-950 rounded-lg shadow-lg flex flex-col`}
            onClick={handleContainerClick}
          >
            {/* Header */}
            <div className="w-full bg-zinc-950 h-[60px] flex items-center justify-between rounded-t-lg px-4 z-40">
              <div className="text-white">Network</div>

              <div className="flex flex-col justify-between items-center">
                <div className="flex items-center">
                  <div className="bg-green-500 w-2 h-2 rounded-full mx-1"></div>
                  <div className="text-sm mx-1 text-white">Account Name</div>

                  <div
                    className="cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsAccountSelectorOpen(!isAccountSelectorOpen);
                    }}
                  >
                    <ChevronDown
                      size={20}
                      className="text-white"
                      onClick={fetchWallets}
                    />
                  </div>
                </div>

                <div className="text-xs text-gray-400 flex gap-1">
                  {selectedWallet ? (
                    <>
                      {`${selectedWallet.address.slice(
                        0,
                        6
                      )}...${selectedWallet.address.slice(-4)}`}
                      <Copy
                        size={14}
                        className="cursor-pointer hover:text-gray-300 transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigator.clipboard.writeText(selectedWallet.address);
                          setShowCopied(true);
                          setTimeout(() => setShowCopied(false), 2000);
                        }}
                      />
                      {showCopied && (
                        <div className="absolute top-14 right-40 bg-zinc-950 text-xs px-2 py-1 rounded">
                          Copied!
                        </div>
                      )}
                    </>
                  ) : (
                    "Loading..."
                  )}
                </div>
              </div>

              <div>Logo</div>
            </div>

            {/* Account Selector */}
            {isAccountSelectorOpen && (
              <div
                ref={accountSelectorRef}
                className="relative bg-zinc-950 w-[96%] mx-auto top-2 rounded-2xl z-50 h-[200px] overflow-y-auto no-scrollbar"
                onClick={handleContainerClick}
              >
                <div className="p-4">
                  <h3 className="text-white text-sm mb-2 text-center">
                    Select Wallet
                  </h3>
                  {wallets.map((wallet, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center text-white hover:bg-zinc-800 hover:scale-105 transition duration-500 ease-in-out p-2 rounded cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleActivate(wallet);
                        setIsAccountSelectorOpen(false);
                      }}
                    >
                      <div className="flex items-center">
                        {activeWalletId === wallet.id ? (
                          <div className="bg-green-500 w-6 h-6 rounded-full flex items-center justify-center mr-2">
                            <Check
                              size={16}
                              color="white"
                              onClick={() => handleActivate(wallet)}
                            />
                          </div>
                        ) : (
                          <div className="w-6 h-6 rounded-full border border-gray-500 mr-2 bg-transparent"></div>
                        )}

                        <div className="flex flex-col">
                          <div className="text-sm">{wallet.id}</div>
                          <div className="text-xs text-gray-400">
                            {" "}
                            {`${wallet.address.slice(
                              0,
                              6
                            )}...${wallet.address.slice(-4)}`}
                          </div>
                        </div>
                      </div>

                      <div className="text-sm text-gray-300 text-right ml-2">
                        {" "}
                        {loadingBalances[wallet.address] ? (
                          <p>Loading balance...</p>
                        ) : balanceErrors[wallet.address] ? (
                          <p className="text-red-400">
                            {balanceErrors[wallet.address]}
                          </p>
                        ) : (
                          <p>
                            {walletBalances[wallet.address] !== undefined
                              ? `${walletBalances[wallet.address].toFixed(6)} ${
                                  chainId === "1" ? "ETH" : "SepoliaETH"
                                }`
                              : "Not available"}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Wallet details */}
            <div className="h-[360px] bg-zinc-950 w-full rounded-b-lg absolute top-14">
              <div className="flex flex-col bg-zinc-900 w-full h-full rounded-b-lg">
                {/* Wallet info */}
                <div className="flex justify-between">
                  <div className="text-white  py-4 ">
                    <div className="text-4xl px-5 tracking-tighter">
                      {isShowWalletAmount === true ? (
                        <div>
                          {selectedWallet &&
                            (loadingBalances[selectedWallet.address] ? (
                              <p>Loading balance...</p>
                            ) : balanceErrors[selectedWallet.address] ? (
                              <p className="text-red-400">
                                {balanceErrors[selectedWallet.address]}
                              </p>
                            ) : (
                              <p>
                                {walletBalances[selectedWallet.address] !==
                                undefined
                                  ? `${walletBalances[
                                      selectedWallet.address
                                    ].toFixed(6)} ${
                                      chainId === "1" ? "ETH" : "SepoliaETH"
                                    }`
                                  : "Not available"}
                              </p>
                            ))}
                        </div>
                      ) : (
                        <div>*****</div>
                      )}
                    </div>
                    <div className="px-5">
                      {isShowWalletAmount === true ? (
                        <div>{selectedWallet?.chainType}</div>
                      ) : (
                        <div>***</div>
                      )}
                    </div>
                  </div>
                  <div
                    className="absolute top-7 right-5"
                    onClick={() => setIsShowWalletAmount(!isShowWalletAmount)}
                  >
                    {isShowWalletAmount === true ? <Eye /> : <EyeOff />}
                  </div>
                </div>
                {/* buttons */}
                <div className="flex my-5 w-[96%] mx-auto h-16 rounded-lg overflow-hidden">
                  {/* Move Up Right Action */}
                  <div
                    className={`
          ${
            hoveredAction === "moveUpRight"
              ? "w-48 transition-all duration-500 ease-in-out"
              : "w-16"
          } 
          h-16 bg-zinc-950 rounded-full flex items-center justify-center mx-2 transition-all duration-300 ease-in-out
        `}
                    onMouseEnter={() => setHoveredAction("moveUpRight")}
                    onMouseLeave={() => setHoveredAction(null)}
                    onClick={() => setShowSendModal(true)}
                  >
                    <div className="flex items-center">
                      <MoveUpRight size={24} className="text-white" />
                      {hoveredAction === "moveUpRight" && (
                        <span className="text-white ml-2 whitespace-nowrap">
                          Send Funds
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Scan QR Code Action */}
                  <div
                    className={`
          ${
            hoveredAction === "scanQr"
              ? "w-48 transition-all duration-500 ease-in-out"
              : "w-16"
          } 
          h-16 bg-zinc-950 rounded-full flex items-center justify-center mx-2 transition-all duration-300 ease-in-out
        `}
                    onMouseEnter={() => setHoveredAction("scanQr")}
                    onMouseLeave={() => setHoveredAction(null)}
                  >
                    <div className="flex items-center">
                      <ScanQrCode size={24} className="text-white" />
                      {hoveredAction === "scanQr" && (
                        <span className="text-white ml-2 whitespace-nowrap">
                          Receive Funds
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Settings Action */}
                  <div
                    className={`
          ${
            hoveredAction === "settings"
              ? "w-48 transition-all duration-500 ease-in-out"
              : "w-16"
          } 
          h-16 bg-zinc-950 rounded-full flex items-center justify-center mx-2 transition-all duration-300 ease-in-out
        `}
                    onMouseEnter={() => setHoveredAction("settings")}
                    onMouseLeave={() => setHoveredAction(null)}
                  >
                    <div className="flex items-center">
                      <Cog size={28} className="text-white" />
                      {hoveredAction === "settings" && (
                        <span className="text-white ml-2 whitespace-nowrap">
                          Wallet Settings
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="w-[98%] mx-auto h-32">
                  <InfiniteMovingCardsDemo />
                </div>
                <div className="text-xs font-light text-center mt-3 italic">
                  Powered by{" "}
                  <a href="https://www.privy.io/" className="underline">
                    Privy
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <SendTransactionModal
        walletId={selectedWallet?.id || ""}
        isOpen={showSendModal}
        onClose={() => setShowSendModal(false)}
        onSend={async (txData) => {
          try {
            console.log("Sending transaction with data:", txData);

            const response = await fetch(
              "http://localhost:3000/send-transaction",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  walletId: selectedWallet?.id,
                  ...txData,
                }),
              }
            );

            const result = await response.json();

            if (!response.ok) {
              console.error("Server error details:", result);
              throw new Error(result.details || "Transaction failed");
            }

            console.log("Transaction successful:", result);
            return result;
          } catch (error: any) {
            console.error("Transaction error:", {
              message: error.message,
              cause: error.cause,
              stack: error.stack,
            });
            throw error;
          }
        }}
      />
    </div>
  );
};

export default WalletIcon;
