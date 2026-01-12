# 🔐 Environment Variables Explained

This file explains every environment variable used in the backend and how to configure them.

---

## 📝 Required Variables

### MONGODB_URI
**What it is:** Connection string to your MongoDB database  
**Format:** `mongodb://host:port/database` or `mongodb+srv://username:password@cluster/database`

**Options:**

#### Option 1: Local MongoDB (Recommended for Development)
```env
MONGODB_URI=mongodb://localhost:27017/chat-spark
```
- Requires MongoDB installed on your computer
- Download from: https://www.mongodb.com/try/download/community
- No internet required after installation

#### Option 2: MongoDB Atlas (Cloud - Recommended for Production)
```env
MONGODB_URI=mongodb+srv://myusername:mypassword@cluster0.xxxxx.mongodb.net/chat-spark
```
- Free tier available (512MB storage)
- No local installation needed
- Accessible from anywhere
- **Setup:**
  1. Go to https://www.mongodb.com/cloud/atlas
  2. Create account and cluster
  3. Create database user
  4. Get connection string from "Connect" button
  5. Replace `<password>` with your database password

**Troubleshooting:**
- If you see "MongooseServerSelectionError", MongoDB is not reachable
- Local: Make sure MongoDB service is running
- Atlas: Check connection string and network access settings

---

### JWT_SECRET
**What it is:** Secret key used to sign and verify JWT tokens  
**Format:** Any long random string (at least 32 characters)

**How to generate a secure secret:**

#### Option 1: Use Node.js (Recommended)
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

#### Option 2: Use online generator
- Visit: https://generate-secret.vercel.app/32
- Copy the generated string

#### Option 3: Create your own
```env
JWT_SECRET=myapp-super-secret-key-2026-change-in-production-xyz123456789
```

**Example:**
```env
JWT_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6
```

**Important:**
- ⚠️ Never commit this to Git
- ⚠️ Use different secrets for dev/production
- ✅ Longer is better (64+ characters)
- ✅ Include numbers, letters, symbols

---

### JWT_EXPIRE
**What it is:** How long JWT tokens remain valid  
**Format:** Number + unit (d=days, h=hours, m=minutes)

**Examples:**
```env
JWT_EXPIRE=7d    # 7 days (default)
JWT_EXPIRE=24h   # 24 hours
JWT_EXPIRE=30d   # 30 days
JWT_EXPIRE=2h    # 2 hours
```

**Recommendations:**
- Development: `7d` (convenient for testing)
- Production: `24h` to `7d` (balance security and UX)
- Banking/sensitive: `1h` (high security)

---

## 📸 Cloudinary Variables (Image Uploads)

To enable image uploads, you need a Cloudinary account:

### Getting Cloudinary Credentials (FREE)

1. **Sign up:** https://cloudinary.com/users/register/free
2. **Verify email**
3. **Go to Dashboard:** https://console.cloudinary.com/
4. **Copy credentials:**

### CLOUDINARY_CLOUD_NAME
```env
CLOUDINARY_CLOUD_NAME=dxxxxxxxxxxxxx
```
- Found in Dashboard
- Usually starts with 'd'
- Example: `dmycloud123`

### CLOUDINARY_API_KEY
```env
CLOUDINARY_API_KEY=123456789012345
```
- Found in Dashboard under "API Key"
- 15-digit number
- Example: `987654321098765`

### CLOUDINARY_API_SECRET
```env
CLOUDINARY_API_SECRET=abcdefghijklmnopqrstuvwxyz123
```
- Found in Dashboard (click eye icon to reveal)
- Mix of letters and numbers
- Example: `aBcDeFgHiJkLmNoPqRsTuVwXyZ`

**What happens if not configured:**
- ✅ Server will start
- ❌ Profile picture uploads will fail
- ❌ Message image uploads will fail
- ⚠️ GIF/Sticker URLs will still work (they're just URLs)

**Free Tier Limits:**
- 25 GB storage
- 25 GB monthly bandwidth
- Sufficient for development and small apps

---

## ⚙️ Optional Variables (Have Defaults)

### PORT
**What it is:** Port number the server listens on  
**Default:** `5000`

```env
PORT=5000          # Default
PORT=3000          # Alternative
PORT=8080          # Another option
```

**When to change:**
- Port 5000 is already in use
- Your hosting requires specific port
- Frontend expects different port

**Check if port is in use (Windows):**
```bash
netstat -ano | findstr :5000
```

---

### NODE_ENV
**What it is:** Environment mode (development/production)  
**Default:** `development`

```env
NODE_ENV=development   # Development mode
NODE_ENV=production    # Production mode
```

**Differences:**
- **Development:**
  - Detailed error messages
  - Request logging
  - Auto-restart with nodemon
  
- **Production:**
  - Minimal error details
  - No debug logging
  - Optimized performance

---

### CLIENT_URL
**What it is:** Your frontend application URL (for CORS)  
**Default:** `http://localhost:5173` (Vite default)

```env
CLIENT_URL=http://localhost:5173    # Vite default
CLIENT_URL=http://localhost:3000    # Create React App
CLIENT_URL=http://localhost:4200    # Angular
CLIENT_URL=http://localhost:8080    # Vue
```

**For production:**
```env
CLIENT_URL=https://my-chat-app.com
```

**What it does:**
- Allows frontend to make API requests
- Prevents unauthorized domains from accessing API
- Must match your frontend's actual URL

**Multiple URLs (if needed):**
Edit `server/server.js` directly:
```javascript
cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
})
```

---

### RATE_LIMIT_WINDOW_MS
**What it is:** Time window for rate limiting (milliseconds)  
**Default:** `900000` (15 minutes)

```env
RATE_LIMIT_WINDOW_MS=900000     # 15 minutes (default)
RATE_LIMIT_WINDOW_MS=600000     # 10 minutes
RATE_LIMIT_WINDOW_MS=300000     # 5 minutes
```

**Calculation:**
- 1 minute = 60,000 ms
- 15 minutes = 900,000 ms
- 1 hour = 3,600,000 ms

---

### RATE_LIMIT_MAX_REQUESTS
**What it is:** Maximum requests per window  
**Default:** `100`

```env
RATE_LIMIT_MAX_REQUESTS=100     # 100 requests per window (default)
RATE_LIMIT_MAX_REQUESTS=50      # Stricter
RATE_LIMIT_MAX_REQUESTS=200     # More lenient
```

**Example:**
With defaults (15 min window, 100 max):
- User can make 100 API calls in 15 minutes
- After 100 calls, they must wait until window resets
- Prevents API abuse and DDoS attacks

**Recommendations:**
- Development: 100-200 (convenient for testing)
- Production: 50-100 (balance security and usability)

---

## 📋 Complete Example .env File

### Development (Local MongoDB)
```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/chat-spark

# Authentication
JWT_SECRET=dev-secret-key-change-in-production-a1b2c3d4e5f6
JWT_EXPIRE=7d

# Image Uploads
CLOUDINARY_CLOUD_NAME=dmycloud123
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=aBcDeFgHiJkLmNoPqRsTuVwXyZ

# CORS
CLIENT_URL=http://localhost:5173

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Production (MongoDB Atlas)
```env
# Server
PORT=5000
NODE_ENV=production

# Database
MONGODB_URI=mongodb+srv://chatuser:mypassword123@cluster0.abcde.mongodb.net/chat-spark

# Authentication
JWT_SECRET=prod-secret-key-generated-with-crypto-randomBytes-very-long-string
JWT_EXPIRE=24h

# Image Uploads
CLOUDINARY_CLOUD_NAME=dprodcloud
CLOUDINARY_API_KEY=987654321098765
CLOUDINARY_API_SECRET=xYzAbCdEfGhIjKlMnOpQrStUvW

# CORS
CLIENT_URL=https://my-chat-app.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=50
```

---

## 🔍 Verification Checklist

Run this command to check your configuration:
```bash
npm run check
```

Or manually verify:

- [ ] MONGODB_URI starts with `mongodb://` or `mongodb+srv://`
- [ ] JWT_SECRET is at least 32 characters long
- [ ] JWT_EXPIRE ends with d/h/m (e.g., 7d, 24h)
- [ ] CLOUDINARY_CLOUD_NAME is set (if using images)
- [ ] CLOUDINARY_API_KEY is 15 digits
- [ ] CLOUDINARY_API_SECRET is set
- [ ] PORT is a number between 1024-65535
- [ ] CLIENT_URL matches your frontend URL
- [ ] No quotes around values
- [ ] No spaces before/after = sign

---

## 🆘 Troubleshooting

### "MONGODB_URI is not defined"
- Make sure `.env` file exists in `/server` folder
- Check file is named exactly `.env` (not `.env.txt`)
- Restart server after editing `.env`

### "Cannot connect to MongoDB"
**Local MongoDB:**
```bash
# Check if MongoDB is running
sc query MongoDB

# Start MongoDB service
net start MongoDB
```

**MongoDB Atlas:**
- Verify connection string
- Check database user password
- Whitelist IP address (or use 0.0.0.0/0 for all)

### "Cloudinary configuration error"
- Verify all three credentials are set
- Check for typos
- Make sure no extra spaces
- Temporarily comment out image upload features to test other functionality

### "Token expired" errors
- Increase JWT_EXPIRE
- Clear tokens in frontend
- Re-login to get new token

### CORS errors
- Make sure CLIENT_URL matches exactly
- Include protocol (http:// or https://)
- Check port number matches
- Restart both backend and frontend

---

## 🔒 Security Best Practices

1. **Never commit .env to Git**
   ```bash
   # .gitignore already includes .env
   ```

2. **Use different secrets for each environment**
   - Development: Simple key is OK
   - Production: Use crypto.randomBytes()

3. **Rotate secrets periodically**
   - Change JWT_SECRET every 6-12 months
   - Users will need to re-login

4. **Keep credentials private**
   - Don't share .env file
   - Don't expose in screenshots
   - Use environment variables in deployment

5. **Use MongoDB Atlas for production**
   - Better security
   - Automatic backups
   - Monitoring included

---

**Need Help?**

1. Run `npm run check` to diagnose issues
2. Check server console for error messages
3. Verify each variable one by one
4. Use the example .env above
5. Make sure all required variables are set

Your `.env` file is already created with sensible defaults. Just update MongoDB and Cloudinary credentials!
