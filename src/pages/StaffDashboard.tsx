import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, LogOut, Send, MessageCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Conversation {
  id: string;
  name: string;
  lastMessage: string;
  timestamp: Date;
  status: "active" | "resolved";
  messages: {
    id: string;
    text: string;
    sender: "user" | "support";
    timestamp: Date;
  }[];
}

// Demo data - in production this would come from your database
const demoConversations: Conversation[] = [
  {
    id: "1",
    name: "Paul Wallice",
    lastMessage: "I need help with my subscription",
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
    status: "active",
    messages: [
      {
        id: "1",
        text: "Hello Paul Wallice! Thank you for contacting VPN Support. I'm here to help you today. How can I assist you?",
        sender: "support",
        timestamp: new Date(Date.now() - 1000 * 60 * 10),
      },
      {
        id: "2",
        text: "Hello",
        sender: "user",
        timestamp: new Date(Date.now() - 1000 * 60 * 8),
      },
      {
        id: "3",
        text: "Thank you, How may I assist you today?",
        sender: "support",
        timestamp: new Date(Date.now() - 1000 * 60 * 7),
      },
      {
        id: "4",
        text: "I need help with my subscription",
        sender: "user",
        timestamp: new Date(Date.now() - 1000 * 60 * 5),
      },
    ],
  },
  {
    id: "2",
    name: "Dan",
    lastMessage: "How can I help you?",
    timestamp: new Date(Date.now() - 1000 * 60 * 90),
    status: "active",
    messages: [
      {
        id: "1",
        text: "Hello! How can I help you?",
        sender: "support",
        timestamp: new Date(Date.now() - 1000 * 60 * 90),
      },
    ],
  },
  {
    id: "3",
    name: "Gary A Barnhart",
    lastMessage: "Are you there sir?",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6),
    status: "active",
    messages: [
      {
        id: "1",
        text: "Hello! Welcome to VPN Support.",
        sender: "support",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 7),
      },
      {
        id: "2",
        text: "Are you there sir?",
        sender: "user",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6),
      },
    ],
  },
  {
    id: "4",
    name: "Mark",
    lastMessage: "hello",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
    status: "active",
    messages: [
      {
        id: "1",
        text: "hello",
        sender: "user",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
      },
    ],
  },
  {
    id: "5",
    name: "Prince",
    lastMessage: "Bill",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 26),
    status: "active",
    messages: [
      {
        id: "1",
        text: "Bill",
        sender: "user",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 26),
      },
    ],
  },
];

const StaffDashboard = () => {
  const [conversations, setConversations] = useState<Conversation[]>(demoConversations);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [replyText, setReplyText] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "resolved">("all");
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is authenticated
    const isAuthenticated = sessionStorage.getItem("staff_authenticated");
    if (!isAuthenticated) {
      navigate("/staff/login");
    }
  }, [navigate]);

  const handleLogout = () => {
    sessionStorage.removeItem("staff_authenticated");
    sessionStorage.removeItem("staff_username");
    navigate("/staff/login");
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedConversation) return;

    const newMessage = {
      id: Date.now().toString(),
      text: replyText,
      sender: "support" as const,
      timestamp: new Date(),
    };

    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === selectedConversation.id
          ? {
              ...conv,
              messages: [...conv.messages, newMessage],
              lastMessage: replyText,
              timestamp: new Date(),
            }
          : conv
      )
    );

    setSelectedConversation((prev) =>
      prev
        ? {
            ...prev,
            messages: [...prev.messages, newMessage],
          }
        : null
    );

    setReplyText("");
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);

    if (diffHours < 24) {
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    }
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const filteredConversations = conversations.filter((conv) => {
    const matchesSearch = conv.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || conv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const activeCount = conversations.filter((c) => c.status === "active").length;
  const resolvedCount = conversations.filter((c) => c.status === "resolved").length;
  const staffUsername = sessionStorage.getItem("staff_username") || "Admin";

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-80 border-r border-border flex flex-col bg-card">
        {/* Sidebar Header */}
        <div className="p-4 border-b border-border">
          <h1 className="text-xl font-bold text-foreground mb-4">Support</h1>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Status Filter */}
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => setStatusFilter("all")}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === "all"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setStatusFilter("active")}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                statusFilter === "active"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              Active
              <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                {activeCount}
              </Badge>
            </button>
            <button
              onClick={() => setStatusFilter("resolved")}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                statusFilter === "resolved"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              Resolved
              <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                {resolvedCount}
              </Badge>
            </button>
          </div>
        </div>

        {/* Conversations List */}
        <ScrollArea className="flex-1">
          <div className="p-2">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 py-2">
              Conversations
            </h2>
            {filteredConversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setSelectedConversation(conv)}
                className={`w-full text-left p-3 rounded-lg mb-1 transition-colors ${
                  selectedConversation?.id === conv.id
                    ? "bg-primary/10 border border-primary/20"
                    : "hover:bg-muted"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-foreground text-sm">{conv.name}</span>
                  <span className="text-xs text-muted-foreground">{formatTime(conv.timestamp)}</span>
                </div>
                <p className="text-sm text-muted-foreground truncate">{conv.lastMessage}</p>
              </button>
            ))}
          </div>
        </ScrollArea>

        {/* User Info */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground text-sm">{staffUsername}</p>
              <p className="text-xs text-muted-foreground">Support Agent</p>
            </div>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <header className="p-4 border-b border-border bg-card">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-semibold text-foreground">{selectedConversation.name}</h2>
                  <p className="text-sm text-muted-foreground">
                    {selectedConversation.status === "active" ? "Active conversation" : "Resolved"}
                  </p>
                </div>
                <Badge variant={selectedConversation.status === "active" ? "default" : "secondary"}>
                  {selectedConversation.status}
                </Badge>
              </div>
            </header>

            {/* Messages */}
            <ScrollArea className="flex-1 p-6">
              <div className="space-y-4 max-w-3xl">
                {selectedConversation.messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex flex-col ${
                      message.sender === "support" ? "items-end" : "items-start"
                    }`}
                  >
                    <div
                      className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                        message.sender === "support"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-foreground"
                      }`}
                    >
                      <p className="text-sm">{message.text}</p>
                    </div>
                    <span className="text-xs text-muted-foreground mt-1">
                      {formatTime(message.timestamp)}
                    </span>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Reply Input */}
            <footer className="p-4 border-t border-border bg-card">
              <form onSubmit={handleSendReply} className="flex gap-3 max-w-3xl">
                <Input
                  placeholder="Type your reply..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit">
                  <Send className="w-4 h-4 mr-2" />
                  Send
                </Button>
              </form>
            </footer>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Select a conversation</h3>
              <p className="text-muted-foreground">
                Choose a conversation from the sidebar to start responding
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default StaffDashboard;
