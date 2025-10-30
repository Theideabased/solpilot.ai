# ✨ SOLPILOT - Agent Challenge 102 Submission

## 🎯 Overview

SOLPILOT is a production-ready AI-powered DeFi assistant for Solana blockchain, built with **Mastra AI Agents**, **MCP Server**, and **Zerion API** for the Agent Challenge 102 hackathon.

---

## 🏆 Challenge Requirements Met

### ✅ MCP Server Implementation
- **Location:** `/mastra/mcp-server.ts`
- **Features:**
  - Resource management (portfolio data, transactions, token info)
  - Tool management (Solana + Zerion tools)
  - Prompt templates for AI agents
  - Real-time data synchronization

### ✅ Mastra AI Agents
**Three specialized agents working together:**

1. **SOLPILOT Agent** (`/mastra/agents/solpilot.ts`)
   - Main Solana blockchain assistant
   - Handles swaps, staking, governance, transfers
   - Routes to specialized agents as needed
   
2. **Sonia Agent** (`/mastra/agents/sonia.ts`)
   - Token analysis specialist
   - Evaluates liquidity, holders, investment potential
   - Provides detailed token insights

3. **Zerion Agent** (`/mastra/agents/zerion.ts`) ⭐ **NEW**
   - Portfolio intelligence across Solana + 25 EVM chains
   - Real-time PnL tracking
   - Transaction history with decoded details
   - DeFi positions monitoring
   - NFT holdings analysis

### ✅ Interactive Frontend
- **Built with:** Next.js 15, React 18, TypeScript
- **Features:**
  - Real-time chat interface
  - Phantom wallet integration
  - Live portfolio updates
  - Transaction history display
  - Token swap interface
  - Staking interface
  - Multi-agent responses

### ✅ Live Synchronization
- WebSocket-ready architecture
- Real-time portfolio updates via Zerion API
- Instant UI updates when agents modify resources
- Optimistic UI updates for better UX

---

## 🎨 Zerion API Integration

### **Why Zerion?**
Zerion API powers 200+ teams including Kraken, Infinex, OpenSea, and Backpack. It provides:
- **26+ chains** including Solana and all major EVMs
- **Real-time data** with millisecond freshness
- **1000+ RPS** with 99.9% uptime
- **Atomic transaction parsing** including EIP-7702 batched transactions
- **8000+ DeFi protocols** tracked

### **Features Implemented:**

#### 📊 Portfolio Analysis
```typescript
// Get complete portfolio across all chains
const portfolio = await zerionAgent.getPortfolio(address);
// Returns: Total value, positions, tokens, NFTs, DeFi
```

#### 💰 PnL Tracking
```typescript
// Calculate profit and loss
const pnl = await zerionAgent.getPnL(address);
// Returns: Total invested, current value, gains/losses per position
```

#### 📈 Transaction History
```typescript
// Get decoded transaction history
const txs = await zerionAgent.getTransactions(address);
// Returns: Swaps, transfers, approvals, DeFi interactions
```

#### 🏦 DeFi Positions
```typescript
// Monitor staking and liquidity pools
const defi = await zerionAgent.getDeFiPositions(address);
// Returns: Positions across 8000+ protocols
```

#### 🖼️ NFT Holdings
```typescript
// Track NFT collections
const nfts = await zerionAgent.getNFTs(address);
// Returns: NFTs with floor prices and metadata
```

#### 💹 Token Data
```typescript
// Get real-time token prices
const token = await zerionAgent.getTokenData(address, chain);
// Returns: Price, market cap, 24h change
```

---

## 🛠️ Technical Stack

### **Core Technologies**
- **Frontend:** Next.js 15, React 18, TypeScript, Tailwind CSS
- **AI Framework:** Mastra with OpenRouter
- **Blockchain:** Solana Web3.js, Jupiter Aggregator
- **Wallet Data:** Zerion API
- **Database:** Supabase (PostgreSQL)
- **Authentication:** JWT + Wallet signatures

### **AI Models** (via OpenRouter)
- Primary: `anthropic/claude-3.5-sonnet`
- Alternatives: GPT-4 Turbo, Llama 3.1 70B

### **APIs Integrated**
- ✅ Zerion API (Portfolio & Transactions)
- ✅ Jupiter API (Token swaps & prices)
- ✅ Solana RPC (Blockchain data)
- ✅ DeFiLlama (TVL metrics)

---

## 📁 Project Structure

```
solpilot/
├── mastra/                    # Mastra AI Configuration
│   ├── agents/               # AI Agents
│   │   ├── solpilot.ts      # Main Solana assistant
│   │   ├── sonia.ts         # Token analyst
│   │   └── zerion.ts        # Portfolio analyst ⭐
│   ├── tools/                # Tool Definitions
│   │   ├── solana-tools.ts  # Solana blockchain tools
│   │   └── zerion.ts        # Zerion API tools ⭐
│   ├── providers/            # LLM Providers
│   │   └── openrouter.ts    # OpenRouter config
│   ├── mcp-server.ts         # MCP Server ⭐
│   ├── index.ts              # Mastra initialization
│   └── README.md             # Mastra documentation
├── app/                       # Next.js App
│   ├── api/                  # API Routes
│   │   ├── mastra/          # Mastra endpoints
│   │   ├── chat/            # Chat endpoints
│   │   └── auth/            # Authentication
│   ├── components/           # React Components
│   └── page.tsx              # Main page
├── wallet/                    # Wallet Integration
│   └── solanaWalletConnection.ts
└── ai/                        # Legacy AI (being migrated)
```

---

## 🚀 Getting Started

### **1. Install Dependencies**
```bash
npm install
```

### **2. Environment Variables**
Create `.env.local` with these **required** keys:

```bash
# Zerion API (Get free key)
ZERION_API_KEY=your_key_here
# Get at: https://zerion-io.typeform.com/to/QI3GRa7t?utm_source=cypherpunk

# OpenRouter (For AI)
OPENROUTER_API_KEY=your_key_here
MODEL=anthropic/claude-3.5-sonnet

# Solana RPC
NEXT_PUBLIC_SOLANA_RPC=https://api.devnet.solana.com

# Supabase (Database)
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
SUPABASE_JWT_SECRET=your_secret
```

See `MASTRA_ENV_SETUP.md` for detailed instructions.

### **3. Run the App**
```bash
# Start development server
npm run dev

# In another terminal, start MCP server
npm run mcp:dev
```

Visit: http://localhost:3000 (or the port shown in terminal)

### **4. Test Features**
```
1. Connect Phantom wallet
2. Try: "Show my portfolio"
3. Try: "What's my PnL?"
4. Try: "Show recent transactions"
5. Try: "Analyze token XYZ"
```

---

## 💡 Innovation Highlights

### **1. Multi-Agent Architecture**
- Three specialized agents that collaborate
- Intelligent routing based on user intent
- Each agent has domain expertise

### **2. Cross-Chain Intelligence**
- Solana native with EVM support via Zerion
- Unified view across 26+ chains
- Seamless multi-chain portfolio tracking

### **3. Real-Time Analytics**
- Live PnL calculations
- Instant transaction decoding
- DeFi position monitoring
- Token price feeds

### **4. Production-Ready**
- Error handling and fallbacks
- Rate limit management
- Optimistic UI updates
- Responsive design

### **5. Zerion Integration**
- Enterprise-grade wallet data
- 99.9% uptime SLA
- Battle-tested by Uniswap, Farcaster, Privy
- 8000+ DeFi protocols tracked

---

## 📊 Use Cases

### **Consumer Applications**

#### 1. Portfolio Tracker
```
User: "Show my portfolio"
Zerion Agent: 
📊 Portfolio Overview
Total Value: $45,678
Top Holdings:
• SOL: $12,345 (27%)
• USDC: $8,900 (19.5%)
• JUP: $3,456 (7.6%)
```

#### 2. PnL Analysis
```
User: "How much profit am I making?"
Zerion Agent:
💰 P&L Analysis
Total P&L: +$5,678 (+14.2%)
Best Performer: BONK +$2,100 (+156%)
Needs Attention: SAMO -$345 (-12%)
```

#### 3. Transaction History
```
User: "Show my last 5 transactions"
Zerion Agent:
📈 Recent Activity
1. ✅ Swapped 100 USDC → 0.5 SOL
2. ✅ Staked 50 SOL to Marinade
3. ✅ Received 1,000 BONK
4. ✅ Approved JUP for trading
5. ✅ Claimed 5 SOL rewards
```

### **Social Features**
- Share portfolio performance
- Compare holdings with friends
- Track whale wallets
- Copy trading opportunities

### **Discovery Platform**
- Find trending tokens
- Discover new DeFi protocols
- Track NFT collections
- Monitor liquidity pools

---

## 🎯 Judging Criteria

### ✅ Innovation
- **Multi-agent AI system** with specialized domains
- **Zerion integration** for comprehensive onchain data
- **Cross-chain support** (Solana + 25 EVM chains)
- **MCP Server** for resource management

### ✅ User Experience (UX)
- Clean, modern interface with Shadcn UI
- Real-time updates and optimistic UI
- Mobile-responsive design
- Clear visual feedback with emojis and formatting
- Wallet integration (Phantom + Solflare)

### ✅ Impact
- **Solves real need:** Portfolio tracking across chains
- **User adoption potential:** Multi-chain, AI-powered, social features
- **Reduces complexity:** One interface for all DeFi activities

### ✅ Zerion API Usage
- ✅ Portfolio & balances
- ✅ Transaction history
- ✅ PnL tracking
- ✅ DeFi positions
- ✅ NFT holdings
- ✅ Token market data
- **6/6 core features implemented**

### ✅ Technical Implementation
- Type-safe with TypeScript
- Error handling throughout
- Fallback strategies
- Modular architecture
- Production-ready code

### ✅ Potential for User Adoption
- Intuitive chat interface (like ChatGPT)
- Multi-chain support appeals to broad audience
- Social features enable network effects
- Free to use with optional premium features

---

## 📹 Demo Video Outline

**Duration:** 5 minutes

1. **Introduction (30s)**
   - What is SOLPILOT?
   - Why Zerion + Mastra?

2. **Feature Walkthrough (3min)**
   - Connect Phantom wallet
   - Show portfolio with Zerion
   - Calculate PnL
   - View transaction history
   - Analyze a token with Sonia
   - DeFi positions overview
   - NFT holdings

3. **Behind the Scenes (1min)**
   - Multi-agent architecture
   - MCP Server demo
   - Cross-chain capabilities

4. **Impact & Vision (30s)**
   - Target users
   - Future roadmap
   - Community building

---

## 🔗 Resources

- **Live Demo:** [Your deployed URL]
- **GitHub:** https://github.com/Theideabased/solpilot
- **Demo Video:** [YouTube/Loom link]
- **Documentation:** `MASTRA_ENV_SETUP.md`, `MASTRA_README.md`

### **API Documentation**
- Zerion: https://developers.zerion.io/reference/intro-getting-started
- Mastra: https://mastra.ai/docs
- OpenRouter: https://openrouter.ai/docs

---

## 🎖️ Competition Alignment

### **Agent Challenge 102 Requirements**

| Requirement | Status | Implementation |
|------------|--------|----------------|
| MCP Server | ✅ Complete | `/mastra/mcp-server.ts` |
| Mastra AI Agent | ✅ Complete | 3 agents with tools |
| Interactive Frontend | ✅ Complete | Next.js with real-time UI |
| Live Synchronization | ✅ Complete | Zerion + WebSocket ready |
| Production-Ready | ✅ Complete | Error handling, fallbacks |

### **Zerion Track Requirements**

| Requirement | Status | Implementation |
|------------|--------|----------------|
| Deployed Application | ✅ Ready | Next.js deployment |
| Clear Concept | ✅ Complete | Multi-chain portfolio tracker |
| Demo Video | 🎬 Pending | 5-minute walkthrough |
| GitHub Repository | ✅ Complete | Full source code |
| In English | ✅ Complete | All documentation |

---

## 🚀 Next Steps (Post-Hackathon)

1. **Enhanced Social Features**
   - Wallet following
   - Portfolio sharing
   - Copy trading

2. **Advanced Analytics**
   - Historical PnL charts
   - Risk scoring
   - Portfolio optimization suggestions

3. **Mobile App**
   - Native iOS/Android
   - Push notifications for transactions
   - QR code wallet connection

4. **Community Features**
   - Leaderboards
   - Achievement badges
   - Referral system

5. **Premium Features**
   - Advanced analytics
   - Portfolio alerts
   - Tax reporting

---

## 👥 Team

**Theideabased** - Full-stack developer specializing in Web3 and AI integration

---

## 📄 License

MIT License - See LICENSE file

---

## 🙏 Acknowledgments

- **Zerion** for providing enterprise-grade wallet API
- **Mastra** for the incredible AI agent framework
- **OpenRouter** for LLM access
- **Solana** for the fast, low-cost blockchain
- **Jupiter** for DEX aggregation

---

## 📞 Support

For questions or issues:
- GitHub Issues: [Repository issues page]
- Email: [Your email]
- Twitter: [Your handle]

---

**Built for Agent Challenge 102 🏆**

*Making DeFi accessible to everyone through AI-powered assistance*
