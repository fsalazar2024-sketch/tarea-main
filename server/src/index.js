// ============================================================
// server/src/index.js
// API de la vitrina de catálogo — Build an Impact
// Node.js 18+ | Express 5
// ============================================================

import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  loadCatalog,
  getProductos,
  getFiltros,
  getProductoPorId,
} from "./catalog.js";

// ------------------------------
// Configuración de rutas
// ------------------------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = path.resolve(__dirname, "..", "..");
const MOCKUP_DIR = path.join(ROOT_DIR, "mockup");
const DATA_FILE = path.join(ROOT_DIR, "data", "catalog.csv");

const PORT = Number.parseInt(process.env.PORT, 10) || 3000;

// ------------------------------
// Carga inicial del catálogo
// ------------------------------
let catalogo = [];

try {
  catalogo = loadCatalog(DATA_FILE);
  console.log(`Catálogo cargado: ${catalogo.length} productos`);
} catch (error) {
  console.error("No se pudo cargar el catálogo:", error.message);
  process.exit(1);
}

// ------------------------------
// Aplicación Express
// ------------------------------
const app = express();

app.disable("x-powered-by");
app.use(express.json({ limit: "100kb" }));

// ------------------------------
// Cabeceras de seguridad
// ------------------------------
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "no-referrer");
  res.setHeader("Cross-Origin-Resource-Policy", "same-origin");
  next();
});

// ------------------------------
// Archivos estáticos del mockup
// ------------------------------
app.use(express.static(MOCKUP_DIR));

// ------------------------------
// Validaciones básicas
// ------------------------------
function parseEntero(valor, porDefecto, min, max) {
  const n = Number.parseInt(valor, 10);
  if (Number.isNaN(n)) return porDefecto;
  return Math.min(Math.max(n, min), max);
}

function parseTexto(valor, maxLength = 100) {
  if (typeof valor !== "string") return "";
  return valor.trim().slice(0, maxLength);
}

// ------------------------------
// GET /health — estado del servidor
// ------------------------------
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    total: catalogo.length,
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// ------------------------------
// GET /api/productos
// Parámetros: page, limit, q, categoria, formato, orden
// ------------------------------
app.get("/api/productos", (req, res) => {
  try {
    const page = parseEntero(req.query.page, 1, 1, 10_000);
    const limit = parseEntero(req.query.limit, 24, 1, 100);
    const q = parseTexto(req.query.q, 100);
    const categoria = parseTexto(req.query.categoria, 100);
    const formato = parseTexto(req.query.formato, 100);
    const orden = parseTexto(req.query.orden, 20) || "relevancia";

    const resultado = getProductos(catalogo, {
      page,
      limit,
      q,
      categoria,
      formato,
      orden,
    });

    res.json({
      page,
      limit,
      total: resultado.total,
      totalPages: Math.max(1, Math.ceil(resultado.total / limit)),
      items: resultado.items,
    });
  } catch (error) {
    console.error("Error en /api/productos:", error);
    res.status(500).json({
      error: "Error interno al consultar productos.",
    });
  }
});

// ------------------------------
// GET /api/productos/:id — detalle
// ------------------------------
app.get("/api/productos/:id", (req, res) => {
  const id = parseEntero(req.params.id, -1, -1, Number.MAX_SAFE_INTEGER);
  if (id < 0) {
    return res.status(400).json({ error: "ID inválido." });
  }

  const producto = getProductoPorId(catalogo, id);
  if (!producto) {
    return res.status(404).json({ error: "Producto no encontrado." });
  }

  res.json(producto);
});

// ------------------------------
// GET /api/filtros — categorías y formatos
// ------------------------------
app.get("/api/filtros", (req, res) => {
  try {
    const categoria = parseTexto(req.query.categoria, 100);
    const filtros = getFiltros(catalogo, { categoria });
    res.json(filtros);
  } catch (error) {
    console.error("Error en /api/filtros:", error);
    res.status(500).json({
      error: "Error interno al consultar filtros.",
    });
  }
});
// ------------------------------
app.use((req, res) => {
  res.status(404).json({ error: "Recurso no encontrado." });
});

// ------------------------------
// Manejador global de errores
// ------------------------------
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Error interno del servidor." });
});

// ------------------------------
// Arranque
// ------------------------------
const SERVER_PORT = process.env.PORT || 3000;

if (require.main === module) {
  app.listen(SERVER_PORT, () => {
    console.log(`PASO en http://localhost:${SERVER_PORT}`);
  });
}

module.exports = app;