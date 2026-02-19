import { useState, useEffect } from 'react';
import { Package, Clock, CheckCircle, Bell, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import {
  getPreOrderOrders,
  updateItemStatus,
  notifyPreOrderReady,
} from './orders/services/orderService';

const PreOrders = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [expandedOrders, setExpandedOrders] = useState(new Set());
  const [updatingItems, setUpdatingItems] = useState(new Set());

  useEffect(() => {
    fetchPreOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [orders, activeTab]);

  const fetchPreOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getPreOrderOrders();
      setOrders(response.orders || []);
    } catch (err) {
      setError(err.message || 'Không thể tải danh sách pre-order');
      toast.error('Không thể tải danh sách pre-order');
    } finally {
      setLoading(false);
    }
  };

  const filterOrders = () => {
    if (activeTab === 'all') {
      setFilteredOrders(orders);
    } else if (activeTab === 'pending') {
      setFilteredOrders(
        orders.filter((order) =>
          order.cartItems.some((item) => item.itemStatus === 'preorder_pending')
        )
      );
    } else if (activeTab === 'ready') {
      setFilteredOrders(
        orders.filter((order) =>
          order.cartItems.some((item) => item.itemStatus === 'preorder_ready')
        )
      );
    }
  };

  const toggleOrderExpansion = (orderId) => {
    const newExpanded = new Set(expandedOrders);
    if (newExpanded.has(orderId)) {
      newExpanded.delete(orderId);
    } else {
      newExpanded.add(orderId);
    }
    setExpandedOrders(newExpanded);
  };

  const handleUpdateItemStatus = async (orderId, itemIndex, newStatus) => {
    const itemKey = `${orderId}-${itemIndex}`;
    try {
      setUpdatingItems((prev) => new Set(prev).add(itemKey));
      await updateItemStatus(orderId, itemIndex, newStatus);
      toast.success('Cập nhật trạng thái thành công');
      await fetchPreOrders();
    } catch (err) {
      toast.error(err.message || 'Không thể cập nhật trạng thái');
    } finally {
      setUpdatingItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(itemKey);
        return newSet;
      });
    }
  };

  const handleNotifyCustomer = async (orderId) => {
    try {
      await notifyPreOrderReady(orderId);
      toast.success('Đã gửi thông báo cho khách hàng');
    } catch (err) {
      toast.error(err.message || 'Không thể gửi thông báo');
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const formatDate = (dateString) => {
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateString));
  };

  const getItemStatusBadge = (status) => {
    const statusConfig = {
      preorder_pending: { label: 'Đang chờ', variant: 'secondary', icon: Clock },
      preorder_ready: { label: 'Đã về', variant: 'success', icon: CheckCircle },
      available: { label: 'Có sẵn', variant: 'default', icon: Package },
      shipped: { label: 'Đã gửi', variant: 'default', icon: Package },
    };

    const config = statusConfig[status] || statusConfig.available;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const countItemsByStatus = (status) => {
    if (status === 'all') return orders.length;
    return orders.filter((order) =>
      order.cartItems.some((item) => item.itemStatus === status)
    ).length;
  };

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (error && orders.length === 0) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Quản lý Pre-Order</h1>
        <p className="text-muted-foreground mt-2">
          Theo dõi và cập nhật trạng thái các sản phẩm đặt trước
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">
            Tất cả ({countItemsByStatus('all')})
          </TabsTrigger>
          <TabsTrigger value="pending">
            Đang chờ ({countItemsByStatus('preorder_pending')})
          </TabsTrigger>
          <TabsTrigger value="ready">
            Đã về ({countItemsByStatus('preorder_ready')})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4 mt-6">
          {filteredOrders.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  Không có đơn hàng pre-order nào
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredOrders.map((order) => {
              const isExpanded = expandedOrders.has(order._id);
              const preOrderItems = order.cartItems.filter(
                (item) => item.isPreOrder
              );
              const hasReadyItems = preOrderItems.some(
                (item) => item.itemStatus === 'preorder_ready'
              );

              return (
                <Card key={order._id}>
                  <CardHeader className="cursor-pointer" onClick={() => toggleOrderExpansion(order._id)}>
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <span>#{order.orderNumber}</span>
                          <Badge variant="outline">{order.status}</Badge>
                        </CardTitle>
                        <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                          <p>Khách hàng: {order.customer?.fullname}</p>
                          <p>Ngày đặt: {formatDate(order.createdAt)}</p>
                          <p>Tổng tiền: {formatPrice(order.total)}</p>
                          <p>
                            Số sản phẩm pre-order:{' '}
                            {preOrderItems.length} / {order.cartItems.length}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {hasReadyItems && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleNotifyCustomer(order._id);
                            }}
                          >
                            <Bell className="h-4 w-4 mr-2" />
                            Thông báo
                          </Button>
                        )}
                        {isExpanded ? (
                          <ChevronUp className="h-5 w-5" />
                        ) : (
                          <ChevronDown className="h-5 w-5" />
                        )}
                      </div>
                    </div>
                  </CardHeader>

                  {isExpanded && (
                    <CardContent className="border-t">
                      <div className="space-y-4 pt-4">
                        <h4 className="font-semibold">Sản phẩm Pre-Order:</h4>
                        {preOrderItems.map((item, index) => {
                          const originalIndex = order.cartItems.findIndex(
                            (ci) => ci._id === item._id
                          );
                          const itemKey = `${order._id}-${originalIndex}`;
                          const isUpdating = updatingItems.has(itemKey);

                          return (
                            <div
                              key={item._id}
                              className="flex items-center gap-4 p-4 border rounded-lg"
                            >
                              <img
                                src={item.product?.images?.[0] || '/placeholder.jpg'}
                                alt={item.name}
                                className="w-20 h-20 object-cover rounded"
                              />
                              <div className="flex-1">
                                <h5 className="font-medium">{item.name}</h5>
                                <p className="text-sm text-muted-foreground">
                                  Số lượng: {item.quantity} x {formatPrice(item.price)}
                                </p>
                                <div className="mt-2">
                                  {getItemStatusBadge(item.itemStatus)}
                                </div>
                              </div>
                              <div className="flex gap-2">
                                {item.itemStatus === 'preorder_pending' && (
                                  <Button
                                    size="sm"
                                    onClick={() =>
                                      handleUpdateItemStatus(
                                        order._id,
                                        originalIndex,
                                        'preorder_ready'
                                      )
                                    }
                                    disabled={isUpdating}
                                  >
                                    {isUpdating ? (
                                      'Đang xử lý...'
                                    ) : (
                                      <>
                                        <CheckCircle className="h-4 w-4 mr-2" />
                                        Đánh dấu đã về
                                      </>
                                    )}
                                  </Button>
                                )}
                                {item.itemStatus === 'preorder_ready' && (
                                  <Badge variant="success" className="gap-1">
                                    <CheckCircle className="h-4 w-4" />
                                    Sẵn sàng giao
                                  </Badge>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  )}
                </Card>
              );
            })
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PreOrders;
