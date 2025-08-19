# Eva Chatbot - Next.js Version

A modern chatbot application built with Next.js that collects user information, provides service selection, and enables live chat with administrators.

## Features

- **User Information Collection**: Collects name, phone, email, and organization
- **Service Selection**: Interactive service and sub-service selection
- **Live Chat**: Real-time chat between users and administrators using Socket.IO
- **Admin Dashboard**: Admin panel to view submitted users and manage chats
- **Responsive Design**: Works on desktop and mobile devices
- **MongoDB Integration**: Stores user data and chat messages

## Technology Stack

- **Frontend**: Next.js, React, JavaScript
- **Backend**: Next.js API Routes, Node.js
- **Database**: MongoDB
- **Real-time Communication**: Socket.IO
- **Styling**: CSS-in-JS (styled-jsx)

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB Atlas account or local MongoDB instance
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd himani-didi
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Copy `env.example` to `.env.local`
   - Fill in your MongoDB credentials and admin details:
     ```
     MONGO_USER=your_mongodb_username
     MONGO_PASS=your_mongodb_password
     MONGO_CLUSTER=your_mongodb_cluster
     ADMIN_EMAIL=admin@example.com
     ADMIN_PASSWORD=your_admin_password
     PORT=3000
     ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) to view the application.

### Production Deployment

1. Build the application:
   ```bash
   npm run build
   ```

2. Start the production server:
   ```bash
   npm start
   ```

## Application Structure

```
├── lib/
│   ├── mongodb.js      # MongoDB connection utility
│   └── auth.js         # Authentication utilities
├── pages/
│   ├── api/            # API routes
│   │   ├── auth/
│   │   ├── admin/
│   │   └── messages/
│   ├── chat/
│   │   └── [id].js     # Dynamic chat page
│   ├── _app.js         # Next.js app component
│   ├── index.js        # Main chatbot page
│   ├── login.js        # Admin login page
│   └── admin.js        # Admin dashboard
├── public/             # Static assets
├── styles/             # Global styles
├── server.js           # Custom server with Socket.IO
└── next.config.js      # Next.js configuration
```

## API Endpoints

- `POST /api/submit` - Submit user details
- `POST /api/update-feedback` - Update user feedback
- `POST /api/update-final-message` - Update final message
- `POST /api/auth/login` - Admin login
- `GET /api/admin/users` - Get all users (admin)
- `GET /api/admin/user/[id]` - Get specific user (admin)
- `GET /api/messages/[user_id]` - Get chat messages

## Usage

### For Users
1. Visit the homepage
2. Enter your details (name, phone, email, organization)
3. Select service preferences
4. Wait for an admin to connect
5. Chat with the admin
6. Provide feedback when the chat ends

### For Administrators
1. Go to `/login` and enter admin credentials
2. View the dashboard at `/admin` to see all submitted users
3. Click "Chat" next to any user to start a conversation
4. End the chat when complete

## Development

The application uses:
- **Custom Server**: `server.js` handles Socket.IO alongside Next.js
- **API Routes**: Handle backend logic and database operations
- **React Hooks**: Manage state and effects in components
- **styled-jsx**: Component-scoped CSS styling

## Environment Variables

Required environment variables:

- `MONGO_USER`: MongoDB username
- `MONGO_PASS`: MongoDB password  
- `MONGO_CLUSTER`: MongoDB cluster URL
- `ADMIN_EMAIL`: Admin login email
- `ADMIN_PASSWORD`: Admin login password
- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment (development/production)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the ISC License.# chat-bot-
