'use client';

import { useEffect } from 'react';

type OrderItem = {
  foodItem: { name: string };
  quantity: number;
  price: number;
  total: number;
};

type Order = {
  orderNumber: string | number;
  createdAt: string | Date;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  distance?: number;
  items: OrderItem[];
  subtotal: number;
  deliveryCharges: number;
  total: number;
  paymentMethod: string;
  status: string;
  notes?: string;
};

interface ThermalPrintProps {
  order: Order;
  onClose?: () => void;
}

export const ThermalPrint: React.FC<ThermalPrintProps> = ({ order, onClose }) => {
  useEffect(() => {
    const printContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Order ${order.orderNumber}</title>
    <style>
        @media print {
            @page { 
                margin: 0; 
                size: 58mm auto;
                margin: 2mm;
            }
            body { 
                width: 54mm !important;
                max-width: 54mm !important;
                font-family: 'Courier New', monospace, Arial, sans-serif;
                font-size: 10px;
                margin: 0;
                padding: 2mm;
                line-height: 1.1;
                background: white;
                color: black;
            }
            * {
                box-sizing: border-box;
            }
            .center { text-align: center; }
            .left { text-align: left; }
            .right { text-align: right; }
            .bold { font-weight: bold; }
            .underline { text-decoration: underline; }
            .divider { 
                border-top: 1px dashed #000; 
                margin: 3px 0; 
                padding: 0;
            }
            .double-divider { 
                border-top: 2px solid #000; 
                margin: 4px 0; 
            }
            .item-row { 
                display: flex; 
                justify-content: space-between;
                margin: 1px 0;
            }
            .item-name { flex: 2; }
            .item-qty { flex: 1; text-align: center; }
            .item-price { flex: 1; text-align: right; }
            .item-total { flex: 1; text-align: right; }
            .text-small { font-size: 9px; }
            .text-large { font-size: 12px; font-weight: bold; }
            .mt-1 { margin-top: 3px; }
            .mb-1 { margin-bottom: 3px; }
            .line-break { height: 2px; }
        </style>
    </head>
    <body>
        <div class="center">
            <div class="bold text-large">🍕 PIZZA HUB</div>
            <div class="text-small">123 Main Street, Food City</div>
            <div class="text-small">📞 +91-XXXX-XXXXXX</div>
        </div>
        
        <div class="double-divider"></div>
        
        <div class="item-row">
            <div class="bold">ORDER #:</div>
            <div>${order.orderNumber}</div>
        </div>
        <div class="item-row">
            <div>Date:</div>
            <div>${new Date(order.createdAt).toLocaleDateString('en-IN')}</div>
        </div>
        <div class="item-row">
            <div>Time:</div>
            <div>${new Date(order.createdAt).toLocaleTimeString('en-IN', { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: true 
            })}</div>
        </div>
        
        <div class="divider"></div>
        
        <div class="bold">CUSTOMER DETAILS</div>
        <div>${order.customerName}</div>
        <div>📱 ${order.customerPhone}</div>
        <div class="text-small">${order.deliveryAddress}</div>
        ${order.distance ? `<div>Distance: ${order.distance} km</div>` : ''}
        
        <div class="divider"></div>
        
        <div class="bold">ORDER ITEMS</div>
        ${order.items
          .map(
            (item) => `
            <div class="item-row">
                <div class="item-name">${item.foodItem.name}</div>
                <div class="item-qty">${item.quantity}x</div>
                <div class="item-total">₹${item.total}</div>
            </div>
            <div class="item-row text-small">
                <div class="item-name"></div>
                <div class="item-price">@₹${item.price}</div>
                <div class="item-total"></div>
            </div>
        `
          )
          .join('')}
        
        <div class="divider"></div>
        
        <div class="item-row">
            <div>Subtotal:</div>
            <div>₹${order.subtotal}</div>
        </div>
        <div class="item-row">
            <div>Delivery:</div>
            <div>₹${order.deliveryCharges}</div>
        </div>
        <div class="item-row bold text-large">
            <div>TOTAL:</div>
            <div>₹${order.total}</div>
        </div>
        
        <div class="divider"></div>
        
        <div class="item-row">
            <div>Payment:</div>
            <div>${order.paymentMethod.replace(/_/g, ' ')}</div>
        </div>
        <div class="item-row">
            <div>Status:</div>
            <div>${order.status}</div>
        </div>
        
        ${order.notes ? `
            <div class="divider"></div>
            <div class="bold">NOTES</div>
            <div class="text-small">${order.notes}</div>
        ` : ''}
        
        <div class="line-break"></div>
        <div class="divider"></div>
        
        <div class="center text-small">
            <div>Thank you for your order!</div>
            <div>Visit us again soon! 🎉</div>
        </div>
        
        <div class="double-divider"></div>
        
        <div class="center text-small">
            <div>Generated: ${new Date().toLocaleString('en-IN')}</div>
        </div>
        
        <script>
            window.onload = function() {
                window.print();
                setTimeout(function() {
                    window.close();
                }, 500);
            };
        </script>
    </body>
</html>
    `;

    const printWindow = window.open('', '_blank', 'width=250,height=500');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();

      // Auto-close after print
      printWindow.onafterprint = () => {
        setTimeout(() => {
          printWindow.close();
          onClose?.();
        }, 100);
      };

      // Fallback close
      setTimeout(() => {
        if (!printWindow.closed) {
          printWindow.close();
          onClose?.();
        }
      }, 3000);
    }
  }, [order, onClose]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
        <p className="text-gray-800">Preparing thermal print...</p>
        <button
          onClick={onClose}
          className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};
