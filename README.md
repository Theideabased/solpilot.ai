# SolPilot AI - Intelligent Solana Portfolio Assistant

**Powered by Zerion API** 🚀

SolPilot AI is an intelligent conversational assistant that transforms how users interact with their Solana portfolios. By leveraging the comprehensive Zerion API data stack, SolPilot provides real-time portfolio insights, transaction analysis, and intelligent trading recommendations through natural language conversations.

**🔗 Live Demo**: [https://solpilot-ai.vercel.app/](https://solpilot-ai.vercel.app/)

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![Solana](https://img.shields.io/badge/Solana-9945FF?style=for-the-badge&logo=solana&logoColor=white)
![Zerion API](https://img.shields.io/badge/Powered_by-Zerion_API-4F46E5?style=for-the-badge)

## 🎯 Problem & Solution

**Problem**: Managing Solana portfolios is complex - users struggle to understand their holdings, track performance, and make informed trading decisions across multiple tokens and DeFi protocols.

**Solution**: SolPilot AI acts as your personal crypto portfolio assistant, using **Zerion API's comprehensive onchain data** to provide:
- Real-time portfolio analysis and PnL tracking
- Intelligent transaction insights and history
- Natural language token discovery and market data
- Automated trading suggestions based on wallet activity

## 🚀 Key Features Powered by Zerion API

### 📊 Real-time Portfolio Intelligence
- **Live balance tracking** across all Solana tokens using Zerion's portfolio data
- **PnL analysis** with profit/loss calculations and performance metrics
- **Portfolio visualization** with interactive charts and breakdowns

### 🔍 Transaction Analysis & History
- **Decoded transaction history** using Zerion's comprehensive transaction API
- **AI-powered transaction insights** that explain complex DeFi interactions
- **Smart categorization** of swaps, transfers, and protocol interactions

### 📈 Market Data & Discovery
- **Real-time price charts** and token metadata via Zerion API
- **Token discovery** with AI recommendations based on portfolio patterns
- **Market trend analysis** integrated into conversational responses

### 🤖 Conversational AI Interface
- Natural language queries like "Show me my portfolio performance" or "What tokens should I buy?"
- Intelligent responses combining Zerion data with AI analysis
- Contextual recommendations based on user's actual holdings and activity

## 🛠 How SolPilot Leverages Zerion API

### Portfolio & Balance Integration
```typescript
// Real-time portfolio data from Zerion API
const portfolioData = await zerionAPI.getPortfolio(walletAddress);
const balances = await zerionAPI.getBalances(walletAddress);
```

### Transaction Analysis
```typescript
// Comprehensive transaction history and analysis
const transactions = await zerionAPI.getTransactions(walletAddress);
const decodedTx = await zerionAPI.decodeTransaction(txHash);
```

### Market Data & Charts
```typescript
// Token information and price data
const tokenData = await zerionAPI.getTokenInfo(tokenAddress);
const priceChart = await zerionAPI.getTokenChart(tokenAddress);
```

## 🎨 User Experience

SolPilot AI provides an intuitive chat interface where users can:

1. **Connect their Solana wallet** (Phantom, Solflare, etc.)
2. **Ask natural language questions** about their portfolio
3. **Receive intelligent insights** powered by real Zerion data
4. **Get trading recommendations** based on their actual holdings
5. **Track performance** with beautiful visualizations

### Example Conversations:
- *"How is my portfolio performing today?"* → Real-time PnL analysis
- *"What's the history of my SOL transactions?"* → Decoded transaction timeline
- *"Should I buy more BONK?"* → AI analysis with market data
- *"Show me my biggest winners"* → Portfolio performance breakdown

## 🏗 Technical Architecture

- **Frontend**: Next.js 15 with TypeScript and Tailwind CSS
- **AI Engine**: OpenRouter API with GPT-4 for intelligent responses
- **Data Source**: **Zerion API** for all onchain data (portfolios, transactions, market data)
- **Wallet Integration**: Solana wallet adapters for seamless connection
- **Database**: Supabase for user sessions and chat history

## 🎯 Target Users

- **Crypto beginners** who need guidance understanding their Solana holdings
- **Active traders** wanting quick portfolio insights and market analysis
- **DeFi users** seeking to understand complex transaction histories
- **Portfolio managers** needing comprehensive tracking across multiple protocols

## 🏆 Innovation & Impact

**Innovation**: First conversational AI that combines Zerion's comprehensive Solana data with intelligent analysis, making portfolio management accessible through natural language.

**Impact**: Democratizes access to sophisticated portfolio analytics, helping users make informed decisions regardless of their technical expertise.

**User Adoption Potential**: Addresses the universal need for better portfolio understanding in the growing Solana ecosystem.

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Zerion API key ([Get yours here](https://zerion-io.typeform.com/to/QI3GRa7t?utm_source=cypherpunk))
- Solana wallet (Phantom, Solflare, etc.)

### Installation

```bash
git clone https://github.com/Theideabased/solpilot.ai
cd solpilot.ai
npm install
```

### Environment Setup

```bash
# Zerion API Configuration
ZERION_API_KEY=your_zerion_api_key

# AI Configuration  
OPENROUTER_API_KEY=your_openrouter_key
MODEL=openai/gpt-4o-mini

# Solana Configuration
NEXT_PUBLIC_SOLANA_RPC=https://api.mainnet-beta.solana.com

# Database (Supabase)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
```

### Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` to start using SolPilot AI!

## 🏆 Hackathon Submission

**Track**: Zerion API Consumer Application  
**Team**: SolPilot AI  
**Country**: Nigeria 🇳🇬  

### Zerion API Utilization
- ✅ Real-time Portfolio & PnL data
- ✅ Transaction history and decoding
- ✅ Market data and token information
- ✅ Comprehensive Solana ecosystem coverage

### Demo Video
[Coming Soon - 5-minute showcase of SolPilot AI features]

---

**Powered by Zerion API** - Transforming portfolio management through intelligent conversation and comprehensive onchain data.

Built with ❤️ for the Solana ecosystem during CypherPunk Hackathon 2024.
