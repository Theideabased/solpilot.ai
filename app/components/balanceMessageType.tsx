import type { Token } from "../types";

const BalanceMessageType = ({ balances }: { balances: Token[] }) => {
  return (
    <div className="p-4 rounded-xl bg-zinc-800 text-white max-w-[75%] border border-zinc-700 shadow-lg">
      <h3 className="text-lg font-bold mb-4 text-zinc-100">💰 Your Wallet Balance</h3>
      <div className="flex flex-col gap-3">
        {balances?.map((token: Token) => (
          <div
            key={token.address}
            className="flex items-center bg-zinc-900 p-4 rounded-lg shadow-md border border-zinc-700 hover:border-zinc-600 transition-all duration-200"
          >
            {token.logo ? (
              <img 
                src={token.logo} 
                alt={token.symbol} 
                className="w-12 h-12 rounded-full mr-4 border-2 border-zinc-600 object-cover"
                onError={(e) => {
                  // Fallback if image fails to load
                  e.currentTarget.src = `https://via.placeholder.com/48/334155/ffffff?text=${token.symbol}`;
                }}
              />
            ) : (
              <div className="w-12 h-12 rounded-full mr-4 bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold">
                {token.symbol.substring(0, 2)}
              </div>
            )}

            <div className="flex flex-col flex-1 min-w-0">
              <span className="text-white font-bold text-lg">{token.symbol}</span>
              <span className="text-zinc-300 text-base font-semibold">
                {Number(token.amount).toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 6,
                })}
              </span>
              {token.balance > 0 && (
                <span className="text-green-400 text-sm font-medium">
                  ≈ ${Number(token.balance).toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              )}
            </div>

            <a
              href={`https://explorer.solana.com/address/${encodeURIComponent(token.address)}${
                process.env.NEXT_PUBLIC_SOLANA_RPC?.includes('devnet') ? '?cluster=devnet' : ''
              }`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 hover:underline text-sm font-medium whitespace-nowrap ml-2 transition-colors"
            >
              View ↗
            </a>
          </div>
        ))}
      </div>
      
      {balances && balances.length === 0 && (
        <div className="text-center text-zinc-400 py-6">
          No tokens found in your wallet
        </div>
      )}
    </div>
  );
};

export default BalanceMessageType;
