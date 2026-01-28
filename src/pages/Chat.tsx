import { useState, useRef, useEffect } from "react";
import { ArrowLeft, Send, Clock, Copy, Check } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getAllTickets, getTicketById, createTicket, addMessageToTicket, getTicketUrl } from "@/lib/ticketStorage";
import logo from "@/assets/logo.png";

interface Message {
  id: string;
  text: string;
  sender: "user" | "support";
  timestamp: Date | string;
}

const Chat = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [userName, setUserName] = useState("");
  const [isStarted, setIsStarted] = useState(false);
  const [ticketId, setTicketId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Check for existing ticket in URL
  useEffect(() => {
    const existingTicketId = searchParams.get("ticket");
    if (existingTicketId) {
      const ticket = getTicketById(existingTicketId);
      if (ticket) {
        setTicketId(existingTicketId);
        setUserName(ticket.name);
        setMessages(ticket.messages);
        setIsStarted(true);
      }
    }
  }, [searchParams]);

  const handleStartChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim()) return;

    const ticket = createTicket(userName);
    setTicketId(ticket.id);
    setIsStarted(true);
    
    // Update URL with ticket ID
    setSearchParams({ ticket: ticket.id });

    // TODO: In future, send Telegram webhook notification here
    // fetch(TELEGRAM_WEBHOOK_URL, { method: 'POST', body: JSON.stringify({ new_ticket: userName }) })
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || !ticketId) return;

    const newMessage = addMessageToTicket(ticketId, {
      text: inputValue,
      sender: "user"
    });

    if (newMessage) {
      setMessages((prev) => [...prev, newMessage]);
    }
    setInputValue("");
  };

  // Poll for new messages from operator
  useEffect(() => {
    if (!isStarted || !ticketId) return;

    const pollMessages = setInterval(() => {
      const ticket = getTicketById(ticketId);
      if (ticket && ticket.messages) {
        setMessages(ticket.messages);
      }
    }, 1000);

    return () => clearInterval(pollMessages);
  }, [isStarted, ticketId]);

  const handleCopyLink = () => {
    if (ticketId) {
      navigator.clipboard.writeText(getTicketUrl(ticketId));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatTime = (date: Date | string) => {
    return new Date(date).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  if (!isStarted) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        {/* Header */}
        <header className="border-b border-border/50 glass animate-fade-in">
          <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-4">
            <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <img src={logo} alt="Logo" className="w-8 h-8 rounded-lg" />
            <h1 className="text-xl font-semibold text-foreground">Aurora Support</h1>
          </div>
        </header>

        {/* Start Chat Form */}
        <main className="flex-1 flex items-center justify-center px-6">
          <form onSubmit={handleStartChat} className="w-full max-w-md space-y-6 opacity-0 animate-scale-in">
            <div className="text-center mb-8">
              <div className="flex justify-center mb-6">
                <img src={logo} alt="Logo" className="w-20 h-20 rounded-2xl animate-glow" />
              </div>
              <h2 className="text-3xl font-bold text-foreground mb-2">Start a Conversation</h2>
              <p className="text-muted-foreground">Enter your name to begin</p>
            </div>
            <Input
              type="text"
              placeholder="Your name"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="h-12 text-base bg-card border-border focus:border-primary transition-colors"
              required
            />
            <Button type="submit" className="w-full h-12 text-base hover-scale">
              Start Chat
            </Button>
          </form>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border/50 glass animate-fade-in">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <img src={logo} alt="Logo" className="w-8 h-8 rounded-lg" />
            <h1 className="text-xl font-semibold text-foreground">Aurora Support</h1>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyLink}
            className="gap-2 transition-all duration-200"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-green-500" />
                <span className="text-green-500">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span className="hidden sm:inline">Copy Link</span>
              </>
            )}
          </Button>
        </div>
      </header>

      {/* Messages */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-6 py-6 space-y-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center opacity-0 animate-fade-in-up">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <Clock className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">Waiting for operator</h3>
              <p className="text-muted-foreground">Our support team will respond shortly</p>
            </div>
          )}
          {messages.map((message, index) => (
            <div
              key={message.id}
              className={`flex flex-col opacity-0 animate-fade-in-up ${
                message.sender === "user" ? "items-end" : "items-start"
              }`}
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 transition-all ${
                  message.sender === "user"
                    ? "bg-primary text-primary-foreground"
                    : "glass"
                }`}
              >
                <p className="text-sm leading-relaxed">{message.text}</p>
              </div>
              <span className="text-xs text-muted-foreground mt-1 px-1">
                {formatTime(message.timestamp)}
              </span>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input */}
      <footer className="border-t border-border/50 glass animate-fade-in">
        <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex gap-3">
            <Input
              type="text"
              placeholder="Type a message..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="flex-1 h-12 bg-card border-border focus:border-primary transition-colors"
            />
            <Button type="submit" size="icon" className="h-12 w-12 shrink-0 hover-scale">
              <Send className="w-5 h-5" />
            </Button>
          </div>
        </form>
      </footer>
    </div>
  );
};

export default Chat;
