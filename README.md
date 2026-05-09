# CampusConnect-MERN

A full-featured Campus Social Networking & Management Web Application built using the MERN Stack. The platform connects students, faculty, and administrators with social interaction, academic management, and real-time communication features.

---

## 🚀 Features

### 👨‍💼 Admin
- Admin Authentication
- Add / Manage Faculty
- Manage Students
- Manage Users
- Create & Manage Posts
- View Reports & Activities

### 👨‍🏫 Faculty
- Faculty Authentication
- Add Students
- Create Posts
- Like & Comment on Posts
- Send Friend Requests
- Real-time Chat System

### 👨‍🎓 Students
- Student Authentication
- Create Posts
- Like & Comment
- Send / Accept / Reject Friend Requests
- Real-time Messaging
- Profile Management

---

## 🔥 Social Features
- Post Creation
- Image Upload Support
- Like System
- Comment System
- Friend Request System
  - Pending
  - Accepted
  - Rejected
- Real-time Chat using Socket.io
- Notifications

---

## 🔐 Authentication & Security
- JWT Authentication
- Password Hashing using bcrypt
- Protected Routes
- Role-based Authorization
- Secure REST APIs

---

# 🛠️ Tech Stack

## Frontend
- React.js
- React Router DOM
- Axios
- Material UI (MUI)
- Tailwind CSS
- Context API / Redux Toolkit
- Socket.io Client

## Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- bcryptjs
- Socket.io
- CORS
- dotenv

---

# 📁 Project Structure

```bash
CampusConnect-MERN/
│
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── socket/
│   ├── uploads/
│   ├── utils/
│   ├── server.js
│   └── package.json
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── context/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── socket/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
│
└── README.md
```

---

# ⚙️ Installation

## Clone Repository

```bash
git clone https://github.com/your-username/CampusConnect-MERN.git
cd CampusConnect-MERN
```

---

# Backend Setup

```bash
cd backend
npm install
npm run dev
```

## Backend Packages

```bash
npm install express mongoose cors dotenv bcryptjs jsonwebtoken multer socket.io cookie-parser
npm install nodemon --save-dev
```

---

# Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

## Frontend Packages

```bash
npm install react-router-dom axios
npm install @mui/material @emotion/react @emotion/styled
npm install tailwindcss @tailwindcss/vite
npm install socket.io-client
npm install react-hot-toast
npm install lucide-react
```

---

# 🌐 Environment Variables

## Backend `.env`

```env
PORT=5000
MONGO_URI=your_mongodb_connection
JWT_SECRET=your_secret_key
CLIENT_URL=http://localhost:5173
```

---

# 🔗 API Modules

- Authentication API
- User API
- Faculty API
- Student API
- Posts API
- Comments API
- Friend Request API
- Chat API
- Notification API

---

# 💬 Real-time Chat

Socket.io is used for:
- Real-time Messaging
- Online User Tracking
- Instant Notifications
- Live Friend Request Updates

---

# 🎨 UI Features

- Responsive Design
- Dark Mode
- Modern Dashboard
- MUI Components
- Tailwind Utility Styling
- Animated UI
- Mobile Friendly

---

# 📌 Future Enhancements

- Video Calling
- AI Chatbot
- Attendance System
- Assignment Upload
- Campus Event Management
- Push Notifications

---

# 👨‍💻 Author

Adarshin B Suresh

- MERN Stack Developer
- Full Stack Trainer
- MCA Graduate

GitHub:
https://github.com/Adarshinb

LinkedIn:
https://www.linkedin.com/in/adarshin-b-suresh

---

# ⭐ Support

If you like this project, give it a ⭐ on GitHub.
