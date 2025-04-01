import express from "express";
import axios from "axios";
import querystring from "querystring";
import dotenv from "dotenv";

dotenv.config(); // Load environment variables

const router = express.Router();

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REDIRECT_URI = process.env.SPOTIFY_REDIRECT_URI;

router.get("/login", (req, res) => {
    const scope = "playlist-modify-public playlist-modify-private";
    const authURL = `https://accounts.spotify.com/authorize?${querystring.stringify({
        response_type: "code",
        client_id: CLIENT_ID,
        scope: scope,
        redirect_uri: REDIRECT_URI,
    })}`;
    res.redirect(authURL);
});

router.get("/callback", async (req, res) => {
    const code = req.query.code || null;

    try {
        const tokenResponse = await axios.post(
            "https://accounts.spotify.com/api/token",
            querystring.stringify({
                code,
                redirect_uri: REDIRECT_URI,
                grant_type: "authorization_code",
            }),
            {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    Authorization: `Basic ${Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64")}`,
                },
            }
        );

        const { access_token, refresh_token } = tokenResponse.data;

    
        res.redirect(`http://localhost:5173?access_token=${access_token}&refresh_token=${refresh_token}`);
    } catch (error) {
        console.error("Error getting token:", error.response?.data || error.message);
        res.status(500).send("Authentication failed!");
    }
});


router.get("/refresh", async (req, res) => {
    const refreshToken = req.query.refresh_token || null;

    try {
        const response = await axios.post(
            "https://accounts.spotify.com/api/token",
            querystring.stringify({
                refresh_token: refreshToken,
                grant_type: "refresh_token",
            }),
            {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    Authorization: `Basic ${Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64")}`,
                },
            }
        );

        res.json(response.data);
    } catch (error) {
        console.error("Error refreshing token:", error.response?.data || error.message);
        res.status(400).send("Error refreshing token");
    }
});

export default router; 
