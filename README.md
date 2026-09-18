# Our Little World ❤️ | Private Couple Digital Scrapbook

A beautiful, romantic, private couple website created exclusively for two people. Built with **React.js + Vite**, **Node.js + Express**, **MySQL** (with automatic zero-config **SQLite** fallback for effortless setup), private authenticated media storage, handwritten love notes, PIN-protected secret vault, visual timeline, countdown timers, floating hearts particles, ambient music player, and mobile responsiveness.

---

## 🌟 Key Features

1. **Private Authentication & Security**:
   - Only authorized couple users can log in and view memories. //username couple
   - Passwords hashed securely using `bcryptjs`.  //password:onlylove2819
   - JWT tokens stored in HTTP-Only cookies or Authorization headers.

2. **Private Photo Gallery**:
   - Uploaded photos are **NOT publicly accessible**.
   - Images are stored in a non-public directory (`backend/uploads/memories/`) and served strictly through an authenticated route (`/api/media/:filename`).
   - Drag-and-drop upload, client-side preview, file type validation (JPG, JPEG, PNG, WEBP), max 10MB limit.
   - Masonry photo grid, date filtering, search, and full-screen private Lightbox viewer with arrow navigation.

3. **Love Dashboard**:
   - Live ticker displaying **Days, Hours, Minutes, and Seconds** together.
   - Rotating romantic quotes widget.
   - Quick navigation shortcut cards.

4. **Handwritten Love Letters**:
   - Digital love notes styled like physical letters.
   - Categories ("Why I Love You", "Open When...", "Future", "Random Thought").
   - Bookmark & letter fold expansion view.

5. **Our Story & Relationship Timeline**:
   - Narrative stages ("How It Started", "First Conversation", "First Date", "Favorite Memory", "Today").
   - Visual vertical timeline with photos, dates, and milestone descriptions.

6. **Secret Corner 🔐**:
   - Protected by a custom 4-digit PIN setup in Settings.
   - Housed in a dark velvet, mysterious aesthetic.
   - Contains confidential bucket lists, future travel plans, and private messages.

7. **Countdowns & Special Days**:
   - Important date counter for Anniversaries, Birthdays, First Meetings, and Trips.
   - Displays live counters like *"127 days to go"* or *"Today is the day! 🎉"*.

8. **Ambient Audio Player**:
   - Bottom-corner music player (Play/Pause, Progress bar, Volume slider).
   - Non-autoplay to respect user preference.

9. **Easy Personalization**:
   - Central top-level configuration in `frontend/src/config.js` and dynamic settings management in the UI.

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js** (v18 or higher)
- **npm** (v9 or higher)
- **MySQL** (Optional, recommended for production. If MySQL is not running, the application automatically runs on built-in **SQLite**!)

---

### Step 1: Install Dependencies

From the project root directory, run:

```bash
# Install root, backend, and frontend packages all at once
npm run install:all
```

Or manually in separate directories:

```bash
# Root
npm install

# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

---

### Step 2: Configure Environment Variables

The backend uses environment variables specified in `backend/.env`.

A default `.env` is provided out of the box:

```env
PORT=5000
NODE_ENV=development
JWT_SECRET=our_little_world_super_secret_jwt_key_2026_xoxo

# Database type: 'sqlite' (zero-config) or 'mysql'
DB_TYPE=sqlite

# MySQL settings (used when DB_TYPE=mysql)
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=our_little_world
DB_PORT=3306

# Couple Personalization Defaults
MY_NAME=Alex
GF_NAME=Sophia
RELATIONSHIP_START_DATE=2023-02-14
ANNIVERSARY_DATE=2023-02-14
SECRET_PIN=1234
```

---

### Step 3: Database Setup

#### Option A: MySQL (Production / Standard)
1. Open your MySQL client (MySQL Workbench, phpMyAdmin, or CLI).
2. Execute the provided script in `backend/database/schema.sql`:
   ```bash
   mysql -u root -p < backend/database/schema.sql
   ```
3. Update `backend/.env` with your MySQL credentials:
   ```env
   DB_TYPE=mysql
   DB_USER=root
   DB_PASSWORD=your_password
   ```

#### Option B: SQLite (Instant Zero-Config Development)
- Simply leave `DB_TYPE=sqlite` in `backend/.env`.
- The app automatically initializes `backend/database/our_little_world.sqlite` and seeds the tables and initial user data.

---

### Step 4: Run the Application

You can start both backend and frontend concurrently with a single command from the root directory:

```bash
npm run dev
```

Or run them individually in two terminal windows:

- **Backend** (`http://localhost:5000`):
  ```bash
  cd backend
  npm run dev
  ```

- **Frontend** (`http://localhost:5173`):
  ```bash
  cd frontend
  npm run dev
  ```

Open your browser and visit: **`http://localhost:5173`**

---

## 🔑 First Login Credentials

When the database is initialized for the first time, default credentials are created:

- **Username**: `couple`
- **Password**: `love1234`
- **Secret Corner PIN**: `1234`

> 💡 **Tip**: You can change your password, couple names, start date, anniversary, and Secret Corner PIN anytime under the **Settings ⚙️** tab.

---

## 🔒 Private Photo Storage & Security

- Uploaded images are stored in `backend/uploads/memories/`.
- **Public static file serving is disabled**.
- To view an image, requests must go through `/api/media/:filename`, which requires a valid JWT authentication token (cookie or `Authorization: Bearer <token>`).
- If an unauthenticated user attempts to access photo files directly via URL, the backend rejects the request with `401 Unauthorized`.

## ☁️ Deploy on Render

This repository includes `render.yaml` for a single Render web service. Connect the repository in Render and choose **Blueprint** deployment. Render will build the Vite frontend, start the Express backend, and serve both from one URL.

Before deploying, set `SECRET_PIN` and `DEFAULT_PASSWORD` in Render's environment variables. For durable production storage, set `DB_TYPE=mysql` and provide a managed MySQL connection; the default SQLite database and uploaded files on the free service are not durable across instance replacement.

---

## ⚙️ Customizing Personalization (`src/config.js`)

You can edit default couple settings directly in `frontend/src/config.js`:

```javascript
export const CONFIG = {
  MY_NAME: "Alex",
  GF_NAME: "Sophia",
  RELATIONSHIP_START_DATE: "2023-02-14",
  ANNIVERSARY_DATE: "2023-02-14",
  WEBSITE_TITLE: "Our Little World ❤️",
  SUBTITLE: "Just you and me.",
  ...
};
```

---

## 🛡️ Production Security Checklist

1. Change `JWT_SECRET` in `backend/.env` to a long random string.
2. Change the default couple password and Secret PIN in the Settings page.
3. Set `NODE_ENV=production` in `backend/.env`.
4. Serve the application behind HTTPS (Nginx / Cloudflare / Vercel / Render).
