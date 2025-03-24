const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/auth");
const boardRoutes = require("./routes/board");
const commentsRoutes = require("./routes/comments");
const profileRoutes = require("./routes/profile");

const app = express();

app.use(cors({
  origin: [
    "https://alchanbang.vercel.app",
    "http://localhost:3000"
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// OPTIONS 요청에 대한 추가 처리
app.options('*', cors());

app.use(express.json());

app.use((req, res, next) => {
    console.log(`📌 요청: ${req.method} ${req.url}`);
    console.log("📌 요청 헤더:", req.headers);
    next();
});

app.use("/api/auth", authRoutes);
app.use("/api/board", boardRoutes);
app.use("/api/comments", commentsRoutes);
app.use("/api/profile", profileRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
