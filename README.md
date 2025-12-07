# Face Attendance App with Backend

## Prerequisites

1.  **Node.js** installed using `npm`.
2.  **Expo Go** app on your phone (or Android Emulator).
3.  **MongoDB** Cluster (Connected via URI).
4.  **Google Service Account** (Configured).

## Setup & Run

### 1. Start the Backend Server
The backend handles database verification and Google Sheets logging.

```powershell
cd backend
npm install
node index.js
```

*   The server runs on **Port 5000**.
*   It ensures a mock user "John Doe" (EMP001) exists in MongoDB.

### 2. Configure the App
Open `src/utils/sheetService.js`:
*   If using **Android Emulator**, verify `API_URL` is `http://10.0.2.2:5000/api`.
*   If using a **Physical Device**, replace `10.0.2.2` with your Computer's Local IP (e.g., `192.168.1.5`). Make sure your phone and PC are on the same Wi-Fi.

### 3. Run the Mobile App
Open a new terminal in the project root:

```powershell
npx expo start
```

*   Scan the QR code with **Expo Go**.

## Features
*   **Face Detection**: Ensures a face is visible.
*   **Verification**: Checks against MongoDB (Currently mocks matching 'EMP001' for demo).
*   **Attendance**: Logs Date, Time, Shift (Day/Night), and Name to your Google Sheet.
