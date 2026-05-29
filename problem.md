What You Are Building
You will build a full-stack Document Management Dashboard - a web application where users can upload company PDF documents, track upload progress in
real time, and receive notifications when background processing completes. This tests your ability to handle file uploads, real-time communication, database design,
and clean Ul implementation end to end.

Important Rules - Read Before Starting
> Git commits every 15 minutes. Your commit history will be reviewed. Each commit should reflect meaningful progress - not one giant commit at the end.
> Use any tech stack - frontend framework, backend language, and database are all your choice.
> No chatbot needed. Focus only on the features listed below.
> No user authentication needed. This is a prototype - single-user or no-auth is fine.
> Design reference: Inspect this page (right-click -> Inspect -> toggle responsive view) to understand the design language. The font used is Livvic. Try to match
the white and blue theme.
> Show loaders and progress clearly - progress bars, spinners, and loading states matter.


Features to Build
Build these features in order. Feature 1-3 are required. Feature 4 is optional.

01. File Upload - Individual & Bulk

Required
Build a file upload interface that supports both single file selection and bulk multi-file upload.
Allow users to select one or multiple PDF files at a time using a file input or drag-and-drop zone.
Show a real-time progress bar for each file individually - not a single combined bar. Each file has its own progress indicator with filename and percentage.
Display file size, file type, and current upload status (pending, uploading, complete, failed) for each file.
Files should be stored in the backend. Use any cloud storage (S3, Firebase, local disk) or database approach you prefer.
After upload completes, the file should appear in a document list/table with name, size, upload date, and a download option.


02. Smart Notifications for Bulk Uploads

Required
When more than 3 files are uploaded at once, the UI should behave differently - showing a background processing state with a real notification when
complete.
If the user uploads 3 or fewer files simultaneously, show inline progress for each file as normal (no extra notification needed).
If the user uploads more than 3 files at once, immediately show a toast or banner: 'Upload in progress - processing X files in background.'
The individual file progress bars should still be visible in a collapsible or minimal state.
Once all files are processed server-side, send a real-time notification to the frontend (use WebSockets, Server-Sent Events, or polling - your choice). The notification
should read: 'X files uploaded successfully' with a timestamp.
This notification must be received and displayed even if the user has navigated away from the upload page.


03. Notification Center

Required
Store all system notifications in the backend and display them in a persistent notification panel or page.
Every notification (bulk upload complete, upload failed, system alert) should be saved to the database with: message, type (success/error/info), timestamp, and read

status.
Build a notification icon in the header with an unread count badge.
Clicking it opens a dropdown or a dedicated notifications page that lists all notifications.
Users can mark individual notifications as read or mark all as read.
Notifications should persist across page refreshes - they are fetched from the backend, not stored in localStorage.

04. Unit Tests

Write unit tests for critical parts of your application if you have time after completing the required features.
Write tests for backend API endpoints - upload handler, notification endpoints, file listing.
Write frontend component tests for the upload component and notification panel.
Use any testing framework you prefer (Jest, Vitest, Pytest, etc.).
Aim for meaningful tests, not just coverage. Test edge cases like empty uploads, oversized files, and failed uploads.
Document how to run the tests in your README.