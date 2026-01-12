# Quick guide to get Cloudinary credentials

## Step 1: Sign Up (FREE)
1. Go to: https://cloudinary.com/users/register/free
2. Create account with your email
3. Verify email

## Step 2: Get Credentials
1. Login to: https://console.cloudinary.com/
2. You'll see the Dashboard
3. Copy these 3 values:

   Cloud Name: dxxxxxxxxxxx
   API Key: 123456789012345
   API Secret: aBcDeFgHiJkLmNoPqRsTuVw

## Step 3: Update .env File
1. Open: server/.env
2. Replace these lines:

   CLOUDINARY_CLOUD_NAME=your-cloud-name  → CLOUDINARY_CLOUD_NAME=dxxxxxxxxxxx
   CLOUDINARY_API_KEY=your-api-key        → CLOUDINARY_API_KEY=123456789012345
   CLOUDINARY_API_SECRET=your-api-secret  → CLOUDINARY_API_SECRET=aBcDeFgHiJkLmNoPqRsTuVw

3. Save the file
4. Restart backend server

## That's it! Image uploads will now work! ✅

## Free Tier Limits:
- 25 GB storage
- 25 GB monthly bandwidth
- More than enough for development!

## OR Skip This Entirely
If you don't need image uploads, just leave it as is.
Everything else works perfectly! 🎉
