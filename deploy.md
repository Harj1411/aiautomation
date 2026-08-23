# Deployment Guide: Agentflow_AI

This guide covers deploying the **Agentflow_AI** platform using **Render** for the Express backend and **Vercel** for the Next.js frontend.

---

## 🛠 Part 1: Push Code to GitHub

### 1. Initialize Git Repository
In your terminal at `e:\Onedrive\Desktop\ai automation`:

```bash
git init
git add .
git commit -m "Initial commit of Agentflow_AI platform"
```

### 2. Create GitHub Repository & Push
1. Go to **[github.com/new](https://github.com/new)**.
2. Repository Name: `agentflow-ai`
3. Keep default settings (do **NOT** initialize with README or gitignore).
4. Run the commands shown by GitHub:

```bash
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/agentflow-ai.git
git push -u origin main
```

---

## 🚀 Part 2: Deploy Backend to Render

1. Sign in to **[Render Dashboard](https://dashboard.render.com/)**.
2. Click **New +** → Select **Web Service**.
3. Connect your GitHub repository (`agentflow-ai`).
4. Configure Web Service settings:
   - **Name**: `agentflow-backend`
   - **Region**: Choose closest region
   - **Root Directory**: `server` *(Crucial step!)*
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node src/index.js`
   - **Instance Type**: Free

5. **Set Environment Variables on Render**:
   Under **Environment Variables**, click **Add Environment Variable** and enter:

   | Key | Value |
   |---|---|
   | `NODE_ENV` | `production` |
   | `PORT` | `10000` |
   | `CLIENT_URL` | `https://agentflow-ai.vercel.app` *(update after Step 3)* |
   | `MONGODB_URI` | `mongodb+srv://harjitharjit1411_db_user:ymr4qaXkjsZkFulr@cluster0.t92wyg0.mongodb.net/agentflow_ai?retryWrites=true&w=majority&appName=Cluster0` |
   | `JWT_SECRET` | `super_secret_jwt_key_agentflow_ai_2026_change_in_production` |
   | `JWT_EXPIRES_IN` | `7d` |
   | `CREDENTIAL_ENCRYPTION_KEY` | `0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef` |
   | `GEMINI_API_KEY` | `your_gemini_api_key_here` |

6. Click **Deploy Web Service**.
7. Copy your deployed Render Backend URL (e.g. `https://agentflow-backend.onrender.com`).
   - Verify health check at `https://agentflow-backend.onrender.com/api/health`.

---

## 🌐 Part 3: Deploy Frontend to Vercel

1. Sign in to **[Vercel Dashboard](https://vercel.com/)** with your GitHub account.
2. Click **Add New...** → **Project**.
3. Import your GitHub repository (`agentflow-ai`).
4. Configure Project settings:
   - **Framework Preset**: `Next.js`
   - **Root Directory**: Click Edit → Select `client` *(Crucial step!)*
5. **Set Environment Variables on Vercel**:
   Under **Environment Variables**, enter:

   | Key | Value |
   |---|---|
   | `NEXT_PUBLIC_API_URL` | `https://agentflow-backend.onrender.com/api` |
   | `NEXT_PUBLIC_SOCKET_URL` | `https://agentflow-backend.onrender.com` |

   *(Replace `https://agentflow-backend.onrender.com` with your actual Render URL from Part 2).*

6. Click **Deploy**.
7. Copy your Vercel URL (e.g. `https://agentflow-ai.vercel.app`).

---

## 🔄 Part 4: Final CORS Sync

1. Go back to **Render Dashboard** → `agentflow-backend` → **Environment Variables**.
2. Update `CLIENT_URL` to match your exact Vercel URL:
   ```env
   CLIENT_URL=https://agentflow-ai.vercel.app
   ```
3. Click **Save Changes** (Render will automatically re-deploy).

---

## ✅ Post-Deployment Verification

1. Open `https://agentflow-ai.vercel.app` in your browser.
2. Register an account and test prompt synthesis on `/workflows/builder`.
3. Check MongoDB Atlas to verify cloud data persistence.
