const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/auth");
const boardRoutes = require("./routes/board");
const commentsRoutes = require("./routes/comments");
const profileRoutes = require("./routes/profile");

const app = express();

app.use(cors());
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

// 포트를 5001로 변경
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


  