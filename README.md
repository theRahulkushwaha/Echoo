# Echoo — Real-Time Chat App
 
A full-stack real-time messaging application built with **React Native (Expo)**, **Node.js**, **Socket.io**, and **MongoDB**. Echoo supports direct messaging, group chats, image sharing, stories/status, and voice/video call UI.
 
---
 
## Screenshots
 
 
| Welcome | Login | Sign In |
|:-:|:-:|:-:|
| ![Welcome](./App%20images/wellcome%20page.jpeg) | ![Login](./App%20images/login%20page.jpeg) | ![Sign In](./App%20images/signin%20page.jpeg) |

| Home | New Chat | New Group |
|:-:|:-:|:-:|
| ![Home](./App%20images/homepage.jpeg) | ![New Chat](./App%20images/newchat%20page.jpeg) | ![New Group](./App%20images/newgroup%20page.jpeg) |

| Chat Room | Profile | User Profile |
|:-:|:-:|:-:|
| ![Chat Room](./App%20images/chatroom%20.jpeg) | ![Profile](./App%20images/profile%20page.jpeg) | ![User Profile](./App%20images/usersprofile.jpeg) |

| Settings | Status | Call UI |
|:-:|:-:|:-:|
| ![Settings](./App%20images/settings.jpeg) | ![Status](./App%20images/status%20page.jpeg) | ![Call UI](./App%20images/callUi.jpeg) |

 
---
 
## Features
 
### Messaging
- ✅ Real-time direct messaging via Socket.io
- ✅ Group chat creation with custom name and avatar
- ✅ Image messages (Cloudinary upload)
- ✅ Message seen/read receipts
- ✅ Typing indicators with animated dots
- ✅ Date separators in chat
- ✅ Message grouping by sender
 
### Contacts & Discovery
- ✅ Search users by name or email
- ✅ Start new direct conversations
- ✅ Create groups with member selection
 
### Status / Stories
- ✅ Post text or image stories (24h expiry)
- ✅ Story progress bar viewer
- ✅ Tap to advance / go back
- ✅ Unread story ring indicator
- ✅ Custom background colors for text stories
 
### Calls
- ✅ Voice call UI
- ✅ Video call UI with self-preview
- ✅ Incoming / outgoing call screens
- ✅ Mute, speaker, camera controls
- ✅ Live call timer
- ⏳ WebRTC real audio/video (in progress)
 
### Profile & Settings
- ✅ Edit name and avatar (Cloudinary)
- ✅ Online/offline status indicators
- ✅ Push notification toggles
- ✅ Read receipt toggles
- ✅ Privacy settings
- ✅ Logout
 
### Auth
- ✅ JWT authentication
- ✅ Token persistence with AsyncStorage
- ✅ Auto token expiry check on launch
- ✅ Register / Login / Logout
 
---
 
## Tech Stack
 
### Frontend
| Technology | Purpose |
|---|---|
| React Native (Expo) | Mobile app framework |
| TypeScript | Type safety |
| Expo Router | File-based navigation |
| Socket.io Client | Real-time communication |
| Expo Image Picker | Camera & gallery access |
| Cloudinary | Image hosting |
| JWT Decode | Token parsing |
| Phosphor Icons | Icon library |
| React Native Reanimated | Animations |
 
### Backend
| Technology | Purpose |
|---|---|
| Node.js + Express | REST API server |
| Socket.io | Real-time events |
| MongoDB + Mongoose | Database |
| JWT | Authentication |
| bcryptjs | Password hashing |
| TypeScript | Type safety |
 
---
 
## Project Structure
 
```
Echoo/
├── app/
│   ├── (auth)/
│   │   ├── welcome.tsx        # Welcome / onboarding screen
│   │   ├── Login.tsx          # Login screen
│   │   └── register.tsx       # Register screen
│   ├── (main)/
│   │   ├── home.tsx           # Conversations list
│   │   ├── chatRoom.tsx       # Chat screen
│   │   ├── newChat.tsx        # Start new chat / search users
│   │   ├── createGroup.tsx    # Create group chat
│   │   ├── chatInfo.tsx       # Chat / group info page
│   │   ├── stories.tsx        # Status / stories screen
│   │   ├── callScreen.tsx     # Voice & video call UI
│   │   ├── profileModal.tsx   # Edit profile
│   │   └── settings.tsx       # App settings
│   ├── _layout.tsx            # Root navigator
│   └── index.tsx              # Splash screen
├── components/
│   ├── Avatar.tsx             # User avatar with online dot
│   ├── BackButton.tsx
│   ├── Button.tsx
│   ├── Header.tsx
│   ├── Input.tsx
│   ├── Loading.tsx
│   ├── ScreenWrapper.tsx
│   └── Typo.tsx
├── contexts/
│   ├── authContext.tsx        # Auth state + JWT
│   └── socketContext.tsx      # Online users state
├── socket/
│   ├── socket.ts              # Socket.io connection
│   └── socketEvents.ts        # All socket event helpers
├── services/
│   ├── authservice.ts         # Login / register API calls
│   └── imageService.ts        # Cloudinary upload helpers
├── constants/
│   ├── theme.ts               # Colors, spacing, radius
│   └── index.ts               # API URL, Cloudinary config
├── types.ts                   # All TypeScript types
└── backend/
    ├── modals/
    │   ├── User.ts
    │   ├── Conversation.ts
    │   ├── Message.ts
    │   └── Story.ts
    ├── socket/
    │   ├── socket.ts          # Socket.io server setup + JWT auth
    │   └── userEvents.ts      # All socket event handlers
    ├── routes/
    │   └── auth.routes.ts
    ├── controllers/
    │   └── auth.controller.ts
    ├── config/
    │   └── db.ts
    ├── utils/
    │   └── token.ts
    └── index.ts               # Express server entry point
```
 
---
 
## Getting Started
 
### Prerequisites
- Node.js 18+
- MongoDB Atlas account (free tier works)
- Cloudinary account (free tier works)
- Expo CLI
 
### 1. Clone the repo
 
```bash
git clone https://github.com/yourusername/echoo.git
cd echoo
```
 
### 2. Setup Backend
 
```bash
cd backend
npm install
```
 
Create `backend/.env`:
```env
PORT=3000
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret_key
```
 
Start the backend:
```bash
npm run dev
```
 
### 3. Setup Frontend
 
```bash
# From root directory
npm install
```
 
Create `.env` in root:
```env
EXPO_PUBLIC_API_URL=http://your-backend-url:3000
```
 
Start the app:
```bash
npx expo start
```
 
Scan the QR code with Expo Go (Android/iOS).
 
---
 
## Environment Variables
 
### Backend (`backend/.env`)
| Variable | Description |
|---|---|
| `PORT` | Server port (default: 3000) |
| `MONGO_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Secret key for JWT signing |
 
### Frontend (`.env`)
| Variable | Description |
|---|---|
| `EXPO_PUBLIC_API_URL` | Backend server URL |
 
### Frontend (`constants/index.ts`)
| Variable | Description |
|---|---|
| `CLOUDINARY_CLOUD_NAME` | Your Cloudinary cloud name |
| `CLOUDINARY_UPLOAD_PRESET` | Your Cloudinary upload preset |
 
---
 
## What's Coming Next

These features are planned and actively being worked on:

- 🔧 **WebRTC Real Calls** — Actual voice and video calling using WebRTC + react-native-webrtc so both users can talk and see each other in real time
- 🔔 **Push Notifications** — Background alerts using Expo Notifications so users get notified of new messages even when the app is closed
- 😍 **Message Reactions** — React to messages with emojis (like WhatsApp / iMessage)
- 💬 **Reply to Messages** — Quote and reply to specific messages in a conversation
- 🗑️ **Delete Messages** — Delete messages for yourself or for everyone
- 🌙 **Dark Mode** — Full dark theme support across all screens
- 🔒 **End-to-End Encryption** — Encrypt messages so only sender and receiver can read them
- 📍 **Location Sharing** — Share your live location inside a chat
- 🎤 **Voice Messages** — Record and send audio messages
- 📌 **Pinned Messages** — Pin important messages inside a conversation

---

## Author

**Rahul Kushwaha**

- GitHub: [@theRahulkushwaha](https://github.com/theRahulkushwaha)
- LinkedIn: [rahulkushwaha16](https://linkedin.com/in/rahulkushwaha16)

---

> Built with ❤️ using React Native, Socket.io, and MongoDB
