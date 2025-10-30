# SOLPILOT Mastra Integration

This directory contains the Mastra AI Agent configuration for SOLPILOT.

## 📁 Structure

```
mastra/
├── agents/           # AI Agent definitions
│   ├── solpilot.ts  # Main Solana assistant agent
│   ├── sonia.ts     # Token analysis agent
│   └── zerion.ts    # Portfolio intelligence agent 🆕
├── tools/            # Tool definitions for agents
│   ├── solana-tools.ts  # Solana blockchain tools
│   └── zerion.ts        # Zerion API tools 🆕
├── providers/        # LLM provider configurations
│   └── openrouter.ts    # OpenRouter provider
├── mcp-server.ts     # MCP Server implementation 🆕
├── index.ts          # Main Mastra configuration
└── README.md         # This file
```

## 🤖 Agents

### 1. SOLPILOT Agent (Main)
**File:** `agents/solpilot.ts`

The main Solana blockchain assistant that handles:
- Token swaps via Jupiter
- Balance checking
- Token transfers
- Staking operations
- Network metrics

**Model:** Configurable via `MODEL` env var (default: Claude 3.5 Sonnet)

### 2. Sonia Agent (Token Analyst)
**File:** `agents/sonia.ts`

Token analysis specialist that provides:
- Liquidity analysis
- Holder distribution
- Investment potential scoring
- Token metadata

**Model:** Claude 3.5 Sonnet (specialized for analysis)

### 3. Zerion Agent (Portfolio Intelligence) 🆕
**File:** `agents/zerion.ts`

Portfolio and transaction intelligence across Solana + 25 EVM chains:
- **Portfolio tracking:** Total value, positions, tokens, NFTs
- **PnL analysis:** Gains, losses, ROI calculations
- **Transaction history:** Decoded swaps, transfers, approvals
- **DeFi monitoring:** Staking, LPs, lending across 8000+ protocols
- **NFT holdings:** Collections with floor prices
- **Market data:** Real-time token prices

**Model:** Claude 3.5 Sonnet (optimized for data analysis)

## 🛠️ Tools

### Solana Tools
**File:** `tools/solana-tools.ts`

Core Solana blockchain operations:
- `fetchBalance` - Get SOL and SPL token balances
- `fetchTokenPrice` - Jupiter price API
- `executeSwap` - Create swap quotes
- `transferFunds` - Send SOL/SPL tokens
- `fetchValidators` - List validators
- `fetchMetrics` - Network statistics

### Zerion Tools 🆕
**File:** `tools/zerion.ts`

Comprehensive wallet data tools:
- `zerion-get-portfolio` - Full portfolio across all chains
- `zerion-get-transactions` - Transaction history with decoding
- `zerion-get-pnl` - Profit & loss calculations
- `zerion-get-defi-positions` - DeFi protocol positions
- `zerion-get-nfts` - NFT holdings
- `zerion-get-token-data` - Token prices and market data

## 🔧 Configuration

### Required Environment Variables

```bash
# OpenRouter (AI)
OPENROUTER_API_KEY=your_key_here
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
MODEL=anthropic/claude-3.5-sonnet

# Zerion (Portfolio Data) 🆕
ZERION_API_KEY=your_key_here
# Get free key: https://zerion-io.typeform.com/to/QI3GRa7t?utm_source=cypherpunk

# Solana
NEXT_PUBLIC_SOLANA_RPC=https://api.devnet.solana.com
```

See `../MASTRA_ENV_SETUP.md` for detailed setup instructions.

## 🚀 Usage

### In Your Application

```typescript
import { mastra, solpilotAgent, zerionAgent } from '@/mastra';

// Use main agent
const response = await solpilotAgent.generate("Show my balance");

// Use Zerion agent directly
const portfolio = await zerionAgent.generate("Show portfolio for 0x...");

// Access all agents via Mastra instance
const allAgents = mastra.agents;
```

### MCP Server

The MCP (Model Context Protocol) Server provides:
- Resource management
- Tool definitions
- Prompt templates

Start the MCP server:
```bash
npm run mcp:dev
```

## 📊 Zerion Integration Details

### Why Zerion?
- **Enterprise-grade:** Used by Uniswap, Farcaster, Privy, Kraken
- **Multi-chain:** Solana + 25 EVM chains in one API
- **Real-time:** Millisecond data freshness
- **Comprehensive:** Portfolio, transactions, DeFi, NFTs, prices
- **Reliable:** 99.9% uptime SLA

### Example Use Cases

#### Portfolio Overview
```typescript
User: "Show my portfolio"
Zerion Agent: 
📊 Portfolio Overview
Total Value: $45,678
Top Holdings:
• SOL: $12,345 (27%)
• USDC: $8,900 (19.5%)
```

#### PnL Analysis
```typescript
User: "What's my profit?"
Zerion Agent:
💰 P&L Analysis
Total P&L: +$5,678 (+14.2%)
Best: BONK +$2,100 (+156%)
```

#### Transaction History
```typescript
User: "Show my trades"
Zerion Agent:
📈 Recent Activity
1. ✅ Swapped 100 USDC → 0.5 SOL
2. ✅ Staked 50 SOL
```

## 🏗️ Architecture

```
┌─────────────────┐
│   User Input    │
└────────┬────────┘
         │
┌────────▼────────┐
│  Mastra Router  │
└────────┬────────┘
         │
    ┌────┴────┬────────────┬──────────┐
    │         │            │          │
┌───▼───┐ ┌──▼───┐  ┌─────▼────┐ ┌──▼──┐
│SOLPILOT│ │Sonia │  │ Zerion   │ │ MCP │
│ Agent  │ │Agent │  │  Agent   │ │ Srv │
└───┬───┘ └──┬───┘  └─────┬────┘ └──┬──┘
    │        │            │          │
┌───▼────────▼────────────▼──────────▼───┐
│           Tools Layer                   │
│  • Solana Tools                        │
│  • Zerion Tools (6 tools)              │
│  • Token Analysis                      │
└────────────────────────────────────────┘
```

## 🧪 Testing

### Test Zerion Features
```bash
# In your app, try these:
1. "Show my portfolio for [address]"
2. "What's my PnL?"
3. "Show recent transactions"
4. "Get my DeFi positions"
5. "Show my NFTs"
6. "What's the price of SOL?"
```

### Test Multi-Agent Routing
```bash
1. "Swap 1 SOL to USDC" → SOLPILOT Agent
2. "Analyze JUP token" → Sonia Agent
3. "Show my holdings" → Zerion Agent
```

## 📚 References

### Official Documentation
- **Mastra:** https://mastra.ai/docs
- **Zerion API:** https://developers.zerion.io/reference/intro-getting-started
- **OpenRouter:** https://openrouter.ai/docs
- **Solana Web3.js:** https://solana-labs.github.io/solana-web3.js/

### Example Implementations
- **Uniswap Wallet:** Uses Zerion for portfolio
- **Farcaster:** Uses Zerion for transactions
- **Rainbow Wallet:** Uses Zerion for multi-chain data

## 🐛 Troubleshooting

### Zerion API Errors
```
Error: ZERION_API_KEY is not set
```
**Solution:** Add `ZERION_API_KEY` to `.env.local`

### Rate Limiting
```
Error: 429 Rate limit exceeded
```
**Solution:** 
- Free plan: 3,000 requests/day
- Upgrade at https://zerion.io/api

### Agent Not Responding
```
Error: OpenRouter timeout
```
**Solution:** Check `OPENROUTER_API_KEY` and rate limits

## 🎯 Agent Challenge 102

This implementation meets all requirements:
- ✅ MCP Server (`mcp-server.ts`)
- ✅ Mastra AI Agents (3 specialized agents)
- ✅ Production-ready tools (Solana + Zerion)
- ✅ Real-time synchronization
- ✅ Interactive frontend integration

## 🏆 Zerion Track

All 6 core features implemented:
- ✅ Portfolio & balances
- ✅ Transaction history
- ✅ PnL tracking
- ✅ DeFi positions
- ✅ NFT holdings
- ✅ Token market data

## 📝 License

MIT License - see parent directory LICENSE file

---

**Built with ❤️ for Agent Challenge 102**


## 🎯 Challenge Requirements Met

### ✅ MCP Server
- **Location**: `mastra/mcp-server.ts`
- **Features**:
  - Resource management (agents, network status, tools)
  - Tool execution through MCP protocol
  - Standard I/O transport for communication

### ✅ Mastra AI Agents
- **SOLPILOT Agent** (`agents/solpilot.ts`): Main Solana blockchain assistant
- **Sonia Agent** (`agents/sonia.ts`): Token analyst
- **Venice Agent** (`agents/venice.ts`): Research analyst with web search

### ✅ Interactive Frontend
- Real-time chat interface with Next.js
- Live updates when agents modify resources
- Responsive UI with tool execution feedback

### ✅ Live Synchronization
- Agents can execute tools that modify Solana state
- UI updates instantly with tool results
- Context-aware responses based on wallet state

## 📁 Directory Structure

```
mastra/
├── index.ts                 # Main Mastra instance
├── mcp-server.ts           # Model Context Protocol server
├── agents/
│   ├── solpilot.ts        # Main blockchain assistant
│   ├── sonia.ts           # Token analyst
│   └── venice.ts          # Research analyst
└── tools/
    └── solana-tools.ts    # Solana-specific tools
```

## 🚀 Quick Start

### 1. Environment Variables

Add to your `.env.local`:

```bash
# OpenRouter Configuration (Required)
OPENROUTER_API_KEY=your_openrouter_api_key_here
MODEL=anthropic/claude-3.5-sonnet  # or any OpenRouter model

# Solana Configuration
NEXT_PUBLIC_SOLANA_RPC=https://api.devnet.solana.com

# Venice API (Optional - for research agent)
VENICE_API=your_venice_api_key_here
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Run the Application

```bash
npm run dev
```

### 4. Test the Agents

Send messages like:
- "What's my SOL balance?" (uses SOLPILOT agent + fetchBalance tool)
- "Analyze token ABC123..." (routes to Sonia agent)
- "What's the latest Solana news?" (routes to Venice agent)

## 🛠️ Available Tools

### Solana Tools

1. **fetchBalance**
   - Gets SOL and SPL token balances
   - Input: Wallet address
   - Output: Balance data with token list

2. **fetchTokenPrice**
   - Gets current token prices from Jupiter
   - Input: Token mint address
   - Output: Current price in USD

3. **executeSwap**
   - Gets swap quotes from Jupiter Aggregator
   - Input: Input/output mints, amount, slippage
   - Output: Swap quote with price impact

4. **fetchValidators**
   - Lists Solana validators for staking
   - Input: Optional limit
   - Output: Top validators by stake

5. **fetchMetrics**
   - Gets Solana network metrics and TVL
   - Input: Chain name (default: solana)
   - Output: TVL, epoch info, network stats

6. **transferFunds**
   - Validates transfer parameters
   - Input: From, to, amount
   - Output: Validation result

## 🤖 Agent Routing

The system automatically routes messages to the appropriate agent:

```typescript
// Token analysis → Sonia
"Analyze token ABC..."

// Research/News → Venice
"What's the latest Solana news?"

// Everything else → SOLPILOT
"What's my balance?"
"Swap 1 SOL for USDC"
```

## 🔧 API Endpoints

### POST `/api/mastra`
Direct Mastra agent interaction

```typescript
{
  "message": "What's my balance?",
  "agent": "solpilot",  // optional: "sonia" or "venice"
  "walletAddress": "7xK...",
  "chatHistory": []
}
```

### POST `/api/chat`
Legacy endpoint now powered by Mastra

```typescript
{
  "message": "Swap 1 SOL for USDC",
  "address": "7xK...",
  "chatHistory": []
}
```

## 🎨 MCP Resources

Access via MCP protocol:

- `solpilot://agents/list` - List all agents
- `solpilot://network/status` - Solana network status
- `solpilot://tools/list` - Available tools

## 📊 Tool Execution Flow

```
User Message
    ↓
Agent Selection (SOLPILOT/Sonia/Venice)
    ↓
Tool Detection
    ↓
Tool Execution (via Mastra)
    ↓
Result Processing
    ↓
UI Update (Real-time)
```

## 🔐 Security Notes

- Wallet signing happens client-side only
- Private keys never leave the browser
- Tool execution is validated before processing
- MCP server runs in isolated process

## 🚀 Production Deployment

### Vercel (Recommended)

```bash
# Push to GitHub
git add .
git commit -m "Add Mastra integration"
git push

# Deploy on Vercel
vercel --prod
```

### Environment Variables on Vercel
1. Go to Project Settings → Environment Variables
2. Add all variables from `.env.local`
3. Redeploy

## 📝 Challenge Submission Checklist

- [x] MCP Server implemented
- [x] Multiple Mastra agents (3 agents)
- [x] Interactive Next.js frontend
- [x] Live synchronization with UI updates
- [x] OpenRouter integration
- [x] Production-ready error handling
- [x] Tool execution with feedback
- [x] Context-aware responses
- [x] Real-world Solana integration

## 🎯 What Makes This Production-Ready

1. **Error Handling**: Comprehensive try-catch with fallbacks
2. **Type Safety**: Full TypeScript implementation
3. **Tool Validation**: Input validation with Zod schemas
4. **Agent Routing**: Smart message routing to appropriate agent
5. **Context Management**: Chat history and wallet state tracking
6. **UI Feedback**: Real-time updates and loading states
7. **API Rate Limiting**: Handled via OpenRouter
8. **Security**: Client-side wallet signing only

## 🐛 Troubleshooting

### Agent not responding?
- Check OpenRouter API key in `.env.local`
- Verify MODEL is set correctly
- Check console for error messages

### Tools not executing?
- Ensure Solana RPC endpoint is accessible
- Check wallet address format
- Verify tool parameters in console logs

### MCP Server issues?
- Run `npm run build` to check for TypeScript errors
- Check MCP server logs in terminal
- Verify Node.js version >= 18

## 📚 Learn More

- [Mastra Documentation](https://mastra.ai/docs)
- [OpenRouter Docs](https://openrouter.ai/docs)
- [MCP Protocol](https://modelcontextprotocol.io)
- [Agent Challenge 102](https://github.com/mastra-ai/agent-challenge-102)

## 🏆 Competition Notes

This implementation showcases:
- **Multi-agent collaboration** (SOLPILOT + Sonia + Venice)
- **Real blockchain integration** (Solana mainnet/devnet)
- **Production-grade tools** (Jupiter, DeFiLlama APIs)
- **Live data synchronization** (Balances, prices, validators)
- **Professional UI/UX** (Real-time updates, loading states)

Built with ❤️ for Agent Challenge 102
