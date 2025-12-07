# How to Deploy Backend to Vercel

You can deploy the backend to Vercel for free to get a permanent URL (like `https://face-attendance-backend.vercel.app`).

1.  **Install Vercel CLI** (if not installed):
    ```bash
    npm install -g vercel
    ```

2.  **Deploy**:
    Open a terminal in the `backend` folder and run:
    ```bash
    cd backend
    vercel
    ```

3.  **Follow the Prompts**:
    *   Set up and deploy? **Yes**
    *   Which scope? **(Select your account)**
    *   Link to existing project? **No**
    *   Project Name? **face-attendance-backend**
    *   In which directory is your code located? **./** (Press Enter)
    *   Want to modify these settings? **No**

4.  **Add Environment Variables**:
    *   Go to your [Vercel Dashboard](https://vercel.com/dashboard).
    *   Select the `face-attendance-backend` project.
    *   Go to **Settings > Environment Variables**.
    *   Add all variables from your `backend/.env` file:
        *   `MONGO_URI`
        *   `GOOGLE_SHEETS_ID`
        *   `GOOGLE_SERVICE_ACCOUNT_EMAIL`
        *   `GOOGLE_PRIVATE_KEY`
        *   `JWT_SECRET`

5.  **Get the URL**:
    *   Vercel will give you a Production URL (e.g., `https://face-attendance-backend.vercel.app`).
    *   Copy this URL.

6.  **Update App Config**:
    *   Open `src/config.js` in your VS Code.
    *   Create a new option or update `TUNNEL_URL` with this new Vercel URL (add `/api` at the end if your routes start with `/api`).
        *   Example: `https://face-attendance-backend.vercel.app/api`
