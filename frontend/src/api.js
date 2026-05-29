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
  // Each file gets its own XHR so progress is truly per-file
  const progresses = new Array(files.length).fill(0);

  const requests = files.map((file, idx) =>
    new Promise((resolve, reject) => {
      const formData = new FormData();
      formData.append('files', file);

      const xhr = new XMLHttpRequest();
      xhr.open('POST', `${BASE}/documents/upload`);

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          progresses[idx] = Math.round((e.loaded / e.total) * 100);
          onProgress(idx, progresses[idx]);
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          progresses[idx] = 100;
          onProgress(idx, 100);
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
    })
  );

  // Each request returns a 1-element array; flatten all results
  return Promise.all(requests).then((results) => results.flat());
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
