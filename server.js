import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import serverless from 'serverless-http';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(bodyParser.json());
app.use(cors({
    origin: "http://localhost:5173", // Replace with your frontend URL
    methods: ["GET", "POST"],
  }));

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('DB Connection Error:', err));

const messageSchema = new mongoose.Schema({
    name: String,
    email: String,
    message: String,
    createdAt: { type: Date, default: Date.now },
});

const Message = mongoose.model('Message', messageSchema);

app.post("/api/messages", async (req, res) => {
    try {
      const { name, email, message } = req.body;
      if (!name || !email || !message) {
        return res.status(400).json({ error: "All fields are required" });
      }
      const newMessage = new Message({ name, email, message });
      await newMessage.save();
      res.status(201).json({ success: true, data: newMessage });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  

app.get('/', (req, res) => res.send('Backend is running!'));

// app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

export const handler = serverless(app);