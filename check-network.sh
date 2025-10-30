#!/bin/bash
# Quick script to check and switch Solana network configuration

echo "🌐 SOLANA NETWORK CONFIGURATION CHECK"
echo "======================================"
echo ""

# Check current RPC configuration
if grep -q "NEXT_PUBLIC_SOLANA_RPC" .env.local 2>/dev/null; then
    CURRENT_RPC=$(grep "NEXT_PUBLIC_SOLANA_RPC" .env.local | cut -d'=' -f2)
    echo "📍 Current RPC: $CURRENT_RPC"
    echo ""
    
    if echo "$CURRENT_RPC" | grep -qi "devnet"; then
        echo "🧪 NETWORK: DEVNET (Testnet)"
        echo ""
        echo "✅ What works:"
        echo "   - Wallet connections"
        echo "   - Balance checks"
        echo "   - Test SOL transfers"
        echo "   - Free SOL airdrops"
        echo ""
        echo "❌ What doesn't work:"
        echo "   - Token swaps (Jupiter)"
        echo "   - NOS token (mainnet only)"
        echo "   - Real token prices"
        echo ""
        echo "💡 To get free test SOL:"
        echo "   Visit: https://faucet.solana.com"
        echo ""
        echo "🔄 To switch to MAINNET (for real swaps):"
        echo "   Run: ./switch-to-mainnet.sh"
        
    elif echo "$CURRENT_RPC" | grep -qi "mainnet"; then
        echo "💰 NETWORK: MAINNET (Production)"
        echo ""
        echo "✅ What works:"
        echo "   - Everything (swaps, real tokens, etc.)"
        echo ""
        echo "⚠️  Remember:"
        echo "   - Uses REAL money"
        echo "   - You need real SOL"
        echo "   - Transaction fees apply (~0.000005 SOL)"
        echo ""
        echo "🔄 To switch back to DEVNET (for testing):"
        echo "   Run: ./switch-to-devnet.sh"
        
    else
        echo "⚠️  NETWORK: Unknown (custom RPC)"
        echo "   RPC: $CURRENT_RPC"
    fi
else
    echo "❌ Error: NEXT_PUBLIC_SOLANA_RPC not found in .env.local"
fi

echo ""
echo "======================================"
echo "📄 For detailed guide: cat NETWORK_CONFIGURATION.md"
