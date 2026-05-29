import React, { useState } from 'react';
import { getDownloadUrl } from '../api';

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(ts) {
  // Backend returns naive UTC — append Z so browsers parse it as UTC
  const utc = ts.endsWith('Z') ? ts : ts + 'Z';
  return new Date(utc).toLocaleString();
}

const STATUS_COLORS = {
  completed: { bg: '#dcfce7', color: '#16a34a' },
  uploading: { bg: '#dbeafe', color: '#1d4ed8' },
  pending:   { bg: '#f3f4f6', color: '#6b7280' },
  failed:    { bg: '#fee2e2', color: '#dc2626' },
};

export default function DocumentTable({ documents, loading }) {
  const [search, setSearch] = useState('');

  const filtered = documents.filter((d) =>
    d.original_filename.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="table-loading">
        <div className="spinner" />
        <p>Loading documents…</p>
      </div>
    );
  }

  return (
    <div className="doc-table-wrapper">
      <div className="table-toolbar">
        <h2 className="section-title">Documents</h2>
        <input
          className="search-input"
          type="text"
          placeholder="Search by filename…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {filtered.length === 0 ? (
        <div className="table-empty">
          <p>{search ? 'No documents match your search.' : 'No documents uploaded yet.'}</p>
        </div>
      ) : (
        <div className="table-scroll">
          <table className="doc-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Size</th>
                <th>Type</th>
                <th>Uploaded</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((doc) => {
                const style = STATUS_COLORS[doc.status] || STATUS_COLORS.pending;
                return (
                  <tr key={doc.id}>
                    <td className="doc-name" title={doc.original_filename}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1a6ef5" strokeWidth="2" style={{ marginRight: 6, flexShrink: 0 }}>
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                      </svg>
                      {doc.original_filename}
                    </td>
                    <td>{formatBytes(doc.size_bytes)}</td>
                    <td>PDF</td>
                    <td>{formatDate(doc.uploaded_at)}</td>
                    <td>
                      <span className="status-chip" style={{ background: style.bg, color: style.color }}>
                        {doc.status}
                      </span>
                    </td>
                    <td>
                      {doc.status === 'completed' && (
                        <a
                          href={getDownloadUrl(doc.id)}
                          className="download-btn"
                          download={doc.original_filename}
                          target="_blank"
                          rel="noreferrer"
                        >
                          ↓ Download
                        </a>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
