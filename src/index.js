// src/index.js
const express = require('express');
const dotenv = require('dotenv');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
dotenv.config();

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { Server } = require('socket.io')
const http = require('http')

const app = express();
app.use(express.json());
// Serve static files
app.use(express.static("public"));

// Create HTTP server & attach socket.io
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",  // allow all origins for now (later you can restrict)
  }
});


// Listen for client connections
io.on("connection", (socket) => {
  console.log("🟢 A user connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("🔴 User disconnected:", socket.id);
  });
});


app.get('/', (req,res) => {
  res.send("Backend is connected !!")
})

// health check
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// quick DB test - returns users (should be empty at first)
app.get('/test-db', async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    res.json({ users });
  } catch (err) {
    console.error('DB test error:', err);
    res.status(500).json({ error: 'DB error', details: err.message });
  }
});


// Create a new user
app.post('/users',
  // Validation
  body('name').isLength({ min: 1 }),
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;

    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await prisma.user.create({
        data: {
          name,
          email,
          passwordHash: hashedPassword,
        },
      });
      res.status(201).json({ id: user.id, name: user.name, email: user.email });
    } catch (err) {
      console.error('Error creating user:', err);
      if (err.code === 'P2002') { // Unique constraint failed
        return res.status(400).json({ error: 'Email already exists' });
      }
      res.status(500).json({ error: 'Internal server error' });
    }
});


// List all users
app.get('/users', async (req, res) => {
    try {
      const users = await prisma.user.findMany({
        select: { id: true, name: true, email: true }, // exclude password
      });
      res.json(users);
    } catch (err) {
      console.error('Error fetching users:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });


// Create a new poll with options
app.post('/polls', 
  body('question').isLength({ min: 1 }),
  body('creatorId').isInt(),
  body('options').isArray({ min: 1 }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { question, creatorId, options } = req.body;

    try {
      const poll = await prisma.poll.create({
        data: {
          question,
          creatorId,
          options: {
            create: options.map(opt => ({ text: opt }))
          }
        },
        include: { options: true } // return created options
      });
      res.status(201).json(poll);
    } catch (err) {
      console.error('Error creating poll:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
});


// List all polls with their options
app.get('/polls', async (req, res) => {
  try {
    const polls = await prisma.poll.findMany({
      include: {
        options: true,
        creator: { select: { id: true, name: true, email: true } }
      }
    });
    res.json(polls);
  } catch (err) {
    console.error('Error fetching polls:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// Cast a vote
app.post('/votes',
  body('userId').isInt(),
  body('pollOptionId').isInt(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { userId, pollOptionId } = req.body;

    try {

      const vote = await prisma.vote.create({
        data: {
          userId,
          pollOptionId
        }
      });

      // 🔥 Broadcast updated results for this poll
      const poll = await prisma.pollOption.findUnique({
        where: { id: pollOptionId },
        select: { pollId: true }
      });

      const options = await prisma.pollOption.findMany({
        where: { pollId: poll.pollId },
        include: { votes: true }
      });

      const results = options.map(opt => ({
        id: opt.id,
        text: opt.text,
        voteCount: opt.votes.length
      }));

      io.emit("pollUpdated", { pollId: poll.pollId, results }); // broadcast to all clients

      res.status(201).json({ message: 'Vote cast successfully', vote });
    } catch (err) {
      console.error('Error casting vote:', err);
      if (err.code === 'P2002') {
        return res.status(400).json({ error: 'User has already voted for this option' });
      }
      res.status(500).json({ error: 'Internal server error' });
    }
});



// Get results for a poll
app.get('/polls/:pollId/results', async (req, res) => {
  const pollId = parseInt(req.params.pollId);
  if (isNaN(pollId)) return res.status(400).json({ error: 'Invalid pollId' });

  try {
    const options = await prisma.pollOption.findMany({
      where: { pollId },
      include: {
        votes: { select: { userId: true } } // just count votes
      }
    });

    const results = options.map(opt => ({
      id: opt.id,
      text: opt.text,
      voteCount: opt.votes.length
    }));

    res.json({ pollId, results });
  } catch (err) {
    console.error('Error fetching poll results:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});




const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server + WebSocket listening on http://localhost:${PORT}`);
});
