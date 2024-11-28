import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import http from 'http'; // Required for serverless
import serverless from 'serverless-http'; // For serverless deployment
import { log } from 'console';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(bodyParser.json());
app.use(cors());

// Log MONGO_URI to ensure it's correctly loaded
console.log("MongoDB URI:", process.env.MONGO_URI);

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch((err) => console.error('DB Connection Error:', err));

// Define the Message Schema
const messageSchema = new mongoose.Schema({
  name: String,
  email: String,
  message: String,
  createdAt: { type: Date, default: Date.now },
});

// Create the Message Model
const Message = mongoose.model('Message', messageSchema);

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

    // Create and save the message in the database
    const newMessage = new Message({ name, email, message });
    await newMessage.save();
    
    res.status(201).json({ success: true, data: { name, email, message } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server Error' });
  }
});

app.get('/messages', async (req, res) => {
  try {
    const messages = await Message.find();
    res.json({ messages });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve messages' });
  }
});

  const server = http.createServer(app);
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });

// For serverless environments, export the app as a handler
// export default serverless(app);
