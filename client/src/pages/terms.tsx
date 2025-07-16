
import { Link } from "wouter";
import { ArrowLeft, Shield, Package, CreditCard, Truck, RotateCcw, User, AlertTriangle, Mail } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Terms() {
  const sections = [
    {
      icon: Shield,
      title: "Acceptance of Terms",
      content: "By accessing and using Poppik's website and services, you accept and agree to be bound by the terms and provision of this agreement."
    },
    {
      icon: Package,
      title: "Product Information",
      content: "We strive to ensure that all product information, including descriptions, ingredients, and pricing, is accurate. However, we cannot guarantee that all information is error-free. We reserve the right to correct any errors, inaccuracies, or omissions at any time without prior notice."
    },
    {
      icon: CreditCard,
      title: "Orders and Payment",
      content: "All orders are subject to acceptance and availability. We reserve the right to refuse or cancel orders at our discretion. Payment must be made in full before shipment of products."
    },
    {
      icon: Truck,
      title: "Shipping and Delivery",
      content: "Shipping times are estimates and may vary based on location and product availability. We are not responsible for delays caused by shipping carriers or circumstances beyond our control."
    },
    {
      icon: RotateCcw,
      title: "Returns and Refunds",
      content: "We accept returns of unopened products in original packaging within 30 days of purchase. Refunds will be processed within 5-7 business days after we receive the returned items."
    },
    {
      icon: User,
      title: "User Accounts",
      content: "You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account."
    },
    {
      icon: AlertTriangle,
      title: "Limitation of Liability",
      content: "Poppik shall not be liable for any indirect, incidental, special, or consequential damages arising from the use of our products or services."
    },
    {
      icon: Mail,
      title: "Contact Information",
      content: "If you have any questions about these Terms & Conditions, please contact us through our contact page."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-pink-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-red-600 hover:text-red-700 mb-6 transition-colors">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
          <div className="text-center">
            <Badge variant="outline" className="mb-4 bg-red-50 text-red-700 border-red-200">
              Legal Document
            </Badge>
            <h1 className="text-5xl font-bold text-gray-900 mb-4">Terms & Conditions</h1>
            <p className="text-gray-600 text-lg">Last updated: January 2024</p>
          </div>
        </div>

        {/* Introduction Card */}
        <Card className="shadow-xl mb-8 border-0 bg-gradient-to-r from-red-50 to-pink-50">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl text-red-700">Agreement to Terms</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 text-center leading-relaxed text-lg">
              Welcome to Poppik! These terms and conditions outline the rules and regulations for the use of our website and services. 
              By continuing to browse and use this website, you are agreeing to comply with and be bound by these terms.
            </p>
          </CardContent>
        </Card>

        {/* Terms Sections */}
        <div className="grid gap-6">
          {sections.map((section, index) => {
            const IconComponent = section.icon;
            return (
              <Card key={index} className="shadow-lg border-0 hover:shadow-xl transition-all duration-300 group">
                <CardHeader className="pb-4">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-red-100 rounded-full group-hover:bg-red-200 transition-colors">
                      <IconComponent className="h-6 w-6 text-red-600" />
                    </div>
                    <div>
                      <CardTitle className="text-xl text-gray-900 group-hover:text-red-700 transition-colors">
                        {index + 1}. {section.title}
                      </CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed text-base">
                    {section.content}
                    {section.title === "Contact Information" && (
                      <Link href="/contact" className="text-red-600 hover:text-red-700 ml-1 font-medium">
                        contact page
                      </Link>
                    )}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Footer CTA */}
        <Card className="mt-8 shadow-xl border-0 bg-gradient-to-r from-gray-900 to-gray-800 text-white">
          <CardContent className="text-center py-8">
            <h3 className="text-2xl font-semibold mb-4">Questions about our Terms?</h3>
            <p className="text-gray-300 mb-6 text-lg">
              We're here to help! Don't hesitate to reach out if you need clarification on any of these terms.
            </p>
            <Link href="/contact">
              <button className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg font-medium transition-colors">
                Contact Our Support Team
              </button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
