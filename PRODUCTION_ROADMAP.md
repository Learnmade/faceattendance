# Production Roadmap

To turn this prototype into a real-world enterprise application, follow these steps:

## 1. Build the Android App (APK)
Currently, you run the app inside "Expo Go". For employees, you need a standalone `.apk` file.

1.  **Install EAS CLI**:
    ```bash
    npm install -g eas-cli
    ```
2.  **Login to Expo**:
    ```bash
    eas login
    ```
3.  **Configure Project**:
    ```bash
    eas build:configure
    ```
4.  **Build the APK**:
    ```bash
    eas build -p android --profile production --local
    ```
    *(Remove `--local` to build on Expo Cloud if you don't have Android SDK installed on PC)*

## 2. Implement Real Face Matching (Critical)
Currently, the app verifies *presence* (is there a face?) but assumes identity based on the login ID.
For verification security:

*   **Option A (SaaS)**: Use **Face++**, **AWS Rekognition**, or **Azure Face API**.
    *   *Flow*: App takes photo -> Send to Backend -> Backend accepts photo -> Backend sends to AWS -> AWS returns "Match/No Match" -> Backend logs attendance.
*   **Option B (Python)**: Build a simple Python Flask server with the `face_recognition` library (dlib).

## 3. Offline Support
Employees might not always have internet.
*   **Action**: Use `AsyncStorage` or `SQLite`.
*   *Logic*: If `fetch` fails, save the attendance object locally. When internet returns, sync pending logs.

## 4. Admin Dashboard
Managers need to see the data without opening Google Sheets.
*   **Action**: Build a web-based Admin Panel (React/Next.js) that connects to the same MongoDB/Sheets data to show charts and report.

## 5. Security Improvements
*   **Login**: Verify Employee ID + Password (currently just ID).
*   **GPS Geofencing**: Ensure employees are physically at the office using `expo-location`.
