import React, { useEffect, useRef } from 'react';
import { markNotificationRead, markAllNotificationsRead } from '../api';

function typeIcon(type) {
  if (type === 'success') return '✅';
  if (type === 'error') return '❌';
  return 'ℹ️';
}

function formatTime(ts) {
  const d = new Date(ts);
  return d.toLocaleString();
}

export default function NotificationPanel({ notifications, onClose, onRefresh }) {
  const ref = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [onClose]);

  async function handleMarkRead(id) {
    await markNotificationRead(id);
    onRefresh();
  }

  async function handleMarkAll() {
    await markAllNotificationsRead();
    onRefresh();
  }

  return (
    <div className="notif-panel" ref={ref}>
      <div className="notif-header">
        <span className="notif-title">Notifications</span>
        {notifications.some((n) => !n.read) && (
          <button className="mark-all-btn" onClick={handleMarkAll}>
            Mark all read
          </button>
        )}
      </div>

      <div className="notif-list">
        {notifications.length === 0 && (
          <p className="notif-empty">No notifications yet.</p>
        )}
        {notifications.map((n) => (
          <div key={n.id} className={`notif-item${n.read ? ' read' : ''}`}>
            <span className="notif-icon">{typeIcon(n.type)}</span>
            <div className="notif-body">
              <p className="notif-msg">{n.message}</p>
              <span className="notif-time">{formatTime(n.created_at)}</span>
            </div>
            {!n.read && (
              <button className="mark-btn" onClick={() => handleMarkRead(n.id)} title="Mark as read">
                ●
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
