import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { mastra } from './index';

/**
 * MCP Server for SOLPILOT
 * Implements Model Context Protocol for managing resources, tools, and prompts
 */
class SolpilotMCPServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: 'solpilot-mcp-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
          resources: {},
        },
      }
    );

    this.setupHandlers();
  }

  private setupHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'fetch-balance',
            description: 'Fetches SOL and SPL token balances for a Solana wallet',
            inputSchema: {
              type: 'object',
              properties: {
                address: {
                  type: 'string',
                  description: 'Solana wallet address',
                },
              },
              required: ['address'],
            },
          },
          {
            name: 'fetch-token-price',
            description: 'Gets current token price from Jupiter',
            inputSchema: {
              type: 'object',
              properties: {
                tokenMint: {
                  type: 'string',
                  description: 'Token mint address',
                },
              },
              required: ['tokenMint'],
            },
          },
          {
            name: 'execute-swap',
            description: 'Gets swap quote from Jupiter Aggregator',
            inputSchema: {
              type: 'object',
              properties: {
                inputMint: { type: 'string' },
                outputMint: { type: 'string' },
                amount: { type: 'number' },
                slippage: { type: 'number' },
              },
              required: ['inputMint', 'outputMint', 'amount'],
            },
          },
          {
            name: 'fetch-validators',
            description: 'Gets list of Solana validators',
            inputSchema: {
              type: 'object',
              properties: {
                limit: { type: 'number', description: 'Max validators to return' },
              },
            },
          },
          {
            name: 'fetch-metrics',
            description: 'Gets Solana network metrics and TVL',
            inputSchema: {
              type: 'object',
              properties: {
                chain: { type: 'string', description: 'Chain name' },
              },
            },
          },
          {
            name: 'transfer-funds',
            description: 'Validates a Solana transfer',
            inputSchema: {
              type: 'object',
              properties: {
                from: { type: 'string' },
                to: { type: 'string' },
                amount: { type: 'number' },
              },
              required: ['from', 'to', 'amount'],
            },
          },
        ],
      };
    });

    // Call a tool
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        // Get the appropriate agent based on tool type
        let agentName: 'solpilot' | 'sonia' | 'zerion' | 'venice' = 'solpilot';

        // Route to specialized agents if needed
        if (name.includes('token-analysis')) {
          agentName = 'sonia';
        } else if (name.includes('portfolio') || name.includes('transaction') || name.includes('pnl') || name.includes('defi')) {
          agentName = 'zerion';
        } else if (name.includes('research') || name.includes('news')) {
          agentName = 'venice';
        }

        const agent = mastra.getAgent(agentName);

        // Execute the tool through the agent
        const result = await agent.generate(
          `Use the ${name} tool with these parameters: ${JSON.stringify(args)}`,
          {
            toolChoice: 'required',
          }
        );

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (error: any) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error.message}`,
            },
          ],
          isError: true,
        };
      }
    });

    // List available resources
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => {
      return {
        resources: [
          {
            uri: 'solpilot://agents/list',
            name: 'Available Agents',
            description: 'List of all available AI agents',
            mimeType: 'application/json',
          },
          {
            uri: 'solpilot://network/status',
            name: 'Network Status',
            description: 'Current Solana network status',
            mimeType: 'application/json',
          },
          {
            uri: 'solpilot://tools/list',
            name: 'Available Tools',
            description: 'List of all available Solana tools',
            mimeType: 'application/json',
          },
        ],
      };
    });

    // Read a resource
    this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
      const { uri } = request.params;

      if (uri === 'solpilot://agents/list') {
        return {
          contents: [
            {
              uri,
              mimeType: 'application/json',
              text: JSON.stringify(
                {
                  agents: [
                    {
                      name: 'SOLPILOT',
                      role: 'Main Solana blockchain assistant',
                      capabilities: [
                        'Balance checking',
                        'Token swaps',
                        'Staking',
                        'Transfers',
                        'Validator info',
                      ],
                    },
                    {
                      name: 'Sonia',
                      role: 'Token analyst',
                      capabilities: ['Token analysis', 'Market data', 'Price tracking'],
                    },
                    {
                      name: 'Venice',
                      role: 'Research analyst',
                      capabilities: ['Web search', 'News gathering', 'Research'],
                    },
                  ],
                },
                null,
                2
              ),
            },
          ],
        };
      }

      if (uri === 'solpilot://network/status') {
        const solpilotAgent = mastra.getAgent('solpilot');
        const result = await solpilotAgent.generate('Get the current Solana network status');

        return {
          contents: [
            {
              uri,
              mimeType: 'application/json',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      if (uri === 'solpilot://tools/list') {
        const tools = await this.server.request(
          { method: 'tools/list' },
          ListToolsRequestSchema
        );
        return {
          contents: [
            {
              uri,
              mimeType: 'application/json',
              text: JSON.stringify(tools, null, 2),
            },
          ],
        };
      }

      throw new Error(`Unknown resource: ${uri}`);
    });
  }

  async start() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.log('🚀 SOLPILOT MCP Server started');
  }
}

// Start the server if run directly
if (require.main === module) {
  const server = new SolpilotMCPServer();
  server.start().catch(console.error);
}

export { SolpilotMCPServer };
