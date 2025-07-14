
import crypto from 'crypto';

interface OTPData {
  otp: string;
  mobile: string;
  expiresAt: Date;
  verified: boolean;
}

// In-memory storage for OTPs (in production, use Redis or database)
const otpStorage = new Map<string, OTPData>();

export class OTPService {
  private static generateOTP(): string {
    return crypto.randomInt(100000, 999999).toString();
  }

  static async sendOTP(mobile: string): Promise<{ success: boolean; message: string }> {
    try {
      // Generate 6-digit OTP
      const otp = this.generateOTP();
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

      // Store OTP
      otpStorage.set(mobile, {
        otp,
        mobile,
        expiresAt,
        verified: false
      });

      // In production, integrate with SMS service like Twilio, MSG91, etc.
      // For development, we'll just log the OTP
      console.log(`OTP for ${mobile}: ${otp}`);
      
      // Simulate SMS sending
      // await this.sendSMS(mobile, `Your OTP is: ${otp}. Valid for 5 minutes.`);

      return {
        success: true,
        message: 'OTP sent successfully'
      };
    } catch (error) {
      console.error('Error sending OTP:', error);
      return {
        success: false,
        message: 'Failed to send OTP'
      };
    }
  }

  static async verifyOTP(mobile: string, otp: string): Promise<{ success: boolean; message: string }> {
    const otpData = otpStorage.get(mobile);

    if (!otpData) {
      return {
        success: false,
        message: 'OTP not found or expired'
      };
    }

    if (new Date() > otpData.expiresAt) {
      otpStorage.delete(mobile);
      return {
        success: false,
        message: 'OTP has expired'
      };
    }

    if (otpData.otp !== otp) {
      return {
        success: false,
        message: 'Invalid OTP'
      };
    }

    // Mark as verified
    otpData.verified = true;
    otpStorage.set(mobile, otpData);

    return {
      success: true,
      message: 'OTP verified successfully'
    };
  }

  static isVerified(mobile: string): boolean {
    const otpData = otpStorage.get(mobile);
    return otpData?.verified === true;
  }

  static clearOTP(mobile: string): void {
    otpStorage.delete(mobile);
  }

  // For production, implement actual SMS sending
  private static async sendSMS(mobile: string, message: string): Promise<void> {
    // Example integration with MSG91 or Twilio
    // const response = await fetch('https://api.msg91.com/api/v5/otp', {
    //   method: 'POST',
    //   headers: {
    //     'authkey': process.env.MSG91_API_KEY,
    //     'Content-Type': 'application/json'
    //   },
    //   body: JSON.stringify({
    //     template_id: process.env.MSG91_TEMPLATE_ID,
    //     mobile: mobile,
    //     otp: otp
    //   })
    // });
  }
}
