import React, { useState, useRef, useCallback } from 'react';
import { uploadFiles } from '../api';

const STATUS = { PENDING: 'pending', UPLOADING: 'uploading', DONE: 'completed', FAILED: 'failed' };

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function UploadZone({ onUploadComplete }) {
  const [fileItems, setFileItems] = useState([]);
  const [dragging, setDragging] = useState(false);
  const [bulkBanner, setBulkBanner] = useState(null);
  const [collapsed, setCollapsed] = useState(false);
  const inputRef = useRef(null);

  const addFiles = useCallback((newFiles) => {
    const pdfs = Array.from(newFiles).filter((f) => f.type === 'application/pdf');
    if (!pdfs.length) return;
    setFileItems((prev) => [
      ...prev,
      ...pdfs.map((f) => ({ file: f, status: STATUS.PENDING, progress: 0, error: null })),
    ]);
  }, []);

  function onDrop(e) {
    e.preventDefault();
    setDragging(false);
    addFiles(e.dataTransfer.files);
  }

  function onInputChange(e) {
    addFiles(e.target.files);
    e.target.value = '';
  }

  function removeFile(idx) {
    setFileItems((prev) => prev.filter((_, i) => i !== idx));
  }

  async function handleUpload() {
    if (!fileItems.length) return;
    const pendingItems = fileItems.filter((i) => i.status === STATUS.PENDING);
    if (!pendingItems.length) return;
    const isBulk = pendingItems.length > 3;

    if (isBulk) {
      setBulkBanner(`Upload in progress — processing ${pendingItems.length} files in background.`);
      setCollapsed(true);
    }

    // Mark pending files as uploading
    setFileItems((prev) =>
      prev.map((item) =>
        item.status === STATUS.PENDING ? { ...item, status: STATUS.UPLOADING, progress: 0 } : item
      )
    );

    const pendingIndices = fileItems
      .map((item, idx) => (item.status === STATUS.PENDING ? idx : -1))
      .filter((i) => i !== -1);

    try {
      const files = pendingItems.map((i) => i.file);
      const result = await uploadFiles(files, (fileIdx, pct) => {
        const globalIdx = pendingIndices[fileIdx];
        setFileItems((prev) =>
          prev.map((item, i) =>
            i === globalIdx ? { ...item, progress: pct } : item
          )
        );
      });

      const resultMap = {};
      result.forEach((doc) => { resultMap[doc.original_filename] = doc; });

      setFileItems((prev) =>
        prev.map((item, i) => {
          if (!pendingIndices.includes(i)) return item;
          const doc = resultMap[item.file.name];
          return doc
            ? { ...item, status: doc.status === 'completed' ? STATUS.DONE : STATUS.FAILED, progress: 100 }
            : { ...item, status: STATUS.FAILED, progress: 0 };
        })
      );

      if (isBulk) setBulkBanner(null);
      onUploadComplete();
    } catch (err) {
      setFileItems((prev) =>
        prev.map((item, i) =>
          pendingIndices.includes(i) ? { ...item, status: STATUS.FAILED, error: err.message } : item
        )
      );
      if (isBulk) setBulkBanner(null);
    }
  }

  function clearAll() {
    setFileItems([]);
    setBulkBanner(null);
    setCollapsed(false);
  }

  const statusColor = { pending: '#6b7280', uploading: '#1a6ef5', completed: '#16a34a', failed: '#dc2626' };

  return (
    <div className="upload-zone-wrapper">
      {bulkBanner && (
        <div className="bulk-banner">
          <span>⏳ {bulkBanner}</span>
          <button className="collapse-btn" onClick={() => setCollapsed((c) => !c)}>
            {collapsed ? 'Show files ▾' : 'Hide files ▴'}
          </button>
        </div>
      )}

      <div
        className={`drop-zone${dragging ? ' dragging' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          multiple
          style={{ display: 'none' }}
          onChange={onInputChange}
        />
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#1a6ef5" strokeWidth="1.5">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
        <p className="drop-text">Drag &amp; drop PDF files here, or <span className="drop-link">browse</span></p>
        <p className="drop-hint">Only PDF files · Max 50 MB each</p>
      </div>

      {fileItems.length > 0 && (
        <div className={`file-list${collapsed ? ' collapsed' : ''}`}>
          {fileItems.map((item, idx) => (
            <div key={idx} className="file-row">
              <div className="file-info">
                <span className="file-name" title={item.file.name}>{item.file.name}</span>
                <span className="file-meta">{formatBytes(item.file.size)} · PDF</span>
              </div>
              <div className="file-progress-area">
                <div className="progress-bar-track">
                  <div
                    className="progress-bar-fill"
                    style={{
                      width: `${item.progress}%`,
                      background: statusColor[item.status] || '#1a6ef5',
                    }}
                  />
                </div>
                <span className="progress-pct">{item.progress}%</span>
              </div>
              <span className="file-status" style={{ color: statusColor[item.status] }}>
                {item.status}
              </span>
              {item.status === STATUS.PENDING && (
                <button className="remove-btn" onClick={() => removeFile(idx)} title="Remove">✕</button>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="upload-actions">
        {fileItems.length > 0 && (
          <>
            <button
              className="btn-primary"
              onClick={handleUpload}
              disabled={fileItems.every((i) => i.status !== STATUS.PENDING)}
            >
              Upload {fileItems.filter((i) => i.status === STATUS.PENDING).length > 0
                ? `${fileItems.filter((i) => i.status === STATUS.PENDING).length} file(s)`
                : ''}
            </button>
            <button className="btn-ghost" onClick={clearAll}>Clear</button>
          </>
        )}
      </div>
    </div>
  );
}
