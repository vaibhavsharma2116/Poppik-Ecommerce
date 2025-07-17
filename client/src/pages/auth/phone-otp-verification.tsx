
import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Phone, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useToast } from "@/hooks/use-toast";
import { auth, setupRecaptcha, sendOTPToPhone } from "@/lib/firebase";
import { ConfirmationResult } from 'firebase/auth';

interface PhoneOTPVerificationProps {
  onVerified?: (phoneNumber: string) => void;
}

export default function PhoneOTPVerification({ onVerified }: PhoneOTPVerificationProps) {
  const [phoneNumber, setPhoneNumber] = useState("+91");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [step, setStep] = useState(1); // 1: phone input, 2: OTP input
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const { toast } = useToast();

  // Countdown timer for resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const sendOTP = async () => {
    if (!phoneNumber || phoneNumber.length < 13) {
      toast({
        title: "Error",
        description: "Please enter a valid phone number with country code",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Setup reCAPTCHA
      const recaptchaVerifier = setupRecaptcha('recaptcha-container');
      
      // Send OTP
      const confirmation = await sendOTPToPhone(phoneNumber, recaptchaVerifier);
      setConfirmationResult(confirmation);
      setStep(2);
      setCountdown(60);
      
      toast({
        title: "OTP Sent",
        description: `Verification code sent to ${phoneNumber}`,
      });
    } catch (error: any) {
      console.error("Send OTP error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to send OTP. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      toast({
        title: "Error",
        description: "Please enter valid 6-digit OTP",
        variant: "destructive",
      });
      return;
    }

    if (!confirmationResult) {
      toast({
        title: "Error",
        description: "Please request a new OTP",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await confirmationResult.confirm(otp);
      const user = result.user;
      
      toast({
        title: "Success",
        description: "Phone number verified successfully",
      });

      // Get user token for backend authentication
      const token = await user.getIdToken();
      
      // Store token in localStorage
      localStorage.setItem("firebase_token", token);
      localStorage.setItem("user", JSON.stringify({
        uid: user.uid,
        phoneNumber: user.phoneNumber,
        displayName: user.displayName,
      }));

      if (onVerified) {
        onVerified(phoneNumber);
      } else {
        window.location.href = "/profile";
      }
    } catch (error: any) {
      console.error("Verify OTP error:", error);
      toast({
        title: "Error",
        description: error.message || "Invalid OTP. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resendOTP = async () => {
    setIsResending(true);
    try {
      await sendOTP();
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/">
            <h1 className="text-3xl font-bold text-red-600 mb-2">Poppik</h1>
          </Link>
          <p className="text-gray-600">Verify your phone number</p>
        </div>

        <Card className="shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">
              {step === 1 ? "Phone Verification" : "Enter OTP"}
            </CardTitle>
            <CardDescription className="text-center">
              {step === 1 
                ? "Enter your phone number to receive verification code"
                : "Enter the 6-digit code sent to your phone"
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {step === 1 ? (
              <>
                {/* Phone Number Input */}
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    Include country code (e.g., +91 for India)
                  </p>
                </div>

                {/* Send OTP Button */}
                <Button 
                  onClick={sendOTP} 
                  className="w-full bg-red-600 hover:bg-red-700"
                  disabled={isLoading || phoneNumber.length < 13}
                >
                  {isLoading ? "Sending..." : "Send OTP"}
                </Button>
              </>
            ) : (
              <>
                {/* Phone Display */}
                <div className="space-y-2">
                  <Label>Phone Number</Label>
                  <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">{phoneNumber}</span>
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
                    onClick={resendOTP}
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

                {/* Back to Phone Input */}
                <div className="text-center">
                  <Button 
                    variant="ghost" 
                    onClick={() => setStep(1)}
                    className="text-red-600 hover:text-red-700"
                  >
                    Change Phone Number
                  </Button>
                </div>
              </>
            )}

            {/* reCAPTCHA container */}
            <div id="recaptcha-container"></div>

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
