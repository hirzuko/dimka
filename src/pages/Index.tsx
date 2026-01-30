import { Link } from "react-router-dom";
import { MessageCircle, Shield, Sparkles, Zap } from "lucide-react";
import logo from "@/assets/logo.png";

const Index = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      {/* Cosmic Background Orbs */}
      <div className="cosmic-orb w-96 h-96 -top-48 -left-48" />
      <div className="cosmic-orb w-80 h-80 top-1/2 -right-40" style={{ animationDelay: '2s' }} />
      <div className="cosmic-orb w-64 h-64 bottom-20 left-1/4" style={{ animationDelay: '4s' }} />

      {/* Header */}
      <header className="border-b border-border/30 glass sticky top-0 z-50 animate-fade-in">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-3">
          <img src={logo} alt="Logo" className="w-10 h-10 rounded-xl" />
          <h1 className="text-xl font-bold">
            <span className="gradient-text">Astronix</span>
            <span className="text-foreground ml-1">VPN</span>
          </h1>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-16 relative z-10">
        <div className="text-center max-w-2xl mb-16 opacity-0 animate-fade-in-up">
          <div className="flex justify-center mb-8 relative">
            <div className="absolute inset-0 w-36 h-36 mx-auto bg-primary/20 blur-3xl rounded-full" />
            <img 
              src={logo} 
              alt="Astronix VPN" 
              className="w-32 h-32 rounded-3xl animate-glow hover-scale relative z-10 animate-float"
            />
          </div>
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-accent" />
            <span className="text-sm font-medium text-accent uppercase tracking-widest">Support Center</span>
            <Sparkles className="w-5 h-5 text-accent" />
          </div>
          <h2 className="text-5xl md:text-6xl font-bold tracking-tight mb-6">
            <span className="gradient-text">Astronix</span>
            <span className="text-foreground"> Support</span>
          </h2>
          <p className="text-xl text-muted-foreground leading-relaxed">
            Get instant help from our support team. We're here 24/7 to answer your questions.
          </p>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-2 gap-6 w-full max-w-3xl">
          {/* Get Support Card */}
          <Link
            to="/chat"
            className="group glass-card rounded-2xl p-8 hover-scale hover-glow opacity-0 animate-fade-in-up stagger-2 transition-all duration-300 gradient-border"
          >
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-all duration-300 relative overflow-hidden"
              style={{ background: 'linear-gradient(135deg, hsl(220 90% 56% / 0.2) 0%, hsl(280 80% 60% / 0.2) 100%)' }}
            >
              <div className="absolute inset-0 bg-primary/20 group-hover:bg-primary/30 transition-colors" />
              <MessageCircle className="w-8 h-8 text-primary relative z-10" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-3 flex items-center gap-2">
              Get Support
              <Zap className="w-5 h-5 text-accent opacity-0 group-hover:opacity-100 transition-opacity" />
            </h3>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Chat with our support team for help with your VPN service, billing, or technical issues.
            </p>
            <span className="inline-flex items-center gap-2 text-primary font-semibold group-hover:gap-3 transition-all">
              Start Chat 
              <span className="text-lg">→</span>
            </span>
          </Link>

          {/* Staff Portal Card */}
          <Link
            to="/staff/login"
            className="group glass-card rounded-2xl p-8 hover-scale opacity-0 animate-fade-in-up stagger-3 transition-all duration-300 hover:border-muted-foreground/30"
          >
            <div className="w-16 h-16 bg-muted/50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-muted/70 transition-colors">
              <Shield className="w-8 h-8 text-muted-foreground group-hover:text-foreground transition-colors" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-3">
              Staff Portal
            </h3>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Access the support dashboard to manage and respond to customer requests.
            </p>
            <span className="inline-flex items-center gap-2 text-muted-foreground font-semibold group-hover:text-foreground group-hover:gap-3 transition-all">
              Open Dashboard 
              <span className="text-lg">→</span>
            </span>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/30 py-6 animate-fade-in relative z-10">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} <span className="gradient-text font-medium">Astronix VPN</span>. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
