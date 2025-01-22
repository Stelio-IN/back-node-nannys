import { Router } from "express";
import nannyProfilesController from "../Controllers/NannyProfilesController.js";

const router = Router();

router.post("/", nannyProfilesController.createProfile); // Cria um novo perfil de babá
router.get("/", nannyProfilesController.getAllProfiles); // Lista todos os perfis de babás
router.get("/:nanny_id", nannyProfilesController.getProfileById); // Busca um perfil de babá pelo ID
router.put("/:nanny_id", nannyProfilesController.updateProfile); // Atualiza um perfil de babá pelo ID
router.delete("/:nanny_id", nannyProfilesController.deleteProfile); // Remove um perfil de babá pelo ID
router.put("/saveBusiness/:id_user", nannyProfilesController.saveBusiness);


export default router;
