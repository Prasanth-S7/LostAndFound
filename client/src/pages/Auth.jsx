import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search } from "lucide-react";
import { api } from "@/lib/api";

export default function Auth() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  // Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  
  // Signup state
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupFullName, setSignupFullName] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { token } = await api.login(loginEmail, loginPassword);
      localStorage.setItem("token", token);
      toast({ title: "Logged in" });
      navigate("/dashboard");
    } catch (err) {
      toast({ title: "Login failed", description: err.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await api.register(signupEmail, signupPassword);
      const { token } = await api.login(signupEmail, signupPassword);
      localStorage.setItem("token", token);
      toast({ title: "Account created" });
      navigate("/");
    } catch (err) {
      toast({ title: "Signup failed", description: err.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Search className="h-10 w-10 text-white" />
            <h1 className="text-4xl font-bold text-white font-fanwood">Lost & Found</h1>
          </div>
          <p className="font-fanwood text-white text-xl">Help reunite people with their belongings</p>
        </div>

        <Card className="bg-black border-white/20">
          <CardHeader>
            <CardTitle className={"text-white font-fanwood text-xl"}>Welcome</CardTitle>
            <CardDescription className={"text-white font-fanwood text-xl"}>Login or create an account to continue</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full bg-black space-y-8">
              <TabsList className="grid w-full grid-cols-2 bg-black border border-white/10">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="bg-black">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="Email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      required
                      disabled={isLoading}
                      className={"border-white/10 py-5 text-white"}
                    />
                  </div>
                  <div className="space-y-2">
                    <Input
                      id="login-password"
                      type="password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                      disabled={isLoading}
                      placeholder="Password"
                      className={"border-white/10 py-5 text-white"}
                    />
                  </div>
                  <Button type="submit" className="w-full cursor-pointer" disabled={isLoading}>
                    {isLoading ? "Logging in..." : "Login"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="Name"
                      value={signupFullName}
                      onChange={(e) => setSignupFullName(e.target.value)}
                      required
                      disabled={isLoading}
                      className={"border-white/10 py-5 text-white"}
                    />
                  </div>
                  <div className="space-y-2">
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="Email"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      required
                      disabled={isLoading}
                      className={"border-white/10 py-5 text-white"}
                    />
                  </div>
                  <div className="space-y-2">
                    <Input
                      id="signup-password"
                      type="Password"
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      required
                      disabled={isLoading}
                      minLength={6}
                      placeholder="Password"
                      className={"border-white/10 py-5 text-white"}
                    />
                  </div>
                  <Button type="submit" className="w-full cursor-pointer" disabled={isLoading}>
                    {isLoading ? "Creating account..." : "Sign Up"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
