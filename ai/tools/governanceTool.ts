export type ProposalSummary = {
    proposalId: number
    title: string
    summary: string
    proposer: string
    type: string
    status: string
    expedited: boolean
    submitTime: string
    votingStartTime: string
    votingEndTime: string
    finalTally: {
      yes: string
      no: string
      abstain: string
      noWithVeto: string
    }
  }

const PLACEHOLDER_PROPOSALS: ProposalSummary[] = [
  {
    proposalId: 0,
    title: 'Solana governance proposals coming soon',
    summary: 'We are wiring up Solana governance sources (Realms, Squads, SPL Governance) and will surface live proposals here shortly.',
    proposer: 'Solana Ecosystem',
    type: 'Informational',
    status: 'Pending Integration',
    expedited: false,
    submitTime: new Date().toISOString(),
    votingStartTime: new Date().toISOString(),
    votingEndTime: new Date().toISOString(),
    finalTally: {
      yes: '0',
      no: '0',
      abstain: '0',
      noWithVeto: '0',
    },
  },
]

export const fetchLast10Proposals = async () => {
  try {
    // TODO: Integrate with a Solana governance indexer (e.g. Realms API) once the data pipeline is finalised.
    return PLACEHOLDER_PROPOSALS
  } catch (error) {
    console.error('Error preparing Solana governance proposals:', error)
    return PLACEHOLDER_PROPOSALS
  }
}


