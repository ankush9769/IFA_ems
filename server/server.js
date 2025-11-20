import http from 'http';
import dotenv from 'dotenv';
import app from './app.js';
import { connectDatabase } from './src/config/database.js';
import { startNotificationJobs } from './src/services/jobs/deadlineJob.js';

dotenv.config();

const PORT = process.env.PORT || 3000;

const server = http.createServer(app);

const start = async () => {
  try {
    await connectDatabase();
    startNotificationJobs();

    server.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server', error);
    process.exit(1);
  }
};

start();

