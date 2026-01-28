import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, LogOut, Send, MessageCircle, Bell, CheckCircle, RotateCcw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { api } from "@/lib/api";
import { getAllTickets, addMessageToTicket, updateTicketStatus, type Ticket } from "@/lib/ticketStorage";
import logo from "@/assets/logo.png";

interface Message {
  id: string;
  text?: string;
  content?: string;
  sender: "user" | "support";
  timestamp?: Date | string;
  created_at?: string;
}

interface ApiTicket {
  id: string;
  client_name: string;
  status: string;
  created_at: string;
  updated_at: string;
  messages: Message[];
}

// Check if API is available
const useApiMode = import.meta.env.VITE_API_URL ? true : false;

const StaffDashboard = () => {
  const [conversations, setConversations] = useState<(Ticket | ApiTicket)[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<(Ticket | ApiTicket) | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [replyText, setReplyText] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "resolved">("all");
  const navigate = useNavigate();

  const getToken = () => sessionStorage.getItem("staff_token") || "";

  useEffect(() => {
    const isAuthenticated = sessionStorage.getItem("staff_authenticated");
    if (!isAuthenticated) {
      navigate("/staff/login");
    }
  }, [navigate]);

  // Poll for tickets
  useEffect(() => {
    const pollTickets = async () => {
      try {
        if (useApiMode) {
          const tickets = await api.getAllTickets(getToken());
          setConversations(tickets);
        } else {
          const tickets = getAllTickets();
          setConversations(tickets);
        }
      } catch {
        // Fallback to localStorage if API fails
        const tickets = getAllTickets();
        setConversations(tickets);
      }
    };

    pollTickets();
    const interval = setInterval(pollTickets, 1000);
    return () => clearInterval(interval);
  }, []);

  // Update selected conversation when conversations change
  useEffect(() => {
    if (selectedConversation) {
      const updated = conversations.find(c => c.id === selectedConversation.id);
      if (updated) {
        setSelectedConversation(updated);
      }
    }
  }, [conversations, selectedConversation?.id]);

  const handleLogout = () => {
    sessionStorage.removeItem("staff_authenticated");
    sessionStorage.removeItem("staff_username");
    sessionStorage.removeItem("staff_token");
    navigate("/staff/login");
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedConversation) return;

    try {
      if (useApiMode) {
        await api.sendReply(selectedConversation.id, replyText, getToken());
      } else {
        addMessageToTicket(selectedConversation.id, {
          text: replyText,
          sender: "support"
        });
      }
      setReplyText("");
    } catch (err) {
      console.error("Failed to send reply:", err);
      // Fallback to localStorage
      addMessageToTicket(selectedConversation.id, {
        text: replyText,
        sender: "support"
      });
      setReplyText("");
    }
  };

  const handleToggleStatus = async () => {
    if (!selectedConversation) return;
    
    const currentStatus = getStatus(selectedConversation);
    const newStatus = currentStatus === "active" ? "resolved" : "active";
    
    try {
      if (useApiMode) {
        await api.updateTicketStatus(selectedConversation.id, newStatus, getToken());
      } else {
        updateTicketStatus(selectedConversation.id, newStatus);
      }
    } catch {
      updateTicketStatus(selectedConversation.id, newStatus);
    }
  };

  // Helper functions for API/localStorage compatibility
  const getName = (conv: Ticket | ApiTicket) => 
    'name' in conv ? conv.name : conv.client_name;
  
  const getStatus = (conv: Ticket | ApiTicket) => conv.status;
  
  const getTimestamp = (conv: Ticket | ApiTicket) => 
    'timestamp' in conv ? conv.timestamp : conv.updated_at;
  
  const getLastMessage = (conv: Ticket | ApiTicket) => {
    if ('lastMessage' in conv) return conv.lastMessage;
    const msgs = conv.messages || [];
    const last = msgs[msgs.length - 1];
    if (!last) return "";
    return getMessageText(last);
  };

  const getMessages = (conv: Ticket | ApiTicket): Message[] => conv.messages || [];
  
  const getMessageText = (msg: Message) => msg.text || msg.content || "";
  const getMessageTime = (msg: Message) => msg.timestamp || msg.created_at || new Date();

  const formatTime = (date: Date | string) => {
    const d = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);

    if (diffHours < 24) {
      return d.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    }
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const filteredConversations = conversations.filter((conv) => {
    const matchesSearch = getName(conv).toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || getStatus(conv) === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const activeCount = conversations.filter((c) => getStatus(c) === "active").length;
  const resolvedCount = conversations.filter((c) => getStatus(c) === "resolved").length;
  const staffUsername = sessionStorage.getItem("staff_username") || "Admin";

  return (
    <div className="min-h-screen bg-background flex animate-fade-in">
      {/* Sidebar */}
      <aside className="w-80 border-r border-border flex flex-col glass">
        {/* Sidebar Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-3 mb-4">
            <img src={logo} alt="Logo" className="w-8 h-8 rounded-lg" />
            <h1 className="text-xl font-bold text-foreground">Support</h1>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-card border-border focus:border-primary transition-colors"
            />
          </div>

          {/* Status Filter */}
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => setStatusFilter("all")}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                statusFilter === "all"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setStatusFilter("active")}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-1.5 ${
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
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-1.5 ${
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
            {filteredConversations.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No tickets yet</p>
              </div>
            ) : (
              filteredConversations.map((conv, index) => (
                <button
                  key={conv.id}
                  onClick={() => setSelectedConversation(conv)}
                  className={`w-full text-left p-3 rounded-lg mb-1 transition-all duration-200 opacity-0 animate-fade-in-up hover-scale ${
                    selectedConversation?.id === conv.id
                      ? "bg-primary/10 border border-primary/30"
                      : "hover:bg-muted"
                  }`}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-foreground text-sm">{getName(conv)}</span>
                    <span className="text-xs text-muted-foreground">{formatTime(getTimestamp(conv))}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground truncate flex-1 mr-2">
                      {getLastMessage(conv) || "New conversation"}
                    </p>
                    {getStatus(conv) === "resolved" && (
                      <CheckCircle className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </ScrollArea>

        {/* User Info */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground text-sm">{staffUsername}</p>
              <p className="text-xs text-muted-foreground">Support Agent</p>
            </div>
            <Button variant="ghost" size="icon" onClick={handleLogout} className="hover:bg-destructive/20 hover:text-destructive transition-colors">
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
            <header className="p-4 border-b border-border glass animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-semibold text-foreground">{getName(selectedConversation)}</h2>
                  <p className="text-sm text-muted-foreground">
                    Ticket #{selectedConversation.id}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleToggleStatus}
                    className={`gap-2 transition-all duration-200 ${
                      getStatus(selectedConversation) === "active"
                        ? "hover:bg-green-500/10 hover:text-green-500 hover:border-green-500/50"
                        : "hover:bg-primary/10 hover:text-primary hover:border-primary/50"
                    }`}
                  >
                    {getStatus(selectedConversation) === "active" ? (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        Mark Resolved
                      </>
                    ) : (
                      <>
                        <RotateCcw className="w-4 h-4" />
                        Reopen
                      </>
                    )}
                  </Button>
                  <Badge 
                    variant={getStatus(selectedConversation) === "active" ? "default" : "secondary"}
                    className={getStatus(selectedConversation) === "active" ? "bg-primary" : "bg-green-500/20 text-green-500"}
                  >
                    {getStatus(selectedConversation)}
                  </Badge>
                </div>
              </div>
            </header>

            {/* Messages */}
            <ScrollArea className="flex-1 p-6">
              <div className="space-y-4 max-w-3xl">
                {getMessages(selectedConversation).length === 0 ? (
                  <div className="text-center py-16 text-muted-foreground opacity-0 animate-fade-in-up">
                    <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No messages yet. The user is waiting for your response.</p>
                  </div>
                ) : (
                  getMessages(selectedConversation).map((message, index) => (
                    <div
                      key={message.id}
                      className={`flex flex-col opacity-0 animate-fade-in-up ${
                        message.sender === "support" ? "items-end" : "items-start"
                      }`}
                      style={{ animationDelay: `${index * 0.03}s` }}
                    >
                      <div
                        className={`max-w-[70%] rounded-2xl px-4 py-3 transition-all ${
                          message.sender === "support"
                            ? "bg-primary text-primary-foreground"
                            : "glass"
                        }`}
                      >
                        <p className="text-sm">{getMessageText(message)}</p>
                      </div>
                      <span className="text-xs text-muted-foreground mt-1">
                        {message.sender === "support" ? "You • " : `${getName(selectedConversation)} • `}
                        {formatTime(getMessageTime(message))}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>

            {/* Reply Input */}
            <footer className="p-4 border-t border-border glass animate-fade-in">
              <form onSubmit={handleSendReply} className="flex gap-3 max-w-3xl">
                <Input
                  placeholder="Type your reply..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="flex-1 bg-card border-border focus:border-primary transition-colors"
                />
                <Button type="submit" className="hover-scale">
                  <Send className="w-4 h-4 mr-2" />
                  Send
                </Button>
              </form>
            </footer>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center opacity-0 animate-fade-in-up">
            <div className="text-center">
              <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-10 h-10 text-muted-foreground" />
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
