import express from "express";
import { upload } from "../config/multer.config.js";
import { uploadFile } from "../controllers/upload.controller.js";

const router = express.Router();

router.post("/upload", upload.single("file"), uploadFile);

export default router;
