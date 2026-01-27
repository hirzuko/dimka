import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

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

    // TODO: Replace with actual API call to your backend
    // This is a placeholder that simulates authentication
    // In production, you would:
    // 1. Send credentials to your server
    // 2. Server validates against hashed password in database
    // 3. Server returns JWT token
    // 4. Store token in localStorage/cookie
    
    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // Placeholder validation - REPLACE THIS WITH REAL API CALL
      // Example with fetch:
      // const response = await fetch('/api/auth/login', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ username, password })
      // });
      // const data = await response.json();
      // if (data.token) {
      //   localStorage.setItem('auth_token', data.token);
      //   navigate('/staff/dashboard');
      // }

      // For demo purposes - remove this in production
      if (username && password) {
        // Store a session indicator (replace with real token)
        sessionStorage.setItem("staff_authenticated", "true");
        sessionStorage.setItem("staff_username", username);
        navigate("/staff/dashboard");
      } else {
        setError("Invalid username or password");
      }
    } catch (err) {
      setError("Authentication failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-xl font-semibold text-foreground">VPN Support</h1>
        </div>
      </header>

      {/* Login Form */}
      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-muted rounded-2xl flex items-center justify-center">
              <Shield className="w-8 h-8 text-muted-foreground" />
            </div>
            <div>
              <CardTitle className="text-2xl">Staff Portal</CardTitle>
              <CardDescription className="mt-2">
                Sign in to access the support dashboard
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-destructive/10 text-destructive text-sm px-4 py-3 rounded-lg">
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
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
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
