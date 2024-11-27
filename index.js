import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import http from 'http'; // Required for serverless
import serverless from 'serverless-http'; // For serverless deployment

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(bodyParser.json());
app.use(cors({
  origin: '*', // Replace with your frontend URL if needed
  methods: ['GET', 'POST'],
}));

// Log MONGO_URI to ensure it's correctly loaded
console.log("MongoDB URI:", process.env.MONGO_URI);

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('DB Connection Error:', err));

// Example route - can be expanded to any number of routes
app.get('/', (req, res) => {
  res.send('Backend is running!');
});

// Define your API or other routes here
app.post('/contact', async (req, res) => {
  try {
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // You can store the message in the database if needed
    const newMessage = new Message({ name, email, message });
    await newMessage.save();
    
    res.status(201).json({ success: true, data: { name, email, message } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server Error' });
  }
});

// For local development, start server normally
if (process.env.NODE_ENV !== 'production') {
  const server = http.createServer(app);
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// For serverless environments, export the app as a handler
export default serverless(app);
