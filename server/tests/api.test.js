/**
 * api.test.js
 * Pruebas de integración para la API del catálogo.
 * Framework: Jest + Supertest
 * Cubre: health, paginación, búsqueda, filtros, validaciones,
 *        errores, cabeceras de seguridad y formato de respuesta.
 */

const request = require("supertest");
const app = require("../src/index");

// Si tu proyecto exporta { app }, cambia por:
// const { app } = require("../src/index");

describe("API del catálogo", () => {
  // ------------------------------------------------------------
  // 1. Health check
  // ------------------------------------------------------------
  describe("GET /health", () => {
    test("responde 200 y reporta estado OK con total de productos", async () => {
      const res = await request(app).get("/health");

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("status", "ok");
      expect(res.body).toHaveProperty("total");
      expect(typeof res.body.total).toBe("number");
      expect(res.body.total).toBeGreaterThan(0);
    });
  });

  // ------------------------------------------------------------
  // 2. Paginación — primera página
  // ------------------------------------------------------------
  describe("GET /api/productos — paginación", () => {
    test("devuelve la primera página con metadatos correctos", async () => {
      const res = await request(app).get("/api/productos?page=1");

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("data");
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);

      expect(res.body).toHaveProperty("pagination");
      expect(res.body.pagination).toMatchObject({
        page: 1,
      });
      expect(res.body.pagination).toHaveProperty("pageSize");
      expect(res.body.pagination).toHaveProperty("total");
      expect(res.body.pagination).toHaveProperty("totalPages");
    });

    // ----------------------------------------------------------
    // 3. Paginación — páginas distintas devuelven datos distintos
    // ----------------------------------------------------------
    test("la página 2 devuelve productos distintos a la página 1", async () => {
      const [p1, p2] = await Promise.all([
        request(app).get("/api/productos?page=1"),
        request(app).get("/api/productos?page=2"),
      ]);

      expect(p1.statusCode).toBe(200);
      expect(p2.statusCode).toBe(200);

      const ids1 = p1.body.data.map((p) => p.id);
      const ids2 = p2.body.data.map((p) => p.id);

      expect(ids1).not.toEqual(ids2);
    });
  });

  // ------------------------------------------------------------
  // 4. Búsqueda por nombre
  // ------------------------------------------------------------
  describe("GET /api/productos — búsqueda", () => {
    test("filtra resultados por término de búsqueda", async () => {
      // Ajusta "notebook" al término que exista en tu CSV
      const res = await request(app).get("/api/productos?q=notebook");

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);

      res.body.data.forEach((producto) => {
        const nombre = (producto.nombre || "").toLowerCase();
        expect(nombre).toContain("notebook");
      });
    });

    test("devuelve lista vacía si no hay coincidencias", async () => {
      const res = await request(app).get(
        "/api/productos?q=zzzzzzzzzzzzzzzzzz"
      );

      expect(res.statusCode).toBe(200);
      expect(res.body.data).toEqual([]);
      expect(res.body.pagination.total).toBe(0);
    });
  });

  // ------------------------------------------------------------
  // 5. Filtros en cascada
  // ------------------------------------------------------------
  describe("GET /api/filtros", () => {
    test("devuelve categorías y formatos disponibles", async () => {
      const res = await request(app).get("/api/filtros");

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("categorias");
      expect(res.body).toHaveProperty("formatos");
      expect(Array.isArray(res.body.categorias)).toBe(true);
      expect(Array.isArray(res.body.formatos)).toBe(true);
      expect(res.body.categorias.length).toBeGreaterThan(0);
    });
  });

  describe("GET /api/productos — filtros", () => {
    test("filtra por categoría válida", async () => {
      const filtros = await request(app).get("/api/filtros");
      const categoria = filtros.body.categorias[0];

      const res = await request(app).get(
        `/api/productos?categoria=${encodeURIComponent(categoria)}`
      );

      expect(res.statusCode).toBe(200);
      res.body.data.forEach((producto) => {
        expect(producto.categoria).toBe(categoria);
      });
    });
  });

  // ------------------------------------------------------------
  // 6. Validaciones de parámetros
  // ------------------------------------------------------------
  describe("Validaciones de parámetros", () => {
    test("responde 400 si page no es un número válido", async () => {
      const res = await request(app).get("/api/productos?page=abc");

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty("error");
    });

    test("responde 400 si page es negativo o cero", async () => {
      const res = await request(app).get("/api/productos?page=0");
      expect(res.statusCode).toBe(400);

      const res2 = await request(app).get("/api/productos?page=-5");
      expect(res2.statusCode).toBe(400);
    });

    test("responde 400 si pageSize excede el máximo permitido", async () => {
      const res = await request(app).get("/api/productos?pageSize=99999");

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty("error");
    });
  });

  // ------------------------------------------------------------
  // 7. Manejo de errores — rutas no encontradas
  // ------------------------------------------------------------
  describe("Manejo de errores", () => {
    test("responde 404 en rutas inexistentes", async () => {
      const res = await request(app).get("/api/no-existe");

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty("error");
    });

    test("no expone trazas internas en respuestas de error", async () => {
      const res = await request(app).get("/api/no-existe");

      const bodyStr = JSON.stringify(res.body);
      expect(bodyStr).not.toMatch(/at .*\(.*:\d+:\d+\)/);
      expect(bodyStr).not.toMatch(/node_modules/);
      expect(bodyStr).not.toMatch(/stack/i);
    });
  });

  // ------------------------------------------------------------
  // 8. Cabeceras de seguridad
  // ------------------------------------------------------------
  describe("Cabeceras de seguridad", () => {
    test("incluye cabeceras básicas de seguridad", async () => {
      const res = await request(app).get("/health");

      // Helmet agrega estas cabeceras por defecto
      expect(res.headers).toHaveProperty("x-content-type-options");
      expect(res.headers["x-content-type-options"]).toBe("nosniff");

      expect(res.headers).toHaveProperty("x-frame-options");
      expect(["DENY", "SAMEORIGIN"]).toContain(
        res.headers["x-frame-options"]
      );
    });

    test("no expone cabecera X-Powered-By", async () => {
      const res = await request(app).get("/health");
      expect(res.headers["x-powered-by"]).toBeUndefined();
    });
  });

  // ------------------------------------------------------------
  // 9. Formato de respuesta JSON
  // ------------------------------------------------------------
  describe("Formato de respuesta", () => {
    test("el endpoint de productos responde JSON con esquema esperado", async () => {
      const res = await request(app).get("/api/productos?page=1");

      expect(res.headers["content-type"]).toMatch(/application\/json/);
      expect(res.body.data[0]).toHaveProperty("id");
      expect(res.body.data[0]).toHaveProperty("nombre");
      expect(res.body.data[0]).toHaveProperty("precio");
      expect(res.body.data[0]).toHaveProperty("categoria");
    });
  });

  // ------------------------------------------------------------
  // 10. Caso límite — página fuera de rango
  // ------------------------------------------------------------
  describe("Casos límite", () => {
    test("página fuera de rango devuelve data vacía sin error", async () => {
      const res = await request(app).get("/api/productos?page=99999");

      expect(res.statusCode).toBe(200);
      expect(res.body.data).toEqual([]);
    });
  });
});