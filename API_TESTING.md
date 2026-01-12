# API Testing Postman Collection

## Quick Import Instructions

1. Open Postman
2. Click "Import" button
3. Copy and paste this JSON
4. All endpoints will be ready to test!

## Endpoints Overview

### Base URL
```
http://localhost:5000
```

## 1. Authentication

### Register User
```
POST /api/auth/register
```

Body (JSON):
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "password123"
}
```

### Login
```
POST /api/auth/login
```

Body (JSON):
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Save the token from response!**

### Get Current User
```
GET /api/auth/me
```

Headers:
```
Authorization: Bearer YOUR_TOKEN_HERE
```

## 2. Users

### Search Users
```
GET /api/users/search?query=john
```

Headers:
```
Authorization: Bearer YOUR_TOKEN_HERE
```

### Get User Profile
```
GET /api/users/:userId
```

Headers:
```
Authorization: Bearer YOUR_TOKEN_HERE
```

### Update Profile
```
PUT /api/users/profile
```

Headers:
```
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json
```

Body (JSON):
```json
{
  "username": "johndoe_updated",
  "bio": "Hello, I'm John!"
}
```

### Upload Profile Picture
```
POST /api/users/profile/picture
```

Headers:
```
Authorization: Bearer YOUR_TOKEN_HERE
```

Body (form-data):
```
image: [Select file]
```

## 3. Chat Requests

### Send Chat Request
```
POST /api/requests/send
```

Headers:
```
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json
```

Body (JSON):
```json
{
  "receiverId": "USER_ID_HERE",
  "message": "Hi! Let's connect"
}
```

### Get Received Requests
```
GET /api/requests/received
```

Headers:
```
Authorization: Bearer YOUR_TOKEN_HERE
```

### Get Sent Requests
```
GET /api/requests/sent
```

Headers:
```
Authorization: Bearer YOUR_TOKEN_HERE
```

### Accept Request
```
PUT /api/requests/:requestId/accept
```

Headers:
```
Authorization: Bearer YOUR_TOKEN_HERE
```

### Reject Request
```
PUT /api/requests/:requestId/reject
```

Headers:
```
Authorization: Bearer YOUR_TOKEN_HERE
```

## 4. Conversations

### Get All Conversations
```
GET /api/conversations
```

Headers:
```
Authorization: Bearer YOUR_TOKEN_HERE
```

### Get Conversation Details
```
GET /api/conversations/:conversationId
```

Headers:
```
Authorization: Bearer YOUR_TOKEN_HERE
```

### Delete Conversation
```
DELETE /api/conversations/:conversationId
```

Headers:
```
Authorization: Bearer YOUR_TOKEN_HERE
```

## 5. Messages

### Get Messages
```
GET /api/messages/:conversationId?page=1&limit=50
```

Headers:
```
Authorization: Bearer YOUR_TOKEN_HERE
```

### Upload Image
```
POST /api/messages/upload
```

Headers:
```
Authorization: Bearer YOUR_TOKEN_HERE
```

Body (form-data):
```
image: [Select file]
```

### Mark Messages as Read
```
PUT /api/messages/:conversationId/read
```

Headers:
```
Authorization: Bearer YOUR_TOKEN_HERE
```

### Delete Message
```
DELETE /api/messages/:messageId
```

Headers:
```
Authorization: Bearer YOUR_TOKEN_HERE
```

## Testing Flow

### Complete Test Scenario

1. **Create User 1**
   ```
   POST /api/auth/register
   {
     "username": "alice",
     "email": "alice@example.com",
     "password": "password123"
   }
   ```
   Save token as `TOKEN_ALICE`

2. **Create User 2**
   ```
   POST /api/auth/register
   {
     "username": "bob",
     "email": "bob@example.com",
     "password": "password123"
   }
   ```
   Save token as `TOKEN_BOB`
   Save user ID as `BOB_ID`

3. **Alice searches for Bob**
   ```
   GET /api/users/search?query=bob
   Authorization: Bearer TOKEN_ALICE
   ```

4. **Alice sends chat request to Bob**
   ```
   POST /api/requests/send
   Authorization: Bearer TOKEN_ALICE
   {
     "receiverId": "BOB_ID",
     "message": "Hi Bob!"
   }
   ```
   Save request ID as `REQUEST_ID`

5. **Bob checks received requests**
   ```
   GET /api/requests/received
   Authorization: Bearer TOKEN_BOB
   ```

6. **Bob accepts request**
   ```
   PUT /api/requests/REQUEST_ID/accept
   Authorization: Bearer TOKEN_BOB
   ```
   Save conversation ID as `CONVERSATION_ID`

7. **Alice gets conversations**
   ```
   GET /api/conversations
   Authorization: Bearer TOKEN_ALICE
   ```

8. **Test Socket.IO (use Socket.IO client or browser console)**
   ```javascript
   // Alice connects
   const socket = io('http://localhost:5000', {
     auth: { token: 'TOKEN_ALICE' }
   });

   // Alice sends message
   socket.emit('send_message', {
     receiverId: 'BOB_ID',
     type: 'text',
     content: 'Hello Bob!',
     conversationId: 'CONVERSATION_ID'
   });
   ```

9. **Get messages via HTTP**
   ```
   GET /api/messages/CONVERSATION_ID
   Authorization: Bearer TOKEN_BOB
   ```

## Environment Variables for Postman

Create environment in Postman:

```json
{
  "name": "Chat Spark Dev",
  "values": [
    {
      "key": "base_url",
      "value": "http://localhost:5000",
      "enabled": true
    },
    {
      "key": "token",
      "value": "",
      "enabled": true
    },
    {
      "key": "user_id",
      "value": "",
      "enabled": true
    }
  ]
}
```

Then use in requests:
- URL: `{{base_url}}/api/auth/login`
- Headers: `Authorization: Bearer {{token}}`

## Response Examples

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Response data here
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "errors": ["Detailed error 1", "Detailed error 2"]
}
```

## Socket.IO Testing

### Browser Console Test

```javascript
// Load Socket.IO client
const script = document.createElement('script');
script.src = 'https://cdn.socket.io/4.6.1/socket.io.min.js';
document.head.appendChild(script);

// After script loads
setTimeout(() => {
  const socket = io('http://localhost:5000', {
    auth: {
      token: 'YOUR_TOKEN_HERE'
    }
  });

  socket.on('connect', () => {
    console.log('✅ Connected');
  });

  socket.on('receive_message', (data) => {
    console.log('📨 Message:', data);
  });

  // Send message
  socket.emit('send_message', {
    receiverId: 'USER_ID',
    type: 'text',
    content: 'Test message'
  });
}, 1000);
```

---

**Pro Tip:** Use Postman's "Tests" tab to automatically save tokens and IDs from responses!

Example test script:
```javascript
// Save token from login response
if (pm.response.json().data.token) {
    pm.environment.set("token", pm.response.json().data.token);
}
```
