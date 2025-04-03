// API is available at import.meta.env.VITE_API_URL

import { useState } from "react";
import {
    Container,
    Typography,
    TextField,
    Button,
    Box,
    Snackbar,
} from "@mui/material";

function App() {
    const [url, setUrl] = useState("");
    const [shortUrl, setShortUrl] = useState("");
    const [open, setOpen] = useState(false);

    const handleShorten = async () => {
        if (!url.startsWith("http")) return;

        const response = await fetch(`${import.meta.env.VITE_API_URL}api/shorten`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ targetUrl: url }),
        });

        const data = await response.json();
        setShortUrl(data.shortUrl);
        setOpen(true);
    };

    return (
        <Container maxWidth="sm" sx={{ mt: 10 }}>
            <Typography variant="h4" gutterBottom>
                URL Shortener
            </Typography>

            <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                <TextField
                    fullWidth
                    label="Paste a long URL"
                    variant="outlined"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                />
                <Button variant="contained" onClick={handleShorten}>
                    Shorten
                </Button>
            </Box>

            {shortUrl && (
                <Typography variant="body1">
                    Short URL: <a href={shortUrl}>{shortUrl}</a>
                </Typography>
            )}

            <Snackbar
                open={open}
                autoHideDuration={3000}
                onClose={() => setOpen(false)}
                message="URL shortened!"
            />
        </Container>
    );
}

export default App;

