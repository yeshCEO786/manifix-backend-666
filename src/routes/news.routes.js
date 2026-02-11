import express from "express";
import { newsController } from "../controllers/news.controller.js";

const router = express.Router();
router.get("/", newsController);

export default router;
