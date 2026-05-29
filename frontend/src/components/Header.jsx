import React from 'react';

export default function Header({ activePage, setActivePage, unreadCount, onBellClick }) {
  return (
    <header className="header">
      <div className="header-brand">
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
          <rect width="28" height="28" rx="6" fill="#1a6ef5" />
          <path d="M7 8h14M7 13h10M7 18h12" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <span className="brand-name">DocManager</span>
      </div>

      <nav className="header-nav">
        <button
          className={`nav-btn${activePage === 'upload' ? ' active' : ''}`}
          onClick={() => setActivePage('upload')}
        >
          Upload
        </button>
        <button
          className={`nav-btn${activePage === 'documents' ? ' active' : ''}`}
          onClick={() => setActivePage('documents')}
        >
          Documents
        </button>
      </nav>

      <button className="bell-btn" onClick={onBellClick} aria-label="Notifications">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unreadCount > 0 && (
          <span className="badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
        )}
      </button>
    </header>
  );
}
