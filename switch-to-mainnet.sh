#!/bin/bash
# Switch to Solana Mainnet

echo "🔄 Switching to SOLANA MAINNET..."
echo ""

# Backup current config
cp .env.local .env.local.backup

# Update RPC to mainnet
if grep -q "NEXT_PUBLIC_SOLANA_RPC" .env.local; then
    # Use macOS compatible sed
    if [[ "$OSTYPE" == "darwin"* ]]; then
        sed -i '' 's|NEXT_PUBLIC_SOLANA_RPC=.*|NEXT_PUBLIC_SOLANA_RPC=https://api.mainnet-beta.solana.com|' .env.local
    else
        sed -i 's|NEXT_PUBLIC_SOLANA_RPC=.*|NEXT_PUBLIC_SOLANA_RPC=https://api.mainnet-beta.solana.com|' .env.local
    fi
    echo "✅ Updated .env.local to use Mainnet"
else
    echo "NEXT_PUBLIC_SOLANA_RPC=https://api.mainnet-beta.solana.com" >> .env.local
    echo "✅ Added Mainnet RPC to .env.local"
fi

echo ""
echo "💰 MAINNET ENABLED"
echo ""
echo "⚠️  IMPORTANT:"
echo "   - This network uses REAL money"
echo "   - You need real SOL to transact"
echo "   - Buy SOL from exchanges (Coinbase, Binance, etc.)"
echo "   - Minimum recommended: 0.1 SOL (~$20)"
echo ""
echo "📱 Don't forget to:"
echo "   1. Switch Phantom wallet to Mainnet"
echo "   2. Restart dev server: npm run dev"
echo ""
echo "🔄 To switch back to devnet: ./switch-to-devnet.sh"
