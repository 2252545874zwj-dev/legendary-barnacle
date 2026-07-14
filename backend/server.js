import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
<<<<<<< HEAD
import http from 'http';
import { Server } from 'socket.io';
=======
>>>>>>> ac58535bee06e561eeda876df089ccdadedcee65

import { initDatabase } from './config/db.js';
import authRoutes from './routes/auth.js';
import infoRoutes from './routes/info.js';
import agentRoutes from './routes/agent.js';
import uploadRoutes from './routes/upload.js';
<<<<<<< HEAD
import adminRoutes from './routes/admin.js';
=======
>>>>>>> ac58535bee06e561eeda876df089ccdadedcee65
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
<<<<<<< HEAD
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';

const allowedOrigins = process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ['http://localhost:5173', 'http://127.0.0.1:5173'];

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true
  }
});

export { io };

io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);
  
  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

app.use(helmet());

const corsOptions = {
  origin: allowedOrigins,
=======
const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';

// 安全中间件：设置安全 HTTP 头
app.use(helmet());

// CORS 配置
const corsOptions = {
  origin: process.env.CORS_ORIGIN || ['http://localhost:5173', 'http://127.0.0.1:5173'],
>>>>>>> ac58535bee06e561eeda876df089ccdadedcee65
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));

// 请求限流：防止暴力攻击
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100, // 限制每个IP 100次请求
  message: { message: '请求过于频繁，请稍后再试' },
  standardHeaders: true,
  legacyHeaders: false
});
app.use('/api/', limiter);

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  console.log(`Request received: ${req.method} ${req.url} from ${req.ip}`);
  next();
});

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/auth', authRoutes);
app.use('/api/info', infoRoutes);
app.use('/api/agent', agentRoutes);
app.use('/api/upload', uploadRoutes);
<<<<<<< HEAD
app.use('/api/admin', adminRoutes);
=======
>>>>>>> ac58535bee06e561eeda876df089ccdadedcee65

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

app.use((req, res) => {
  console.log(`404 Not Found: ${req.method} ${req.url}`);
  res.status(404).send(`Error\nCannot ${req.method} ${req.url}`);
});

const startServer = async () => {
  try {
    await initDatabase();
<<<<<<< HEAD
    server.listen(PORT, HOST, () => {
      console.log(`==========================================`);
      console.log(`Server running on http://${HOST}:${PORT}`);
      console.log(`WebSocket server is ready`);
=======
    app.listen(PORT, HOST, () => {
      console.log(`==========================================`);
      console.log(`Server running on http://${HOST}:${PORT}`);
>>>>>>> ac58535bee06e561eeda876df089ccdadedcee65
      console.log(`代码版本: 2024-01-15-SEARCH-FIX`);
      console.log(`==========================================`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
