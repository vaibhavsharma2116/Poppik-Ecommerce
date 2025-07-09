
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useLocation } from 'wouter';
import { 
  Users, 
  Package, 
  ShoppingCart, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight,
  DollarSign,
  Eye,
  Heart,
  Star,
  Calendar,
  BarChart3,
  PieChart,
  Activity
} from "lucide-react";

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const [dateRange, setDateRange] = useState('Last 30 days');

  const handleViewReports = () => {
    alert('Reports functionality coming soon!');
  };

  const handleViewAllProducts = () => {
    setLocation('/admin/products');
  };

  const handleDateRangeChange = () => {
    const ranges = ['Last 7 days', 'Last 30 days', 'Last 90 days', 'Last year'];
    const currentIndex = ranges.indexOf(dateRange);
    const nextIndex = (currentIndex + 1) % ranges.length;
    setDateRange(ranges[nextIndex]);
  };

  const stats = [
    {
      title: "Total Revenue",
      value: "$45,231.89",
      change: "+20.1%",
      trend: "up",
      icon: DollarSign,
      color: "from-emerald-500 to-green-600"
    },
    {
      title: "Orders",
      value: "2,350",
      change: "+180.1%",
      trend: "up",
      icon: ShoppingCart,
      color: "from-blue-500 to-cyan-600"
    },
    {
      title: "Products",
      value: "12,234",
      change: "+19%",
      trend: "up",
      icon: Package,
      color: "from-purple-500 to-violet-600"
    },
    {
      title: "Active Users",
      value: "573",
      change: "-5.2%",
      trend: "down",
      icon: Users,
      color: "from-rose-500 to-pink-600"
    },
  ];

  const recentActivity = [
    { action: "New order placed", user: "Sarah J.", time: "2 min ago", amount: "$89.99" },
    { action: "Product reviewed", user: "Emily D.", time: "5 min ago", rating: 5 },
    { action: "Customer registered", user: "Mike R.", time: "8 min ago" },
    { action: "Payment received", user: "Lisa K.", time: "12 min ago", amount: "$156.50" },
  ];

  const topProducts = [
    { name: "Vitamin C Serum", sales: 847, revenue: "$25,410", trend: 15 },
    { name: "Moisturizing Cream", sales: 623, revenue: "$18,690", trend: 8 },
    { name: "Rose Water Toner", sales: 456, revenue: "$5,928", trend: -3 },
    { name: "Matte Foundation", sales: 389, revenue: "$13,615", trend: 22 },
  ];

  return (
    <div className="flex-1 space-y-8 p-8 pt-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
            Dashboard Overview
          </h2>
          <p className="text-slate-600 mt-1">Welcome back! Here's what's happening with your store today.</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm" onClick={handleDateRangeChange}>
            <Calendar className="h-4 w-4 mr-2" />
            {dateRange}
          </Button>
          <Button 
            className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600"
            onClick={handleViewReports}
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            View Reports
          </Button>
        </div>
      </div>
      
      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="relative overflow-hidden border-0 shadow-xl bg-white/70 backdrop-blur-sm">
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-5`}></div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">{stat.title}</CardTitle>
                <div className={`p-2 rounded-xl bg-gradient-to-br ${stat.color}`}>
                  <Icon className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
                <div className="flex items-center mt-2">
                  {stat.trend === "up" ? (
                    <ArrowUpRight className="h-4 w-4 text-emerald-500 mr-1" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4 text-red-500 mr-1" />
                  )}
                  <span className={`text-sm font-medium ${
                    stat.trend === "up" ? "text-emerald-600" : "text-red-600"
                  }`}>
                    {stat.change}
                  </span>
                  <span className="text-xs text-slate-500 ml-1">from last month</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts and Activity */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Top Products */}
        <Card className="lg:col-span-2 border-0 shadow-xl bg-white/70 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-slate-900">Top Products</CardTitle>
                <CardDescription>Best performing products this month</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={handleViewAllProducts}>
                <Eye className="h-4 w-4 mr-2" />
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {topProducts.map((product, index) => (
                <div key={index} className="flex items-center justify-between p-4 rounded-xl bg-slate-50/80">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-slate-900">{product.name}</h4>
                      <Badge variant={product.trend > 0 ? "default" : "destructive"} className="text-xs">
                        {product.trend > 0 ? "+" : ""}{product.trend}%
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm text-slate-600">
                      <span>{product.sales} sales</span>
                      <span className="font-medium text-slate-900">{product.revenue}</span>
                    </div>
                    <Progress value={(product.sales / 1000) * 100} className="h-2 mt-2" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="border-0 shadow-xl bg-white/70 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-slate-900 flex items-center">
              <Activity className="h-5 w-5 mr-2" />
              Recent Activity
            </CardTitle>
            <CardDescription>Latest store activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-slate-50/80 transition-colors">
                  <div className="w-2 h-2 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900">{activity.action}</p>
                    <p className="text-xs text-slate-500">{activity.user} • {activity.time}</p>
                    {activity.amount && (
                      <Badge variant="outline" className="mt-1 text-xs">
                        {activity.amount}
                      </Badge>
                    )}
                    {activity.rating && (
                      <div className="flex items-center mt-1">
                        {[...Array(activity.rating)].map((_, i) => (
                          <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
