const express = require("express");
const multer = require("multer");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const { exec } = require("child_process");

const app = express();

/* =========================
   MIDDLEWARE
========================= */

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* =========================
   SERVE STATIC FILES
========================= */

app.use(
    "/tools",
    express.static(
        path.join(__dirname, "tools")
    )
);

/* =========================
   CREATE FOLDERS IF MISSING
========================= */

const uploadsDir = path.join(
    __dirname,
    "uploads"
);

const outputDir = path.join(
    __dirname,
    "output"
);

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

        cb(
            null,
            uploadsDir
        );

    },

    filename: (req, file, cb) => {

        cb(
            null,
            Date.now() +
            "-" +
            file.originalname
        );

    }

});

const upload = multer({
    storage
});

/* =========================
   HOME PAGE
========================= */

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "EditMee PDF API is running"
    });
});
/* =========================
   UPLOAD ROUTE
========================= */

app.post(
    "/upload",
    upload.single("pdf"),
    (req, res) => {

        if (!req.file) {

            return res
                .status(400)
                .json({
                    success: false,
                    message: "No PDF uploaded"
                });

        }

        console.log(
            "Uploaded:",
            req.file.filename
        );

        res.json({

            success: true,

            file: req.file.filename

        });

    }
);

/* =========================
   PROTECT PDF
========================= */

app.post(
    "/protect",
    upload.single("pdf"),

    (req, res) => {

        console.log("PROTECT ROUTE HIT");
        console.log("FILE:", req.file);
        console.log("BODY:", req.body);

        try {

            const password =
                req.body.password;

            if (
                !req.file ||
                !password
            ) {

                return res
                    .status(400)
                    .json({
                        success: false,
                        message:
                            "PDF and password required"
                    });

            }

            const inputFile =
                req.file.path;

            const outputFile =
                path.join(
                    outputDir,
                    `protected-${Date.now()}.pdf`
                );

            const command =
                `qpdf --encrypt "${password}" "${password}" 256 -- ` +
                `"${inputFile}" "${outputFile}"`;

            console.log("RUNNING COMMAND:", command);

            exec(
                command,
                (error, stdout, stderr) => {

                    if (error) {

                        console.error("QPDF ERROR:", error);
                        console.error("STDERR:", stderr);

                        if (
                            fs.existsSync(
                                inputFile
                            )
                        ) {
                            fs.unlinkSync(
                                inputFile
                            );
                        }

                        return res
                            .status(500)
                            .json({
                                success: false,
                                message:
                                    error.message
                            });

                    }

                    res.download(
                        outputFile,
                        "protected.pdf",
                        (err) => {

                            if (
                                fs.existsSync(
                                    inputFile
                                )
                            ) {
                                fs.unlinkSync(
                                    inputFile
                                );
                            }

                            if (
                                fs.existsSync(
                                    outputFile
                                )
                            ) {
                                fs.unlinkSync(
                                    outputFile
                                );
                            }

                            if (err) {
                                console.error(
                                    "DOWNLOAD ERROR:",
                                    err
                                );
                            }

                        }
                    );

                }
            );

        }
        catch (err) {

            console.error(
                "SERVER ERROR:",
                err
            );

            res.status(500)
                .json({
                    success: false,
                    message:
                        "Server Error"
                });

        }

    }
);

/* =========================
   ERROR HANDLER
========================= */

app.use((err, req, res, next) => {

    console.error("MULTER ERROR:", err);

    res.status(500).json({
        success: false,
        error: err.message,
        field: err.field
    });

});

/* =========================
   START SERVER
========================= */

const PORT = process.env.PORT || 3000;

app.listen(
    PORT,
    () => {

        console.log(
            `Server running on port ${PORT}`
        );

    }
);