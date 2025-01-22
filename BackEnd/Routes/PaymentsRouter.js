import express from "express";
import PaymentsController from "../Controllers/PaymentsController.js";

const router = express.Router();

router.get("/", PaymentsController.getAllPaymentsWithDetails);
 router.get("/payments/total-completed-month", PaymentsController.getTotalCompletedPayments);
// router.put("/:id", PaymentsController.update);
// router.delete("/:id", PaymentsController.delete);

export default router;
