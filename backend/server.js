const express = require("express");
const multer = require("multer");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const app = express();
const cors = require("cors");

/* =========================
   CORS (FIXED)
========================= */
app.use(cors({
    origin: "https://editmee.com"
}));

/* =========================
   MIDDLEWARE
========================= */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* =========================
   SERVE STATIC FILES
========================= */

app.use(
    "/tools",
    express.static(path.join(__dirname, "tools"))
);

/* =========================
   CREATE FOLDERS IF MISSING
========================= */

const uploadsDir = path.join(__dirname, "uploads");
const outputDir = path.join(__dirname, "output");

if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}

if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
}

/* =========================
   MULTER CONFIG
========================= */

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
    }
});

const upload = multer({ storage });

/* =========================
   HOME PAGE
========================= */

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

/* =========================
   UPLOAD ROUTE
========================= */

app.post("/upload", upload.single("pdf"), (req, res) => {
    if (!req.file) {
        return res.status(400).json({
            success: false,
            message: "No PDF uploaded"
        });
    }

    console.log("Uploaded:", req.file.filename);

    res.json({
        success: true,
        file: req.file.filename
    });
});

/* =========================
   SAFE PROTECT ROUTE (CLOUD VERSION)
========================= */

app.post("/protect", upload.single("pdf"), (req, res) => {
    try {
        const password = req.body.password;

        if (!req.file || !password) {
            return res.status(400).json({
                success: false,
                message: "PDF and password required"
            });
        }

        // ⚠️ Cloud-safe placeholder (no qpdf.exe in Railway)
        // Later we can upgrade to pdf-lib / cloud encryption

        const inputFile = req.file.path;

        // simulate "processing"
        setTimeout(() => {
            if (fs.existsSync(inputFile)) {
                fs.unlinkSync(inputFile);
            }

            return res.status(200).json({
                success: true,
                message: "Protect feature temporarily disabled in cloud version. We will upgrade it with cloud-compatible encryption."
            });
        }, 1000);

    } catch (err) {
        console.error(err);

        return res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
});

/* =========================
   HEALTH CHECK
========================= */

app.get("/health", (req, res) => {
    res.json({
        success: true,
        message: "Backend is running"
    });
});

/* =========================
   START SERVER
========================= */

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log("Editmee Backend Started 🚀");
});