import { useState } from "react";
import { Link } from "wouter";
import { Eye, EyeOff, Mail, Lock, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import PhoneOTPVerification from "./phone-otp-verification";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [showPhoneLogin, setShowPhoneLogin] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false
  });
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        // Store token in localStorage
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        alert("Login successful!");
        // Redirect based on user role
        if (data.user.role === "admin") {
          window.location.href = "/admin";
        } else {
          window.location.href = "/profile";
        } 
      } else {
        alert(data.error || "Invalid credentials");
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("Failed to login. Please try again.");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Render phone login component
  if (showPhoneLogin) {
    return <PhoneOTPVerification onVerified={() => window.location.href = "/profile"} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/">
            <h1 className="text-3xl font-bold text-red-600 mb-2">Poppik</h1>
          </Link>
          <p className="text-gray-600">Welcome back to your beauty journey</p>
        </div>

        <Card className="shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Sign In</CardTitle>
            <CardDescription className="text-center">
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="rememberMe"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleInputChange}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="rememberMe" className="text-sm">Remember me</Label>
                </div>
                <Link href="/auth/forgot-password" className="text-sm text-red-600 hover:text-red-700">
                  Forgot password?
                </Link>
              </div>

              <Button type="submit" className="w-full bg-red-600 hover:bg-red-700">
                Sign In
              </Button>
            </form>

            <Separator />

            <div className="space-y-4">
              {/* Google sign-in button removed */}

            {/* Phone Login - Temporarily disabled */}
            <Button 
              onClick={() => toast({
                title: "Coming Soon",
                description: "Phone authentication will be available soon. Please use Google sign-in for now.",
                variant: "default",
              })}
              variant="outline" 
              className="w-full border-gray-200 text-gray-400 cursor-not-allowed"
              disabled
            >
              <Phone className="h-4 w-4 mr-2" />
              Continue with Phone (Coming Soon)
            </Button>
            </div>

            <div className="text-center">
              <span className="text-gray-600">Don't have an account? </span>
              <Link href="/auth/signup" className="text-red-600 hover:text-red-700 font-medium">
                Sign up
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}