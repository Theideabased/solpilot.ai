export const intents = {
    swap_token: {
    description: "Executes a token swap using Jupiter routes.",
        examples: [
            "I want to trade SOL for USDT.",
            "Swap 50 SOL to BNB.",
            "Convert my SOL into ETH.",
            "Trade 10 USDT into SOL."
        ],
        keywords: [
            "swap", "exchange", "convert", "trade",
            "swap tokens", "exchange tokens", "convert tokens", "trade tokens",
            "swap SOL", "swap to USDT", "trade for", "convert my",
            "exchange my", "where can I swap", "how to swap"
        ]
    },
    stake_sol: {
        description: "Provides staking information for Solana (SOL).",
        examples: [
            "I want to stake my SOL tokens for rewards.",
            "How do I delegate SOL?",
            "Stake 100 SOL with a validator."
        ],
        keywords: [
            "stake", "staking", "earn rewards", "delegate", "validator",
            "stake SOL", "staking rewards", "staking pool"
        ]
    },
    place_bid: {
        description: "Allows users to place a bid in the latest Solana burn auction.",
        examples: [
            "I want to place a bid for the latest burn auction.",
            "Bid 100 SOL in the current burn auction.",
            "How do I participate in the Solana burn auction?",
            "Place a bid for me in the latest auction.",
            "I want to join the Solana auction and bid."
        ],
        keywords: [
            "bid", "place bid", "burn auction", "latest auction bid",
            "join auction", "participate auction", "Solana auction bid",
            "current auction bid", "bidding in auction", "auction entry"
        ]
    },
    send_token: {
        description: "Handles token transfers to another Solana address.",
        examples: [
            "Send 5 SOL to my friend.",
            "Transfer SOL to this wallet.",
            "Move 10 USDT to another account."
        ],
        keywords: [
            "send", "transfer", "move", "send SOL", "transfer USDT",
            "send funds", "move tokens", "send crypto", "send to address"
        ]
    },
    get_price: {
        description: "Fetches the estimated USDT price for a given token on Solana.",
        examples: [
            "What is the current price of SOL?",
            "How much is 1 SOL worth in USDT?"
        ],
        keywords: [
            "price", "current value", "worth", "token price", "how much is"
        ]
    },
    get_latest_auction: {
        description: "Fetches and displays the latest auction on Solana.",
        examples: [
            "I want to see the latest auction on Solana.",
            "Get me the most recent auction on Solana.",
            "Show me the newest Solana auction.",
            "What is the current auction happening on Solana?",
            "Fetch the latest Solana auction details."
        ],
        keywords: [
            "auction", "Solana auction", "latest auction", "current auction",
            "new auction", "Solana bidding", "auction event", "bidding round",
            "active auction", "auction update"
        ]
    },
    get_auction: {
        description: "Fetches and displays auction details for a specific auction round.",
        examples: [
            "I want to see the auction with number 2.",
            "Show me the auction info from round 5.",
            "Get auction details for round 10.",
            "Retrieve auction data from round 3.",
            "What happened in auction round 7?"
        ],
        keywords: [
            "auction round", "specific auction", "auction number", "auction details",
            "auction info", "bidding round", "round of auction", "auction at round"
        ]
    },
    tx_search: {
        description: "Searches for a transaction on Solana Explorer.",
        examples: [
            "Find this transaction hash on Solana.",
            "Check this transaction ID: 0x1234abcd."
        ],
        keywords: [
            "tx", "transaction", "hash", "explorer", "txid", "transaction ID"
        ]
    },
    unstake_sol: {
        description: "Handles the process of unstaking Solana (SOL) tokens from a validator.",
        examples: [
            "I want to unstake my SOL tokens.",
            "How do I undelegate my staked SOL?",
            "Unstake 50 SOL from my validator.",
            "Withdraw my SOL from staking.",
            "Stop staking my SOL."
        ],
        keywords: [
            "unstake", "unstaking", "undelegate", "withdraw stake",
            "unstake SOL", "remove stake", "stop staking", "withdraw staked SOL",
            "unstake my tokens", "how to unstake", "unstake from validator",
            "unstake rewards", "withdraw from staking", "exit staking"
        ]
    },
    fetch_my_portfolio: {
        description: "Retrieves the user's own wallet balances using their Solana address.",
        examples: [
            "Check my wallet balance.",
            "What is my current SOL balance?",
            "How much USDT do I have in my Solana wallet?",
            "Show me my token holdings.",
            "Fetch my Solana portfolio.",
            "What assets do I currently hold?",
            "List all tokens in my wallet."
        ],
        keywords: [
            "my balance", "my wallet balance", "my portfolio", "my funds",
            "check my balance", "how much SOL do I have", "show my holdings",
            "fetch my assets", "retrieve my portfolio", "my Solana tokens",
            "list my tokens", "my Solana wallet", "check my funds"
        ]
    },

    fetch_user_portfolio: {
        description: "Retrieves the full portfolio details of another user's Solana address, including token balances and asset distribution.",
        examples: [
            "Show me the portfolio of this user: sol1zgym77e6mzjqceqldk4purvjnuz5jwe5ckmymg",
            "Fetch the portfolio of SOL1xyz...",
            "What assets does this Solana wallet hold?",
            "Retrieve the holdings of this Solana address.",
            "Show me the token distribution for this address.",
            "Can you analyze the portfolio of this Solana address?",
            "Tell me what tokens this user holds.",
            "Get the wallet assets of SOL1abc..."
        ],
        keywords: [
            "portfolio", "holdings", "wallet assets", "token balances",
            "show portfolio", "fetch holdings", "Solana wallet details",
            "wallet portfolio", "asset overview", "retrieve portfolio",
            "this user", "this address", "full wallet details", "token distribution",
            "analyze holdings", "portfolio analysis", "fetch address portfolio",
            "another wallet", "Solana address assets", "wallet scan"
        ]
    },
    analyze_token: {
        description: "Provides an in-depth analysis of a given token, including price trends, market data, and liquidity information.",
        examples: [
            "Analyze SOL for me.",
            "Give me a detailed report on QUNT.",
            "What are the market trends for NONJA?",
            "Show me the liquidity and volume of NINJA."
        ],
        keywords: [
            "analyze", "analysis", "market trends", "token insights", "price analysis",
            "liquidity", "volume", "market cap", "supply", "token metrics",
            "SOL analysis", "BTC insights", "detailed report on", "what is happening with"
        ]
    },
    search_solana_news: {
        description: "Finds the latest Solana news on X (Twitter).",
        examples: [
            "What’s the latest news about Solana?",
            "Find Solana updates on Twitter."
        ],
        keywords: [
            "Solana news", "latest Solana updates", "Solana twitter",
            "recent Solana posts", "Solana social media", "news", "updates"
        ]
    },
    forbidden_topics: {
        description: "Detects and restricts discussions on prohibited topics.",
        examples: [
            "How do I write a Python script?",
            "What are the latest updates in Bitcoin?",
            "Can you help me with stock market investments?",
            "Tell me about AI and machine learning."
        ],
        keywords: [
            "code", "programming", "script", "AI", "machine learning",
            "stock market", "finance", "Bitcoin", "Ethereum", "Solana",
            "crypto outside Solana", "trading bots", "automated trading",
            "smart contract outside Solana", "blockchain other than Solana",
            "ML", "chatbot development", "OpenAI", "Llama", "GPT"
        ]
    },
    talk_between_agents: {
        description: "Triggers a multi-turn conversation between Solpilot and Sonia based on the user's request.",
        examples: [
            "Tell me a joke about Sonia.",
            "What does Solpilot think about Sonia?",
            "Let Solpilot and Sonia have a debate about Solana.",
            "I want Solpilot and Sonia to talk to each other."
        ],
        keywords: [
            "talk", "discuss", "debate", "chat", "conversation",
            "between Solpilot and Sonia", "Solpilot and Sonia talk", "make Solpilot talk to Sonia",
            "make Sonia reply","tell a joke about Sonia", "what does Solpilot think of",
            "what does Sonia think of"
        ]
    }
    ,
    get_metrics: {
        description: "Fetches the Total Value Locked (TVL) details of the Solana Ecosystem, including top protocols and aggregated TVL.",
        examples: [
            "Give me the details of the TVLs of Solana Ecosystem.",
            "Show me the total TVL of Solana.",
            "List the top protocols on Solana by TVL.",
            "Fetch Solana's DeFi TVL rankings.",
            "What are the biggest protocols by TVL on Solana?"
        ],
        keywords: [
            "TVL", "Solana TVL", "total value locked", "protocol TVL",
            "top TVL protocols", "Solana ecosystem TVL", "defi TVL",
            "biggest protocols by TVL", "tvl details", "Solana defi rankings"
        ]
    }
    , 
    get_governance_proposals: {
        description: "Fetches and displays recent governance proposals on the Solana blockchain.",
        examples: [
            "I want to see the proposals of Solana.",
            "Show me the Solana governance proposals.",
            "List current proposals.",
            "What are the latest governance proposals?",
            "Display active proposals on Solana.",
            "Get me the most recent Solana proposals.",
            "What’s happening in Solana governance?"
        ],
        keywords: [
            "proposal", "proposals", "governance", "Solana governance",
            "latest proposals", "recent proposals", "active proposals",
            "governance update", "governance list", "Solana proposals",
            "governance activity", "see proposals", "get proposals",
            "show proposals", "fetch proposals", "display proposals",
            "proposals of Solana", "current proposals", "governance overview"
        ]
    }
    ,       
    default: {
        description: "Handles general questions about Solana, greetings, and polite interactions.",
        examples: [
            "Who is Sonia ?",
            "Hey there!",
            "Hello!",
            "How’s it going?",
            "Tell me about Solana.",
            "Can you explain how Solana works?",
            "What makes Solana special?",
            "I’m new to Solana—where should I start?",
            "How does staking work on Solana?",
            "Is Solana good for trading?",
            "Thank you!",
            "Thanks for your help!",
            "I appreciate it!"
        ],
        keywords: [
            "Solana", "blockchain", "crypto basics", "how does Solana work",
            "explain Solana", "what is Solana", "learn about Solana",
            "getting started with Solana", "understanding Solana",
            "tell me about Solana", "why use Solana", "benefits of Solana",
            "hello", "hi", "hey", "good morning", "good evening", "what’s up",
            "thank you", "thanks", "appreciate it", "grateful", "cheers"
        ]
    }
    
};
