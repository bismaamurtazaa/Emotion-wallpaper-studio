# 🎨 Emotion Wallpaper Studio

An AI-powered web app that converts human emotions into stunning abstract wallpapers. Pick a feeling, choose a visual style, and watch AI generate a unique wallpaper just for you.

## ✨ Features

- **12 Emotions** — Joy, Love, Rage, Serenity, Wonder, Nostalgia, and more
- **6 Visual Styles** — Abstract Fluid, Cosmic Nebula, Watercolor, Crystalline, and more
- **3 Sizes** — Desktop (1920×1080), Mobile (1080×1920), Square (1080×1080)
- **Intensity Control** — adjust how bold or subtle the result is
- **Persistent Gallery** — wallpapers saved in browser, download anytime
- **Secure Backend** — API keys never exposed to the user

## 🛠 Tech Stack

| Layer       | Technology                  |
|-------------|------------------------------|
| Frontend    | React 18 + Vite + Tailwind CSS v4 |
| Backend     | Node.js + Express.js         |
| LLM         | Google Gemini 2.5 Flash      |
| Image Gen   | Cloudflare AI (Flux model)   |

## 🚀 How It Works

1. User selects an **emotion**, **style**, **size**, and **intensity**
2. Backend sends a structured request to **Gemini 2.5 Flash**, which crafts a vivid art prompt combining the emotion and style
3. The prompt is sent to **Cloudflare AI (Flux)** to generate the final image
4. The wallpaper is returned to the frontend and saved to the gallery

## 📦 Setup & Installation

### 1. Clone the repository
```bash
git clone https://github.com/bismaamurtazaa/Emotion-wallpaper-studio.git
cd Emotion-wallpaper-studio/emotion-wallpaper-pro
```

### 2. Backend setup
```bash
cd backend
npm install
```

Create a `.env` file in the `backend` folder:
GEMINI_API_KEY=your_gemini_api_key

CF_ACCOUNT_ID=your_cloudflare_account_id

CF_API_TOKEN=your_cloudflare_api_token

PORT=3001
Start the backend:
```bash
npm start
```

### 3. Frontend setup
Open a new terminal:
```bash
cd frontend
npm install
npm run dev
```

### 4. Open the app
Visit **http://localhost:5173**

## 🔑 Getting API Keys

- **Gemini API Key** — free at [aistudio.google.com/apikey](https://aistudio.google.com/apikey)
- **Cloudflare AI** — free at [dash.cloudflare.com](https://dash.cloudflare.com) → Workers AI → REST API (get Account ID + API Token)

## 📁 Project Structure
emotion-wallpaper-pro/

├── backend/

│   ├── server.js

│   ├── package.json

│   └── .env (not committed)

└── frontend/

├── src/

│   ├── App.jsx

│   └── components/

│       ├── EmotionGrid.jsx

│       └── WallpaperCard.jsx

├── index.html

└── package.json
## 📄 License

This project was built for educational purposes as part of a Generative AI lab.

---

Built with ❤️ by Bisma