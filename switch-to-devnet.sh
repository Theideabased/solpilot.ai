#!/bin/bash
# Switch to Solana Devnet (Testnet)

echo "🔄 Switching to SOLANA DEVNET..."
echo ""

# Backup current config
cp .env.local .env.local.backup

# Update RPC to devnet
if grep -q "NEXT_PUBLIC_SOLANA_RPC" .env.local; then
    # Use macOS compatible sed
    if [[ "$OSTYPE" == "darwin"* ]]; then
        sed -i '' 's|NEXT_PUBLIC_SOLANA_RPC=.*|NEXT_PUBLIC_SOLANA_RPC=https://api.devnet.solana.com|' .env.local
    else
        sed -i 's|NEXT_PUBLIC_SOLANA_RPC=.*|NEXT_PUBLIC_SOLANA_RPC=https://api.devnet.solana.com|' .env.local
    fi
    echo "✅ Updated .env.local to use Devnet"
else
    echo "NEXT_PUBLIC_SOLANA_RPC=https://api.devnet.solana.com" >> .env.local
    echo "✅ Added Devnet RPC to .env.local"
fi

echo ""
echo "🧪 DEVNET ENABLED (Safe Testing Mode)"
echo ""
echo "✅ What you can do:"
echo "   - Test wallet connections"
echo "   - Get free test SOL"
echo "   - Test transfers (fake money)"
echo "   - Check balances"
echo ""
echo "💰 Get free test SOL:"
echo "   Visit: https://faucet.solana.com"
echo "   Or use CLI: solana airdrop 2 YOUR_ADDRESS --url devnet"
echo ""
echo "📱 Don't forget to:"
echo "   1. Switch Phantom wallet to Devnet"
echo "   2. Restart dev server: npm run dev"
echo ""
echo "🔄 To switch to mainnet (for real swaps): ./switch-to-mainnet.sh"
