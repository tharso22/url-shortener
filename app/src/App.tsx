// API is available at import.meta.env.VITE_API_URL

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
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";

function App() {
    const [url, setUrl] = useState("");
    const [shortUrl, setShortUrl] = useState("");
    const [open, setOpen] = useState(false);
    const [expiresAt, setExpiresAt] = useState<Dayjs | null>(null);

    const handleShorten = async () => {
        if (!url.startsWith("http")) return;

        const response = await fetch(`${import.meta.env.VITE_API_URL}api/shorten`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                targetUrl: url,
                expiresAt: expiresAt ? expiresAt.toISOString() : undefined,
            }),
        });

        const data = await response.json();
        setShortUrl(data.shortUrl);
        setOpen(true);
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
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

                <Box sx={{ mb: 2 }}>
                    <DateTimePicker
                        label="Expiration Date (optional)"
                        value={expiresAt}
                        onChange={setExpiresAt}
                        slotProps={{ textField: { fullWidth: true } }}
                    />
                </Box>

                {shortUrl && (
                    <Typography variant="body1">
                        Short URL:{" "}
                        <a href={shortUrl} target="_blank" rel="noopener noreferrer">
                            {shortUrl}
                        </a>
                    </Typography>
                )}

                <Snackbar
                    open={open}
                    autoHideDuration={3000}
                    onClose={() => setOpen(false)}
                    message="URL shortened!"
                />
            </Container>
        </LocalizationProvider>
    );
}

export default App;
