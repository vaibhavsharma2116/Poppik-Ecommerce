
import { Link } from "wouter";
import { ArrowLeft, Shield, Eye, Share2, Lock, Cookie, UserCheck, Baby, RefreshCw, Mail } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Privacy() {
  const sections = [
    {
      icon: Eye,
      title: "Information We Collect",
      content: "We collect information you provide directly to us, such as when you create an account, make a purchase, or contact us for support. This includes your name, email address, phone number, shipping address, and payment information.",
      highlight: "Personal Data Collection"
    },
    {
      icon: RefreshCw,
      title: "How We Use Your Information",
      content: "We use the information we collect to process orders, provide customer service, send promotional communications (with your consent), and improve our products and services.",
      highlight: "Data Processing"
    },
    {
      icon: Share2,
      title: "Information Sharing",
      content: "We do not sell, trade, or rent your personal information to third parties. We may share your information with trusted service providers who assist us in operating our website and conducting our business.",
      highlight: "No Selling of Data"
    },
    {
      icon: Lock,
      title: "Data Security",
      content: "We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure.",
      highlight: "Security Measures"
    },
    {
      icon: Cookie,
      title: "Cookies and Tracking",
      content: "We use cookies and similar technologies to enhance your browsing experience, analyze website traffic, and understand where our visitors are coming from.",
      highlight: "Cookie Usage"
    },
    {
      icon: UserCheck,
      title: "Your Rights",
      content: "You have the right to access, update, or delete your personal information. You can also opt out of promotional communications at any time.",
      highlight: "User Rights"
    },
    {
      icon: Baby,
      title: "Children's Privacy",
      content: "Our services are not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13.",
      highlight: "Child Protection"
    },
    {
      icon: RefreshCw,
      title: "Changes to This Policy",
      content: "We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page.",
      highlight: "Policy Updates"
    },
    {
      icon: Mail,
      title: "Contact Us",
      content: "If you have any questions about this Privacy Policy, please contact us through our contact page.",
      highlight: "Get Help"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6 transition-colors">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
          <div className="text-center">
            <Badge variant="outline" className="mb-4 bg-blue-50 text-blue-700 border-blue-200">
              Privacy Document
            </Badge>
            <h1 className="text-5xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
            <p className="text-gray-600 text-lg">Last updated: January 2024</p>
          </div>
        </div>

        {/* Introduction Card */}
        <Card className="shadow-xl mb-8 border-0 bg-gradient-to-r from-blue-50 to-purple-50">
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-blue-100 rounded-full">
                <Shield className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            <CardTitle className="text-2xl text-blue-700">Your Privacy Matters</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 text-center leading-relaxed text-lg">
              At Poppik, we take your privacy seriously. This policy explains how we collect, use, and protect your personal information 
              when you use our website and services. We are committed to transparency and giving you control over your data.
            </p>
          </CardContent>
        </Card>

        {/* Privacy Sections */}
        <div className="grid gap-6">
          {sections.map((section, index) => {
            const IconComponent = section.icon;
            return (
              <Card key={index} className="shadow-lg border-0 hover:shadow-xl transition-all duration-300 group">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-blue-100 rounded-full group-hover:bg-blue-200 transition-colors">
                        <IconComponent className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <CardTitle className="text-xl text-gray-900 group-hover:text-blue-700 transition-colors">
                          {index + 1}. {section.title}
                        </CardTitle>
                      </div>
                    </div>
                    <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
                      {section.highlight}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed text-base">
                    {section.content}
                    {section.title === "Contact Us" && (
                      <Link href="/contact" className="text-blue-600 hover:text-blue-700 ml-1 font-medium">
                        contact page
                      </Link>
                    )}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Data Protection Highlights */}
        <div className="grid md:grid-cols-3 gap-6 mt-8">
          <Card className="shadow-lg border-0 bg-gradient-to-br from-green-50 to-emerald-50">
            <CardContent className="text-center py-6">
              <div className="p-3 bg-green-100 rounded-full w-fit mx-auto mb-4">
                <Shield className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Secure Storage</h3>
              <p className="text-gray-600 text-sm">Your data is encrypted and stored securely using industry-standard practices.</p>
            </CardContent>
          </Card>
          
          <Card className="shadow-lg border-0 bg-gradient-to-br from-purple-50 to-pink-50">
            <CardContent className="text-center py-6">
              <div className="p-3 bg-purple-100 rounded-full w-fit mx-auto mb-4">
                <UserCheck className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Your Control</h3>
              <p className="text-gray-600 text-sm">Access, update, or delete your personal information anytime through your account.</p>
            </CardContent>
          </Card>
          
          <Card className="shadow-lg border-0 bg-gradient-to-br from-orange-50 to-red-50">
            <CardContent className="text-center py-6">
              <div className="p-3 bg-orange-100 rounded-full w-fit mx-auto mb-4">
                <Eye className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Transparency</h3>
              <p className="text-gray-600 text-sm">We're clear about what data we collect and how we use it to improve your experience.</p>
            </CardContent>
          </Card>
        </div>

        {/* Footer CTA */}
        <Card className="mt-8 shadow-xl border-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <CardContent className="text-center py-8">
            <h3 className="text-2xl font-semibold mb-4">Privacy Questions?</h3>
            <p className="text-blue-100 mb-6 text-lg">
              We believe in transparency. If you have any questions about how we handle your data, we're here to help.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact">
                <button className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 rounded-lg font-medium transition-colors">
                  Contact Privacy Team
                </button>
              </Link>
              <Link href="/profile">
                <button className="bg-blue-700 hover:bg-blue-800 text-white px-8 py-3 rounded-lg font-medium transition-colors border border-blue-500">
                  Manage Your Data
                </button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
