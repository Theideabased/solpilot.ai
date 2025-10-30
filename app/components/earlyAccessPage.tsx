"use client";

import React, { useCallback, useEffect, useState } from "react";
import { connectToSolanaWallet, type SolanaWalletType } from "@/wallet/solanaWalletConnection";
import { ToastContainer, toast } from "react-toastify";

import { Loader2, Wallet as WalletIcon } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

interface EarlyAccessPageProps {
  solanaAddress: string | null;
  setSolanaAddress: (address: string | null) => void;
  isWhitelisted: boolean;
  setIsWhitelisted: (isWL: boolean) => void;
}

const EarlyAccessPage = ({
  solanaAddress,
  setSolanaAddress,
  isWhitelisted,
  setIsWhitelisted,
}: EarlyAccessPageProps) => {
  const [referralCode, setReferralCode] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const checkIsWhitelisted = useCallback(async () => {
    try {
      setIsLoading(true);
      // TODO: Implement Solana smart contract check or backend API call
      // For now, we'll check via backend API
      const res = await fetch("/api/users", {
        method: "GET",
        headers: { 
          "Content-Type": "application/json", 
          solanaAddress: solanaAddress || "" 
        },
      });
      
      const userData = await res.json();
      setIsLoading(false);
      setIsWhitelisted(userData?.data?.is_whitelisted || false);
    } catch (error) {
      setIsLoading(false);
      setIsWhitelisted(false);
      console.error("Error checking whitelist status:", error);
    }
  }, [solanaAddress]);

  useEffect(() => {
    if (solanaAddress) {
      checkIsWhitelisted();
    }
  }, [solanaAddress, checkIsWhitelisted]);

  const handleConnectWallet = async (walletType: SolanaWalletType) => {
    try {
      setIsLoading(true);
      const { address, token } = await connectToSolanaWallet(walletType);

      if (address) {
        setSolanaAddress(address);
        toast.success("Wallet Connected!", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "colored",
        });
      }
      if (token) {
        localStorage.setItem("token", token);
      } else {
        localStorage.removeItem("token");
      }
    } catch (error) {
      console.error("Error connecting wallet:", error);
      toast.error("Login failed.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const joinEAP = async (ref_code: string) => {
    try {
      setIsLoading(true);
      if (solanaAddress) {
        // TODO: Implement Solana payment transaction
        // This would involve creating a Solana transaction to send SOL
        // to your program/wallet address
        
        toast.info("Solana payment integration coming soon!", {
          position: "top-right",
          autoClose: 3000,
        });
        
        // For now, just update the backend
        const res = await fetch("/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            wallet_address: solanaAddress, 
            referral_code: ref_code 
          }),
        });

        if (res.ok) {
          localStorage.removeItem("token");
          setSolanaAddress(null);
          toast.success("Registration successful! Please connect your wallet again.", {
            position: "top-right",
            autoClose: 3000,
            theme: "colored",
          });
        }
      }
    } catch (error) {
      toast.error(`❌ ${error instanceof Error ? error.message : "Something went wrong!"}`, {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
      });
      console.error("Error joining EAP:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <ToastContainer />
      <Card className="w-full max-w-md bg-zinc-900 border-zinc-800 text-zinc-100 ">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-600 bg-clip-text text-transparent">
            Welcome to SOLPILOT
          </CardTitle>
          <CardDescription className="text-zinc-400">
            {solanaAddress
              ? "Join our Early Access Program"
              : "Connect your wallet to get started"}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
            </div>
          ) : (
            <>
              {solanaAddress ? (
                <div className="space-y-4">
                  <div className="p-3 rounded-lg bg-zinc-800/50 border border-zinc-700 break-all">
                    <p className="text-xs font-medium text-zinc-500 mb-1">Connected Address</p>
                    <p className="text-sm font-medium text-zinc-300">{solanaAddress}</p>
                  </div>

                  {!isWhitelisted && (
                <div className="space-y-6">
                
                  <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4 space-y-2">
                    <p className="text-sm font-semibold text-zinc-300">EAP Benefits</p>
                    <ul className="text-sm space-y-1 text-zinc-400 pl-5 list-disc">
                      <li>Support Solpilot development growth</li>
                      <li>Early access to features</li>
                      <li>Unlimited AI interactions</li>
                      <li>Earn rewards for future</li>
                    </ul>
                  </div>

                 
                  <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4 space-y-2">
                    <p className="text-sm font-semibold text-zinc-300">Payment</p>
                    <p className="text-sm text-zinc-400">
                      This is a single-time payment. Funds cover LLM integration, services, infrastructure, and operational costs for platform stability.
                    </p>
                    <p className="text-lg font-bold bg-gradient-to-r from-blue-400 to-cyan-600 bg-clip-text text-transparent mt-2">0.1 SOL</p>
                  </div>

                 
                  <Input
                    type="text"
                    placeholder="Enter referral code (Optional)"
                    value={referralCode}
                    onChange={(e) => setReferralCode(e.target.value)}
                    className="bg-zinc-800 border-zinc-700 text-zinc-100"
                  />
                  <Button
                    className="w-full bg-gradient-to-r from-blue-400 to-cyan-600 hover:from-blue-500 hover:to-cyan-700 text-white"
                    onClick={() => joinEAP(referralCode)}
                  >
                    Join Early Access
                  </Button>
                </div>
              )}

                </div>
              ) : (
                <div className="grid gap-3">
                  <Button
                    variant="outline"
                    className="w-full border-zinc-800 hover:bg-zinc-800 hover:text-zinc-100 bg-transparent "
                    onClick={() => handleConnectWallet("phantom")}
                  >
                    <WalletIcon className="mr-2 h-4 w-4" />
                    Connect with Phantom
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full border-zinc-800 hover:bg-zinc-800 hover:text-zinc-100 bg-transparent"
                    onClick={() => handleConnectWallet("solflare")}
                  >
                    <WalletIcon className="mr-2 h-4 w-4" />
                    Connect with Solflare
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>

        {solanaAddress && isWhitelisted && (
          <CardFooter>
            <p className="text-sm text-emerald-500 font-medium w-full text-center">
              ✨ You have Early Access! ✨
            </p>
          </CardFooter>
        )}
      </Card>
    </div>
  );
};

export default EarlyAccessPage;
