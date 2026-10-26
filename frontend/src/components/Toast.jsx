import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const icons = {
    success: <CheckCircle2 size={20} color="#00ff88" />,
    error: <AlertCircle size={20} color="#ef4444" />,
    info: <Info size={20} color="#3b82f6" />
  };

  const borders = {
    success: '1px solid rgba(0, 255, 136, 0.3)',
    error: '1px solid rgba(239, 68, 68, 0.3)',
    info: '1px solid rgba(59, 130, 246, 0.3)'
  };

  return (
    <div className="toast-container">
      <div className="toast" style={{ border: borders[type] }}>
        {icons[type]}
        <span style={{ fontSize: '0.92rem', fontWeight: 500 }}>{message}</span>
        <button
          onClick={onClose}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#94a3b8',
            cursor: 'pointer',
            marginLeft: 'auto'
          }}
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
