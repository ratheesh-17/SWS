import React, { useState, useEffect, useCallback, useRef } from 'react';
import Header from './components/Header';
import UploadZone from './components/UploadZone';
import DocumentTable from './components/DocumentTable';
import NotificationPanel from './components/NotificationPanel';
import Toast from './components/Toast';
import {
  fetchDocuments,
  fetchNotifications,
  fetchUnreadCount,
  createSSEConnection,
} from './api';
import './App.css';

let toastIdCounter = 0;

export default function App() {
  const [activePage, setActivePage] = useState('upload');
  const [documents, setDocuments] = useState([]);
  const [docsLoading, setDocsLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [panelOpen, setPanelOpen] = useState(false);
  const [toasts, setToasts] = useState([]);
  const sseRef = useRef(null);

  const addToast = useCallback((message, type, time) => {
    const id = ++toastIdCounter;
    setToasts((prev) => [...prev, { id, message, type, time }]);
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const loadDocuments = useCallback(async () => {
    setDocsLoading(true);
    try {
      const docs = await fetchDocuments();
      setDocuments(docs);
    } catch {}
    setDocsLoading(false);
  }, []);

  const loadNotifications = useCallback(async () => {
    try {
      const [notifs, countData] = await Promise.all([
        fetchNotifications(),
        fetchUnreadCount(),
      ]);
      setNotifications(notifs);
      setUnreadCount(countData.count);
    } catch {}
  }, []);

  // Initial load
  useEffect(() => {
    loadDocuments();
    loadNotifications();
  }, [loadDocuments, loadNotifications]);

  // Reload documents when switching to documents page
  useEffect(() => {
    if (activePage === 'documents') loadDocuments();
  }, [activePage, loadDocuments]);

  // SSE — persists across page navigation
  useEffect(() => {
    sseRef.current = createSSEConnection((data) => {
      const time = new Date().toLocaleTimeString();
      addToast(data.message, data.type || 'batch_complete', time);
      loadNotifications();
      loadDocuments();
    });
    return () => {
      if (sseRef.current) sseRef.current.close();
    };
  }, [addToast, loadNotifications, loadDocuments]);

  function handleUploadComplete() {
    loadDocuments();
    loadNotifications();
  }

  function handleBellClick() {
    setPanelOpen((o) => !o);
  }

  function handlePanelClose() {
    setPanelOpen(false);
  }

  return (
    <div className="app">
      <Header
        activePage={activePage}
        setActivePage={setActivePage}
        unreadCount={unreadCount}
        onBellClick={handleBellClick}
      />

      {panelOpen && (
        <div className="notif-overlay">
          <NotificationPanel
            notifications={notifications}
            onClose={handlePanelClose}
            onRefresh={loadNotifications}
          />
        </div>
      )}

      <main className="main-content">
        {activePage === 'upload' && (
          <div className="page">
            <div className="page-header">
              <h1 className="page-title">Upload Documents</h1>
              <p className="page-sub">Upload one or multiple PDF files. Bulk uploads (&gt;3 files) are processed in the background.</p>
            </div>
            <UploadZone onUploadComplete={handleUploadComplete} />
          </div>
        )}

        {activePage === 'documents' && (
          <div className="page">
            <DocumentTable documents={documents} loading={docsLoading} />
          </div>
        )}
      </main>

      <Toast toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
