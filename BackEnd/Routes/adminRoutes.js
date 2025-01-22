import { Router } from "express";
import adminController from "../Controllers/AdminController.js";

const router = Router();

router.post("/", adminController.createAdmin);
router.get("/", adminController.getAllAdmins);
router.get("/:id", adminController.getAdminById);
router.put("/:email", adminController.updateAdmin);
router.delete("/:id", adminController.deleteAdmin);

router.post("/login", adminController.loginAdmin);

export default router;
