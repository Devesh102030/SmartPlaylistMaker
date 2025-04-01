import express from "express";
import axios from "axios";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config(); 

const router = express.Router();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY; 

router.post("/generate-songs", async (req, res) => {
    const { prompt } = req.body;

    if (!prompt) {
        return res.status(400).json({ error: "Prompt is required" });
    }

    try {
        const genAI = new GoogleGenerativeAI(`${GEMINI_API_KEY}`);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const result = await model.generateContent(`Give me a list of 10 popular songs based on this request: ${prompt}. Only return song titles and artist names in a comma-separated format.`);
        const response = await result.response; 
        const aiResponse = response.text(); 

        const songs = aiResponse.split(",").map(song => song.trim());

        res.json({ songs });
    } catch (error) {
        console.error("Error fetching songs:", error);
        res.status(500).json({ error: "Failed to generate song list" });
    }
});

export default router; // ✅ Export as ES module

