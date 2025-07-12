
import { useState, useEffect } from "react";
import { Link } from "wouter";
import { User, Mail, Phone, Calendar, LogOut, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface UserProfile {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  createdAt: string;
}

export default function Profile() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get user data from localStorage
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
      } catch (error) {
        console.error("Error parsing user data:", error);
        // Redirect to login if user data is invalid
        window.location.href = "/auth/login";
      }
    } else {
      // Redirect to login if no user data
      window.location.href = "/auth/login";
    }
    setLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Access Denied</h2>
            <p className="text-gray-600 mb-6">Please log in to view your profile.</p>
            <Link href="/auth/login">
              <Button className="bg-red-600 hover:bg-red-700">
                Go to Login
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-red-600 hover:text-red-700 mb-4">
            ← Back to Home
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600 mt-2">Manage your account information</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <Card className="shadow-lg">
              <CardHeader className="text-center">
                <Avatar className="w-24 h-24 mx-auto mb-4">
                  <AvatarFallback className="text-2xl bg-red-100 text-red-600">
                    {getInitials(user.firstName, user.lastName)}
                  </AvatarFallback>
                </Avatar>
                <CardTitle className="text-2xl">
                  {user.firstName} {user.lastName}
                </CardTitle>
                <CardDescription>{user.email}</CardDescription>
                <Badge variant="outline" className="mt-2">
                  <User className="h-3 w-3 mr-1" />
                  Customer
                </Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => alert("Edit profile feature coming soon!")}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
                <Button 
                  variant="destructive" 
                  className="w-full bg-red-600 hover:bg-red-700"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Account Details */}
          <div className="lg:col-span-2">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
                <CardDescription>Your personal details and account settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">First Name</label>
                    <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <User className="h-4 w-4 text-gray-400 mr-3" />
                      <span className="text-gray-900">{user.firstName}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Last Name</label>
                    <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <User className="h-4 w-4 text-gray-400 mr-3" />
                      <span className="text-gray-900">{user.lastName}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Email Address</label>
                    <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <Mail className="h-4 w-4 text-gray-400 mr-3" />
                      <span className="text-gray-900">{user.email}</span>
                    </div>
                  </div>
                  
                  {user.phone && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Phone Number</label>
                      <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                        <Phone className="h-4 w-4 text-gray-400 mr-3" />
                        <span className="text-gray-900">{user.phone}</span>
                      </div>
                    </div>
                  )}
                  
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium text-gray-700">Member Since</label>
                    <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <Calendar className="h-4 w-4 text-gray-400 mr-3" />
                      <span className="text-gray-900">{formatDate(user.createdAt)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="shadow-lg mt-6">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Manage your account and orders</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Link href="/cart">
                    <Button variant="outline" className="w-full justify-start">
                      View Cart
                    </Button>
                  </Link>
                  <Link href="/order-history">
                    <Button variant="outline" className="w-full justify-start">
                      Order History
                    </Button>
                  </Link>
                  <Link href="/wishlist">
                    <Button variant="outline" className="w-full justify-start">
                      My Wishlist
                    </Button>
                  </Link>
                  <Link href="/change-password">
                    <Button variant="outline" className="w-full justify-start">
                      Change Password
                    </Button>
                  </Link>
                  <Link href="/contact">
                    <Button variant="outline" className="w-full justify-start">
                      Contact Support
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
