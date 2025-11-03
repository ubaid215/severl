// components/PrinterSetupGuide.jsx
'use client';

export const PrinterSetupGuide = () => {
  return (
    <div className="bg-yellow-900 border border-yellow-700 rounded-lg p-4 mb-6">
      <h3 className="text-yellow-400 font-bold mb-2">📋 Thermal Printer Setup</h3>
      <div className="text-yellow-200 text-sm space-y-1">
        <p>1. Connect your thermal printer to this computer</p>
        <p>2. In print dialog, select your thermal printer</p>
        <p>3. Set paper size to: <strong>58mm width</strong></p>
        <p>4. Set margins to: <strong>0mm or minimum</strong></p>
        <p>5. Enable: <strong>Background graphics</strong></p>
      </div>
    </div>
  );
};