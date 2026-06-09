const express = require("express");
const cors = require("cors");
const multer = require("multer");

const app = express();

/* =========================
   FILE UPLOAD SETUP
========================= */
const upload = multer({ dest: "uploads/" });

/* =========================
   CORS CONFIG (IMPORTANT)
========================= */
app.use(cors({
    origin: ["https://editmee.com", "https://www.editmee.com"]
}));

/* =========================
   MIDDLEWARE
========================= */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* =========================
   TEST ROUTE
========================= */
app.get("/", (req, res) => {
    res.send("Backend is working 🚀");
});

/* =========================
   PROTECT PDF ROUTE
========================= */
app.post("/protect", upload.single("file"), (req, res) => {
    try {
        console.log("File received:", req.file);

        res.json({
            success: true,
            message: "File received successfully"
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
});

/* =========================
   START SERVER
========================= */
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});