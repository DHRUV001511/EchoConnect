import express from 'express';
import cors from 'cors';
import { StreamChat } from 'stream-chat';

const app = express();
app.use(cors());
app.use(express.json());

// Store the API key in a variable for logging purposes
const API_KEY = '4mdy2gxtmjpm';
const SECRET = 'uducrh9ef8brn2haewkytr5mkzdyfd7rgxccja3asdbs9mu8fbwhtz42wjjrc5b6';

// Initialize Stream Chat (for token generation)
const streamClient = StreamChat.getInstance(API_KEY, SECRET);

// Token endpoint
app.post('/auth/stream-token', async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }
    
    const token = streamClient.createToken(userId);
    console.log(`Generated token for user: ${userId}`);
    res.json({ token });
  } catch (error: any) {
    console.error('Token generation error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Test endpoint
app.get('/test', (req, res) => {
  res.json({ message: 'Server is working!' });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API Key: ${API_KEY}`); // Use the stored variable instead
  console.log('Health check: http://localhost:3001/health');
});