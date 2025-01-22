import { Router } from "express";
import FileController from "../Controllers/FilesController.js";

const router = Router();

router.delete("/deletefile/:id", FileController.deleteFile);

export default router;