// server.js
import express from 'express';
import axios from 'axios';
import cors from 'cors';  // Importação do CORS

const app = express();
const port = process.env.PORT || 3000;

app.get('/teste', (req, res) => {
  res.send('Hello, Vercel!');
});

// Configuração do CORS para permitir todos os domínios
const corsOptions = {
  origin: "*",  // Permitir todos os domínios
  methods: ["GET", "POST", "PUT", "DELETE"], // Permitir todos os métodos
  allowedHeaders: ["Content-Type", "Authorization"], // Cabeçalhos permitidos
};

// Middleware para permitir CORS
app.use(cors(corsOptions));

// Rota para buscar países
app.get("/", async (req, res) => {
  try {
    const response = await axios.get(
      "https://countriesnow.space/api/v0.1/countries/info?returns=name"
    );
    const countries = response.data.data.map((country) => country.name);
    res.json(countries);
  } catch (error) {
    console.error("Detailed error:", error.message);
    res.status(500).json({ error: "Error fetching countries", details: error.message });
  }
});

// Rota para buscar províncias/estados de um país específico
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
    res.status(500).json({ error: "Error fetching provinces", details: error.message });
  }
});

// Inicia o servidor na porta definida
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
