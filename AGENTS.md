# AGENTS.md

## 1. Descripción del proyecto

Este proyecto consiste en desarrollar una aplicación Full Stack para consultar un catálogo de productos utilizando los datos proporcionados en `data/catalog.csv`.

El proyecto incluye:

- **Frontend:** HTML5, CSS3 y JavaScript.
- **Backend:** Node.js y Express.
- **Datos:** archivo CSV original del catálogo.
- **API REST:** consulta de productos, búsqueda, filtros, paginación y detalle.
- **Pruebas:** validación de los endpoints y del comportamiento de la aplicación.

## 2. Estructura del proyecto

Mantener la siguiente organización como referencia:

```text
tarea-main/
├── AGENTS.md
├── README.md
├── SPECIFICATION.md
├── ARCHITECTURE.md
├── data/
│   └── catalog.csv
├── mockup/
│   ├── index.html
│   ├── styles.css
│   ├── app.js
│   └── assets/
└── server/
    ├── package.json
    ├── src/
    │   ├── index.js
    │   └── catalog.js
    └── tests/
        └── api.test.js
```

No crear archivos duplicados con implementaciones alternativas de los mismos módulos.

## 3. Reglas para trabajar con los datos

- Utilizar el archivo original `data/catalog.csv` como fuente de datos.
- No reemplazar el catálogo proporcionado por productos ficticios o generados aleatoriamente.
- No modificar arbitrariamente los nombres, precios, categorías, identificadores u otros campos originales.
- Validar los datos al cargarlos y manejar adecuadamente registros incompletos.
- No asumir nombres de columnas sin comprobar primero el encabezado real del CSV.
- No utilizar datos de ejemplo como si fueran datos reales del catálogo.

## 4. Reglas para el backend

El backend debe utilizar Node.js y Express para exponer una API REST.

### Endpoints esperados

| Método | Endpoint | Función |
|---|---|---|
| GET | `/health` | Comprobar el estado del servidor |
| GET | `/api/productos` | Obtener productos |
| GET | `/api/productos/:id` | Obtener el detalle de un producto |
| GET | `/api/filtros` | Obtener las opciones de filtrado |

### Búsqueda, filtros y paginación

El endpoint `/api/productos` debe admitir los parámetros que defina el contrato de la API, por ejemplo:

- `page`: número de página.
- `limit`: cantidad de productos por página.
- `q`: texto de búsqueda.
- `categoria`: categoría seleccionada.
- `formato`: formato seleccionado.
- `orden`: criterio de ordenamiento.

Validar los parámetros de entrada y definir valores predeterminados coherentes.

### Contrato de respuesta

Mantener una única estructura de respuesta documentada. Por ejemplo:

```json
{
  "page": 1,
  "limit": 12,
  "total": 4032,
  "totalPages": 336,
  "items": []
}
```

Los valores anteriores son ilustrativos: el total real debe obtenerse del CSV proporcionado, no asumirse como constante.

- El frontend y las pruebas deben utilizar los mismos nombres de propiedades.
- Los errores deben devolver códigos HTTP apropiados y mensajes comprensibles.
- Un producto inexistente debe responder con `404`.
- Los parámetros inválidos deben manejarse de forma controlada.
- No duplicar la lógica de lectura y filtrado del catálogo en diferentes archivos.

## 5. Consistencia de módulos JavaScript

Utilizar un único sistema de módulos en todo el backend.

Se recomienda utilizar **ES Modules** si el proyecto está configurado con `"type": "module"` en `package.json`.

En ese caso:

- Utilizar `import` para importar módulos.
- Utilizar `export` o `export default` para exportar.
- No mezclar `require()` y `module.exports` con `import` y `export` en los mismos módulos sin una razón técnica documentada.
- Comprobar que los nombres importados coincidan exactamente con los nombres exportados.
- Verificar que las funciones reciban los parámetros que realmente esperan.

## 6. Reglas para el frontend

El frontend debe consumir la API mediante `fetch()`.

### HTML

- Utilizar identificadores (`id`) consistentes con los selectores de JavaScript.
- Mantener una estructura semántica y accesible.
- Evitar identificadores duplicados.
- Incluir estados para carga, errores y ausencia de resultados.

### JavaScript

- Mantener sincronizados los selectores con el HTML.
- Implementar búsqueda, filtros, paginación y visualización del detalle.
- Manejar errores de red y respuestas HTTP no exitosas.
- Evitar duplicar funciones o mantener implementaciones antiguas sin uso.
- No insertar contenido del catálogo mediante concatenación insegura de HTML.
- Verificar que los eventos de búsqueda, filtros, botones y modales funcionen correctamente.

### CSS

- Utilizar nombres de clases coherentes con los definidos en el HTML.
- Mantener los estilos organizados y reutilizables.
- Comprobar la presentación en pantallas de escritorio y dispositivos móviles.
- No crear clases alternativas para resolver el mismo componente sin necesidad.

## 7. Pruebas y validación

Antes de considerar terminada una funcionalidad:

- Comprobar que el servidor inicia correctamente.
- Verificar el endpoint `/health`.
- Comprobar la consulta de productos.
- Verificar búsqueda, filtros y paginación.
- Comprobar la consulta de un producto existente.
- Verificar la respuesta para un identificador inexistente.
- Validar los errores por parámetros incorrectos.
- Confirmar que el frontend consuma la estructura real de la API.
- Ejecutar las pruebas automatizadas configuradas en `package.json`.
- No declarar una prueba como aprobada si no se ha ejecutado.

## 8. Seguridad y calidad del código

- Validar y normalizar los parámetros recibidos por la API.
- Limitar la cantidad máxima de resultados por página.
- Evitar exponer rutas locales, información sensible o detalles internos de errores.
- Mantener las responsabilidades separadas entre servidor, acceso a datos y presentación.
- Utilizar nombres descriptivos para variables, funciones y módulos.
- Eliminar código duplicado y funciones sin uso.
- No incorporar dependencias nuevas sin justificar su necesidad.
- No guardar credenciales ni secretos en el repositorio.

## 9. Documentación

Mantener actualizados los siguientes documentos:

- `README.md`: instalación, configuración y ejecución.
- `SPECIFICATION.md`: requisitos funcionales y criterios de aceptación.
- `ARCHITECTURE.md`: estructura, componentes y flujo de datos.
- `AGENTS.md`: reglas para modificar y mantener el proyecto.

Cuando se cambie un endpoint o su estructura de respuesta, actualizar también la documentación, el frontend y las pruebas correspondientes.

## 10. Criterios para considerar una tarea terminada

Una tarea se considera terminada cuando:

1. Cumple el requisito correspondiente.
2. Respeta la estructura y las convenciones del proyecto.
3. Utiliza los datos originales del catálogo.
4. Mantiene la compatibilidad entre frontend y backend.
5. No introduce errores conocidos en funcionalidades existentes.
6. Las pruebas relevantes se han ejecutado y sus resultados están documentados.
7. La documentación necesaria se encuentra actualizada.

## 11. Prioridad de trabajo

Al corregir el proyecto, seguir este orden:

1. Confirmar la estructura real del repositorio y el CSV original.
2. Unificar el sistema de módulos del backend.
3. Corregir las importaciones y exportaciones de `catalog.js`.
4. Establecer un único contrato para las respuestas de la API.
5. Alinear los identificadores HTML con los selectores de JavaScript.
6. Alinear las clases CSS con los componentes HTML.
7. Verificar búsqueda, filtros, paginación y detalle.
8. Ejecutar las pruebas y corregir los errores encontrados.
9. Actualizar la documentación.
