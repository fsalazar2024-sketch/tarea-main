// ============================================================
// catalog.js — Carga y consulta del catálogo en memoria
// Proyecto: PASO — Vitrina de catálogo (Build an Impact)
// ============================================================

const fs = require("fs");
const path = require("path");

// ------------------------------
// Configuración
// ------------------------------
const CSV_PATH = path.resolve(__dirname, "../../data/catalog.csv");

const PAGE_SIZE_DEFAULT = 24;
const PAGE_SIZE_MAX = 100;

// ------------------------------
// Estado en memoria
// ------------------------------
let products = [];       // Array completo de productos
let categories = [];     // Categorías únicas
let formats = [];        // Formatos únicos
let loaded = false;

// ------------------------------
// Parseo de CSV
// ------------------------------
/**
 * Parser CSV mínimo que soporta comillas dobles y comas dentro de campos.
 * No requiere dependencias externas.
 */
function parseCSV(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (char === '"' && next === '"') {
        field += '"';
        i++; // saltar la segunda comilla
      } else if (char === '"') {
        inQuotes = false;
      } else {
        field += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ",") {
        row.push(field);
        field = "";
      } else if (char === "\n") {
        row.push(field);
        rows.push(row);
        row = [];
        field = "";
      } else if (char === "\r") {
        // ignorar
      } else {
        field += char;
      }
    }
  }

  // Último campo/fila si no termina en salto de línea
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows;
}

// ------------------------------
// Normalización
// ------------------------------
function normalizeText(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, ""); // quita acentos
}

function toNumber(value, fallback = 0) {
  const n = Number(String(value ?? "").replace(/[^\d.-]/g, ""));
  return Number.isFinite(n) ? n : fallback;
}

// ------------------------------
// Carga del catálogo
// ------------------------------
function loadCatalog() {
  if (loaded) return;

  if (!fs.existsSync(CSV_PATH)) {
    throw new Error(`No se encontró el archivo CSV en: ${CSV_PATH}`);
  }

  const raw = fs.readFileSync(CSV_PATH, "utf8");
  const rows = parseCSV(raw);

  if (rows.length < 2) {
    throw new Error("El CSV está vacío o no tiene encabezados.");
  }

  // Encabezados → claves normalizadas
  const headers = rows[0].map((h) => normalizeText(h));
  const index = {
    id: headers.indexOf("id"),
    nombre: headers.indexOf("nombre"),
    precio: headers.indexOf("precio"),
    categoria: headers.indexOf("categoria"),
    formato: headers.indexOf("formato"),
    stock: headers.indexOf("stock"),
    imagen: headers.indexOf("imagen"),
    descripcion: headers.indexOf("descripcion"),
  };

  products = rows
    .slice(1)
    .filter((r) => r.length > 1 && r.some((c) => c !== ""))
    .map((r, i) => {
      const get = (key) => (index[key] >= 0 ? r[index[key]] : "");

      return {
        id: toNumber(get("id"), i + 1),
        nombre: String(get("nombre")).trim(),
        precio: toNumber(get("precio")),
        categoria: String(get("categoria")).trim() || "Sin categoría",
        formato: String(get("formato")).trim() || "General",
        stock: toNumber(get("stock")),
        imagen: String(get("imagen")).trim(),
        descripcion: String(get("descripcion")).trim(),
      };
    })
    .filter((p) => p.nombre);

  // Índices únicos ordenados alfabéticamente
  categories = [...new Set(products.map((p) => p.categoria))].sort((a, b) =>
    a.localeCompare(b, "es")
  );
  formats = [...new Set(products.map((p) => p.formato))].sort((a, b) =>
    a.localeCompare(b, "es")
  );

  loaded = true;
}

// ------------------------------
// Filtros
// ------------------------------
function filterProducts({ q, categoria, formato, minPrecio, maxPrecio, soloStock } = {}) {
  const query = normalizeText(q);
  const cat = normalizeText(categoria);
  const fmt = normalizeText(formato);
  const min = minPrecio != null && minPrecio !== "" ? toNumber(minPrecio, null) : null;
  const max = maxPrecio != null && maxPrecio !== "" ? toNumber(maxPrecio, null) : null;

  return products.filter((p) => {
    if (query) {
      const haystack = normalizeText(`${p.nombre} ${p.descripcion} ${p.categoria}`);
      if (!haystack.includes(query)) return false;
    }
    if (cat && normalizeText(p.categoria) !== cat) return false;
    if (fmt && normalizeText(p.formato) !== fmt) return false;
    if (min != null && p.precio < min) return false;
    if (max != null && p.precio > max) return false;
    if (soloStock === true && p.stock <= 0) return false;
    return true;
  });
}

// ------------------------------
// Paginación
// ------------------------------
function paginate(items, page = 1, pageSize = PAGE_SIZE_DEFAULT) {
  const total = items.length;
  const size = Math.min(
    Math.max(toNumber(pageSize, PAGE_SIZE_DEFAULT), 1),
    PAGE_SIZE_MAX
  );
  const totalPages = Math.max(Math.ceil(total / size), 1);
  const current = Math.min(Math.max(toNumber(page, 1), 1), totalPages);

  const start = (current - 1) * size;
  const end = start + size;

  return {
    items: items.slice(start, end),
    pagination: {
      page: current,
      pageSize: size,
      total,
      totalPages,
      hasPrev: current > 1,
      hasNext: current < totalPages,
    },
  };
}

// ------------------------------
// API pública del módulo
// ------------------------------
function getProducts(options = {}) {
  loadCatalog();

  const {
    q,
    categoria,
    formato,
    minPrecio,
    maxPrecio,
    soloStock,
    page,
    pageSize,
    sortBy = "nombre",
    sortDir = "asc",
  } = options;

  const filtered = filterProducts({
    q,
    categoria,
    formato,
    minPrecio,
    maxPrecio,
    soloStock,
  });

  // Ordenamiento
  const dir = sortDir === "desc" ? -1 : 1;
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "precio") return (a.precio - b.precio) * dir;
    if (sortBy === "stock") return (a.stock - b.stock) * dir;
    if (sortBy === "id") return (a.id - b.id) * dir;
    return a.nombre.localeCompare(b.nombre, "es") * dir;
  });

  return paginate(sorted, page, pageSize);
}

function getProductById(id) {
  loadCatalog();
  const n = toNumber(id, null);
  if (n == null) return null;
  return products.find((p) => p.id === n) || null;
}

function getFilters() {
  loadCatalog();
  return { categorias: categories, formatos: formats };
}

function getStats() {
  loadCatalog();
  return {
    total: products.length,
    categorias: categories.length,
    formatos: formats.length,
  };
}

function isLoaded() {
  return loaded;
}

// ------------------------------
// Exportaciones
// ------------------------------
module.exports = {
  loadCatalog,
  getProducts,
  getProductById,
  getFilters,
  getStats,
  isLoaded,
  // utilidades expuestas para pruebas
  _internal: {
    parseCSV,
    normalizeText,
    filterProducts,
    paginate,
  },
};
