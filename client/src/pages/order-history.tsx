import { useState, useEffect } from "react";
import { Link } from "wouter";
import { ArrowLeft, Package, Truck, CheckCircle, Clock, Eye, Download, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

interface OrderItem {
  id: number;
  name: string;
  quantity: number;
  price: string;
  image: string;
}

interface Order {
  id: string;
  date: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total: string;
  items: OrderItem[];
  trackingNumber?: string;
  estimatedDelivery?: string;
  shippingAddress: string;
  paymentMethod: string;
  userId?: number;
}

export default function OrderHistory() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();

  // Get current user info
  const getCurrentUser = () => {
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  };

  // Fetch orders from backend
  const fetchOrders = async (showRefreshToast = false) => {
    try {
      setRefreshing(true);
      const user = getCurrentUser();

      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please log in to view your order history.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      const response = await fetch(`/api/orders?userId=${user.id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Fetched orders:", data);

        // If no orders from API, create sample orders first
        if (data.length === 0) {
          console.log("No orders found, creating sample orders...");
          await createSampleOrders(user.id);
          // Fetch again after creating sample orders
          const retryResponse = await fetch(`/api/orders?userId=${user.id}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          });
          if (retryResponse.ok) {
            const retryData = await retryResponse.json();
            setOrders(retryData);
          } else {
            setSampleOrders();
          }
        } else {
          setOrders(data);
        }

        if (showRefreshToast) {
          toast({
            title: "Orders Updated",
            description: "Your order history has been refreshed.",
          });
        }
      } else {
        console.log("API response not ok, status:", response.status);
        // Try to create sample orders if none exist
        await createSampleOrders(user.id);
        setSampleOrders();
        if (showRefreshToast) {
          toast({
            title: "Using Sample Data",
            description: "Unable to fetch orders from server. Showing sample data.",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      const user = getCurrentUser();
      if (user) {
        await createSampleOrders(user.id);
      }
      setSampleOrders();
      if (showRefreshToast) {
        toast({
          title: "Connection Error",
          description: "Failed to connect to server. Showing sample data.",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Create sample orders in database
  const createSampleOrders = async (userId: number) => {
    try {
      const response = await fetch('/api/orders/sample', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      if (response.ok) {
        console.log("Sample orders created successfully");
      } else {
        console.log("Failed to create sample orders");
      }
    } catch (error) {
      console.error("Error creating sample orders:", error);
    }
  };

  // Load orders on component mount
  useEffect(() => {
    fetchOrders();
  }, []);

  const setSampleOrders = () => {
    const user = getCurrentUser();
    if (!user) return;

    const sampleOrders: Order[] = [
      {
        id: 'ORD-001',
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'delivered',
        total: '₹1,299',
        items: [
          {
            id: 1,
            name: 'Vitamin C Face Serum',
            quantity: 1,
            price: '₹699',
            image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300'
          },
          {
            id: 2,
            name: 'Hair Growth Serum',
            quantity: 1,
            price: '₹600',
            image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300'
          }
        ],
        trackingNumber: 'TRK001234567',
        estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        shippingAddress: '123 Beauty Street, Mumbai, Maharashtra 400001',
        paymentMethod: 'Credit Card',
        userId: user.id
      },
      {
        id: 'ORD-002',
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'shipped',
        total: '₹899',
        items: [
          {
            id: 3,
            name: 'Anti-Aging Night Cream',
            quantity: 1,
            price: '₹899',
            image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300'
          }
        ],
        trackingNumber: 'TRK001234568',
        estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        shippingAddress: '456 Glow Avenue, Delhi, Delhi 110001',
        paymentMethod: 'UPI',
        userId: user.id
      },
      {
        id: 'ORD-003',
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'processing',
        total: '₹1,599',
        items: [
          {
            id: 4,
            name: 'Hyaluronic Acid Serum',
            quantity: 2,
            price: '₹799',
            image: 'https://images.unsplash.com/photo-1598662779094-110c2bad80b5?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300'
          }
        ],
        trackingNumber: null,
        estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        shippingAddress: '789 Skincare Lane, Bangalore, Karnataka 560001',
        paymentMethod: 'Net Banking',
        userId: user.id
      }
    ];

    setOrders(sampleOrders);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'processing':
        return <Package className="h-4 w-4" />;
      case 'shipped':
        return <Truck className="h-4 w-4" />;
      case 'delivered':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'secondary';
      case 'processing':
        return 'default';
      case 'shipped':
        return 'default';
      case 'delivered':
        return 'default';
      case 'cancelled':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailsOpen(true);
  };

  const handleRefresh = () => {
    fetchOrders(true);
  };

  const handleTrackOrder = (trackingNumber?: string) => {
    if (trackingNumber) {
      toast({
        title: "Tracking Information",
        description: `Tracking number: ${trackingNumber}. Visit courier website for detailed tracking.`,
      });
    }
  };

  const calculateOrderTotal = (items: OrderItem[]) => {
    return items.reduce((total, item) => {
      const price = parseInt(item.price.replace(/[₹,]/g, ""));
      return total + (price * item.quantity);
    }, 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading order history...</p>
        </div>
      </div>
    );
  }

  const user = getCurrentUser();
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-16">
            <Package className="mx-auto h-24 w-24 text-gray-300 mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Login Required</h2>
            <p className="text-gray-600 mb-8">Please log in to view your order history.</p>
            <Link href="/auth/login">
              <Button className="bg-red-600 hover:bg-red-700">
                Login
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-16">
            <Package className="mx-auto h-24 w-24 text-gray-300 mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">No orders yet</h2>
            <p className="text-gray-600 mb-8">You haven't placed any orders yet. Start shopping to see your order history here.</p>
            <div className="flex gap-4 justify-center">
              <Link href="/">
                <Button className="bg-red-600 hover:bg-red-700">
                  Start Shopping
                </Button>
              </Link>
              <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/profile" className="inline-flex items-center text-red-600 hover:text-red-700 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Profile
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Order History</h1>
              <p className="text-gray-600 mt-2">{orders.length} order{orders.length !== 1 ? 's' : ''} found</p>
            </div>
            <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-6">
          {orders.map((order) => (
            <Card key={order.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Order {order.id}</h3>
                    <p className="text-sm text-gray-600">Placed on {new Date(order.date).toLocaleDateString('en-IN')}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-gray-900">{order.total}</p>
                    <Badge variant={getStatusColor(order.status)} className="mt-1">
                      {getStatusIcon(order.status)}
                      <span className="ml-1 capitalize">{order.status}</span>
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex -space-x-2">
                      {order.items.slice(0, 3).map((item, index) => (
                        <img
                          key={index}
                          src={item.image}
                          alt={item.name}
                          className="h-10 w-10 rounded-full border-2 border-white object-cover"
                        />
                      ))}
                      {order.items.length > 3 && (
                        <div className="h-10 w-10 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600">
                          +{order.items.length - 3}
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                      </p>
                      {order.trackingNumber && (
                        <p className="text-xs text-gray-600">
                          Tracking: {order.trackingNumber}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewOrder(order)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View Details
                    </Button>
                    {order.status !== 'delivered' && (
                      <Link href={`/track-order?orderId=${order.id}`}>
                        <Button
                          variant="outline"
                          size="sm"
                        >
                          <Truck className="h-4 w-4 mr-1" />
                          Track Order
                        </Button>
                      </Link>
                    )}
                    {order.status === 'delivered' && (
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-1" />
                        Invoice
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Order Details Modal */}
        <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Order Details - {selectedOrder?.id}</DialogTitle>
              <DialogDescription>
                Complete information about your order
              </DialogDescription>
            </DialogHeader>

            {selectedOrder && (
              <div className="space-y-6">
                {/* Order Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Order Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Order ID:</span>
                        <span className="font-medium">{selectedOrder.id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Date:</span>
                        <span className="font-medium">{new Date(selectedOrder.date).toLocaleDateString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Status:</span>
                        <Badge variant={getStatusColor(selectedOrder.status)}>
                          {getStatusIcon(selectedOrder.status)}
                          <span className="ml-1 capitalize">{selectedOrder.status}</span>
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total:</span>
                        <span className="font-bold text-lg">{selectedOrder.total}</span>
                      </div>
                    </div>
                    {selectedOrder.trackingNumber && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tracking Number:</span>
                        <span className="font-medium">{selectedOrder.trackingNumber}</span>
                      </div>
                    )}
                    {selectedOrder.estimatedDelivery && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Est. Delivery:</span>
                        <span className="font-medium">{new Date(selectedOrder.estimatedDelivery).toLocaleDateString('en-IN')}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Order Items */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Order Items</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {selectedOrder.items.map((item, index) => (
                        <div key={index} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-16 w-16 object-cover rounded-lg"
                          />
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{item.name}</h4>
                            <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-900">{item.price}</p>
                            <p className="text-sm text-gray-600">
                              Total: ₹{parseInt(item.price.replace(/[₹,]/g, "")) * item.quantity}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Shipping & Payment */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Shipping & Payment</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Shipping Address</p>
                      <p className="text-gray-900">{selectedOrder.shippingAddress}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Payment Method</p>
                      <p className="text-gray-900">{selectedOrder.paymentMethod}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}