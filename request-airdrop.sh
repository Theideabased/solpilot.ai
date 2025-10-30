#!/bin/bash
# Request devnet SOL airdrop using Solana Web3.js

WALLET_ADDRESS="$1"
AMOUNT="${2:-2}"  # Default 2 SOL per request

if [ -z "$WALLET_ADDRESS" ]; then
    echo "❌ Error: Please provide a wallet address"
    echo "Usage: ./request-airdrop.sh YOUR_WALLET_ADDRESS [AMOUNT]"
    exit 1
fi

echo "🪂 Requesting ${AMOUNT} SOL airdrop on DEVNET..."
echo "📍 Wallet: $WALLET_ADDRESS"
echo ""

# Use Node.js to request airdrop via Solana Web3
node << EOF
const { Connection, PublicKey, LAMPORTS_PER_SOL } = require('@solana/web3.js');

async function requestAirdrop() {
    try {
        const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
        const publicKey = new PublicKey('$WALLET_ADDRESS');
        
        console.log('🔄 Requesting airdrop...');
        const signature = await connection.requestAirdrop(
            publicKey,
            ${AMOUNT} * LAMPORTS_PER_SOL
        );
        
        console.log('⏳ Confirming transaction...');
        await connection.confirmTransaction(signature);
        
        console.log('✅ Airdrop successful!');
        console.log('📝 Signature:', signature);
        
        // Check new balance
        const balance = await connection.getBalance(publicKey);
        console.log('💰 New balance:', (balance / LAMPORTS_PER_SOL).toFixed(4), 'SOL');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        if (error.message.includes('airdrop request limit')) {
            console.log('');
            console.log('⏰ You have reached the airdrop limit.');
            console.log('💡 Solutions:');
            console.log('   1. Wait 24 hours and try again');
            console.log('   2. Use web faucet: https://faucet.solana.com');
            console.log('   3. Create a new wallet for testing');
        }
    }
}

requestAirdrop();
EOF

echo ""
