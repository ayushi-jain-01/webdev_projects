import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoute from './routes/auth.route.js';
import taskRoute from './routes/task.route.js';
import notesRoute from './routes/notes.route.js';

dotenv.config();
const app = express();


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendPath = path.resolve(__dirname, '../frontend');

console.log(' __dirname:', __dirname);
console.log(' Static path resolved:', frontendPath);

//  Serve static frontend
app.use(express.static(frontendPath));

//  Middleware
app.use(cors());
app.use(express.json());

//  API Routes
app.use('/api/auth', authRoute);
app.use('/api/task', taskRoute);
app.use('/api/notes', notesRoute);

//  Manual test route
app.get('/check', (req, res) => {
  res.send(' /check route working!');
});

//  Home route to serve index.html directly
app.get('/', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

//  Catch-all 404 route (must be LAST)
app.use((req, res) => {
  console.log(' Route not matched:', req.originalUrl);
  res.status(404).json({ message: 'Route not found' });
});

//  MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log(' Connected to MongoDB');
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(` Server running at:${PORT}`);
  });
})
.catch((err) => {
  console.error(' MongoDB connection error:', err);
});
