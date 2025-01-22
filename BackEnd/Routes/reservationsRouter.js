import { Router } from "express";
import reservationsController from "../Controllers/ReservationsController.js";

const router = Router();

router.post("/", reservationsController.createReservation); // Cria uma nova reserva
router.get("/", reservationsController.getAllReservations); // Lista todas as reservas
router.get("/:reservation_id", reservationsController.getReservationById); // Busca uma reserva pelo ID
router.put("/:reservation_id", reservationsController.updateReservation); // Atualiza uma reserva pelo ID
router.delete("/:reservation_id", reservationsController.deleteReservation); // Remove uma reserva pelo IDget

router.get(
  "/getAll/reservations/:nanny_id",
  reservationsController.getAllReservationsForNanny
);

router.get(
  "/getAll/reservations/client/:client_id",
  reservationsController.getAllReservationsForClient
);

router.put(
  "/cancel/reservation/:id_reservation",
  reservationsController.cancelReservation
);

router.put(
  "/payClient/reservation/:id_reservation",
  reservationsController.PayReservationtoClient
);

router.put(
  "/payReservation/reservation/:id_reservation",
  reservationsController.payReservation
);

router.get(
  "/getAll/reservations",
  reservationsController.countConfirmedAndBookedReservations
);

router.get(
  "/countReservations/:nanny_id",
  reservationsController.countCompletedForNanny
);

router.get(
  "/countReservationsC/:client_id",
  reservationsController.countBookedForClient
);

router.post("/:reservationId/feedback", reservationsController.rateBook);

export default router;
