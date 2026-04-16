'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Plus, Minus, Search, X, ArrowLeft, User, Phone, MapPin, Mail,
  ShoppingCart, Package, CheckCircle, AlertCircle, Keyboard,
  HelpCircle, ChevronRight, Zap, CreditCard, Banknote, Receipt, Trash2,
} from 'lucide-react';

/* ─── Types ─────────────────────────────────────────── */
interface Variant {
  id: string;
  label: string;
  price: number;
  isDefault: boolean;
  isActive: boolean;
  sortOrder: number;
}

interface FoodItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: { name: string };
  variants: Variant[];
}

interface CartItem {
  foodItem: FoodItem;
  quantity: number;
  price: number;
  total: number;
  variantId?: string;
  variantLabel?: string;
}

interface CustomerInfo {
  name: string;
  phone: string;
  email: string;
  address: string;
  latitude?: number;
  longitude?: number;
}

interface Toast {
  id: string;
  type: 'success' | 'error';
  message: string;
}

/* ─── Shortcut badge ─────────────────────────────────── */
const Kbd = ({ children }: { children: React.ReactNode }) => (
  <kbd style={{ display:'inline-flex',alignItems:'center',justifyContent:'center',background:'#2a2d35',border:'1px solid #3a3d47',borderBottom:'3px solid #1a1d25',borderRadius:5,padding:'2px 6px',fontSize:11,fontFamily:'monospace',color:'#f5c842',lineHeight:1.4 }}>
    {children}
  </kbd>
);

/* ─── Variant Picker Modal ───────────────────────────── */
function VariantPickerModal({
  item,
  onAdd,
  onClose,
}: {
  item: FoodItem;
  onAdd: (item: FoodItem, variant: Variant) => void;
  onClose: () => void;
}) {
  const activeVariants = item.variants.filter((v) => v.isActive).sort((a, b) => a.sortOrder - b.sortOrder);
  const defaultVariant = activeVariants.find((v) => v.isDefault) ?? activeVariants[0];
  const [selected, setSelected] = useState<Variant>(defaultVariant);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Enter') onAdd(item, selected);
      if (e.key === 'ArrowDown') {
        setSelected((prev) => {
          const idx = activeVariants.findIndex((v) => v.id === prev.id);
          return activeVariants[Math.min(idx + 1, activeVariants.length - 1)];
        });
      }
      if (e.key === 'ArrowUp') {
        setSelected((prev) => {
          const idx = activeVariants.findIndex((v) => v.id === prev.id);
          return activeVariants[Math.max(idx - 1, 0)];
        });
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [selected, activeVariants]);

  return (
    <div
      style={{ position:'fixed',inset:0,background:'rgba(0,0,0,0.75)',backdropFilter:'blur(4px)',zIndex:9999,display:'flex',alignItems:'center',justifyContent:'center',padding:16 }}
      onClick={onClose}
    >
      <div
        style={{ background:'#13151a',border:'1px solid #2a2d35',borderRadius:14,width:'100%',maxWidth:420,boxShadow:'0 32px 80px rgba(0,0,0,0.8)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ background:'#161820',borderBottom:'1px solid #1e2028',padding:'14px 18px',display:'flex',alignItems:'center',justifyContent:'space-between' }}>
          <div style={{ color:'#f5c842',fontSize:13,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.08em',display:'flex',alignItems:'center',gap:8 }}>
            <ShoppingCart size={14} color="#f5c842" />
            Choose Size
          </div>
          <button onClick={onClose} style={{ background:'transparent',border:'none',color:'#4b5563',cursor:'pointer',display:'flex',alignItems:'center' }}>
            <X size={16} />
          </button>
        </div>

        {/* Item info */}
        <div style={{ padding:'14px 18px 4px' }}>
          <div style={{ fontSize:16,fontWeight:700,color:'#e5e7eb',marginBottom:4 }}>{item.name}</div>
          {item.description && (
            <div style={{ fontSize:12,color:'#4b5563',marginBottom:12 }}>{item.description}</div>
          )}
          <div style={{ color:'#6b7280',fontSize:11,fontWeight:600,textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:10 }}>
            Available sizes
          </div>
        </div>

        {/* Variants */}
        <div style={{ display:'flex',flexDirection:'column',gap:6,padding:'0 18px 14px' }}>
          {activeVariants.map((v) => {
            const isSel = selected.id === v.id;
            return (
              <div
                key={v.id}
                onClick={() => setSelected(v)}
                style={{
                  display:'flex',alignItems:'center',justifyContent:'space-between',
                  background: isSel ? '#f5c84215' : '#0d0f13',
                  border: `1px solid ${isSel ? '#f5c842' : '#1e2028'}`,
                  borderRadius:10,padding:'10px 14px',cursor:'pointer',transition:'all 0.12s',
                }}
              >
                <div style={{ display:'flex',alignItems:'center',gap:10 }}>
                  {/* Radio circle */}
                  <div style={{ width:18,height:18,borderRadius:'50%',border:`2px solid ${isSel ? '#f5c842' : '#2a2d35'}`,flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center' }}>
                    {isSel && <div style={{ width:10,height:10,borderRadius:'50%',background:'#f5c842' }} />}
                  </div>
                  <span style={{ fontSize:14,fontWeight:600,color:'#e5e7eb' }}>{v.label}</span>
                  {v.isDefault && (
                    <span style={{ fontSize:10,background: isSel ? '#f5c84220' : '#1e2028',color: isSel ? '#f5c842' : '#6b7280',borderRadius:4,padding:'2px 6px' }}>
                      Default
                    </span>
                  )}
                </div>
                <span style={{ color:'#f5c842',fontWeight:800,fontSize:15 }}>Rs {v.price}</span>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div style={{ borderTop:'1px solid #1e2028',padding:'12px 18px',display:'flex',gap:8 }}>
          <button
            onClick={onClose}
            style={{ background:'#1e2028',color:'#9ca3af',border:'1px solid #2a2d35',borderRadius:8,padding:'9px 16px',fontWeight:600,cursor:'pointer',fontSize:13,flex:1 }}
          >
            Cancel
          </button>
          <button
            onClick={() => onAdd(item, selected)}
            style={{ background:'#f5c842',color:'#000',border:'none',borderRadius:8,padding:'9px 16px',fontWeight:800,cursor:'pointer',fontSize:13,flex:2,display:'flex',alignItems:'center',justifyContent:'center',gap:6 }}
          >
            <Plus size={14} />
            Add to Cart · Rs {selected.price}
          </button>
        </div>

        {/* Keyboard hint */}
        <div style={{ padding:'0 18px 12px',display:'flex',alignItems:'center',gap:6,justifyContent:'center' }}>
          <Kbd>↑↓</Kbd>
          <span style={{ color:'#4b5563',fontSize:11 }}>navigate</span>
          <Kbd>Enter</Kbd>
          <span style={{ color:'#4b5563',fontSize:11 }}>add</span>
          <Kbd>Esc</Kbd>
          <span style={{ color:'#4b5563',fontSize:11 }}>cancel</span>
        </div>
      </div>
    </div>
  );
}

/* ─── User Guide Modal ───────────────────────────────── */
const shortcuts = [
  { keys: ['F1'], desc: 'Toggle this help guide' },
  { keys: ['F2'], desc: 'Focus search / find item' },
  { keys: ['F3'], desc: 'Jump to Customer Name field' },
  { keys: ['F4'], desc: 'Jump to Phone field' },
  { keys: ['F5'], desc: 'Jump to Address field' },
  { keys: ['F8'], desc: 'Clear entire order & form' },
  { keys: ['F9'], desc: 'Submit / Place order' },
  { keys: ['Ctrl', 'shift', '+'], desc: 'Increase qty of last cart item' },
  { keys: ['Ctrl', '-'], desc: 'Decrease qty of last cart item' },
  { keys: ['Delete'], desc: 'Remove last item from cart' },
  { keys: ['Esc'], desc: 'Close any open panel/modal' },
  { keys: ['↑ ↓'], desc: 'Navigate filtered item list' },
  { keys: ['Enter'], desc: 'Add focused item / confirm variant' },
];

function UserGuideModal({ onClose }: { onClose: () => void }) {
  return (
    <div style={{ position:'fixed',inset:0,background:'rgba(0,0,0,0.75)',backdropFilter:'blur(4px)',zIndex:9999,display:'flex',alignItems:'center',justifyContent:'center',padding:16 }} onClick={onClose}>
      <div style={{ background:'#13151a',border:'1px solid #2a2d35',borderRadius:16,width:'100%',maxWidth:560,maxHeight:'90vh',display:'flex',flexDirection:'column',boxShadow:'0 32px 80px rgba(0,0,0,0.8)' }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16,padding:'24px 24px 0 24px',flexShrink:0 }}>
          <div style={{ display:'flex',alignItems:'center',gap:10 }}>
            <div style={{ background:'#f5c842',borderRadius:8,padding:6,display:'flex' }}><Keyboard size={18} color="#000" /></div>
            <div>
              <h2 style={{ color:'#f5c842',fontSize:18,fontWeight:700,margin:0 }}>POS Keyboard Shortcuts</h2>
              <p style={{ color:'#666',fontSize:12,margin:0 }}>Speed up your workflow</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background:'#1e2028',border:'1px solid #2a2d35',borderRadius:8,padding:'6px 12px',color:'#888',cursor:'pointer',fontSize:12 }}><Kbd>Esc</Kbd></button>
        </div>
        <div style={{ overflowY:'auto',padding:'0 24px',flex:1 }}>
          <div style={{ display:'flex',flexDirection:'column',gap:8,marginBottom:24 }}>
            {shortcuts.map((s, i) => (
              <div key={i} style={{ display:'flex',alignItems:'center',justifyContent:'space-between',background:'#1a1c22',borderRadius:8,padding:'10px 14px',border:'1px solid #22252e',flexWrap:'wrap',gap:8 }}>
                <span style={{ color:'#ccc',fontSize:13 }}>{s.desc}</span>
                <div style={{ display:'flex',gap:4,flexWrap:'wrap' }}>{s.keys.map((k, ki) => <Kbd key={ki}>{k}</Kbd>)}</div>
              </div>
            ))}
          </div>
          <div style={{ background:'#1a1c22',borderRadius:10,padding:14,border:'1px solid #f5c84220',marginBottom:24 }}>
            <p style={{ color:'#f5c842',fontSize:12,fontWeight:600,margin:'0 0 6px' }}>💡 Pro Tips</p>
            <ul style={{ color:'#888',fontSize:12,margin:0,paddingLeft:16,lineHeight:1.8 }}>
              <li>Type in Search and press <Kbd>↓</Kbd> to navigate items without a mouse</li>
              <li>Press <Kbd>Enter</Kbd> on a highlighted item to open variant picker or add to cart</li>
              <li>Use <Kbd>F9</Kbd> to submit only when the form is completely filled</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Component ─────────────────────────────────── */
export default function CreateOrderPage() {
  const router = useRouter();

  const searchRef = useRef<HTMLInputElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const addressRef = useRef<HTMLTextAreaElement>(null);
  const [focusedItemIdx, setFocusedItemIdx] = useState<number>(-1);

  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<FoodItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categories, setCategories] = useState<string[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({ name:'',phone:'',email:'',address:'' });
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'CASH_ON_DELIVERY'|'CREDIT_CARD'|'DEBIT_CARD'>('CASH_ON_DELIVERY');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [showGuide, setShowGuide] = useState(false);

  // Variant picker state
  const [variantPickerItem, setVariantPickerItem] = useState<FoodItem | null>(null);

  /* ── Toast helpers ── */
  const showToast = (type: 'success'|'error', message: string) => {
    const id = Date.now().toString();
    setToasts((p) => [...p, { id, type, message }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 5000);
  };
  const removeToast = (id: string) => setToasts((p) => p.filter((t) => t.id !== id));

  /* ── Form helpers ── */
  const clearForm = () => {
    setCart([]);
    setCustomerInfo({ name:'',phone:'',email:'',address:'' });
    setNotes('');
    setPaymentMethod('CASH_ON_DELIVERY');
    setSearchTerm('');
    showToast('success', 'Form cleared');
  };

  /* ── Data fetching ── */
  useEffect(() => { fetchFoodItems(); fetchCategories(); }, []);

  useEffect(() => {
    let filtered = foodItems;
    if (searchTerm) filtered = filtered.filter((i) => i.name.toLowerCase().includes(searchTerm.toLowerCase()) || i.description.toLowerCase().includes(searchTerm.toLowerCase()));
    if (selectedCategory !== 'all') filtered = filtered.filter((i) => i.category.name === selectedCategory);
    setFilteredItems(filtered);
    setFocusedItemIdx(-1);
  }, [foodItems, searchTerm, selectedCategory]);

  const fetchFoodItems = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const res = await fetch('/api/food-items', { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) setFoodItems(data.data);
    } catch { showToast('error', 'Failed to fetch food items'); }
    finally { setLoading(false); }
  };

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const res = await fetch('/api/categories', { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) setCategories(data.data.map((c: any) => c.name));
    } catch { showToast('error', 'Failed to fetch categories'); }
  };

  /* ── Cart logic ── */

  // Called when clicking an item card — open variant picker if variants exist, else add directly
  const handleItemClick = useCallback((foodItem: FoodItem) => {
    const activeVariants = foodItem.variants?.filter((v) => v.isActive) ?? [];
    if (activeVariants.length > 0) {
      setVariantPickerItem(foodItem);
    } else {
      addToCartDirect(foodItem, foodItem.price);
    }
  }, []);

  // Add without variant
  const addToCartDirect = useCallback((foodItem: FoodItem, price: number, variantId?: string, variantLabel?: string) => {
    // Cart key: foodItemId + variantId (so same item in different sizes = separate rows)
    const cartKey = variantId ? `${foodItem.id}__${variantId}` : foodItem.id;
    setCart((prev) => {
      const existing = prev.find((i) => (i.variantId ? `${i.foodItem.id}__${i.variantId}` : i.foodItem.id) === cartKey);
      if (existing) {
        return prev.map((i) => {
          const k = i.variantId ? `${i.foodItem.id}__${i.variantId}` : i.foodItem.id;
          return k === cartKey ? { ...i, quantity: i.quantity + 1, total: (i.quantity + 1) * i.price } : i;
        });
      }
      return [...prev, { foodItem, quantity:1, price, total:price, variantId, variantLabel }];
    });
  }, []);

  // Called from variant picker modal
  const handleVariantAdd = useCallback((foodItem: FoodItem, variant: Variant) => {
    addToCartDirect(foodItem, variant.price, variant.id, variant.label);
    setVariantPickerItem(null);
    showToast('success', `${foodItem.name} (${variant.label}) added`);
  }, [addToCartDirect]);

  const updateQuantity = (cartKey: string, qty: number) => {
    if (qty < 1) { removeFromCart(cartKey); return; }
    setCart((prev) => prev.map((i) => {
      const k = i.variantId ? `${i.foodItem.id}__${i.variantId}` : i.foodItem.id;
      return k === cartKey ? { ...i, quantity:qty, total:qty * i.price } : i;
    }));
  };

  const removeFromCart = (cartKey: string) =>
    setCart((prev) => prev.filter((i) => (i.variantId ? `${i.foodItem.id}__${i.variantId}` : i.foodItem.id) !== cartKey));

  const getCartKey = (item: CartItem) => item.variantId ? `${item.foodItem.id}__${item.variantId}` : item.foodItem.id;
  const getCartTotal = () => cart.reduce((s, i) => s + i.total, 0);
  const getTotalItems = () => cart.reduce((s, i) => s + i.quantity, 0);

  /* ── Submit ── */
  const handleSubmit = async () => {
    if (!isFormValid() || submitting) return;
    setSubmitting(true);
    try {
      const token = localStorage.getItem('admin_token');
      const orderData = {
        sessionId: `admin-${Date.now()}`,
        customerName: customerInfo.name,
        customerPhone: customerInfo.phone,
        customerEmail: customerInfo.email || undefined,
        deliveryAddress: customerInfo.address,
        latitude: customerInfo.latitude,
        longitude: customerInfo.longitude,
        items: cart.map((i) => ({
          foodItemId: i.foodItem.id,
          quantity: i.quantity,
          ...(i.variantId && { variantId: i.variantId }),
        })),
        paymentMethod,
        notes: notes || undefined,
      };
      const res = await fetch('/api/orders', { method:'POST', headers:{ 'Content-Type':'application/json', Authorization:`Bearer ${token}` }, body:JSON.stringify(orderData) });
      if (res.ok) { showToast('success', 'Order created successfully!'); clearForm(); }
      else { const err = await res.json(); showToast('error', `Error: ${err.error}`); }
    } catch { showToast('error', 'Failed to create order. Please try again.'); }
    finally { setSubmitting(false); }
  };

  const isFormValid = () =>
    customerInfo.name.trim() !== '' &&
    customerInfo.phone.trim() !== '' &&
    customerInfo.address.trim() !== '' &&
    cart.length > 0;

  /* ── Keyboard shortcuts ── */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName.toLowerCase();
      const isInput = tag === 'input' || tag === 'textarea' || tag === 'select';
      const pickerOpen = variantPickerItem !== null;

      if (e.key === 'Escape') { setShowGuide(false); setVariantPickerItem(null); return; }
      if (pickerOpen) return; // let picker's own handler manage Enter/arrows

      if (e.key === 'F1') { e.preventDefault(); setShowGuide((p) => !p); return; }
      if (e.key === 'F2') { e.preventDefault(); searchRef.current?.focus(); return; }
      if (e.key === 'F3') { e.preventDefault(); nameRef.current?.focus(); return; }
      if (e.key === 'F4') { e.preventDefault(); phoneRef.current?.focus(); return; }
      if (e.key === 'F5') { e.preventDefault(); addressRef.current?.focus(); return; }
      if (e.key === 'F8') { e.preventDefault(); if (confirm('Clear entire order?')) clearForm(); return; }
      if (e.key === 'F9') { e.preventDefault(); handleSubmit(); return; }

      if (e.key === 'ArrowDown' && document.activeElement === searchRef.current) {
        e.preventDefault();
        setFocusedItemIdx((p) => Math.min(p + 1, filteredItems.length - 1));
        return;
      }
      if (e.key === 'ArrowUp' && document.activeElement === searchRef.current) {
        e.preventDefault();
        setFocusedItemIdx((p) => Math.max(p - 1, 0));
        return;
      }
      if (e.key === 'Enter' && focusedItemIdx >= 0 && filteredItems[focusedItemIdx]) {
        e.preventDefault();
        handleItemClick(filteredItems[focusedItemIdx]);
        return;
      }

      if (e.ctrlKey && e.key === '+' && cart.length > 0) {
        e.preventDefault();
        const last = cart[cart.length - 1];
        updateQuantity(getCartKey(last), last.quantity + 1);
        return;
      }
      if (e.ctrlKey && e.key === '-' && cart.length > 0) {
        e.preventDefault();
        const last = cart[cart.length - 1];
        updateQuantity(getCartKey(last), last.quantity - 1);
        return;
      }
      if (e.key === 'Delete' && !isInput && cart.length > 0) {
        e.preventDefault();
        const last = cart[cart.length - 1];
        removeFromCart(getCartKey(last));
        return;
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [filteredItems, focusedItemIdx, cart, customerInfo, submitting, variantPickerItem]);

  /* ── Styles ── */
  const S = {
    page: { minHeight:'100vh',background:'#0d0f13',color:'#e5e7eb',fontFamily:"'DM Sans','Segoe UI',sans-serif",display:'flex',flexDirection:'column' as const },
    topBar: { background:'#13151a',borderBottom:'1px solid #1e2028',padding:'12px 24px',display:'flex',alignItems:'center',justifyContent:'space-between',position:'sticky' as const,top:0,zIndex:100,flexWrap:'wrap' as const,gap:12 },
    badge: (bg: string, color = '#000') => ({ background:bg,color,borderRadius:8,padding:'6px 14px',fontSize:13,fontWeight:700,display:'flex',alignItems:'center',gap:6 }),
    panel: { background:'#13151a',border:'1px solid #1e2028',borderRadius:14,overflow:'hidden' },
    panelHeader: { background:'#161820',borderBottom:'1px solid #1e2028',padding:'12px 18px',display:'flex',alignItems:'center',justifyContent:'space-between' },
    panelTitle: { color:'#f5c842',fontSize:13,fontWeight:700,textTransform:'uppercase' as const,letterSpacing:'0.08em',display:'flex',alignItems:'center',gap:8 },
    input: { width:'100%',background:'#0d0f13',border:'1px solid #1e2028',borderRadius:8,padding:'9px 12px',color:'#e5e7eb',fontSize:14,outline:'none',boxSizing:'border-box' as const,transition:'border-color 0.15s' },
    label: { color:'#6b7280',fontSize:12,fontWeight:600,letterSpacing:'0.05em',textTransform:'uppercase' as const,display:'flex',alignItems:'center',gap:5,marginBottom:6 },
    btn: (variant: 'primary'|'ghost'|'danger') => ({
      primary: { background:'#f5c842',color:'#000',border:'none',borderRadius:8,padding:'8px 14px',fontWeight:700,cursor:'pointer',display:'flex',alignItems:'center',gap:5,fontSize:13 },
      ghost: { background:'#1e2028',color:'#9ca3af',border:'1px solid #2a2d35',borderRadius:8,padding:'8px 12px',fontWeight:600,cursor:'pointer',display:'flex',alignItems:'center',gap:5,fontSize:13 },
      danger: { background:'transparent',color:'#ef4444',border:'none',borderRadius:6,padding:'4px 6px',cursor:'pointer',display:'flex',alignItems:'center' },
    }[variant]),
  };

  if (loading) return (
    <div style={{ ...S.page,alignItems:'center',justifyContent:'center' }}>
      <div style={{ width:40,height:40,border:'3px solid #1e2028',borderTop:'3px solid #f5c842',borderRadius:'50%',animation:'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); }}`}</style>
    </div>
  );

  return (
    <div style={S.page}>
      <style>{`
        *:focus-visible { outline: 2px solid #f5c842; outline-offset: 2px; }
        input:focus, textarea:focus, select:focus { border-color: #f5c842 !important; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: #0d0f13; }
        ::-webkit-scrollbar-thumb { background: #2a2d35; border-radius: 3px; }
        @keyframes slideIn { from { transform: translateX(120%); opacity:0; } to { transform: translateX(0); opacity:1; } }
        @keyframes spin { to { transform: rotate(360deg); } }
        .item-card:hover { border-color: #f5c842 !important; }
        .item-card.focused { border-color: #f5c842 !important; background: #1a1c22 !important; }
        .pay-btn.active { border-color: #f5c842 !important; color: #f5c842 !important; background: #f5c84215 !important; }
        .variant-tag { display:inline-flex; align-items:center; background:#1e2028; color:#6b7280; border-radius:4px; padding:1px 6px; font-size:10px; margin-left:4px; }
        @media (max-width: 1200px) { .three-col-grid { grid-template-columns: 1fr 1fr 300px !important; } }
        @media (max-width: 992px) { .three-col-grid { grid-template-columns: 1fr 1fr !important; } .cart-col { grid-column: span 2 !important; } }
        @media (max-width: 768px) { .three-col-grid { grid-template-columns: 1fr !important; } .cart-col { grid-column: span 1 !important; } }
      `}</style>

      {showGuide && <UserGuideModal onClose={() => setShowGuide(false)} />}
      {variantPickerItem && (
        <VariantPickerModal
          item={variantPickerItem}
          onAdd={handleVariantAdd}
          onClose={() => setVariantPickerItem(null)}
        />
      )}

      {/* Toasts */}
      <div style={{ position:'fixed',top:16,right:16,zIndex:9998,display:'flex',flexDirection:'column',gap:8 }}>
        {toasts.map((t) => (
          <div key={t.id} style={{ display:'flex',alignItems:'center',gap:10,padding:'12px 16px',borderRadius:10,minWidth:280,background:t.type==='success'?'#166534':'#7f1d1d',border:`1px solid ${t.type==='success'?'#16a34a':'#dc2626'}`,animation:'slideIn 0.25s ease-out',boxShadow:'0 8px 24px rgba(0,0,0,0.4)' }}>
            {t.type==='success' ? <CheckCircle size={16} color="#4ade80" /> : <AlertCircle size={16} color="#f87171" />}
            <span style={{ flex:1,fontSize:13,color:'#fff' }}>{t.message}</span>
            <button onClick={() => removeToast(t.id)} style={{ background:'transparent',border:'none',color:'#9ca3af',cursor:'pointer',padding:2 }}><X size={14} /></button>
          </div>
        ))}
      </div>

      {/* Top Bar */}
      <div style={S.topBar}>
        <div style={{ display:'flex',alignItems:'center',gap:16 }}>
          <button onClick={() => router.push('/admin/orders')} style={{ ...S.btn('ghost'),padding:'8px 10px' }}><ArrowLeft size={16} /></button>
          <div>
            <div style={{ color:'#f5c842',fontWeight:800,fontSize:17,letterSpacing:'-0.02em' }}>New Order</div>
            <div style={{ color:'#4b5563',fontSize:11 }}>POS Terminal</div>
          </div>
        </div>
        <div style={{ display:'flex',alignItems:'center',gap:10,flexWrap:'wrap' }}>
          <button onClick={() => setShowGuide(true)} style={{ ...S.btn('ghost'),gap:6 }}>
            <HelpCircle size={15} /><span>Help</span><Kbd>F1</Kbd>
          </button>
          <div style={S.badge('#1e2028','#9ca3af')}>
            <ShoppingCart size={14} />
            <span style={{ color:'#f5c842',fontWeight:800 }}>{getTotalItems()}</span>
            <span style={{ color:'#4b5563' }}>items</span>
          </div>
          <div style={S.badge('#f5c842')}>
            <Receipt size={14} />
            <span>Rs {getCartTotal().toLocaleString('en-PK')}</span>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="three-col-grid" style={{ display:'grid',gridTemplateColumns:'1fr 1fr 320px',gap:16,padding:16,flex:1,minHeight:0 }}>

        {/* COL 1: Menu */}
        <div style={{ display:'flex',flexDirection:'column',gap:12,minHeight:0 }}>
          <div style={S.panel}>
            <div style={S.panelHeader}>
              <span style={S.panelTitle}><Package size={14} /> Menu Items</span>
              <Kbd>F2</Kbd>
            </div>
            <div style={{ padding:12,display:'flex',flexDirection:'column',gap:10 }}>
              <div style={{ position:'relative' }}>
                <Search size={15} style={{ position:'absolute',left:10,top:'50%',transform:'translateY(-50%)',color:'#4b5563' }} />
                <input ref={searchRef} type="text" placeholder="Search items… (F2)" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ ...S.input,paddingLeft:34 }} />
              </div>
              <div style={{ display:'flex',gap:6,flexWrap:'wrap' as const }}>
                {['all',...categories].map((c) => (
                  <button key={c} onClick={() => setSelectedCategory(c)} style={{ background:selectedCategory===c?'#f5c842':'#1e2028',color:selectedCategory===c?'#000':'#6b7280',border:'1px solid '+(selectedCategory===c?'#f5c842':'#2a2d35'),borderRadius:20,padding:'4px 12px',fontSize:12,fontWeight:600,cursor:'pointer',textTransform:'capitalize' }}>
                    {c==='all'?'All':c}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ overflowY:'auto',maxHeight:'calc(100vh - 280px)',padding:'0 12px 12px' }}>
              {filteredItems.length === 0 ? (
                <div style={{ textAlign:'center',padding:'40px 0',color:'#4b5563' }}>
                  <Package size={36} style={{ margin:'0 auto 8px',display:'block' }} />
                  No items found
                </div>
              ) : (
                <div style={{ display:'flex',flexDirection:'column',gap:6 }}>
                  {filteredItems.map((item, idx) => {
                    const activeVariants = item.variants?.filter((v) => v.isActive) ?? [];
                    const hasVariants = activeVariants.length > 0;
                    const priceDisplay = hasVariants
                      ? `From Rs ${Math.min(...activeVariants.map((v) => v.price))}`
                      : `Rs ${item.price}`;

                    return (
                      <div
                        key={item.id}
                        className={`item-card${focusedItemIdx===idx?' focused':''}`}
                        style={{ display:'flex',alignItems:'center',background:'#0d0f13',border:'1px solid #1e2028',borderRadius:10,padding:'10px 12px',gap:12,cursor:'pointer',transition:'all 0.12s' }}
                        onClick={() => handleItemClick(item)}
                      >
                        <div style={{ flex:1,minWidth:0 }}>
                          <div style={{ display:'flex',alignItems:'baseline',gap:8,marginBottom:2,flexWrap:'wrap' }}>
                            <span style={{ fontWeight:700,color:'#e5e7eb',fontSize:14,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis' }}>{item.name}</span>
                            <span style={{ fontSize:10,background:'#1e2028',color:'#6b7280',borderRadius:4,padding:'1px 6px',whiteSpace:'nowrap' }}>{item.category.name}</span>
                            {hasVariants && (
                              <span style={{ fontSize:10,background:'#1a1208',color:'#f59e0b',borderRadius:4,padding:'1px 6px',border:'1px solid #78350f',whiteSpace:'nowrap' }}>
                                {activeVariants.length} sizes
                              </span>
                            )}
                          </div>
                          <p style={{ color:'#4b5563',fontSize:12,margin:0,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{item.description}</p>
                        </div>
                        <div style={{ display:'flex',alignItems:'center',gap:10,flexShrink:0 }}>
                          <span style={{ color:'#f5c842',fontWeight:800,fontSize:15,whiteSpace:'nowrap' }}>{priceDisplay}</span>
                          <button
                            style={{ background:'#f5c842',color:'#000',border:'none',borderRadius:7,width:30,height:30,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',fontWeight:700,fontSize:18 }}
                            onClick={(e) => { e.stopPropagation(); handleItemClick(item); }}
                          >
                            {hasVariants ? <ChevronRight size={16} /> : <Plus size={16} />}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* COL 2: Customer Info + Notes */}
        <div style={{ display:'flex',flexDirection:'column',gap:12 }}>
          <div style={S.panel}>
            <div style={S.panelHeader}>
              <span style={S.panelTitle}><User size={14} /> Customer Info</span>
              <div style={{ display:'flex',gap:4 }}><Kbd>F3</Kbd><Kbd>F4</Kbd><Kbd>F5</Kbd></div>
            </div>
            <div style={{ padding:14,display:'flex',flexDirection:'column',gap:12 }}>
              <div>
                <label style={S.label}><User size={12} /> Full Name <span style={{ color:'#ef4444' }}>*</span></label>
                <input ref={nameRef} type="text" value={customerInfo.name} onChange={(e) => setCustomerInfo((p) => ({ ...p,name:e.target.value }))} placeholder="Customer name" style={S.input} required />
              </div>
              <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:10 }}>
                <div>
                  <label style={S.label}><Phone size={12} /> Phone <span style={{ color:'#ef4444' }}>*</span></label>
                  <input ref={phoneRef} type="tel" value={customerInfo.phone} onChange={(e) => setCustomerInfo((p) => ({ ...p,phone:e.target.value }))} placeholder="0300-1234567" style={S.input} required />
                </div>
                <div>
                  <label style={S.label}><Mail size={12} /> Email</label>
                  <input type="email" value={customerInfo.email} onChange={(e) => setCustomerInfo((p) => ({ ...p,email:e.target.value }))} placeholder="optional" style={S.input} />
                </div>
              </div>
              <div>
                <label style={S.label}><MapPin size={12} /> Delivery Address <span style={{ color:'#ef4444' }}>*</span></label>
                <textarea ref={addressRef} value={customerInfo.address} onChange={(e) => setCustomerInfo((p) => ({ ...p,address:e.target.value }))} placeholder="Complete delivery address" rows={3} style={{ ...S.input,resize:'vertical' }} required />
              </div>
            </div>
          </div>

          <div style={S.panel}>
            <div style={S.panelHeader}>
              <span style={S.panelTitle}><CreditCard size={14} /> Payment &amp; Notes</span>
            </div>
            <div style={{ padding:14,display:'flex',flexDirection:'column',gap:12 }}>
              <div>
                <label style={S.label}>Payment Method</label>
                <div style={{ display:'grid',gridTemplateColumns:'repeat(3, 1fr)',gap:8 }}>
                  {([
                    { val:'CASH_ON_DELIVERY',label:'Cash',icon:<Banknote size={14} /> },
                    { val:'CREDIT_CARD',label:'Credit',icon:<CreditCard size={14} /> },
                    { val:'DEBIT_CARD',label:'Debit',icon:<CreditCard size={14} /> },
                  ] as const).map(({ val,label,icon }) => (
                    <button key={val} className={`pay-btn${paymentMethod===val?' active':''}`} onClick={() => setPaymentMethod(val)}
                      style={{ background:paymentMethod===val?'#f5c84215':'#0d0f13',border:`1px solid ${paymentMethod===val?'#f5c842':'#1e2028'}`,borderRadius:8,padding:'8px 6px',color:paymentMethod===val?'#f5c842':'#6b7280',cursor:'pointer',display:'flex',flexDirection:'column',alignItems:'center',gap:4,fontSize:12,fontWeight:600,transition:'all 0.12s' }}>
                      {icon}{label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label style={S.label}>Order Notes</label>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Allergies, special instructions…" rows={3} style={{ ...S.input,resize:'vertical' }} />
              </div>
            </div>
          </div>

          <div style={{ background:'#13151a',border:'1px solid #1e2028',borderRadius:10,padding:'12px 14px',display:'flex',flexWrap:'wrap',gap:8,alignItems:'center' }}>
            <span style={{ color:'#4b5563',fontSize:11,fontWeight:600,textTransform:'uppercase',letterSpacing:'0.06em' }}>Quick Keys:</span>
            <div style={{ display:'flex',flexWrap:'wrap',gap:8,alignItems:'center' }}>
              {[['F2','Search'],['F3','Name'],['F4','Phone'],['F5','Address'],['F8','Clear'],['F9','Submit']].map(([k,d]) => (
                <span key={k} style={{ display:'flex',alignItems:'center',gap:4,fontSize:11,color:'#6b7280' }}>
                  <Kbd>{k}</Kbd> {d}
                </span>
              ))}
            </div>
            <button onClick={() => setShowGuide(true)} style={{ marginLeft:'auto',display:'flex',alignItems:'center',gap:4,background:'transparent',border:'none',color:'#f5c842',cursor:'pointer',fontSize:11,fontWeight:600 }}>
              All shortcuts <ChevronRight size={12} />
            </button>
          </div>
        </div>

        {/* COL 3: Cart + Submit */}
        <div className="cart-col" style={{ display:'flex',flexDirection:'column',gap:12 }}>
          <div style={{ ...S.panel,flex:1,display:'flex',flexDirection:'column',minHeight:0 }}>
            <div style={S.panelHeader}>
              <span style={S.panelTitle}><ShoppingCart size={14} /> Cart ({getTotalItems()})</span>
              {cart.length > 0 && (
                <button onClick={() => { if (confirm('Clear cart?')) setCart([]); }} style={{ ...S.btn('ghost'),padding:'4px 8px',fontSize:11 }}>
                  <Trash2 size={12} /> Clear
                </button>
              )}
            </div>

            {cart.length === 0 ? (
              <div style={{ flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',color:'#2a2d35',gap:8,padding:24 }}>
                <ShoppingCart size={40} />
                <span style={{ fontSize:13 }}>Cart is empty</span>
                <span style={{ fontSize:11,color:'#1e2028' }}>Click + or press Enter on item</span>
              </div>
            ) : (
              <div style={{ overflowY:'auto',flex:1,padding:'8px 12px' }}>
                {cart.map((item) => {
                  const key = getCartKey(item);
                  return (
                    <div key={key} style={{ marginBottom:8,background:'#0d0f13',border:'1px solid #1e2028',borderRadius:10,padding:'10px 12px' }}>
                      <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:4 }}>
                        <div style={{ flex:1,marginRight:8,minWidth:0 }}>
                          <span style={{ fontWeight:600,color:'#e5e7eb',fontSize:13,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',display:'block' }}>{item.foodItem.name}</span>
                          {item.variantLabel && (
                            <span style={{ fontSize:11,color:'#f59e0b',background:'#1a1208',borderRadius:4,padding:'1px 6px',border:'1px solid #78350f',display:'inline-block',marginTop:2 }}>
                              {item.variantLabel}
                            </span>
                          )}
                        </div>
                        <button onClick={() => removeFromCart(key)} style={S.btn('danger')}><X size={13} /></button>
                      </div>
                      <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between' }}>
                        <div style={{ display:'flex',alignItems:'center',gap:6 }}>
                          <button onClick={() => updateQuantity(key, item.quantity - 1)} style={{ background:'#1e2028',border:'1px solid #2a2d35',borderRadius:6,width:26,height:26,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',color:'#9ca3af' }}><Minus size={12} /></button>
                          <span style={{ color:'#e5e7eb',fontWeight:700,fontSize:14,minWidth:20,textAlign:'center' }}>{item.quantity}</span>
                          <button onClick={() => updateQuantity(key, item.quantity + 1)} style={{ background:'#1e2028',border:'1px solid #2a2d35',borderRadius:6,width:26,height:26,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',color:'#9ca3af' }}><Plus size={12} /></button>
                        </div>
                        <span style={{ color:'#f5c842',fontWeight:800,fontSize:14 }}>Rs {item.total.toLocaleString('en-PK')}</span>
                      </div>
                      <div style={{ color:'#4b5563',fontSize:11,marginTop:4 }}>Rs {item.price} × {item.quantity}</div>
                    </div>
                  );
                })}
              </div>
            )}

            {cart.length > 0 && (
              <div style={{ borderTop:'1px solid #1e2028',padding:'12px 14px' }}>
                <div style={{ display:'flex',justifyContent:'space-between',marginBottom:4 }}>
                  <span style={{ color:'#6b7280',fontSize:13 }}>Subtotal</span>
                  <span style={{ color:'#e5e7eb',fontSize:13,fontWeight:600 }}>Rs {getCartTotal().toLocaleString('en-PK')}</span>
                </div>
                <div style={{ display:'flex',justifyContent:'space-between',marginBottom:8 }}>
                  <span style={{ color:'#6b7280',fontSize:13 }}>Delivery</span>
                  <span style={{ color:'#6b7280',fontSize:12 }}>At checkout</span>
                </div>
                <div style={{ display:'flex',justifyContent:'space-between',borderTop:'1px solid #1e2028',paddingTop:10 }}>
                  <span style={{ color:'#f5c842',fontWeight:800,fontSize:16 }}>Total</span>
                  <span style={{ color:'#f5c842',fontWeight:800,fontSize:16 }}>Rs {getCartTotal().toLocaleString('en-PK')}</span>
                </div>
              </div>
            )}
          </div>

          {!isFormValid() && (
            <div style={{ background:'#1a1208',border:'1px solid #78350f',borderRadius:10,padding:'10px 14px' }}>
              <div style={{ color:'#fbbf24',fontSize:12,fontWeight:600,marginBottom:6 }}>Required to submit:</div>
              {[
                !customerInfo.name.trim() && '• Customer name',
                !customerInfo.phone.trim() && '• Phone number',
                !customerInfo.address.trim() && '• Delivery address',
                cart.length === 0 && '• At least one item',
              ].filter(Boolean).map((msg, i) => (
                <div key={i} style={{ color:'#d97706',fontSize:12 }}>{msg as string}</div>
              ))}
            </div>
          )}

          <button onClick={handleSubmit} disabled={!isFormValid()||submitting}
            style={{ background:isFormValid()&&!submitting?'#f5c842':'#1e2028',color:isFormValid()&&!submitting?'#000':'#4b5563',border:'none',borderRadius:12,padding:'16px',fontWeight:800,fontSize:16,cursor:isFormValid()&&!submitting?'pointer':'not-allowed',display:'flex',alignItems:'center',justifyContent:'center',gap:10,transition:'all 0.15s' }}>
            {submitting ? (
              <><div style={{ width:18,height:18,border:'2px solid #000',borderTop:'2px solid transparent',borderRadius:'50%',animation:'spin 0.7s linear infinite' }} />Processing…</>
            ) : (
              <><Zap size={18} />Place Order · Rs {getCartTotal().toLocaleString('en-PK')}<Kbd>F9</Kbd></>
            )}
          </button>

          <button onClick={() => { if (confirm('Clear entire order and form?')) clearForm(); }} style={{ ...S.btn('ghost'),justifyContent:'center',width:'100%',padding:'10px' }}>
            <Trash2 size={14} />Clear All<Kbd>F8</Kbd>
          </button>
        </div>
      </div>
    </div>
  );
}