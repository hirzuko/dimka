import { Link } from "react-router-dom";
import { MessageCircle, Shield } from "lucide-react";
import logo from "@/assets/logo.png";

const Index = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border/50 glass sticky top-0 z-50 animate-fade-in">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-3">
          <img src={logo} alt="Logo" className="w-10 h-10 rounded-xl" />
          <h1 className="text-xl font-semibold text-foreground">Aurora VPN</h1>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-16">
        <div className="text-center max-w-2xl mb-16 opacity-0 animate-fade-in-up">
          <div className="flex justify-center mb-8">
            <img 
              src={logo} 
              alt="Aurora VPN" 
              className="w-28 h-28 rounded-3xl animate-glow hover-scale"
            />
          </div>
          <h2 className="text-5xl font-bold text-foreground tracking-tight mb-6">
            Aurora <span className="text-primary">Support</span>
          </h2>
          <p className="text-xl text-muted-foreground leading-relaxed">
            Get the help you need. We're here to answer your questions about our VPN service.
          </p>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-2 gap-6 w-full max-w-3xl">
          {/* Get Support Card */}
          <Link
            to="/chat"
            className="group glass rounded-2xl p-8 hover-scale hover-glow opacity-0 animate-fade-in-up stagger-2 transition-all duration-300"
          >
            <div className="w-14 h-14 bg-primary/20 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary/30 transition-colors">
              <MessageCircle className="w-7 h-7 text-primary" />
            </div>
            <h3 className="text-2xl font-semibold text-foreground mb-3">
              Get Support
            </h3>
            <p className="text-muted-foreground mb-4">
              Chat with our support team for help with your VPN service
            </p>
            <span className="text-primary font-medium group-hover:underline inline-flex items-center gap-1">
              Start Chat 
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </span>
          </Link>

          {/* Staff Portal Card */}
          <Link
            to="/staff/login"
            className="group glass rounded-2xl p-8 hover-scale hover-glow opacity-0 animate-fade-in-up stagger-3 transition-all duration-300"
          >
            <div className="w-14 h-14 bg-muted rounded-2xl flex items-center justify-center mb-6 group-hover:bg-muted/80 transition-colors">
              <Shield className="w-7 h-7 text-muted-foreground" />
            </div>
            <h3 className="text-2xl font-semibold text-foreground mb-3">
              Staff Portal
            </h3>
            <p className="text-muted-foreground mb-4">
              Access the support dashboard to manage customer requests
            </p>
            <span className="text-primary font-medium group-hover:underline inline-flex items-center gap-1">
              Open Dashboard 
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </span>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 py-6 animate-fade-in">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Aurora VPN. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
