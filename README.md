# 🎬 CineStream

> **A modern full-stack movie discovery and community-driven review platform built with React, TypeScript, Vite, Tailwind CSS, Supabase, TMDB API, and OMDb API.**

🔗 **Live Demo:** https://cinestream-psi-lyart.vercel.app/

---

## 📖 About

CineStream is a modern full-stack web application that enables users to discover trending movies, search an extensive movie catalog, explore detailed movie information, watch official trailers, create personalized watchlists, and share public reviews with the community. By integrating multiple movie APIs and Supabase, the platform delivers real-time movie data, secure authentication, and an engaging social experience through a fast, responsive interface.

---

## ✨ Key Features

* 🎥 Browse trending and popular movies powered by the **TMDB API**
* 🔍 Search thousands of movies with dynamic results using **OMDb API**
* 🎬 Watch official movie trailers via YouTube integration
* ⭐ Explore detailed movie information including ratings, genres, runtime, cast, release date, and plot
* 📝 Publish, edit, and manage public movie reviews
* 💬 Read and engage with reviews shared by other users
* ❤️ Create and manage a personalized watchlist
* 🔐 Secure authentication and user session management with Supabase
* 📱 Fully responsive design optimized for desktop, tablet, and mobile devices
* ⚡ Smooth animations and high-performance user experience powered by React and Vite

---

## 🛠 Tech Stack

### Frontend

* React
* TypeScript
* Vite
* Tailwind CSS
* Framer Motion

### Backend & Database

* Supabase
* PostgreSQL

### APIs

* TMDB API
* OMDb API
* YouTube (Movie Trailers)

### Deployment

* Vercel

---

## 🏗 Architecture

```text
React + TypeScript
        │
        ▼
     Vite Frontend
        │
        ├────────► TMDB API
        │
        ├────────► OMDb API
        │
        ├────────► YouTube
        │
        ▼
     Supabase
        │
        ▼
Authentication • Reviews • Watchlist • PostgreSQL Database
```

---

## 🚀 Getting Started

Clone the repository

```bash
git clone https://github.com/Aayushi017005/CineStream.git
```

Navigate to the project

```bash
cd cinestream-main
```

Install dependencies

```bash
npm install
```

Start the development server

```bash
npm run dev
```

Open:

```text
http://localhost:8080
```

---

## 💡 What I Learned

While building CineStream, I gained practical experience with:

* Building scalable applications using React and TypeScript
* Designing reusable and maintainable component architecture
* Integrating multiple third-party APIs (TMDB, OMDb, and YouTube)
* Managing authentication and backend services with Supabase
* Designing relational database structures for reviews and watchlists
* Handling asynchronous data fetching and state management
* Developing responsive user interfaces with Tailwind CSS
* Deploying production-ready applications on Vercel
* Managing projects using Git and GitHub

---

## 📈 Future Enhancements

* AI-powered personalized movie recommendations
* User profile pages and activity history
* Social interactions (likes, replies, and comments)
* Multi-language support
* Progressive Web App (PWA) support


---

## 🤝 Contributing

Contributions, suggestions, and feedback are welcome. Feel free to fork the repository, open an issue, or submit a pull request.

---

## 👩‍💻 Developer

**Aayushi Mishra**

If you found this project helpful, consider giving it a ⭐ on GitHub.
