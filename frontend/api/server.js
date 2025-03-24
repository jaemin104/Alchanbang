const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors({
  origin: process.env.VERCEL_URL ? [`https://${process.env.VERCEL_URL}`] : ["http://localhost:3000"],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

app.get("/", (req, res) => {
	res.send("Welcome to the Express Server!!");
});

const authRoutes = require("./routes/auth");
const boardRoutes = require("./routes/board");
const commentsRoutes = require("./routes/comments");
const profileRoutes = require("./routes/profile");

app.use("/api/auth", authRoutes);
app.use("/api/board", boardRoutes);
app.use("/api/comments", commentsRoutes);
app.use("/api/profile", profileRoutes);


// 포트를 5001로 변경
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));



