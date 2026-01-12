# Quick Setup Guide

## ⚡ Quick Start (5 Minutes)

### Step 1: Install MongoDB

**Windows:**
1. Download from https://www.mongodb.com/try/download/community
2. Install with default settings
3. MongoDB will run automatically as a service

**Or use MongoDB Atlas (Cloud - Recommended for beginners):**
1. Go to https://www.mongodb.com/cloud/atlas
2. Create free account
3. Create cluster (free tier)
4. Get connection string

### Step 2: Get Cloudinary Credentials

1. Go to https://cloudinary.com/
2. Sign up for free account
3. Go to Dashboard
4. Copy: Cloud Name, API Key, API Secret

### Step 3: Setup Backend

```bash
# Navigate to server folder
cd server

# Install dependencies
npm install

# Copy environment file
copy .env.example .env

# Edit .env file with your values
notepad .env
```

Update these in `.env`:
```env
MONGODB_URI=mongodb://localhost:27017/chat-spark
# OR if using MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/chat-spark

CLOUDINARY_CLOUD_NAME=your-cloud-name-here
CLOUDINARY_API_KEY=your-api-key-here
CLOUDINARY_API_SECRET=your-api-secret-here
```

### Step 4: Run Server

```bash
npm run dev
```

You should see:
```
✅ MongoDB Connected: localhost
🚀 Socket.IO initialized
🚀 CHAT SPARK SERVER RUNNING
```

### Step 5: Test API

Open another terminal and test:

```bash
# Test health check
curl http://localhost:5000

# Or open in browser:
# http://localhost:5000
```

## 🧪 Testing the API

### 1. Register User

```bash
curl -X POST http://localhost:5000/api/auth/register ^
  -H "Content-Type: application/json" ^
  -d "{\"username\":\"testuser\",\"email\":\"test@example.com\",\"password\":\"password123\"}"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": { ... },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Save the token!** You'll need it for other requests.

### 2. Login

```bash
curl -X POST http://localhost:5000/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"test@example.com\",\"password\":\"password123\"}"
```

### 3. Get Current User (Protected Route)

```bash
curl http://localhost:5000/api/auth/me ^
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

Replace `YOUR_TOKEN_HERE` with the token from step 1.

### 4. Search Users

```bash
curl "http://localhost:5000/api/users/search?query=test" ^
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 🔧 Common Issues & Solutions

### Issue: MongoDB Connection Failed

**Solution 1:** Make sure MongoDB is running
```bash
# Check if MongoDB service is running
sc query MongoDB

# Start MongoDB service
net start MongoDB
```

**Solution 2:** Use MongoDB Atlas (cloud)
- No local installation needed
- Update MONGODB_URI in .env with Atlas connection string

### Issue: Port 5000 already in use

**Solution:** Change port in `.env`
```env
PORT=5001
```

### Issue: Cloudinary upload fails

**Solution:** Check credentials in `.env`
- Make sure there are no extra spaces
- Verify credentials on Cloudinary dashboard
- For testing, you can skip image uploads initially

### Issue: CORS errors from frontend

**Solution:** Update CLIENT_URL in `.env`
```env
CLIENT_URL=http://localhost:5173
```

## 📱 Frontend Integration

### Install Socket.IO in your frontend

```bash
cd ..  # Go back to root
npm install socket.io-client
```

### Create API service (src/services/api.js)

```javascript
const API_URL = 'http://localhost:5000/api';

export const api = {
  async register(username, email, password) {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password })
    });
    return response.json();
  },

  async login(email, password) {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return response.json();
  },

  async getMe(token) {
    const response = await fetch(`${API_URL}/auth/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  }
};
```

### Create Socket service (src/services/socket.js)

```javascript
import { io } from 'socket.io-client';

let socket = null;

export const socketService = {
  connect(token) {
    socket = io('http://localhost:5000', {
      auth: { token }
    });

    socket.on('connect', () => {
      console.log('✅ Connected to server');
    });

    socket.on('receive_message', (data) => {
      console.log('📨 New message:', data);
      // Handle message in your app
    });

    socket.on('user_online', (data) => {
      console.log('🟢 User online:', data);
      // Update UI
    });

    return socket;
  },

  sendMessage(receiverId, type, content) {
    socket.emit('send_message', {
      receiverId,
      type,
      content
    });
  },

  disconnect() {
    if (socket) socket.disconnect();
  }
};
```

### Usage in React component

```javascript
import { useEffect, useState } from 'react';
import { api } from './services/api';
import { socketService } from './services/socket';

function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    if (token) {
      // Get user info
      api.getMe(token).then(data => {
        if (data.success) {
          setUser(data.data.user);
          // Connect to socket
          socketService.connect(token);
        }
      });
    }

    return () => socketService.disconnect();
  }, [token]);

  const handleLogin = async (email, password) => {
    const result = await api.login(email, password);
    if (result.success) {
      localStorage.setItem('token', result.data.token);
      setToken(result.data.token);
      setUser(result.data.user);
    }
  };

  // ... rest of your app
}
```

## 📊 Database Inspection

### Using MongoDB Compass (GUI)

1. Download from https://www.mongodb.com/try/download/compass
2. Connect to `mongodb://localhost:27017`
3. Browse your `chat-spark` database

### Using MongoDB Shell

```bash
# Connect to MongoDB
mongosh

# Use your database
use chat-spark

# View collections
show collections

# View users
db.users.find().pretty()

# View messages
db.messages.find().pretty()

# Count documents
db.users.countDocuments()
```

## 🎯 Next Steps

1. ✅ Backend running → Test with Postman/curl
2. ✅ Create 2 test users → Register via API
3. ✅ Connect frontend → Integrate Socket.IO
4. ✅ Test real-time chat → Send messages between users
5. ✅ Add features → Extend based on your needs

## 📚 Additional Resources

- [Express.js Docs](https://expressjs.com/)
- [Socket.IO Docs](https://socket.io/docs/v4/)
- [Mongoose Docs](https://mongoosejs.com/docs/)
- [JWT Introduction](https://jwt.io/introduction)
- [MongoDB Tutorial](https://docs.mongodb.com/manual/tutorial/)

---

**Need help?** Check the console logs - they provide detailed error messages!
