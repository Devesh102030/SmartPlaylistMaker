import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";
import spotifyRoutes from "./routes/spotify.js";
import aiRoutes from "./routes/ai.js"; 

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());


app.use("/auth", authRoutes);
app.use("/spotify", spotifyRoutes);
app.use("/ai", aiRoutes); 

app.get("/", (req, res) => {
    res.send("AI Playlist Maker Backend is Running!");
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
