import React, { useEffect } from 'react';

export default function Toast({ toasts, onDismiss }) {
  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onDismiss }) {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(toast.id), 6000);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const colors = {
    success: { bg: '#f0fdf4', border: '#16a34a', color: '#15803d' },
    error:   { bg: '#fef2f2', border: '#dc2626', color: '#b91c1c' },
    info:    { bg: '#eff6ff', border: '#1a6ef5', color: '#1d4ed8' },
    batch_complete: { bg: '#f0fdf4', border: '#16a34a', color: '#15803d' },
  };
  const style = colors[toast.type] || colors.info;

  return (
    <div
      className="toast"
      style={{ background: style.bg, borderLeft: `4px solid ${style.border}`, color: style.color }}
    >
      <span className="toast-msg">{toast.message}</span>
      {toast.time && <span className="toast-time">{toast.time}</span>}
      <button className="toast-close" onClick={() => onDismiss(toast.id)}>✕</button>
    </div>
  );
}
