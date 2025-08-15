"use client";

import {
  useAppKit,
  useAppKitAccount,
  useDisconnect,
} from "@reown/appkit/react";

export const WalletConnection = () => {
  const { address, isConnected } = useAppKitAccount();
  const { disconnect } = useDisconnect();
  const { open } = useAppKit();

  return (
    <div className="p-4 bg-gray-800 border-b border-gray-700 text-white flex justify-between items-center">
      <div className="flex items-center space-x-3">
        {isConnected ? (
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-400 uppercase tracking-wide">
              Connected
            </span>
            <p className="text-sm font-mono text-green-400 bg-gray-700 px-2 py-1 rounded">
              {`${address?.substring(0, 6)}...${address?.substring(38)}`}
            </p>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <p className="text-gray-300">Not Connected</p>
          </div>
        )}
      </div>
      <div>
        {isConnected ? (
          <button
            onClick={() => disconnect()}
            className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors border border-red-500"
          >
            Disconnect
          </button>
        ) : (
          <button
            onClick={() => open()}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors border border-blue-500"
          >
            Connect Wallet
          </button>
        )}
      </div>
    </div>
  );
};
