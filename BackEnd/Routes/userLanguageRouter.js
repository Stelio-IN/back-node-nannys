import { Router } from "express";
import userLanguageController from "../Controllers/UserLanguageController.js";

const router = Router();

router.post("/:user_id", userLanguageController.createUserLanguage); 
router.get("/", userLanguageController.getAllUserLanguages); 
router.get("/:user_id/:language", userLanguageController.getUserLanguageById); 
router.put("/:user_id/:language", userLanguageController.updateUserLanguage); 
router.delete("/:user_id/:language", userLanguageController.deleteUserLanguage); 

export default router;
