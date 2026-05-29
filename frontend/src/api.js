const BASE = 'http://localhost:8000/api';

export async function fetchDocuments() {
  const res = await fetch(`${BASE}/documents`);
  if (!res.ok) throw new Error('Failed to fetch documents');
  return res.json();
}

export async function fetchNotifications() {
  const res = await fetch(`${BASE}/notifications`);
  if (!res.ok) throw new Error('Failed to fetch notifications');
  return res.json();
}

export async function fetchUnreadCount() {
  const res = await fetch(`${BASE}/notifications/unread-count`);
  if (!res.ok) throw new Error('Failed to fetch unread count');
  return res.json();
}

export async function markNotificationRead(id) {
  const res = await fetch(`${BASE}/notifications/mark-read/${id}`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to mark notification read');
  return res.json();
}

export async function markAllNotificationsRead() {
  const res = await fetch(`${BASE}/notifications/mark-all-read`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to mark all read');
  return res.json();
}

export function uploadFiles(files, onProgress) {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    files.forEach((f) => formData.append('files', f));

    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${BASE}/documents/upload`);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        const pct = Math.round((e.loaded / e.total) * 100);
        onProgress(pct);
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(JSON.parse(xhr.responseText));
      } else {
        try {
          const err = JSON.parse(xhr.responseText);
          reject(new Error(err.detail || 'Upload failed'));
        } catch {
          reject(new Error('Upload failed'));
        }
      }
    };

    xhr.onerror = () => reject(new Error('Network error'));
    xhr.send(formData);
  });
}

export function getDownloadUrl(documentId) {
  return `${BASE}/documents/${documentId}/download`;
}

export function createSSEConnection(onMessage) {
  const es = new EventSource(`${BASE}/notifications/stream`);
  es.onmessage = (e) => {
    try {
      onMessage(JSON.parse(e.data));
    } catch {}
  };
  es.onerror = () => {};
  return es;
}
