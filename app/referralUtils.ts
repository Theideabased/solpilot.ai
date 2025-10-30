interface RefDetails {
  ref_code: string;
  count: number;
  refferer: string;
}
const deriveRefCode = (solanaAddress: string) => `sol-${solanaAddress.slice(0, 4)}-${solanaAddress.slice(-4)}`;

export const getRefCodeDetails = async (solanaAddress: string | null) => {
  try {
    if (!solanaAddress) {
      return null;
    }

    const referralDetails: RefDetails = {
      ref_code: deriveRefCode(solanaAddress),
      count: 0,
      refferer: solanaAddress,
    };

    return referralDetails;
  } catch (error) {
    console.error("Error preparing Solana referral details:", error);
    return null;
  }
};
