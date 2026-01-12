# Chat Spark Backend - Real-Time Chat Application

A production-ready, scalable real-time chat application backend built with Node.js, Express, Socket.IO, and MongoDB.

## 🚀 Features

- **User Authentication** - JWT-based secure authentication
- **User Discovery** - Search and find users by username
- **Chat Request System** - Send, accept, or reject connection requests
- **Real-Time Messaging** - Instant message delivery with Socket.IO
- **Message Types** - Support for text, images, GIFs, and stickers
- **Message Status** - Track sent, delivered, and read status
- **Online Status** - Real-time user online/offline tracking
- **Typing Indicators** - See when other users are typing
- **Offline Messages** - Messages stored and delivered when users come online
- **Image Upload** - Cloudinary integration for image storage
- **Rate Limiting** - API protection against abuse
- **Input Validation** - Comprehensive request validation

## 📁 Project Structure

```
server/
├── controllers/          # Request handlers
│   ├── authController.js       # Authentication logic
│   ├── userController.js       # User operations
│   ├── requestController.js    # Chat request handling
│   ├── conversationController.js
│   └── messageController.js    # Message operations
├── models/              # Database schemas
│   ├── User.js         # User model
│   ├── ChatRequest.js  # Chat request model
│   ├── Conversation.js # Conversation model
│   └── Message.js      # Message model
├── routes/             # API endpoints
│   ├── authRoutes.js
│   ├── userRoutes.js
│   ├── requestRoutes.js
│   ├── conversationRoutes.js
│   └── messageRoutes.js
├── middlewares/        # Custom middleware
│   ├── auth.js        # JWT authentication
│   ├── validate.js    # Input validation
│   ├── error.js       # Error handling
│   └── upload.js      # File upload
├── sockets/           # Socket.IO handlers
│   └── socketHandler.js
├── utils/             # Helper functions
│   ├── response.js    # Response formatter
│   ├── token.js       # JWT utilities
│   ├── validators.js  # Validation rules
│   └── cloudinary.js  # Image upload
├── uploads/           # Temporary file storage
├── .env              # Environment variables
├── .env.example      # Environment template
├── .gitignore
├── package.json
└── server.js         # Entry point
```

## 🛠️ Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- Cloudinary account (for image uploads)

### Installation

1. **Navigate to server directory**
```bash
cd server
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**

Copy `.env.example` to `.env` and update the values:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/chat-spark
# For MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/chat-spark

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# CORS Configuration
CLIENT_URL=http://localhost:5173

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

4. **Start MongoDB** (if using local installation)
```bash
mongod
```

5. **Run the server**

Development mode (with auto-restart):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

The server will start on `http://localhost:5000`

## 📡 API Endpoints

### Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login user | No |
| GET | `/api/auth/me` | Get current user | Yes |

### Users

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/users/search?query=username` | Search users | Yes |
| GET | `/api/users/:userId` | Get user profile | Yes |
| PUT | `/api/users/profile` | Update profile | Yes |
| POST | `/api/users/profile/picture` | Upload profile picture | Yes |

### Chat Requests

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/requests/send` | Send chat request | Yes |
| GET | `/api/requests/received` | Get received requests | Yes |
| GET | `/api/requests/sent` | Get sent requests | Yes |
| PUT | `/api/requests/:requestId/accept` | Accept request | Yes |
| PUT | `/api/requests/:requestId/reject` | Reject request | Yes |

### Conversations

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/conversations` | Get all conversations | Yes |
| GET | `/api/conversations/:conversationId` | Get conversation details | Yes |
| DELETE | `/api/conversations/:conversationId` | Delete conversation | Yes |

### Messages

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/messages/:conversationId` | Get conversation messages | Yes |
| POST | `/api/messages/upload` | Upload image | Yes |
| PUT | `/api/messages/:conversationId/read` | Mark messages as read | Yes |
| DELETE | `/api/messages/:messageId` | Delete message | Yes |

## 🔌 Socket.IO Events

### Client → Server

| Event | Payload | Description |
|-------|---------|-------------|
| `connection` | `{ auth: { token } }` | Connect with JWT token |
| `send_message` | `{ receiverId, type, content, conversationId? }` | Send message |
| `typing` | `{ receiverId, conversationId }` | User is typing |
| `stop_typing` | `{ receiverId, conversationId }` | User stopped typing |
| `message_delivered` | `{ messageId }` | Mark message as delivered |
| `message_read` | `{ messageId }` or `{ conversationId }` | Mark message(s) as read |
| `request_sent` | `{ receiverId, request }` | Notify about chat request |
| `request_accepted` | `{ senderId, conversation }` | Notify request accepted |

### Server → Client

| Event | Payload | Description |
|-------|---------|-------------|
| `receive_message` | `{ message, conversationId }` | Receive new message |
| `message_sent` | `{ message, conversationId }` | Confirm message sent |
| `message_error` | `{ error }` | Message sending error |
| `user_typing` | `{ userId, conversationId, isTyping }` | Typing indicator |
| `message_status_updated` | `{ messageId, status }` | Message status changed |
| `messages_read` | `{ conversationId, readBy }` | All messages read |
| `user_online` | `{ userId, isOnline }` | User came online |
| `user_offline` | `{ userId, isOnline, lastSeen }` | User went offline |
| `request_received` | `{ request }` | New chat request received |
| `request_accepted_notification` | `{ conversation, acceptedBy }` | Request accepted |

## 🔐 Authentication

All protected routes require a JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

Socket.IO connections must include the token in the auth object:

```javascript
const socket = io('http://localhost:5000', {
  auth: {
    token: 'your-jwt-token'
  }
});
```

## 📝 Request/Response Examples

### Register User

**Request:**
```bash
POST /api/auth/register
Content-Type: application/json

{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "_id": "...",
      "username": "johndoe",
      "email": "john@example.com",
      "profilePicture": "",
      "bio": "",
      "isOnline": false,
      "lastSeen": "2026-01-10T...",
      "createdAt": "2026-01-10T..."
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Send Message (Socket.IO)

**Client:**
```javascript
socket.emit('send_message', {
  receiverId: '507f1f77bcf86cd799439011',
  type: 'text',
  content: 'Hello!',
  conversationId: '507f1f77bcf86cd799439012' // optional
});
```

**Server Response:**
```javascript
// To sender
socket.on('message_sent', (data) => {
  console.log(data.message); // Message object
});

// To receiver
socket.on('receive_message', (data) => {
  console.log(data.message); // Message object
});
```

## 🗄️ Database Models

### User Schema
```javascript
{
  username: String (unique, required),
  email: String (unique, required),
  password: String (hashed, required),
  profilePicture: String,
  bio: String,
  isOnline: Boolean,
  lastSeen: Date,
  socketId: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Message Schema
```javascript
{
  conversationId: ObjectId (required),
  sender: ObjectId (required),
  receiver: ObjectId (required),
  type: 'text' | 'image' | 'gif' | 'sticker',
  content: String (required),
  status: 'sent' | 'delivered' | 'read',
  metadata: {
    fileName: String,
    fileSize: Number,
    width: Number,
    height: Number
  },
  isDeleted: Boolean,
  deletedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

## 🎯 Best Practices Implemented

1. **Security**
   - Password hashing with bcrypt
   - JWT token authentication
   - Helmet for security headers
   - CORS configuration
   - Rate limiting
   - Input validation

2. **Code Quality**
   - Modular architecture
   - Clear separation of concerns
   - Comprehensive error handling
   - Consistent response format
   - Detailed comments

3. **Performance**
   - Database indexing
   - Efficient queries
   - Connection pooling
   - Pagination support

4. **Scalability**
   - Stateless authentication
   - RESTful API design
   - Clean code structure
   - Easy to extend

## 🐛 Error Handling

All errors follow a consistent format:

```json
{
  "success": false,
  "message": "Error description",
  "errors": ["Detailed error 1", "Detailed error 2"] // optional
}
```

## 🧪 Testing

You can test the API using:
- **Postman** - Import the endpoints
- **cURL** - Command line testing
- **Frontend** - Connect your React/Vue/Angular app

## 📚 Learning Resources

This codebase is designed to be interview-ready and educational. Each file contains:
- Detailed comments explaining the logic
- Best practices demonstrations
- Real-world patterns
- Production-level structure

## 🚀 Deployment

### Environment Setup
1. Set `NODE_ENV=production`
2. Use strong JWT_SECRET
3. Configure MongoDB Atlas
4. Set up Cloudinary
5. Configure proper CORS origins

### Platforms
- **Heroku** - Easy deployment
- **AWS** - EC2 or Elastic Beanstalk
- **DigitalOcean** - Droplets
- **Railway** - Modern platform

## 🤝 Frontend Integration

To connect your frontend:

1. **Install Socket.IO client:**
```bash
npm install socket.io-client
```

2. **Initialize connection:**
```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000', {
  auth: {
    token: localStorage.getItem('token')
  }
});
```

3. **Use API endpoints:**
```javascript
const response = await fetch('http://localhost:5000/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ email, password })
});
```

## 📄 License

This project is open source and available for educational purposes.

## 💡 Support

For questions or issues:
1. Check the code comments
2. Review the API documentation
3. Test with Postman
4. Check console logs for detailed errors

---

**Built with ❤️ for learning and production use**
