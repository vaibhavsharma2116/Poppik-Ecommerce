import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  Settings, 
  LogOut,
  Menu,
  Search,
  Bell,
  Moon,
  Sun,
  ChevronDown,
  User,
  Shield,
  Activity,
  TrendingUp,
  FolderTree
} from "lucide-react";

const sidebarItems = [
  {
    title: "Dashboard",
    href: "",
    icon: LayoutDashboard,
    badge: null,
  },
  {
    title: "Products",
    href: "/products",
    icon: Package,
    badge: "127",
  },
  {
    title: "Orders",
    href: "/orders",
    icon: ShoppingCart,
    badge: "8",
  },
  {
    title: "Customers",
    href: "/customers",
    icon: Users,
    badge: "1.2k",
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
    badge: null,
  },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  return (
    <div className={cn("flex h-screen", darkMode ? "dark" : "")}>
      {/* Sidebar */}
      <div className={cn(
        "flex flex-col bg-gradient-to-b from-slate-900 to-slate-800 shadow-2xl transition-all duration-300",
        sidebarCollapsed ? "w-16" : "w-72"
      )}>
        {/* Logo */}
        <div className="flex items-center justify-center h-20 px-4 border-b border-slate-700/50">
          {!sidebarCollapsed ? (
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-rose-500 rounded-xl flex items-center justify-center">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">Beauty Admin</h1>
                <p className="text-xs text-slate-400">v2.0 Dashboard</p>
              </div>
            </div>
          ) : (
            <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-rose-500 rounded-xl flex items-center justify-center">
              <Activity className="w-6 h-6 text-white" />
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-6 space-y-1">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href;

            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "group flex items-center px-3 py-3 text-sm font-medium rounded-xl transition-all duration-200",
                  isActive
                    ? "bg-gradient-to-r from-pink-500/20 to-rose-500/20 text-white border border-pink-500/30 shadow-lg"
                    : "text-slate-300 hover:bg-slate-700/50 hover:text-white"
                )}
              >
                <Icon className={cn("flex-shrink-0 transition-colors", sidebarCollapsed ? "w-6 h-6" : "w-5 h-5 mr-4")} />
                {!sidebarCollapsed && (
                  <>
                    <span className="flex-1">{item.title}</span>
                    {item.badge && (
                      <Badge variant="secondary" className="ml-auto bg-slate-700 text-slate-300 text-xs">
                        {item.badge}
                      </Badge>
                    )}
                  </>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-3 py-4 border-t border-slate-700/50">
          <Button 
            variant="ghost" 
            className={cn(
              "w-full text-slate-300 hover:bg-slate-700/50 hover:text-white",
              sidebarCollapsed ? "px-3" : "justify-start"
            )}
          >
            <LogOut className={cn("transition-colors", sidebarCollapsed ? "w-5 h-5" : "w-4 h-4 mr-3")} />
            {!sidebarCollapsed && "Logout"}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden bg-slate-50">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur-sm shadow-sm border-b border-slate-200/60">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="text-slate-600 hover:text-slate-900"
            >
              <Menu className="h-5 w-5" />
            </Button>

            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search anything..."
                className="pl-10 w-64 bg-slate-100/50 border-slate-200 focus:bg-white"
              />
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm" onClick={() => setDarkMode(!darkMode)}>
              {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>

            <Button variant="ghost" size="sm" className="relative">
              <Bell className="h-4 w-4" />
              <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></span>
            </Button>

            <div className="flex items-center space-x-3 border-l border-slate-200 pl-4">
              <div className="relative">
                <div className="w-9 h-9 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full flex items-center justify-center shadow-md">
                  <User className="h-5 w-5 text-white" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-medium text-slate-900">Admin User</p>
                <p className="text-xs text-slate-500">Super Admin</p>
              </div>
              <ChevronDown className="h-4 w-4 text-slate-400" />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gradient-to-br from-slate-50 to-slate-100/50">
          {children}
        </main>
      </div>
    </div>
  );
}