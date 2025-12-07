# How to Avoid using Local IP (Tunneling)

If you don't want to constantly update the IP address, you can create a **Public URL** (Tunnel) for your local server.

## Option 1: Using LocalTunnel (Free & Quick)

1.  Start your backend server:
    ```bash
    cd backend
    node index.js
    ```
2.  Open a **new terminal** and run:
    ```bash
    npx localtunnel --port 5000
    ```
3.  You will get a URL like: `https://slimy-dog-44.loca.lt`
4.  Copy this URL.
5.  Open `src/config.js` in this project.
6.  Paste it into `TUNNEL_URL` (add `/api` at the end).
    *   Example: `https://slimy-dog-44.loca.lt/api`
7.  Set `USE_TUNNEL: true`.

**Note:** LocalTunnel URLs change every time you restart not the command, but the tunnel.

## Option 2: Using Ngrok (More Stable)

1.  Sign up at [ngrok.com](https://ngrok.com) and install it.
2.  Run:
    ```bash
    ngrok http 5000
    ```
3.  Copy the `https://...` URL.
4.  Update `src/config.js` as above.

## Option 3: Deploy to Cloud (Permanent)

For a permanent URL (e.g., `https://my-app.onrender.com/api`), you can deploy your `backend` folder to a free host like **Render.com**.

1.  Push your code to GitHub.
2.  Create a "Web Service" on Render connected to your repo.
3.  Set "Build Command" to `npm install`.
4.  Set "Start Command" to `node index.js`.
5.  Add your Environment Variables (.env) in the Render dashboard.
6.  Use the provided Render URL in `src/config.js`.
