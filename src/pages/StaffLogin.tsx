import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Shield, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/lib/api";
import logo from "@/assets/logo.png";

// FALLBACK CREDENTIALS FOR PREVIEW MODE (when no backend)
const FALLBACK_USERNAME = "admin";
const FALLBACK_PASSWORD = "admin123";

const StaffLogin = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // Try API login first (for self-hosted)
      const { token, user } = await api.login(username, password);
      sessionStorage.setItem("staff_token", token);
      sessionStorage.setItem("staff_authenticated", "true");
      sessionStorage.setItem("staff_username", user.username);
      navigate("/staff/dashboard");
    } catch {
      // Fallback to hardcoded credentials (for Lovable preview)
      if (username === FALLBACK_USERNAME && password === FALLBACK_PASSWORD) {
        sessionStorage.setItem("staff_authenticated", "true");
        sessionStorage.setItem("staff_username", username);
        navigate("/staff/dashboard");
      } else {
        setError("Invalid username or password");
      }
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      {/* Cosmic Background */}
      <div className="cosmic-orb w-96 h-96 -top-48 -left-48" />
      <div className="cosmic-orb w-72 h-72 bottom-20 -right-36" style={{ animationDelay: '2s' }} />

      {/* Header */}
      <header className="border-b border-border/30 glass animate-fade-in relative z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <img src={logo} alt="Logo" className="w-8 h-8 rounded-lg" />
          <h1 className="text-xl font-bold">
            <span className="gradient-text">Astronix</span>
            <span className="text-foreground ml-1">VPN</span>
          </h1>
        </div>
      </header>

      {/* Login Form */}
      <main className="flex-1 flex items-center justify-center px-6 py-16 relative z-10">
        <Card className="w-full max-w-md glass-card border-border/30 opacity-0 animate-scale-in">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-20 h-20 rounded-2xl flex items-center justify-center animate-glow relative overflow-hidden"
              style={{ background: 'linear-gradient(135deg, hsl(220 90% 56% / 0.2) 0%, hsl(280 80% 60% / 0.2) 100%)' }}
            >
              <Shield className="w-10 h-10 text-primary relative z-10" />
            </div>
            <div>
              <div className="flex items-center justify-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-accent" />
                <span className="text-xs font-medium text-accent uppercase tracking-widest">Admin Access</span>
              </div>
              <CardTitle className="text-2xl font-bold">Staff Portal</CardTitle>
              <CardDescription className="mt-2 text-muted-foreground">
                Sign in to access the support dashboard
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-destructive/10 text-destructive text-sm px-4 py-3 rounded-xl animate-fade-in border border-destructive/20">
                  {error}
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  disabled={isLoading}
                  className="h-12 bg-card/50 border-border/50 focus:border-primary transition-all duration-300 rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="h-12 bg-card/50 border-border/50 focus:border-primary transition-all duration-300 rounded-xl"
                />
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 hover-scale rounded-xl font-semibold" 
                disabled={isLoading}
                style={{ background: 'linear-gradient(135deg, hsl(220 90% 56%) 0%, hsl(280 80% 60%) 100%)' }}
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>

              <p className="text-xs text-muted-foreground text-center mt-4">
                Protected area. Authorized personnel only.
              </p>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default StaffLogin;
