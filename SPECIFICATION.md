# SPECIFICATION.md

# Especificación del Proyecto: Catálogo de Productos Full Stack

## 1. Información general

**Nombre del proyecto:** Catálogo de Productos Full Stack  
**Tipo:** Aplicación web Full Stack  
**Frontend:** HTML5, CSS3 y JavaScript  
**Backend:** Node.js y Express  
**Fuente de datos:** `data/catalog.csv`  
**Cantidad de productos esperada:** 4.032 registros

## 2. Objetivo del proyecto

Desarrollar una aplicación web que permita visualizar, buscar, filtrar y consultar productos a partir de un catálogo proporcionado en formato CSV.

La aplicación debe utilizar una interfaz web construida con HTML, CSS y JavaScript, conectada a una API REST desarrollada con Express.

El proyecto debe respetar los datos originales del catálogo, sin generar productos ficticios ni reemplazar la información proporcionada.

## 3. Alcance funcional

### RF-01: Carga del catálogo

El sistema debe leer los productos desde el archivo `data/catalog.csv`.

**Criterios de aceptación:**
- El archivo debe cargarse desde la ubicación configurada.
- Los registros deben procesarse para su utilización en la aplicación.
- Los datos originales deben conservarse.
- El sistema debe manejar errores si el archivo no existe o no puede leerse.

### RF-02: Visualización de productos

El sistema debe mostrar los productos disponibles en una cuadrícula de tarjetas.

Cada tarjeta debe mostrar únicamente los atributos que existan en el catálogo, por ejemplo, nombre, precio, categoría o imagen, según las columnas disponibles.

**Criterios de aceptación:**
- Los productos deben presentarse de forma organizada.
- La información debe provenir del catálogo original.
- La interfaz debe mostrar un mensaje cuando no existan resultados.

### RF-03: Búsqueda de productos

El usuario debe poder buscar productos mediante un campo de búsqueda.

**Criterios de aceptación:**
- La búsqueda debe utilizar los campos de texto disponibles en los datos.
- Debe permitir actualizar los resultados según el término ingresado.
- Si no existen coincidencias, debe informarse al usuario.

### RF-04: Filtrado por categoría

El sistema debe permitir filtrar los productos por categoría, siempre que dicha información exista en el catálogo.

**Criterios de aceptación:**
- Las opciones deben obtenerse de los datos disponibles.
- El usuario debe poder seleccionar una categoría.
- Debe existir una opción para mostrar todas las categorías.

### RF-05: Filtrado por formato

El sistema debe permitir filtrar por formato cuando el catálogo contenga un atributo compatible con ese criterio.

**Criterios de aceptación:**
- Las opciones deben corresponder a los valores existentes.
- El filtro debe combinarse con la búsqueda y los demás filtros.
- No se deben inventar atributos para completar este requisito.

### RF-06: Ordenamiento de productos

El sistema debe permitir ordenar los productos mediante criterios compatibles con los campos disponibles.

Los criterios definitivos deben corresponder a los datos reales del catálogo.

**Criterios de aceptación:**
- El ordenamiento debe producir resultados consistentes.
- Debe mantenerse la compatibilidad con los filtros aplicados.

### RF-07: Paginación

El sistema debe dividir los resultados en páginas para facilitar la navegación.

**Criterios de aceptación:**
- El usuario debe poder consultar distintas páginas.
- Deben calcularse el total de resultados y el total de páginas.
- La página actual debe mantenerse dentro de los límites disponibles.
- Los cambios de búsqueda y filtros deben actualizar la paginación.

### RF-08: Detalle del producto

El sistema debe permitir consultar los detalles de un producto específico.

**Criterios de aceptación:**
- Cada producto debe identificarse mediante un identificador disponible o una estrategia de identificación consistente.
- La API debe devolver el producto solicitado.
- Si el producto no existe, debe responder con un error HTTP apropiado.

### RF-09: Estado de carga y errores

La interfaz debe informar al usuario cuando los datos estén cargando o cuando ocurra un error.

**Criterios de aceptación:**
- Debe existir un estado de carga.
- Los errores de comunicación con la API deben manejarse.
- La interfaz no debe quedar bloqueada ante una respuesta fallida.
- Debe mostrarse un mensaje comprensible cuando corresponda.

## 4. Requisitos de la API REST

### Endpoint de estado

`GET /health`

Permite verificar que el servidor se encuentra disponible.

Respuesta esperada:

```json
{
  "status": "ok"
}
```

### Endpoint de listado de productos

`GET /api/productos`

Debe devolver los productos correspondientes a los parámetros de consulta admitidos.

Parámetros previstos:
- `page`: número de página.
- `limit`: cantidad de productos por página.
- `q`: término de búsqueda.
- `categoria`: categoría seleccionada.
- `formato`: formato seleccionado.
- `orden`: criterio de ordenamiento.

Ejemplo:

`GET /api/productos?page=1&limit=12&q=producto`

La respuesta debe utilizar un contrato uniforme. Como propuesta, se establece la siguiente estructura:

```json
{
  "page": 1,
  "limit": 12,
  "total": 4032,
  "totalPages": 336,
  "items": []
}
```

Los valores de `total` y `totalPages` deben calcularse a partir de los resultados reales y de los parámetros utilizados. El ejemplo representa una página de 12 elementos sobre un catálogo de 4.032 productos sin filtros.

### Endpoint de detalle

`GET /api/productos/:id`

Debe devolver la información del producto correspondiente al identificador solicitado.

**Criterios de aceptación:**
- Respuesta HTTP 200 cuando el producto exista.
- Respuesta HTTP 404 cuando no exista.
- Respuesta JSON con una estructura consistente.

### Endpoint de filtros

`GET /api/filtros`

Debe devolver las opciones de filtrado obtenidas a partir de los valores existentes en el catálogo.

**Criterios de aceptación:**
- Los filtros deben generarse a partir de los datos reales.
- No deben incluir categorías o formatos inventados.
- La estructura de respuesta debe coincidir con lo que consume el frontend.

## 5. Arquitectura del sistema

El sistema estará organizado en tres componentes principales:

### Frontend

Responsable de:
- Mostrar el catálogo.
- Capturar búsquedas y filtros.
- Consultar la API mediante `fetch`.
- Mostrar los resultados y la paginación.
- Presentar el detalle de cada producto.
- Informar estados de carga y errores.

### Backend

Responsable de:
- Exponer los endpoints REST.
- Leer y procesar el catálogo CSV.
- Aplicar búsqueda, filtros y ordenamiento.
- Gestionar la paginación.
- Buscar productos por identificador.
- Entregar respuestas JSON consistentes.

### Datos

El archivo `data/catalog.csv` será la fuente de información del sistema.

Los nombres de las columnas, sus tipos y las reglas de identificación deben verificarse directamente en el archivo proporcionado antes de implementar la lógica definitiva.

## 6. Estructura de carpetas propuesta

```text
tarea-main/
├── README.md
├── SPECIFICATION.md
├── ARCHITECTURE.md
├── AGENTS.md
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

Esta estructura es una propuesta organizativa. Debe ajustarse a los archivos reales existentes en el repositorio.

## 7. Requisitos técnicos

- Utilizar Node.js y Express para el backend.
- Utilizar HTML5, CSS3 y JavaScript para el frontend.
- Utilizar la API REST para comunicar frontend y backend.
- Utilizar JSON como formato de respuesta de la API.
- Mantener el catálogo original como fuente de datos.
- Evitar la duplicación de lógica de búsqueda y filtrado.
- Mantener una estructura coherente entre módulos, rutas y funciones exportadas.
- Utilizar un único sistema de módulos en el backend: CommonJS o ES Modules.
- Mantener los selectores HTML y las referencias JavaScript sincronizados.
- Mantener los nombres de las clases CSS coherentes con el marcado HTML.

## 8. Requisitos de calidad y seguridad

- Validar los parámetros recibidos por la API.
- Limitar los valores permitidos para `page` y `limit`.
- Gestionar errores de lectura y procesamiento del CSV.
- Evitar insertar contenido no confiable directamente en HTML.
- Utilizar identificadores consistentes para los productos.
- No exponer rutas internas del servidor en mensajes de error.
- Mantener separados los datos, la lógica de negocio y la presentación.

## 9. Pruebas y validación

Se deben implementar pruebas para comprobar:

1. Que el servidor inicia correctamente.
2. Que `GET /health` responde correctamente.
3. Que el listado de productos devuelve una estructura válida.
4. Que la búsqueda filtra los resultados correctamente.
5. Que los filtros funcionan individualmente y combinados.
6. Que la paginación calcula correctamente los resultados.
7. Que el detalle devuelve un producto existente.
8. Que un identificador inexistente devuelve HTTP 404.
9. Que el endpoint de filtros devuelve opciones derivadas del catálogo.
10. Que los errores de lectura del archivo se manejan adecuadamente.
11. Que el frontend consume correctamente las respuestas de la API.
12. Que los selectores y elementos de la interfaz coinciden entre HTML, CSS y JavaScript.

## 10. Restricciones del proyecto

- No reemplazar el archivo CSV proporcionado por datos generados aleatoriamente.
- No inventar columnas, atributos o valores que no existan en el catálogo.
- No mantener implementaciones duplicadas de las mismas funciones.
- No mezclar CommonJS y ES Modules sin una configuración explícita.
- No utilizar contratos de respuesta diferentes entre la API, el frontend y las pruebas.
- No considerar una funcionalidad terminada hasta verificar su comportamiento.

## 11. Criterios generales de aceptación

El proyecto podrá considerarse funcional cuando:

- El servidor inicie sin errores.
- El catálogo original se cargue correctamente.
- Los endpoints definidos respondan según su contrato.
- La búsqueda, los filtros y la paginación funcionen de forma conjunta.
- El usuario pueda consultar los detalles de un producto.
- La interfaz muestre estados de carga, resultados vacíos y errores.
- Las pruebas automatizadas se ejecuten correctamente.
- La documentación describa el comportamiento implementado.

## 12. Estado de implementación

Los requisitos de este documento representan el comportamiento esperado del sistema, no una certificación de que ya esté implementado.

Cada requisito debe marcarse como uno de los siguientes estados durante la revisión:

- **Pendiente:** todavía no implementado.
- **En desarrollo:** implementación incompleta.
- **Implementado:** código desarrollado.
- **Verificado:** comportamiento probado y resultado satisfactorio.

La aceptación final debe basarse en la ejecución de la aplicación y las pruebas con el catálogo original.
