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

[staff]
<img width="1905" height="1046" alt="image" src="https://github.com/user-attachments/assets/a069462b-bfee-499e-9949-ab5c5eb4dbe5" />
<img width="1910" height="1041" alt="image" src="https://github.com/user-attachments/assets/80ed0c5a-9159-4e26-b291-617bfa0aa02b" />
<img width="1913" height="1042" alt="image" src="https://github.com/user-attachments/assets/2128eeb6-dd3a-415a-80c0-3aff2be8e8e0" />
<img width="1911" height="1040" alt="image" src="https://github.com/user-attachments/assets/4bfded8a-42ec-4fb1-a81c-6d279c25ea9d" />
<img width="1913" height="1040" alt="image" src="https://github.com/user-attachments/assets/b97863d7-d32f-46d5-afcd-256eafc86f1f" />
<img width="1913" height="1005" alt="image" src="https://github.com/user-attachments/assets/6a295b54-3fa8-4ab1-a16c-f2a43d7a8178" />
<img width="1915" height="1038" alt="image" src="https://github.com/user-attachments/assets/dfaf48de-1f20-4ade-8596-a93a9bf9efe3" />
<img width="1918" height="1050" alt="image" src="https://github.com/user-attachments/assets/c6842f21-cc46-4b94-b107-80c9b4f247e2" />
<img width="1915" height="1050" alt="image" src="https://github.com/user-attachments/assets/5082c4ad-d268-482e-84bc-cfea193be2c7" />
<img width="1910" height="1062" alt="image" src="https://github.com/user-attachments/assets/c0224159-3fa7-4a70-87f7-d74f05041336" />
<img width="1919" height="1057" alt="image" src="https://github.com/user-attachments/assets/62f5a675-eef4-4d80-b786-f04ebed09d47" />

[customer]
<img width="1912" height="1049" alt="image" src="https://github.com/user-attachments/assets/34176238-28e4-41d5-8058-702cae9f8a89" />
<img width="1916" height="1054" alt="image" src="https://github.com/user-attachments/assets/1ff67616-750e-4289-bfc6-5eae7de4c127" />
<img width="1914" height="1055" alt="image" src="https://github.com/user-attachments/assets/b55a5a70-531f-4f85-8383-4a163de48b7e" />
<img width="1908" height="1049" alt="image" src="https://github.com/user-attachments/assets/e292cdad-0a0b-422e-bf4a-f7269b0e51e4" />
<img width="1909" height="1044" alt="image" src="https://github.com/user-attachments/assets/2e68deaa-f0c5-4da5-8c70-9155997f457f" />
<img width="1916" height="1043" alt="image" src="https://github.com/user-attachments/assets/8d3a84e9-4936-4e7c-92ea-b8831f84b870" />
<img width="1918" height="1054" alt="image" src="https://github.com/user-attachments/assets/ecdd1e81-b16f-45d1-ae23-06c416b63294" />
<img width="1906" height="1080" alt="image" src="https://github.com/user-attachments/assets/3d8fc7f0-6c3f-492f-9a1b-e2e8943a970e" />
<img width="1906" height="1107" alt="image" src="https://github.com/user-attachments/assets/c0bda36d-6505-4df9-beef-22127dc7da10" />
<img width="1910" height="1097" alt="image" src="https://github.com/user-attachments/assets/592a2457-e48d-473c-a732-99914c490a5c" />
<img width="1910" height="1051" alt="image" src="https://github.com/user-attachments/assets/11011e82-ed17-4cee-8906-22e9692aa579" />





















