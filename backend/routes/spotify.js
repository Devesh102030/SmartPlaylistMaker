import express from "express";
import axios from "axios";

const router = express.Router();

router.post("/search-tracks", async (req, res) => {
    const { access_token, songs } = req.body;

    if (!access_token || !songs || songs.length === 0) {
        return res.status(400).json({ error: "Access token and song list are required" });
    }

    try {
        const trackURIs = [];

        for (const song of songs) {
            const response = await axios.get(
                "https://api.spotify.com/v1/search",
                {
                    params: { q: song, type: "track", limit: 1 },
                    headers: {
                        Authorization: `Bearer ${access_token}`
                    }
                }
            );

            const track = response.data.tracks.items[0];
            if (track) {
                trackURIs.push(track.uri);
            }
        }

        res.json({ trackURIs });
    } catch (error) {
        console.error("Error searching for tracks:", error.response?.data || error.message);
        res.status(500).json({ error: "Failed to search for tracks" });
    }
});

router.post("/create-playlist", async (req, res) => {
    const { access_token, name, trackURIs } = req.body;

    if (!access_token || !name || !trackURIs || trackURIs.length === 0) {
        return res.status(400).json({ error: "Missing required parameters" });
    }

    try {
        
        const userResponse = await axios.get("https://api.spotify.com/v1/me", {
            headers: { Authorization: `Bearer ${access_token}` }
        });

        const user_id = userResponse.data.id;
        
        const playlistResponse = await axios.post(
            `https://api.spotify.com/v1/users/${user_id}/playlists`,
            { name, description: "AI-Generated Playlist", public: false },
            { headers: { Authorization: `Bearer ${access_token}`, "Content-Type": "application/json" } }
        );

        const playlistId = playlistResponse.data.id;

        
        await axios.post(
            `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
            { uris: trackURIs },
            { headers: { Authorization: `Bearer ${access_token}`, "Content-Type": "application/json" } }
        );

        res.json({ message: "Playlist created successfully!", playlistId });
    } catch (error) {
        console.error("Error creating playlist:", error.response?.data || error.message);
        res.status(500).json({ error: "Failed to create playlist" });
    }
});

export default router; 
