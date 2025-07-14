
import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Phone, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useToast } from "@/hooks/use-toast";

interface OTPVerificationProps {
  mobile?: string;
  onVerified?: (mobile: string) => void;
}

export default function OTPVerification({ mobile: propMobile, onVerified }: OTPVerificationProps) {
  const [mobile, setMobile] = useState(propMobile || "");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const { toast } = useToast();

  // Countdown timer for resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const sendOTP = async () => {
    if (!mobile) {
      toast({
        title: "Error",
        description: "Please enter mobile number",
        variant: "destructive",
      });
      return;
    }

    setIsResending(true);
    try {
      const response = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ mobile }),
      });

      // Check if response is JSON
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Server returned non-JSON response");
      }

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Success",
          description: "OTP sent to your mobile number",
        });
        setCountdown(60); // 60 seconds countdown
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to send OTP",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Send OTP error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send OTP. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsResending(false);
    }
  };

  const verifyOTP = async () => {
    if (!mobile || !otp || otp.length !== 6) {
      toast({
        title: "Error",
        description: "Please enter valid 6-digit OTP",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ mobile, otp }),
      });

      // Check if response is JSON
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Server returned non-JSON response");
      }

      const data = await response.json();

      if (response.ok && data.verified) {
        toast({
          title: "Success",
          description: "Mobile number verified successfully",
        });
        
        if (onVerified) {
          onVerified(mobile);
        } else {
          // Redirect to login or signup completion
          window.location.href = "/auth/login";
        }
      } else {
        toast({
          title: "Error",
          description: data.error || "Invalid OTP",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Verify OTP error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to verify OTP. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/">
            <h1 className="text-3xl font-bold text-red-600 mb-2">Poppik</h1>
          </Link>
          <p className="text-gray-600">Verify your mobile number</p>
        </div>

        <Card className="shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">OTP Verification</CardTitle>
            <CardDescription className="text-center">
              Enter the 6-digit code sent to your mobile number
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Mobile Number Display */}
            <div className="space-y-2">
              <Label>Mobile Number</Label>
              <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                <Phone className="h-4 w-4 text-gray-500" />
                <span className="font-medium">+91 {mobile}</span>
              </div>
            </div>

            {/* OTP Input */}
            <div className="space-y-4">
              <Label htmlFor="otp">Enter OTP</Label>
              <div className="flex justify-center">
                <InputOTP
                  value={otp}
                  onChange={(value) => setOtp(value)}
                  maxLength={6}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
            </div>

            {/* Verify Button */}
            <Button 
              onClick={verifyOTP} 
              className="w-full bg-red-600 hover:bg-red-700"
              disabled={isLoading || otp.length !== 6}
            >
              {isLoading ? "Verifying..." : "Verify OTP"}
            </Button>

            {/* Resend OTP */}
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">
                Didn't receive the code?
              </p>
              <Button
                variant="outline"
                onClick={sendOTP}
                disabled={isResending || countdown > 0}
                className="w-full"
              >
                {isResending ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : countdown > 0 ? (
                  `Resend OTP in ${countdown}s`
                ) : (
                  "Resend OTP"
                )}
              </Button>
            </div>

            {/* Back to Login */}
            <div className="text-center">
              <Link href="/auth/login" className="text-red-600 hover:text-red-700 text-sm">
                Back to Login
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
