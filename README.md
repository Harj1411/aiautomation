# Agentic AI Automation Platform (Agentflow_AI)

An operational automation platform that turns natural-language prompts into executable visual graphs, executes them through a 5-agent chain, integrates with real third-party tools (Gmail, Slack, Discord, Google Sheets) over OAuth with encrypted credentials, streams live execution events via Socket.IO, and persists a full audit trail.

---

## 🌟 Architecture Overview

- **Frontend**: Next.js (Pages Router), React 19 / 18, Tailwind CSS, Zustand, React Flow (`@xyflow/react`), Socket.IO client, Lucide Icons, Axios.
- **Backend**: Node.js, Express, MongoDB & Mongoose (with In-Memory Database Fallback), JWT Auth, bcryptjs (cost factor 12), BullMQ & Redis (with In-Process Queue Fallback), Socket.IO real-time event broadcasting, Helmet, Morgan, Compression, Express Validator.
- **Agentic Orchestration Layer**:
  1. **Planner Agent**: Calculates topological node graph order and confidence score.
  2. **Execution Agent**: Invokes integration tools and AI providers via the unified `integrationService`.
  3. **Validation Agent**: Verifies required output fields and schemas.
  4. **Recovery Agent**: Classifies failure types (`MISSING_FIELDS`, `API_FAILURE`, `AUTH_EXPIRED`, `RATE_LIMIT`, `TRANSIENT`) and decides between retry backoff and escalation.
  5. **Monitoring Agent**: Emits Socket.IO telemetry and persists `ExecutionLog` audit rows.
- **AI Synthesis Tier**: OpenRouter API primary → Google Gemini SDK fallback → Rule-Based Deterministic Engine fallback.

---

## 🚀 Step-by-Step Local Execution Instructions

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- *(Optional)* **MongoDB** (local or Atlas) & **Redis**. If not installed, the platform automatically activates zero-dependency **In-Memory Storage & Queue Fallback** so you can test immediately!

---

### Step 1: Clone / Navigate to Project Directory

```bash
cd "e:/Onedrive/Desktop/ai automation"
```

---

### Step 2: Backend Setup & Execution (`/server`)

1. Navigate to the backend directory:
   ```bash
   cd server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables (`server/.env`):
   The `.env` file is pre-configured with local defaults. You can adjust keys as needed:
   ```env
   PORT=5000
   NODE_ENV=development
   CLIENT_URL=http://localhost:3000
   MONGODB_URI=mongodb://localhost:27017/agentflow_ai
   JWT_SECRET=super_secret_jwt_key_agentflow_ai_2026
   JWT_EXPIRES_IN=7d
   CREDENTIAL_ENCRYPTION_KEY=0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef
   REDIS_HOST=127.0.0.1
   REDIS_PORT=6379
   OPENROUTER_API_KEY=
   GEMINI_API_KEY=
   ```

4. Start the backend Express & Socket.IO server:
   ```bash
   npm run dev
   ```
   *The backend will boot on `http://localhost:5000`. You can verify health by visiting `http://localhost:5000/api/health`.*

---

### Step 3: Frontend Setup & Execution (`/client`)

1. Open a new terminal window and navigate to the frontend directory:
   ```bash
   cd "e:/Onedrive/Desktop/ai automation/client"
   ```

2. Install frontend dependencies:
   ```bash
   npm install
   ```

3. Start the Next.js development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

---

## 🔑 Default Workflow & Operator Testing

1. **User Registration**:
   - Navigate to `http://localhost:3000/register`.
   - Register an operator account (e.g. `operator@company.com` / `password123`).

2. **AI Prompt-to-Workflow Synthesis**:
   - Go to **AI Builder** (`/workflows/builder`).
   - Enter a prompt like:
     > *"Send an email via Gmail when a new lead is added to Google Sheets and post a notification to Slack #leads"*
   - Click **Generate Graph**. The 3-tier AI engine will compile the prompt into a visual graph.
   - Click **Open in Visual Canvas**.

3. **Visual Canvas Editor**:
   - On `/workflows/[id]`, drag new nodes from the **Node Palette** onto the canvas.
   - Click any node to open the **Node Configuration Panel** on the right.
   - Click **Run Agent Chain** to trigger an execution run.

4. **Live Execution Timeline**:
   - Observe live agent step events streaming in real time on `/executions/[id]` via Socket.IO.
   - Test **Pause**, **Resume**, and **Cancel** execution controls.

5. **Third-Party Integrations & Encryption**:
   - Visit `/integrations` to test OAuth initiation or manual API key entry. All tokens are encrypted at rest using AES-256-GCM (`CREDENTIAL_ENCRYPTION_KEY`).

---

## ⚡ API Endpoints Summary

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Authenticate & get JWT
- `GET /api/auth/me` - Profile check

### Workflows
- `GET /api/workflows/dashboard` - Metrics & stats
- `GET /api/workflows` - List user workflows
- `POST /api/workflows` - Create workflow
- `POST /api/workflows/generate` - AI prompt generation
- `GET /api/workflows/:id` - Fetch single workflow
- `PUT /api/workflows/:id` - Save canvas graph
- `POST /api/workflows/:id/execute` - Trigger run
- `DELETE /api/workflows/:id` - Delete workflow

### Executions & Real-Time Stream
- `GET /api/executions` - List execution history
- `GET /api/executions/:id` - Get run details
- `GET /api/executions/:id/timeline` - Audit logs
- `POST /api/executions/:id/pause` - Pause execution
- `POST /api/executions/:id/resume` - Resume execution
- `POST /api/executions/:id/cancel` - Cancel execution

### Integrations & Notifications
- `GET /api/integrations` - List connections
- `GET /api/integrations/oauth/:provider/start` - Start OAuth flow
- `GET /api/integrations/oauth/:provider/callback` - OAuth callback
- `GET /api/notifications` - User alert notifications

---

## 🛠 Zero-Dependency Fallback Mode

If MongoDB or Redis is not running locally:
- **Database**: Automatically falls back to an in-memory document store.
- **Queue**: Automatically falls back to an in-process execution queue.
- **AI Generator**: Automatically falls back to the deterministic rule engine if API keys are omitted.

Everything works out of the box!
