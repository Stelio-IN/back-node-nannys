import express from "express";
import nodemailer from "nodemailer";
import cors from "cors";
import axios from "axios";
import { initializeDatabase } from "./Models/index.js"; // Ajuste o caminho conforme necessário
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import fs from "fs";
import paypal from "./services/paypal.js"; // Módulo PayPal
import dotenv from "dotenv";
dotenv.config();

const app = express();

// CORS options
const corsOptions = {
  origin: ["https://nanniesfinder.com", "https://www.nanniesfinder.com"], // Lista de domínios permitidos
  methods: ["GET", "POST", "PUT", "DELETE"], // Permitir todos os métodos
  allowedHeaders: ["Content-Type", "Authorization"], // Cabeçalhos permitidos
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rotas
import routerAdmin from "./Routes/adminRoutes.js";
import routerUser from "./Routes/usersRouter.js";
import routerNanny from "./Routes/nannyProfilesRouter.js";
import UserLanguage from "./Routes/userLanguageRouter.js";
import NannyChildAgeExperience from "./Routes/nannyChildAgeExperienceRouter.js";
import NannyChildWorkPreference from "./Routes/nannyChildWorkPreferenceRouter.js";
import ServiceRequests from "./Routes/serviceRequestsRouter.js";
import Reservations from "./Routes/reservationsRouter.js";
import Client from "./Routes/clientRoutes.js";
import Payment from "./Routes/PaymentsRouter.js";
import AdminController from "./Controllers/AdminController.js";
import ClientController from "./Controllers/ClientController.js";
import Admin from "./Routes/adminRoutes.js";
import File from "./Routes/filesRouter.js";
import Reviews from "./Routes/reviewsRouter.js";

app.use("/admin", routerAdmin);
app.use("/user", routerUser);
app.use("/lang", UserLanguage);
app.use("/nanny", routerNanny);
app.use("/experienceAge", NannyChildAgeExperience);
app.use("/experienceWork", NannyChildWorkPreference);
app.use("/requestServices", ServiceRequests);
app.use("/reservations", Reservations);
app.use("/client", Client);
app.use("/Payment", Payment);
app.use("/Admin", Admin);
app.use("/File", File);
app.use("/Review", Reviews);

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/requestServices", ServiceRequests);
app.use("/reservations", Reservations);
app.use("/client", Client);

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Supondo que você esteja usando Express.js
app.get("/count-users", async (req, res) => {
  try {
    const counts = await ClientController.countUsers(); // Chama a função de contagem de usuários
    res.json(counts); // Envia o resultado como resposta JSON
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Route to fetch countries
app.get("/countries", async (req, res) => {
  try {
    const response = await axios.get(
      "https://countriesnow.space/api/v0.1/countries/info?returns=name"
    );
    const countries = response.data.data.map((country) => country.name);
    res.json(countries);
  } catch (error) {
    console.error("Detailed error:", error.message);
    res
      .status(500)
      .json({ error: "Error fetching countries", details: error.message });
  }
});

// Route to fetch provinces/states for a specific country
app.get("/provinces/:country", async (req, res) => {
  try {
    const response = await axios.post(
      "https://countriesnow.space/api/v0.1/countries/states",
      {
        country: req.params.country,
      }
    );
    const provinces = response.data.data.states.map((state) => state.name);
    res.json(provinces);
  } catch (error) {
    console.error("Detailed error:", error.message);
    res
      .status(500)
      .json({ error: "Error fetching provinces", details: error.message });
  }
});

// Static list of languages
app.get("/languages", (req, res) => {
  const languages = [
    "Afrikaans",
    "Albanian",
    "Arabic",
    "Armenian",
    "Basque",
    "Bengali",
    "Bosnian",
    "Bulgarian",
    "Catalan",
    "Chinese",
    "Croatian",
    "Czech",
    "Danish",
    "Dutch",
    "English",
    "Estonian",
    "Finnish",
    "French",
    "Georgian",
    "German",
    "Greek",
    "Gujarati",
    "Haitian Creole",
    "Hebrew",
    "Hindi",
    "Hungarian",
    "Icelandic",
    "Indonesian",
    "Italian",
    "Japanese",
    "Kazakh",
    "Khmer",
    "Korean",
    "Kurdish",
    "Latvian",
    "Lithuanian",
    "Macedonian",
    "Malay",
    "Maltese",
    "Norwegian",
    "Persian",
    "Polish",
    "Portuguese",
    "Romanian",
    "Russian",
    "Serbian",
    "Sinhala",
    "Slovak",
    "Slovenian",
    "Spanish",
    "Swahili",
    "Swedish",
    "Tamil",
    "Telugu",
    "Thai",
    "Turkish",
    "Ukrainian",
    "Urdu",
    "Vietnamese",
    "Welsh",
    "Xhosa",
    "Yiddish",
    "Zulu",
  ];
  res.json({ languages });
});

// Send email
app.post("/send-email", async (req, res) => {
  const { name, email, subject, message } = req.body;
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "ediltonmagudo@gmail.com",
      pass: "unom owtx nfvr faqj", // Use a senha de aplicativo para segurança
    },
  });

  const mailOptions = {
    from: email,
    to: "ediltonmagudo@gmail.com",
    subject: subject,
    text: `Mensagem de ${name} (${email}):\n\n${message}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "E-mail enviado com sucesso!" });
  } catch (error) {
    console.error("Erro ao enviar o e-mail:", error);
    res
      .status(500)
      .json({ error: "Erro ao enviar o e-mail", details: error.message });
  }
});



import ReservationController from "./Controllers/ReservationsController.js";

let id_reserva = "";
app.post("/sam/pay", async (req, res) => {
  try {
    const { reservationId, amount } = req.body;
    console.log(req.body);
    id_reserva = reservationId;
    console.log(req.body);
    if (!reservationId || !amount) {
      return res.status(400).send("Missing required payment information");
    }

    // Create PayPal order with reservationId stored in custom_id
    const url = await paypal.createOrder(amount, reservationId);

    if (!url) {
      return res.status(500).send("Failed to create PayPal order");
    }
    res.redirect(url);
  } catch (error) {
    console.error("Error in /pay route:", error);
    res.status(500).send("Error: " + error.message);
  }
});

// Complete PayPal Order Route
app.get("/complete-order", async (req, res) => {
  try {
    const result = await paypal.capturePayment(req.query.token);

    // Get the reservationId from custom_id in PayPal response
    const reservationId = id_reserva;

    if (!reservationId) {
      throw new Error("Reservation ID not found in PayPal response");
    }

    // Create request object with the correct parameter name
    const mockReq = {
      params: {
        id_reservation: reservationId,
      },
    };

    // Create a promise-based wrapper for the controller method
    const updatePromise = new Promise((resolve, reject) => {
      const mockRes = {
        status: (code) => ({
          json: (data) => {
            if (code === 200) {
              resolve(data);
            } else {
              reject(new Error(data.message || "Payment processing failed"));
            }
          },
        }),
      };

      // Call the controller method
      ReservationController.payReservation(mockReq, mockRes);
    });

    // Wait for the update to complete
    await updatePromise;

    // Redirect to success page
    res.redirect(`/payment-success?reservationId=${reservationId}`);
  } catch (error) {
    console.error("Error completing payment:", error);
    res.redirect("/payment-error");
  }
});

app.get("/cancel-order", (req, res) => {
  res.redirect("/reservations");
});

app.get("/payment-success", (req, res) => {
  const reservationId = req.query.reservationId;

  // Redirecionar para o frontend com o ID da reserva como query parameter, se necessário
  res.redirect(
    `http://localhost:5173/client-dashboard?reservationId=${reservationId}`
  );
});

app.get("/payment-error", (req, res) => {
  res.send("Payment failed. Please try again.");
});

const EXCHANGE_RATE_API_URL = 'https://api.exchangerate-api.com/v4/latest/MZN';

// Route to fetch all currencies
app.get('/currencies', async (req, res) => {
    try {
        const response = await axios.get(EXCHANGE_RATE_API_URL);
        const { rates } = response.data;

        // Prepare data for response
        const currencies = Object.entries(rates).map(([currency, rate]) => ({
            currency,
            rate,
        }));

        res.json({
            success: true,
            base: response.data.base,
            date: response.data.date,
            currencies,
        });
    } catch (error) {
        console.error('Error fetching currencies:', error);
        res.status(500).json({
            success: false,
            message: 'Unable to fetch currency data',
        });
    }
});

// Route to convert between two currencies
app.post('/convert', async (req, res) => {
    const { from, to, amount } = req.body;

    if (!from || !to || !amount) {
        return res.status(400).json({
            success: false,
            message: 'Please provide valid query parameters: from, to, and amount',
        });
    }

    try {
        const response = await axios.get(EXCHANGE_RATE_API_URL);
        const { rates } = response.data;

        if (!rates[from] || !rates[to]) {
            return res.status(400).json({
                success: false,
                message: 'Invalid currency codes provided',
            });
        }

        const convertedAmount = (amount / rates[from]) * rates[to];

        res.json({
            success: true,
            from,
            to,
            amount: parseFloat(amount),
            convertedAmount: parseFloat(convertedAmount.toFixed(2)),
        });
    } catch (error) {
        console.error('Error converting currencies:', error);
        res.status(500).json({
            success: false,
            message: 'Unable to perform currency conversion',
        });
    }
});


//Mpesa 
import mpesaService from './services/mpesa.js';

// app.post("/mpesa/pay", async (req, res) => {
//   try {
//     const { reservationId, amount, phoneNumber } = req.body;
    
//     if (!amount || !phoneNumber || !reservationId) {
//       return res.status(400).json({ error: "Missing required payment information" });
//     }

//     const result = await mpesaService.pagamentoMpesa(amount, phoneNumber, reservationId);

//     if (result.status === 'timeout') {
//       return res.status(408).json({
//         message: result.message,
//         reference: result.reference,
//         details: result.details
//       });
//     }

//     if (result.success) {
//       res.status(200).json({
//         message: "Payment processed successfully",
//         ...result
//       });
//     } else {
//       res.status(400).json({
//         message: result.message || "Payment processing failed",
//         ...result
//       });
//     }

//   } catch (error) {
//     console.error("Error processing payment:", error);
//     res.status(500).json({
//       error: "Error processing payment",
//       details: error.message
//     });
//   }
// });


// Initialize database before starting the server

app.post("/mpesa/pay", async (req, res) => {
  try {
    const { reservationId, amount, phoneNumber } = req.body;

    // Validação dos dados de entrada
    if (!amount || !phoneNumber || !reservationId) {
      return res.status(400).json({ error: "Missing required payment information" });
    }

    // Chamada ao serviço de pagamento
    const result = await mpesaService.pagamentoMpesa(amount, phoneNumber, reservationId);

    // Tratamento de timeout
    if (result.status === 'timeout') {
      return res.status(408).json({
        message: result.message,
        reference: result.reference,
        details: result.details
      });
    }

    // Verificação do sucesso do pagamento
    if (result.success) {
      // Redireciona para a rota de sucesso com o ID da reserva
      return res.redirect(`/payment-success?reservationId=${reservationId}`);
    } else {
      // Retorna erro se o pagamento falhar
      return res.status(400).json({
        message: result.message || "Payment processing failed",
        ...result
      });
    }
  } catch (error) {
    console.error("Error processing payment:", error);

    // Resposta em caso de erro interno
    return res.status(500).json({
      error: "Error processing payment",
      details: error.message
    });
  }
});

const startServer = async () => {
  try {
    await initializeDatabase();
    AdminController.initializeAdmin();

    const PORT = process.env.PORT || 3005;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

// Start the server
startServer();
