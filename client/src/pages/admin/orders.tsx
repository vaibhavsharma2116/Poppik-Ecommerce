
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Eye, 
  Search, 
  Filter, 
  Download, 
  MoreVertical,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Truck,
  DollarSign,
  Calendar,
  User,
  Phone,
  Mail,
  MapPin
} from "lucide-react";

interface Order {
  id: string;
  customer: {
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  date: string;
  total: string;
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  items: number;
  paymentMethod: string;
  trackingNumber?: string;
  estimatedDelivery?: string;
  products: Array<{
    name: string;
    quantity: number;
    price: string;
    image: string;
  }>;
}

export default function AdminOrders() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const orders: Order[] = [
    { 
      id: '#ORD-001', 
      customer: {
        name: 'Sarah Johnson',
        email: 'sarah@example.com',
        phone: '+1 234-567-8901',
        address: '123 Beauty Street, Cosmetic City, CC 12345'
      },
      date: '2024-01-15', 
      total: '$87.96', 
      status: 'Delivered', 
      items: 3,
      paymentMethod: 'Credit Card',
      trackingNumber: 'DP123456789',
      estimatedDelivery: '2024-01-18',
      products: [
        { name: 'Vitamin C Serum', quantity: 1, price: '$29.99', image: '/api/placeholder/50/50' },
        { name: 'Moisturizer', quantity: 2, price: '$28.99', image: '/api/placeholder/50/50' }
      ]
    },
    { 
      id: '#ORD-002', 
      customer: {
        name: 'Emily Davis',
        email: 'emily@example.com',
        phone: '+1 234-567-8902',
        address: '456 Glow Avenue, Beauty Town, BT 67890'
      },
      date: '2024-01-14', 
      total: '$45.99', 
      status: 'Processing', 
      items: 2,
      paymentMethod: 'PayPal',
      estimatedDelivery: '2024-01-20',
      products: [
        { name: 'Face Mask', quantity: 1, price: '$25.99', image: '/api/placeholder/50/50' },
        { name: 'Cleanser', quantity: 1, price: '$20.00', image: '/api/placeholder/50/50' }
      ]
    },
    { 
      id: '#ORD-003', 
      customer: {
        name: 'Jessica Brown',
        email: 'jessica@example.com',
        phone: '+1 234-567-8903',
        address: '789 Skincare Lane, Wellness City, WC 54321'
      },
      date: '2024-01-14', 
      total: '$129.97', 
      status: 'Shipped', 
      items: 4,
      paymentMethod: 'Credit Card',
      trackingNumber: 'DP987654321',
      estimatedDelivery: '2024-01-19',
      products: [
        { name: 'Anti-Aging Cream', quantity: 1, price: '$49.99', image: '/api/placeholder/50/50' },
        { name: 'Eye Serum', quantity: 2, price: '$39.99', image: '/api/placeholder/50/50' }
      ]
    },
    { 
      id: '#ORD-004', 
      customer: {
        name: 'Amanda Wilson',
        email: 'amanda@example.com',
        phone: '+1 234-567-8904',
        address: '321 Natural Boulevard, Organic City, OC 98765'
      },
      date: '2024-01-13', 
      total: '$67.98', 
      status: 'Pending', 
      items: 3,
      paymentMethod: 'Bank Transfer',
      estimatedDelivery: '2024-01-22',
      products: [
        { name: 'Sunscreen', quantity: 2, price: '$22.99', image: '/api/placeholder/50/50' },
        { name: 'Lip Balm', quantity: 1, price: '$22.00', image: '/api/placeholder/50/50' }
      ]
    },
    { 
      id: '#ORD-005', 
      customer: {
        name: 'Rachel Garcia',
        email: 'rachel@example.com',
        phone: '+1 234-567-8905',
        address: '654 Radiance Road, Glow City, GC 13579'
      },
      date: '2024-01-13', 
      total: '$34.99', 
      status: 'Cancelled', 
      items: 1,
      paymentMethod: 'Credit Card',
      products: [
        { name: 'Night Cream', quantity: 1, price: '$34.99', image: '/api/placeholder/50/50' }
      ]
    },
  ];

  // Filter orders based on search term, status, and date
  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customer.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || order.status.toLowerCase() === statusFilter.toLowerCase();
    
    // Date filtering logic can be enhanced based on requirements
    const matchesDate = dateFilter === 'all' || true; // Simplified for demo
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  // Calculate stats
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => o.status === 'Pending').length;
  const processingOrders = orders.filter(o => o.status === 'Processing').length;
  const shippedOrders = orders.filter(o => o.status === 'Shipped').length;
  const deliveredOrders = orders.filter(o => o.status === 'Delivered').length;

  const totalRevenue = orders.reduce((sum, order) => sum + parseFloat(order.total.replace('$', '')), 0);

  const stats = [
    { label: "Total Orders", value: totalOrders.toString(), icon: Package, color: "from-blue-500 to-cyan-500" },
    { label: "Pending", value: pendingOrders.toString(), icon: Clock, color: "from-yellow-500 to-orange-500" },
    { label: "Processing", value: processingOrders.toString(), icon: AlertCircle, color: "from-purple-500 to-pink-500" },
    { label: "Revenue", value: `$${totalRevenue.toFixed(2)}`, icon: DollarSign, color: "from-green-500 to-emerald-500" },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Pending': return <Clock className="h-4 w-4" />;
      case 'Processing': return <AlertCircle className="h-4 w-4" />;
      case 'Shipped': return <Truck className="h-4 w-4" />;
      case 'Delivered': return <CheckCircle className="h-4 w-4" />;
      case 'Cancelled': return <XCircle className="h-4 w-4" />;
      default: return <Package className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Delivered': return 'default';
      case 'Shipped': return 'secondary';
      case 'Processing': return 'outline';
      case 'Pending': return 'destructive';
      case 'Cancelled': return 'destructive';
      default: return 'outline';
    }
  };

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailsOpen(true);
  };

  const handleStatusChange = (orderId: string, newStatus: string) => {
    // Implementation for status change
    const updatedOrders = orders.map(order => 
      order.id === orderId ? { ...order, status: newStatus as Order['status'] } : order
    );
    console.log(`Order ${orderId} status changed to ${newStatus}`);
    // In a real app, you would update the state and make an API call here
  };

  const handleUpdateTracking = (order: Order) => {
    const trackingNumber = prompt('Enter tracking number:');
    if (trackingNumber) {
      console.log(`Updating tracking for order ${order.id} with tracking number: ${trackingNumber}`);
      // In a real app, you would update the order with the new tracking number
    }
  };

  const handleSendNotification = (order: Order) => {
    const notificationTypes = ['Order Confirmation', 'Shipping Update', 'Delivery Notification'];
    const notificationType = prompt(`Select notification type:\n${notificationTypes.map((type, index) => `${index + 1}. ${type}`).join('\n')}`);
    
    if (notificationType) {
      console.log(`Sending notification to ${order.customer.email} for order ${order.id}`);
      // In a real app, you would send an email notification
    }
  };

  const handleDownloadInvoice = (order: Order) => {
    // Create a simple invoice content
    const invoiceContent = `
INVOICE
Order ID: ${order.id}
Customer: ${order.customer.name}
Date: ${order.date}
Total: ${order.total}
Status: ${order.status}

Products:
${order.products.map(product => `- ${product.name} (Qty: ${product.quantity}) - ${product.price}`).join('\n')}

Customer Information:
Name: ${order.customer.name}
Email: ${order.customer.email}
Phone: ${order.customer.phone}
Address: ${order.customer.address}
    `;

    // Create and download the invoice
    const element = document.createElement('a');
    const file = new Blob([invoiceContent], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `invoice-${order.id}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
            Order Management
          </h2>
          <p className="text-slate-600 mt-1">Track and manage customer orders efficiently</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">{stat.label}</p>
                    <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color}`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filters and Search */}
      <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <Input
                  placeholder="Search orders by ID, customer name, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="quarter">This Quarter</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Recent Orders ({filteredOrders.length})
          </CardTitle>
          <CardDescription>Manage customer orders and track their status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-slate-200/60 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/80">
                  <TableHead className="font-semibold">Order ID</TableHead>
                  <TableHead className="font-semibold">Customer</TableHead>
                  <TableHead className="font-semibold">Date</TableHead>
                  <TableHead className="font-semibold">Items</TableHead>
                  <TableHead className="font-semibold">Total</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold">Payment</TableHead>
                  <TableHead className="font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order.id} className="hover:bg-slate-50/60">
                    <TableCell className="font-medium text-slate-900">{order.id}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium text-slate-900">{order.customer.name}</div>
                        <div className="text-sm text-slate-500">{order.customer.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center text-slate-600">
                        <Calendar className="h-4 w-4 mr-1" />
                        {order.date}
                      </div>
                    </TableCell>
                    <TableCell>{order.items} items</TableCell>
                    <TableCell className="font-semibold text-slate-900">{order.total}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={getStatusColor(order.status)}
                        className="flex items-center gap-1 w-fit"
                      >
                        {getStatusIcon(order.status)}
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-slate-600">{order.paymentMethod}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleViewOrder(order)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Select onValueChange={(value) => handleStatusChange(order.id, value)}>
                          <SelectTrigger className="w-[100px] h-8">
                            <MoreVertical className="h-4 w-4" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="processing">Processing</SelectItem>
                            <SelectItem value="shipped">Shipped</SelectItem>
                            <SelectItem value="delivered">Delivered</SelectItem>
                            <SelectItem value="cancelled">Cancel</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Order Details Modal */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Order Details - {selectedOrder?.id}
            </DialogTitle>
            <DialogDescription>
              Complete information about the selected order
            </DialogDescription>
          </DialogHeader>
          
          {selectedOrder && (
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="customer">Customer</TabsTrigger>
                <TabsTrigger value="products">Products</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Order Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Order ID:</span>
                        <span className="font-medium">{selectedOrder.id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Date:</span>
                        <span className="font-medium">{selectedOrder.date}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Status:</span>
                        <Badge variant={getStatusColor(selectedOrder.status)}>
                          {getStatusIcon(selectedOrder.status)}
                          {selectedOrder.status}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Total Amount:</span>
                        <span className="font-bold text-lg">{selectedOrder.total}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Payment Method:</span>
                        <span className="font-medium">{selectedOrder.paymentMethod}</span>
                      </div>
                      {selectedOrder.trackingNumber && (
                        <div className="flex justify-between">
                          <span className="text-slate-600">Tracking Number:</span>
                          <span className="font-medium">{selectedOrder.trackingNumber}</span>
                        </div>
                      )}
                      {selectedOrder.estimatedDelivery && (
                        <div className="flex justify-between">
                          <span className="text-slate-600">Est. Delivery:</span>
                          <span className="font-medium">{selectedOrder.estimatedDelivery}</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Button 
                        className="w-full justify-start" 
                        variant="outline"
                        onClick={() => handleUpdateTracking(selectedOrder)}
                      >
                        <Truck className="h-4 w-4 mr-2" />
                        Update Tracking
                      </Button>
                      <Button 
                        className="w-full justify-start" 
                        variant="outline"
                        onClick={() => handleSendNotification(selectedOrder)}
                      >
                        <Mail className="h-4 w-4 mr-2" />
                        Send Notification
                      </Button>
                      <Button 
                        className="w-full justify-start" 
                        variant="outline"
                        onClick={() => handleDownloadInvoice(selectedOrder)}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download Invoice
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="customer" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Customer Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-slate-600">Customer Name</Label>
                        <p className="font-medium">{selectedOrder.customer.name}</p>
                      </div>
                      <div>
                        <Label className="text-slate-600">Email Address</Label>
                        <p className="font-medium flex items-center gap-1">
                          <Mail className="h-4 w-4" />
                          {selectedOrder.customer.email}
                        </p>
                      </div>
                      <div>
                        <Label className="text-slate-600">Phone Number</Label>
                        <p className="font-medium flex items-center gap-1">
                          <Phone className="h-4 w-4" />
                          {selectedOrder.customer.phone}
                        </p>
                      </div>
                      <div>
                        <Label className="text-slate-600">Shipping Address</Label>
                        <p className="font-medium flex items-start gap-1">
                          <MapPin className="h-4 w-4 mt-0.5" />
                          {selectedOrder.customer.address}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="products" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Ordered Products</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {selectedOrder.products.map((product, index) => (
                        <div key={index} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                              <Package className="h-6 w-6 text-slate-400" />
                            </div>
                            <div>
                              <p className="font-medium">{product.name}</p>
                              <p className="text-sm text-slate-600">Quantity: {product.quantity}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{product.price}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
