import { Router } from "express";
import multer from "multer";
import usersController from "../Controllers/UsersController.js";
import upload from "../Middlewares/upload.js"; // Importa a configuração existente de `multer`
import up from "../Middlewares/uploadPic.js";

const router = Router();

// Rotas com upload configurado
router.post("/", upload.single('file'), usersController.createUser);

router.post('/register', upload.fields([{ name: 'idCopy', maxCount: 1 }]), usersController.createNannyUser);

// Rotas sem upload
router.post('/login', usersController.loginUser);
router.get("/", usersController.getAllUsers);
router.get("/:user_id", usersController.getUserById);
router.put("/:user_id", usersController.updateUser);
router.delete("/:user_id", usersController.deleteUser);
router.put("/upd/Pas",usersController.changePassword );

router.put('/uploadProfile/Picture/:user_id', up.single('profilePicture'), usersController.uploadProfilePicture);

router.get("/:user_id/profile-picture", usersController.getUserProfilePicture);

// Rota de atualização de perfil (usando `multer` básico para processar `multipart/form-data`)
router.put("/updatenannyProfiles/:id_user", upload.single('policeClearanceFile'), usersController.updatedProfile);

router.post("/getAllNannyWith/Requirement", usersController.getAllNannyWithRequirement)

router.post('/changeStatus', usersController.changeStatus);

router.put('/saveLocation/:id_user', usersController.saveLocation);

router.put('/save/Phone/:id_user', usersController.savePhone);

export default router;
