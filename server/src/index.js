const http = require('http');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const env = require('./config/env');
const { connectDB } = require('./config/db');
const { initSocket } = require('./config/socket');

const authRoutes = require('./routes/authRoutes');
const workflowRoutes = require('./routes/workflowRoutes');
const executionRoutes = require('./routes/executionRoutes');
const integrationRoutes = require('./routes/integrationRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO
initSocket(server, env.clientUrl);

// Middlewares
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, etc.) or matching clientUrl
      callback(null, true);
    },
    credentials: true
  })
);
app.use(compression());
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    service: 'Agentic AI Automation Platform (Agentflow_AI)',
    timestamp: new Date().toISOString(),
    environment: env.nodeEnv,
    integrations: ['gmail', 'slack', 'discord', 'google-sheets'],
    agents: ['planner', 'execution', 'validation', 'recovery', 'monitoring']
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/workflows', workflowRoutes);
app.use('/api/executions', executionRoutes);
app.use('/api/integrations', integrationRoutes);
app.use('/api/notifications', notificationRoutes);

// Centralized Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('[ServerError]', err);

  const statusCode = err.statusCode || err.status || (err.code === 'INTEGRATION_NOT_CONNECTED' ? 400 : 500);
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    error: {
      code: err.code || 'SERVER_ERROR',
      message: message,
      ...(env.nodeEnv === 'development' && { stack: err.stack })
    }
  });
});

// Start Server
const startServer = async () => {
  await connectDB();
  server.listen(env.port, () => {
    console.log(`=======================================================`);
    console.log(` Agentflow_AI Backend running on http://localhost:${env.port}`);
    console.log(` Health Check: http://localhost:${env.port}/api/health`);
    console.log(` Socket.IO active. Mode: ${env.nodeEnv}`);
    console.log(`=======================================================`);
  });
};

startServer();
