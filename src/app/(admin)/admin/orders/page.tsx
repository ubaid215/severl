'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import {
  Search,
  Eye,
  Printer,
  Share2,
  ArrowLeft,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  Phone,
  MapPin,
  ChevronDown,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface OrderItem {
  quantity: number;
  price: number;
  total: number;
  variantId?: string | null;       // ✅ ADDED
  variantLabel?: string | null;    // ✅ ADDED — snapshot label from order creation
  foodItem: { name: string };
}

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  deliveryAddress: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  total: number;
  subtotal: number;
  deliveryCharges: number;
  distance?: number;
  notes?: string;
  createdAt: string;
  items: OrderItem[];
}

interface StatusCount {
  status: string;
  _count: { id: number };
}

// ─── Constants ────────────────────────────────────────────────────────────────

const ALL_STATUSES = [
  'PENDING',
  'CONFIRMED',
  'PREPARING',
  'READY',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
  'CANCELLED',
] as const;

type OrderStatus = (typeof ALL_STATUSES)[number];

const STATUS_META: Record<
  OrderStatus,
  { label: string; icon: React.ReactNode; pill: string }
> = {
  PENDING: {
    label: 'Pending',
    icon: <Clock size={14} className="text-yellow-400" />,
    pill: 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30',
  },
  CONFIRMED: {
    label: 'Confirmed',
    icon: <CheckCircle size={14} className="text-blue-400" />,
    pill: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
  },
  PREPARING: {
    label: 'Preparing',
    icon: <Package size={14} className="text-orange-400" />,
    pill: 'bg-orange-500/15 text-orange-300 border-orange-500/30',
  },
  READY: {
    label: 'Ready',
    icon: <CheckCircle size={14} className="text-sky-400" />,
    pill: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
  },
  OUT_FOR_DELIVERY: {
    label: 'Out for Delivery',
    icon: <Truck size={14} className="text-purple-400" />,
    pill: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
  },
  DELIVERED: {
    label: 'Delivered',
    icon: <CheckCircle size={14} className="text-green-400" />,
    pill: 'bg-green-600/15 text-green-400 border-green-600/30',
  },
  CANCELLED: {
    label: 'Cancelled',
    icon: <XCircle size={14} className="text-red-400" />,
    pill: 'bg-red-500/15 text-red-300 border-red-500/30',
  },
};

// ─── Portal Dropdown ──────────────────────────────────────────────────────────

interface StatusDropdownProps {
  order: Order;
  isUpdating: boolean;
  onUpdate: (orderId: string, status: string) => void;
}

function StatusDropdown({ order, isUpdating, onUpdate }: StatusDropdownProps) {
  const [open, setOpen] = useState(false);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const meta = STATUS_META[order.status as OrderStatus] ?? {
    label: order.status,
    icon: <Package size={14} />,
    pill: 'bg-gray-500/15 text-gray-300 border-gray-500/30',
  };

  const openDropdown = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const dropdownH = ALL_STATUSES.length * 40;

    if (spaceBelow < dropdownH && rect.top > dropdownH) {
      setDropdownStyle({
        position: 'fixed',
        bottom: window.innerHeight - rect.top + 4,
        left: rect.left,
        minWidth: 190,
        zIndex: 9999,
      });
    } else {
      setDropdownStyle({
        position: 'fixed',
        top: rect.bottom + 4,
        left: rect.left,
        minWidth: 190,
        zIndex: 9999,
      });
    }
    setOpen(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (
        triggerRef.current?.contains(e.target as Node) ||
        dropdownRef.current?.contains(e.target as Node)
      )
        return;
      setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    window.addEventListener('scroll', close, true);
    window.addEventListener('resize', close);
    return () => {
      window.removeEventListener('scroll', close, true);
      window.removeEventListener('resize', close);
    };
  }, [open]);

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    open ? setOpen(false) : openDropdown();
  };

  const handleSelect = (e: React.MouseEvent, status: string) => {
    e.preventDefault();
    e.stopPropagation();
    setOpen(false);
    if (status !== order.status) onUpdate(order.id, status);
  };

  return (
    <>
      <button
        ref={triggerRef}
        onClick={handleToggle}
        disabled={isUpdating}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-opacity select-none
          ${meta.pill}
          ${isUpdating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:opacity-75'}`}
      >
        {isUpdating ? (
          <span className="inline-block h-3 w-3 rounded-full border border-current border-t-transparent animate-spin" />
        ) : (
          meta.icon
        )}
        <span>{meta.label}</span>
        <ChevronDown
          size={11}
          className={`transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open &&
        createPortal(
          <div
            ref={dropdownRef}
            style={{ ...dropdownStyle, backgroundColor: '#1a1d23' }}
            className="rounded-xl border border-gray-700 shadow-2xl overflow-hidden"
          >
            {ALL_STATUSES.map((status) => {
              const m = STATUS_META[status];
              const active = order.status === status;
              return (
                <button
                  key={status}
                  onMouseDown={(e) => handleSelect(e, status)}
                  className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm transition-colors text-left
                    ${active ? 'bg-yellow-500/10 text-yellow-300' : 'text-gray-200 hover:bg-white/5'}`}
                >
                  {m.icon}
                  {m.label}
                  {active && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-yellow-400" />
                  )}
                </button>
              );
            })}
          </div>,
          document.body
        )}
    </>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getTotalItems(order: Order) {
  return order.items.reduce((t, item) => t + item.quantity, 0);
}

// ✅ Helper to build display name with size label
function getItemDisplayName(item: OrderItem): string {
  if (item.variantLabel) return `${item.foodItem.name} (${item.variantLabel})`;
  return item.foodItem.name;
}

function filterByDate(order: Order, filter: string) {
  if (filter === 'all') return true;
  const orderDate = new Date(order.createdAt);
  const now = new Date();
  if (filter === 'today') return orderDate.toDateString() === now.toDateString();
  if (filter === 'week') {
    const cutoff = new Date(now);
    cutoff.setDate(cutoff.getDate() - 7);
    return orderDate >= cutoff;
  }
  if (filter === 'month') {
    const cutoff = new Date(now);
    cutoff.setMonth(cutoff.getMonth() - 1);
    return orderDate >= cutoff;
  }
  return true;
}

function shareOrderWithRider(order: Order) {
  const lines = [
    '🛵 NEW DELIVERY ORDER',
    '',
    `📦 Order #${order.orderNumber}`,
    `📅 ${new Date(order.createdAt).toLocaleDateString('en-IN')} ${new Date(
      order.createdAt
    ).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`,
    '',
    '👤 CUSTOMER INFO:',
    `Name: ${order.customerName}`,
    `Phone: ${order.customerPhone}`,
    `📍 Address: ${order.deliveryAddress}`,
    order.distance ? `📏 Distance: ${order.distance} km` : '',
    '',
    '🍽️ ORDER ITEMS:',
    // ✅ Include size label in rider message
    ...order.items.map((item) =>
      `• ${item.quantity}x ${getItemDisplayName(item)}`
    ),
    '',
    '💰 PAYMENT:',
    `Method: ${order.paymentMethod.replace(/_/g, ' ')}`,
    `Status: ${order.paymentStatus}`,
    `Total: Rs ${order.total} ${order.paymentStatus === 'PENDING' ? '(COLLECT CASH)' : '(PAID ONLINE)'}`,
    order.notes ? `\n📝 SPECIAL NOTES:\n${order.notes}` : '',
    '',
    `⏰ Status: ${order.status.replace(/_/g, ' ')}`,
  ]
    .filter((l) => l !== '')
    .join('\n')
    .trim();

  window.open(`https://wa.me/?text=${encodeURIComponent(lines)}`, '_blank');
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [statusCounts, setStatusCounts] = useState<StatusCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const res = await fetch('/api/orders', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.orders) setOrders(data.orders);
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStatusCounts = useCallback(async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const res = await fetch('/api/orders/status-counts', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.statusCounts) setStatusCounts(data.statusCounts);
    } catch (err) {
      console.error('Error fetching status counts:', err);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
    fetchStatusCounts();
  }, [fetchOrders, fetchStatusCounts]);

  const updateOrderStatus = useCallback(
    async (orderId: string, newStatus: string) => {
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
      setUpdatingOrderId(orderId);
      try {
        const token = localStorage.getItem('admin_token');
        const res = await fetch(`/api/orders/${orderId}/status`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: newStatus }),
        });
        if (!res.ok) {
          fetchOrders();
        } else {
          fetchStatusCounts();
        }
      } catch (err) {
        console.error('Error updating order status:', err);
        fetchOrders();
      } finally {
        setUpdatingOrderId(null);
      }
    },
    [fetchOrders, fetchStatusCounts]
  );

  const filteredOrders = useMemo(() => {
    const q = searchTerm.toLowerCase();
    return orders.filter((order) => {
      const matchesSearch =
        !q ||
        order.orderNumber.toLowerCase().includes(q) ||
        order.customerName.toLowerCase().includes(q) ||
        order.customerPhone.includes(q);
      const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
      const matchesDate = filterByDate(order, dateFilter);
      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [orders, searchTerm, statusFilter, dateFilter]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div className="flex items-center mb-4 md:mb-0">
            <button
              onClick={() => router.push('/admin')}
              className="flex items-center text-yellow-500 mr-4 hover:text-yellow-400 transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-2xl md:text-3xl font-bold text-yellow-500">
              Orders Management
            </h1>
          </div>
        </div>

        {/* Status Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2 md:gap-3 mb-6">
          {ALL_STATUSES.map((status) => {
            const count = statusCounts.find((s) => s.status === status)?._count.id ?? 0;
            const m = STATUS_META[status];
            return (
              <button
                key={status}
                onClick={() => setStatusFilter((prev) => prev === status ? 'all' : status)}
                className={`bg-[#1A1C20] p-3 md:p-4 rounded-xl text-center border transition-all hover:border-gray-500
                  ${statusFilter === status ? 'border-yellow-500/60 bg-yellow-500/5' : 'border-transparent'}`}
              >
                <div className="flex justify-center mb-1.5">{m.icon}</div>
                <div className="text-lg md:text-2xl font-bold text-white">{count}</div>
                <div className="text-[10px] md:text-xs text-gray-400 leading-tight mt-0.5">{m.label}</div>
              </button>
            );
          })}
        </div>

        {/* Filters */}
        <div className="bg-[#1A1C20] p-4 md:p-5 rounded-xl mb-6 border border-gray-800">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
              <input
                type="text"
                placeholder="Search by order #, name, phone…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-800/60 border border-gray-700 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-gray-500
                  focus:outline-none focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500 transition-colors"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-gray-800/60 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white
                focus:outline-none focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500 transition-colors"
            >
              <option value="all">All Statuses</option>
              {ALL_STATUSES.map((s) => (
                <option key={s} value={s}>{STATUS_META[s].label}</option>
              ))}
            </select>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="bg-gray-800/60 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white
                focus:outline-none focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500 transition-colors"
            >
              <option value="all">All Dates</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block bg-[#1A1C20] rounded-xl border border-gray-800 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-800/60 text-left">
                {['Order #', 'Customer', 'Items', 'Total', 'Status', 'Date', 'Actions'].map((h) => (
                  <th key={h} className="px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-800/30 transition-colors">
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <span className="text-sm font-semibold text-yellow-400">{order.orderNumber}</span>
                  </td>
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <div className="text-sm font-medium text-white">{order.customerName}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{order.customerPhone}</div>
                  </td>

                  {/* ✅ Items column now shows size labels */}
                  <td className="px-5 py-3.5">
                    <div className="space-y-0.5">
                      {order.items.map((item, i) => (
                        <div key={i} className="flex items-center gap-1.5 text-xs text-gray-300">
                          <span className="text-yellow-500 font-semibold">{item.quantity}×</span>
                          <span>{item.foodItem.name}</span>
                          {item.variantLabel && (
                            <span className="bg-yellow-500/15 text-yellow-400 border border-yellow-500/25 px-1.5 py-0.5 rounded text-[10px] font-medium">
                              {item.variantLabel}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </td>

                  <td className="px-5 py-3.5 whitespace-nowrap text-sm font-medium text-white">
                    Rs {order.total.toLocaleString('en-PK')}
                  </td>
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <StatusDropdown
                      order={order}
                      isUpdating={updatingOrderId === order.id}
                      onUpdate={updateOrderStatus}
                    />
                  </td>
                  <td className="px-5 py-3.5 whitespace-nowrap text-xs text-gray-400">
                    {formatDate(order.createdAt)}
                  </td>
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => router.push(`/admin/orders/${order.id}`)}
                        className="p-1.5 bg-blue-500/10 border border-blue-500/30 rounded-lg hover:bg-blue-500/20 transition-colors"
                        title="View Details"
                      >
                        <Eye size={15} className="text-blue-400" />
                      </button>
                      <button
                        onClick={() => window.open(`/api/orders/${order.id}/slip?format=thermal`, '_blank')}
                        className="p-1.5 bg-green-500/10 border border-green-500/30 rounded-lg hover:bg-green-500/20 transition-colors"
                        title="Print Slip"
                      >
                        <Printer size={15} className="text-green-400" />
                      </button>
                      <button
                        onClick={() => shareOrderWithRider(order)}
                        className="p-1.5 bg-orange-500/10 border border-orange-500/30 rounded-lg hover:bg-orange-500/20 transition-colors"
                        title="Share with Rider"
                      >
                        <Share2 size={15} className="text-orange-400" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-3">
          {filteredOrders.map((order) => (
            <div key={order.id} className="bg-[#1A1C20] rounded-xl p-4 border border-gray-800">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-yellow-400 font-semibold text-base leading-tight">{order.orderNumber}</h3>
                  <p className="text-gray-500 text-xs mt-0.5">{formatDate(order.createdAt)}</p>
                </div>
                <StatusDropdown
                  order={order}
                  isUpdating={updatingOrderId === order.id}
                  onUpdate={updateOrderStatus}
                />
              </div>

              <div className="mb-3 space-y-1">
                <div className="text-white text-sm font-medium">{order.customerName}</div>
                <div className="flex items-center gap-1 text-gray-400 text-xs">
                  <Phone size={11} />
                  {order.customerPhone}
                </div>
                {order.deliveryAddress && (
                  <div className="flex items-start gap-1 text-gray-400 text-xs">
                    <MapPin size={11} className="mt-0.5 flex-shrink-0" />
                    <span className="line-clamp-2">{order.deliveryAddress}</span>
                  </div>
                )}
              </div>

              {/* ✅ Mobile: items with size badges */}
              <div className="mb-3 bg-gray-800/40 rounded-lg p-2.5 space-y-1.5">
                {order.items.map((item, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="text-yellow-500 font-bold">{item.quantity}×</span>
                      <span className="text-gray-200">{item.foodItem.name}</span>
                      {item.variantLabel && (
                        <span className="bg-yellow-500/15 text-yellow-400 border border-yellow-500/25 px-1.5 py-0.5 rounded text-[10px] font-medium">
                          {item.variantLabel}
                        </span>
                      )}
                    </div>
                    <span className="text-gray-400">Rs {item.total}</span>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                <div>
                  <p className="text-gray-500 text-xs">Total</p>
                  <p className="text-white font-medium">Rs {order.total.toLocaleString('en-PK')}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Payment</p>
                  <p className="text-white text-xs capitalize">{order.paymentMethod.replace(/_/g, ' ')}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Pay Status</p>
                  <p className={`text-xs font-semibold ${order.paymentStatus === 'PAID' ? 'text-green-400' : 'text-yellow-400'}`}>
                    {order.paymentStatus}
                  </p>
                </div>
                {order.distance && (
                  <div>
                    <p className="text-gray-500 text-xs">Distance</p>
                    <p className="text-white text-xs">{order.distance} km</p>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => router.push(`/admin/orders/${order.id}`)}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-blue-500/10 border border-blue-500/30
                    text-blue-300 px-3 py-2 rounded-lg hover:bg-blue-500/20 transition-colors text-sm font-medium"
                >
                  <Eye size={14} />
                  View
                </button>
                <button
                  onClick={() => window.open(`/api/orders/${order.id}/slip?format=thermal`, '_blank')}
                  className="flex items-center justify-center bg-green-500/10 border border-green-500/30
                    text-green-300 px-3 py-2 rounded-lg hover:bg-green-500/20 transition-colors"
                  title="Print"
                >
                  <Printer size={14} />
                </button>
                <button
                  onClick={() => shareOrderWithRider(order)}
                  className="flex items-center justify-center bg-orange-500/10 border border-orange-500/30
                    text-orange-300 px-3 py-2 rounded-lg hover:bg-orange-500/20 transition-colors"
                  title="Share with Rider"
                >
                  <Share2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredOrders.length === 0 && (
          <div className="text-center py-16">
            <Package size={56} className="text-gray-700 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No orders found</p>
            <p className="text-gray-600 text-sm mt-1">Try adjusting your filters</p>
          </div>
        )}
      </div>
    </div>
  );
}