# MomBabyMilk

E-commerce platform for premium milk products for moms and babies. Built with the MERN stack (MongoDB, Express, React, Node.js).

## 🏗️ Project Structure

This is a monorepo containing:

```
MomBabyMilk/
├── server/          # Backend API (Node.js + Express + MongoDB)
│   ├── models/      # Mongoose models
│   ├── routes/      # Express routes
│   └── server.js    # Main server file
├── client/          # Frontend (React + Vite + Tailwind CSS)
│   ├── src/         # React components
│   └── public/      # Static assets
└── package.json     # Root package for workspace management
```

## 👨‍💻 My Contribution
- Developed UI components using React + Tailwind CSS
- Integrated frontend with backend API
- Implemented product listing page
- Fixed bugs and improved UI responsiveness

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/HuyFPT-School/MomBabyMilk.git
cd MomBabyMilk
```

2. Install dependencies for both server and client:
```bash
npm install
cd server && npm install
cd ../client && npm install
```

3. Set up environment variables:

**Server** - Create `server/.env`:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/mombabymilk
NODE_ENV=development
```

**Client** - Create `client/.env`:
```
VITE_API_URL=http://localhost:5000
```

### Running the Application

**Run both server and client concurrently:**
```bash
npm run dev
```

**Or run them separately:**

```bash
# Terminal 1 - Run server
npm run dev

# Terminal 2 - Run client
npm run dev
```

The application will be available at:
- Client: http://localhost:5173 || https://mom-baby-milk-client.vercel.app/
- Server: http://localhost:5000 || https://mombabymilk.onrender.com

## 📚 API Endpoints

### Health Check
- `GET /api/health` - Check server and database status

## 🛠️ Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express** - Web framework
- **Mongoose** - MongoDB ODM
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment variable management

### Frontend
- **React** - UI library
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework

## 📝 Features

- 🍼 Product catalog for baby formula
- 🥛 Baby food products
- 👶 Baby care accessories
- 🛒 Shopping cart functionality (coming soon)
- 👤 User authentication (coming soon)
- 📦 Order management (coming soon)



## 📄 License

This project is licensed under the ISC License.
[admin dashboard]
demo <img width="1916" height="1093" alt="image" src="https://github.com/user-attachments/assets/260a80c1-70fa-4934-8471-55d155bb4934" />
[admin managerment account]
<img width="1916" height="1035" alt="image" src="https://github.com/user-attachments/assets/6c578766-77e2-4b68-a32f-af171a2635b5" />
[admin Revenue Statistics]
<img width="1914" height="1038" alt="image" src="https://github.com/user-attachments/assets/0f4533fc-927c-4f6a-ae8a-04626a05d319" />



