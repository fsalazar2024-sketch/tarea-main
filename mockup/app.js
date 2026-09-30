// app.js
// Frontend del catálogo Full Stack — Build an Impact
// Conecta con la API, muestra productos, filtros, paginación, modal y estados UI.

const API_BASE = "/api";
const LIMIT = 12;

const state = {
  productos: [],
  page: 1,
  total: 0,
  totalPages: 1,
  q: "",
  categoria: "",
  formato: "",
  cargando: false,
  error: null,
};

const $ = (selector) => document.querySelector(selector);

const dom = {
  catalogo: $("#catalogo"),
  estado: $("#estado"),
  buscador: $("#buscador"),
  filtroCategoria: $("#filtroCategoria"),
  filtroFormato: $("#filtroFormato"),
  paginacion: $("#paginacion"),
  modal: $("#modal"),
  modalContenido: $("#modalContenido"),
  cerrarModal: $("#cerrarModal"),
};

// -----------------------------
// Utilidades
// -----------------------------
function escapeHtml(valor) {
  return String(valor ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatearPrecio(valor) {
  const numero = Number(valor);
  if (Number.isNaN(numero)) return escapeHtml(valor);
  return numero.toLocaleString("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  });
}

function mostrarEstado(mensaje, tipo = "info") {
  if (!dom.estado) return;
  dom.estado.textContent = mensaje;
  dom.estado.className = `estado estado--${tipo}`;
  dom.estado.hidden = false;
}

function limpiarEstado() {
  if (!dom.estado) return;
  dom.estado.textContent = "";
  dom.estado.className = "estado";
  dom.estado.hidden = true;
}

// -----------------------------
// Carga de datos
// -----------------------------
async function cargarProductos() {
  state.cargando = true;
  state.error = null;

  mostrarEstado("Cargando productos...", "loading");

  try {
    const params = new URLSearchParams({
      page: state.page,
      limit: LIMIT,
    });

    if (state.q) params.set("q", state.q);
    if (state.categoria) params.set("categoria", state.categoria);
    if (state.formato) params.set("formato", state.formato);

    const response = await fetch(`${API_BASE}/productos?${params.toString()}`);

    if (!response.ok) {
      throw new Error(`Error HTTP ${response.status}`);
    }

    const data = await response.json();

    // Normaliza respuesta: array plano u objeto paginado.
    let productos = [];
    if (Array.isArray(data)) {
      productos = data;
      state.total = data.length;
      state.totalPages = 1;
    } else {
      productos = data.data || data.productos || data.items || [];
      state.total = data.total ?? productos.length;
      state.totalPages = data.totalPages ?? Math.ceil(state.total / LIMIT);
    }

    state.productos = productos;
    renderProductos();
    renderPaginacion();
  } catch (error) {
    console.error(error);
    state.error = error;
    renderError();
  } finally {
    state.cargando = false;
  }
}

async function cargarFiltros() {
  try {
    const response = await fetch(`${API_BASE}/filtros`);
    if (!response.ok) throw new Error(`Error HTTP ${response.status}`);

    const data = await response.json();

    if (dom.filtroCategoria && data.categorias) {
      dom.filtroCategoria.innerHTML =
        `<option value="">Todas las categorías</option>` +
        data.categorias
          .map(
            (c) =>
              `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`
          )
          .join("");
    }

    if (dom.filtroFormato && data.formatos) {
      dom.filtroFormato.innerHTML =
        `<option value="">Todos los formatos</option>` +
        data.formatos
          .map(
            (f) =>
              `<option value="${escapeHtml(f)}">${escapeHtml(f)}</option>`
          )
          .join("");
    }
  } catch (error) {
    console.error("No se pudieron cargar los filtros:", error);
  }
}

// -----------------------------
// Render
// -----------------------------
function renderProductos() {
  if (!dom.catalogo) return;

  if (state.productos.length === 0) {
    dom.catalogo.innerHTML = "";
    mostrarEstado("No se encontraron productos.", "empty");
    return;
  }

  limpiarEstado();

  dom.catalogo.innerHTML = state.productos
    .map((p) => {
      const id = escapeHtml(p.id);
      const nombre = escapeHtml(p.nombre);
      const imagen = escapeHtml(p.imagen || "assets/placeholder.png");
      const categoria = escapeHtml(p.categoria || "Sin categoría");

      return `
        <article class="producto" data-id="${id}">
          <img src="${imagen}" alt="${nombre}" loading="lazy">
          <h3>${nombre}</h3>
          <p class="precio">${formatearPrecio(p.precio)}</p>
          <p class="categoria">${categoria}</p>
        </article>
      `;
    })
    .join("");

  dom.catalogo.querySelectorAll(".producto").forEach((card) => {
    card.addEventListener("click", () => {
      const id = card.dataset.id;
      const producto = state.productos.find((p) => String(p.id) === String(id));
      if (producto) abrirModal(producto);
    });
  });
}

function renderError() {
  if (!dom.catalogo) return;
  dom.catalogo.innerHTML = "";
  mostrarEstado("⚠ No fue posible cargar los productos.", "error");
}

function renderPaginacion() {
  if (!dom.paginacion) return;

  if (state.totalPages <= 1) {
    dom.paginacion.innerHTML = "";
    return;
  }

  const anterior = state.page > 1;
  const siguiente = state.page < state.totalPages;

  dom.paginacion.innerHTML = `
    <button ${anterior ? "" : "disabled"} data-page="${state.page - 1}">
      ← Anterior
    </button>
    <span>Página ${state.page} de ${state.totalPages}</span>
    <button ${siguiente ? "" : "disabled"} data-page="${state.page + 1}">
      Siguiente →
    </button>
  `;

  dom.paginacion.querySelectorAll("button[data-page]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const nuevaPagina = Number(btn.dataset.page);
      if (nuevaPagina >= 1 && nuevaPagina <= state.totalPages) {
        state.page = nuevaPagina;
        cargarProductos();
      }
    });
  });
}

// -----------------------------
// Modal de detalle
// -----------------------------
function abrirModal(producto) {
  if (!dom.modal || !dom.modalContenido) return;

  dom.modalContenido.innerHTML = `
    <h2>${escapeHtml(producto.nombre)}</h2>
    <img src="${escapeHtml(producto.imagen || "assets/placeholder.png")}"
         alt="${escapeHtml(producto.nombre)}"
         style="max-width: 100%; height: auto;">
    <p><strong>Precio:</strong> ${formatearPrecio(producto.precio)}</p>
    <p><strong>Categoría:</strong> ${escapeHtml(producto.categoria || "Sin categoría")}</p>
    <p><strong>Stock:</strong> ${escapeHtml(producto.stock ?? "No disponible")}</p>
    <p><strong>ID:</strong> ${escapeHtml(producto.id)}</p>
  `;

  dom.modal.hidden = false;
  dom.modal.setAttribute("aria-hidden", "false");
}

function cerrarModal() {
  if (!dom.modal) return;
  dom.modal.hidden = true;
  dom.modal.setAttribute("aria-hidden", "true");
}

// -----------------------------
// Eventos
// -----------------------------
function initEventos() {
  if (dom.buscador) {
    let timer;
    dom.buscador.addEventListener("input", (event) => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        state.q = event.target.value.trim();
        state.page = 1;
        cargarProductos();
      }, 300);
    });
  }

  if (dom.filtroCategoria) {
    dom.filtroCategoria.addEventListener("change", (event) => {
      state.categoria = event.target.value;
      state.page = 1;
      cargarProductos();
    });
  }

  if (dom.filtroFormato) {
    dom.filtroFormato.addEventListener("change", (event) => {
      state.formato = event.target.value;
      state.page = 1;
      cargarProductos();
    });
  }

  if (dom.cerrarModal) {
    dom.cerrarModal.addEventListener("click", cerrarModal);
  }

  if (dom.modal) {
    dom.modal.addEventListener("click", (event) => {
      if (event.target === dom.modal) cerrarModal();
    });
  }

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") cerrarModal();
  });
}

// -----------------------------
// Inicio
// -----------------------------
async function init() {
  initEventos();
  await cargarFiltros();
  await cargarProductos();
}

document.addEventListener("DOMContentLoaded", init);