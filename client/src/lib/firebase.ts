
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, RecaptchaVerifier, signInWithPhoneNumber, signInWithPopup } from 'firebase/auth';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Google Auth Provider
export const googleProvider = new GoogleAuthProvider();

// Store reCAPTCHA verifier globally to prevent re-rendering
let globalRecaptchaVerifier: RecaptchaVerifier | null = null;

// Phone Auth functions
export const setupRecaptcha = (containerId: string) => {
  // Clear existing verifier if it exists
  if (globalRecaptchaVerifier) {
    globalRecaptchaVerifier.clear();
    globalRecaptchaVerifier = null;
  }

  // Clear the container element
  const container = document.getElementById(containerId);
  if (container) {
    container.innerHTML = '';
  }

  globalRecaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
    size: 'invisible',
    callback: () => {
      console.log('Recaptcha verified');
    },
    'expired-callback': () => {
      console.log('Recaptcha expired');
    }
  });
  
  return globalRecaptchaVerifier;
};

export const sendOTPToPhone = async (phoneNumber: string, recaptchaVerifier: RecaptchaVerifier) => {
  try {
    const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
    return confirmationResult;
  } catch (error) {
    console.error('Error sending OTP:', error);
    // Clear verifier on error
    if (globalRecaptchaVerifier) {
      globalRecaptchaVerifier.clear();
      globalRecaptchaVerifier = null;
    }
    throw error;
  }
};

// Function to cleanup reCAPTCHA
export const cleanupRecaptcha = () => {
  if (globalRecaptchaVerifier) {
    globalRecaptchaVerifier.clear();
    globalRecaptchaVerifier = null;
  }
};

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    
    // Get user token
    const token = await user.getIdToken();
    
    // Save user to database first
    try {
      const response = await fetch("/api/auth/firebase", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          phoneNumber: user.phoneNumber,
          photoURL: user.photoURL,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Google user saved to database:", data);
        
        // Store our app's token and user data
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        
        return { user: data.user, result };
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save user to database");
      }
    } catch (error) {
      console.error("Error saving Google user to database:", error);
      throw error;
    }
  } catch (error) {
    console.error('Error signing in with Google:', error);
    throw error;
  }
};

// Firebase SMS Service for mobile OTP
export class FirebaseSMSService {
  private static recaptchaVerifier: RecaptchaVerifier | null = null;
  private static confirmationResult: any = null;

  static async sendSMSOTP(phoneNumber: string): Promise<{ success: boolean; message: string }> {
    try {
      // Setup reCAPTCHA
      if (!this.recaptchaVerifier) {
        this.recaptchaVerifier = setupRecaptcha('recaptcha-container');
      }

      // Add +91 prefix for Indian numbers
      const formattedPhone = `+91${phoneNumber}`;
      
      // Send OTP
      this.confirmationResult = await signInWithPhoneNumber(auth, formattedPhone, this.recaptchaVerifier);
      
      return {
        success: true,
        message: 'OTP sent successfully'
      };
    } catch (error) {
      console.error('Firebase SMS error:', error);
      return {
        success: false,
        message: error.message || 'Failed to send OTP'
      };
    }
  }

  static async verifySMSOTP(otp: string): Promise<{ success: boolean; message: string }> {
    try {
      if (!this.confirmationResult) {
        return {
          success: false,
          message: 'Please request a new OTP'
        };
      }

      const result = await this.confirmationResult.confirm(otp);
      const user = result.user;
      
      // Get user token
      const token = await user.getIdToken();
      
      // Store token in localStorage
      localStorage.setItem("firebase_token", token);
      localStorage.setItem("user", JSON.stringify({
        uid: user.uid,
        phoneNumber: user.phoneNumber,
        displayName: user.displayName,
      }));

      // Save user to database
      try {
        const response = await fetch("/api/auth/firebase/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            uid: user.uid,
            phoneNumber: user.phoneNumber,
            displayName: user.displayName,
            provider: "phone"
          }),
        });

        if (response.ok) {
          const data = await response.json();
          console.log("SMS user saved to database:", data);
        }
      } catch (error) {
        console.error("Error saving SMS user to database:", error);
      }

      return {
        success: true,
        message: 'Phone number verified successfully'
      };
    } catch (error) {
      console.error('Firebase SMS verification error:', error);
      return {
        success: false,
        message: error.message || 'Invalid OTP'
      };
    }
  }

  static cleanup() {
    if (this.recaptchaVerifier) {
      this.recaptchaVerifier.clear();
      this.recaptchaVerifier = null;
    }
    this.confirmationResult = null;
  }
}

export default app;
