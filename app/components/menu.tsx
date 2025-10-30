"use client";
import { useEffect, useState } from "react";
import { getLastChatNames, deleteChat } from "../services/chatServices";
import { getRefCodeDetails } from "../referralUtils";
import { useChat } from "../providers/chatProvider";

import { cn } from "@/lib/utils";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

import Header from "./header";
import { useMenu } from "../providers/menuProvider";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  FileText,
  MessageSquare,
  Menu as MenuIcon,
  ExternalLink,
  Trash2,
  MoreVertical,
} from "lucide-react";
import Link from "next/link";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

interface ChatItem {
  id: string;
  title: string;
  updated_at: string;
}

interface MenuProps {
  loadChatHistory: (chatId: string) => void;
  createNewChatButton: () => void;
  solanaAddress: string | null;
  setSolanaAddress: (address: string | null) => void;
  isWhitelisted: boolean;
  newChatCreated: boolean;
}

const Menu = ({
  solanaAddress,
  setSolanaAddress,
  loadChatHistory,
  createNewChatButton,
  isWhitelisted,
  newChatCreated,
}: MenuProps) => {
  const { allChats, setAllChats } = useChat();
  const { isCollapsed, setIsCollapsed } = useMenu();
  const [refDetails, setRefDetails] = useState<{ ref_code: string; count: number } | null>(null);
  const [copySuccess, setCopySuccess] = useState<string>("");
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [deletingChatId, setDeletingChatId] = useState<string | null>(null);

  function createTweetAndRedirect(refCode: string) {
    const tweetText = `I'm using @solpilotdotai on Early Access right now ! Use my referal code to get your early access too.\n\nMy ref code : ${refCode} .\n\nTry it now ! https://www.solpilotdotai.com`;
    const twitterBaseUrl = "https://twitter.com/intent/tweet";
    const encodedTweet = encodeURIComponent(tweetText);
    const tweetUrl = `${twitterBaseUrl}?text=${encodedTweet}`;

    window.open(tweetUrl, "_blank");
  }

  useEffect(() => {
    if (!solanaAddress) {
      return;
    }
    const fetchLastChatNames = async () => {
      const response = await getLastChatNames(solanaAddress || "");
      if (response) {
        const sortedChats = response.sort(
          (a: ChatItem, b: ChatItem) =>
            new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
        );
        setAllChats(sortedChats);
      }
    };
    fetchLastChatNames();
  }, [isWhitelisted, newChatCreated]);

  useEffect(() => {
    const getRef = async () => {
      if (isWhitelisted && solanaAddress) {
        const response = await getRefCodeDetails(solanaAddress);
        if (response) {
          setRefDetails(response);
        }
      }
    };
    getRef();
  }, [isWhitelisted, solanaAddress]);

  const copyToClipboard = () => {
    if (refDetails?.ref_code) {
      navigator.clipboard.writeText(refDetails.ref_code);
      setCopySuccess("Copied!");
      setTimeout(() => setCopySuccess(""), 2000);
    }
  };

  const handleChatSelect = (chatId: string) => {
    setSelectedChatId(chatId);
    loadChatHistory(chatId);
  };

  const handleDeleteChat = async (chatId: string, event: React.MouseEvent) => {
    // Prevent the chat from being selected when clicking delete
    event.stopPropagation();

    if (!confirm("Are you sure you want to delete this chat? This action cannot be undone.")) {
      return;
    }

    setDeletingChatId(chatId);

    try {
      await deleteChat(chatId);
      
      // Remove chat from the list
      setAllChats(allChats.filter(chat => chat.id !== chatId));
      
      // If the deleted chat was selected, clear selection and create new chat
      if (selectedChatId === chatId) {
        setSelectedChatId(null);
        createNewChatButton();
      }

      console.log("Chat deleted successfully");
    } catch (error: any) {
      console.error("Failed to delete chat:", error);
      alert("Failed to delete chat. Please try again.");
    } finally {
      setDeletingChatId(null);
    }
  };

  const MenuContent = () => (
    <div className="flex flex-col h-full ">
      <div className="space-y-6 p-4">
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="Solpilot" className="h-8 w-8" />
          {!isCollapsed && (
            <div>
              <h1 className="text-xl font-bold">SOLPILOT</h1>
              <span className="text-xs text-gray-400">v0.0.1</span>
            </div>
          )}
        </div>

        <nav className="space-y-2">
          <Button variant="ghost" className="w-full justify-start" onClick={createNewChatButton}>
            <Plus className="h-4 w-4 mr-2" />
            {!isCollapsed && "New Chat"}
          </Button>

          {/* <Link href="https://jecta.gitbook.io/jecta" passHref target="_blank">
            <Button variant="ghost" className="w-full justify-start">
              <FileText className="h-4 w-4 mr-2" />
              {!isCollapsed && "Docs"}
            </Button>
          </Link> */}

          <Link href="https://forms.gle/6dYD6KhLxeENfUmt5" passHref target="_blank">
                      <Button
              variant="outline"
              className="w-full justify-start bg-blue-400/10 hover:bg-blue-400/20 border-blue-400/30 text-blue-400 hover:text-white"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              {!isCollapsed && "EAP Feedback Form"}
            </Button>
          </Link>
        </nav>

        {isWhitelisted && refDetails && !isCollapsed && (
          <div className="bg-zinc-800/50 backdrop-blur-sm rounded-lg overflow-hidden">
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-zinc-200">Referral Program</h3>
                <div className="flex items-center gap-2">
                  <Button
                    className="text-xs px-3 py-1 hover:bg-green-400 rounded-full bg-zinc-700 text-zinc-300"
                    onClick={() => createTweetAndRedirect(refDetails.ref_code)}
                  >
                    Share
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2 p-2 rounded-md bg-zinc-900/50 border border-zinc-800">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-zinc-400">Code:</span>
                    <span className="text-sm font-medium text-zinc-200">
                      {refDetails.ref_code.slice(0, 6)}...{refDetails.ref_code.slice(-4)}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "h-7 px-2 text-xs transition-colors",
                      copySuccess ? "text-green-400" : "text-zinc-400 hover:text-zinc-200"
                    )}
                    onClick={copyToClipboard}
                  >
                    {copySuccess ? "Copied!" : "Copy"}
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2 rounded-md bg-zinc-900/50 border border-zinc-800">
                    <p className="text-xs text-zinc-400">Total Uses</p>
                    <p className="text-sm font-medium text-zinc-200">{refDetails.count}</p>
                  </div>
                  <div className="p-2 rounded-md bg-zinc-900/50 border border-zinc-800">
                    <p className="text-xs text-zinc-400">Status</p>
                    <p className="text-sm font-medium text-blue-400">Active</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 flex flex-col min-h-0 p-4 pt-0">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-zinc-400">
            {!isCollapsed && "Recent Chats"}
          </span>
          {!isCollapsed && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-zinc-400 hover:text-white"
              onClick={createNewChatButton}
            >
              <Plus className="h-4 w-4" />
            </Button>
          )}
        </div>
        <ScrollArea className="flex-1">
          <div className="space-y-1 pr-4">
            {allChats.map((chat) => (
              <div
                key={chat.id}
                className={cn(
                  "group relative w-full rounded-md transition-colors duration-200 flex items-center gap-1",
                  selectedChatId === chat.id
                    ? "bg-zinc-800/80"
                    : "hover:bg-zinc-800/50"
                )}
              >
                <Button
                  variant="ghost"
                  className={cn(
                    "flex-1 justify-start py-2 text-sm transition-colors duration-200",
                    selectedChatId === chat.id
                      ? "text-white hover:bg-transparent"
                      : "text-zinc-400 hover:text-white hover:bg-transparent",
                    deletingChatId === chat.id && "opacity-50 cursor-not-allowed"
                  )}
                  onClick={() => handleChatSelect(chat.id)}
                  disabled={deletingChatId === chat.id}
                >
                  <div className="flex items-center gap-3 overflow-hidden w-full">
                    <MessageSquare
                      className={cn(
                        "h-4 w-4 flex-shrink-0",
                        selectedChatId === chat.id ? "text-white" : "text-zinc-400"
                      )}
                    />
                    {!isCollapsed && <span className="truncate flex-1 text-left">{chat.title}</span>}
                  </div>
                </Button>
                
                {/* Three-dot menu */}
                {!isCollapsed && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={cn(
                          "h-8 w-8 flex-shrink-0",
                          "text-zinc-400 hover:text-white hover:bg-zinc-800",
                          "opacity-0 group-hover:opacity-100 transition-opacity",
                          deletingChatId === chat.id && "opacity-50 cursor-not-allowed"
                        )}
                        disabled={deletingChatId === chat.id}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem
                        className="text-red-400 focus:text-red-400 focus:bg-red-400/10 cursor-pointer"
                        onClick={(e: React.MouseEvent) => {
                          e.stopPropagation();
                          handleDeleteChat(chat.id, e);
                        }}
                        disabled={deletingChatId === chat.id}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete chat
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      <div className="p-4 text-sm text-gray-500">{!isCollapsed && "@jectadotai"}</div>
    </div>
  );

  return (
    <>
      <Header
        solanaAddress={solanaAddress}
        setSolanaAddress={setSolanaAddress}
        isWhitelisted={isWhitelisted}
        isCollapsed={isCollapsed}
      />

      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden fixed top-4 left-4 z-50">
            <MenuIcon className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent
          aria-label="Menu"
          side="left"
          className="w-80 p-0 bg-zinc-900 border-zinc-800"
        >
          <VisuallyHidden>
            <SheetHeader>
              <SheetTitle>Menu</SheetTitle>
              <SheetDescription>Navigation menu for accessing chat options.</SheetDescription>
            </SheetHeader>
          </VisuallyHidden>
          <MenuContent />
        </SheetContent>
      </Sheet>

      <aside
        className={cn(
          "relative hidden md:flex min-h-screen bg-zinc-900 text-white flex-col shadow-lg border-r border-zinc-800 transition-all duration-300 z-30",
          isCollapsed ? "w-20" : "w-72"
        )}
      >
        <Button
          variant="ghost"
          size="icon"
          className="absolute -right-4 top-2 bg-zinc-800 rounded-full"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4 z-50" />
          ) : (
            <ChevronLeft className="h-4 w-4 z-50" />
          )}
        </Button>

        <MenuContent />
      </aside>
    </>
  );
};

export default Menu;
