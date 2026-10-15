# NEO PI-R

Cuestionario local de 240 afirmaciones con perfil de puntuaciones directas y opcion para ver un informe de demostracion.

## Estructura

- `index.html`: punto de entrada de la aplicacion.
- `css/style.css`: estilos de pantalla e impresion PDF.
- `js/script.js`: navegacion del cuestionario, calculo y exportacion.
- `data/questions.js`: banco de preguntas.
- `data/scoring.js`: clave de puntuacion por pregunta y faceta.
- `docs/referencia/`: libro original de Excel exportado a HTML y sus hojas asociadas.

## Uso

Abre `index.html` directamente en un navegador moderno. No requiere servidor ni instalacion.

- `Empezar`: inicia el cuestionario real.
- `Ver informe de ejemplo`: muestra resultados ficticios sin responder preguntas.
- `Guardar informe PDF`: abre el dialogo de impresion; selecciona guardar como PDF.

Las respuestas del cuestionario real permanecen en la memoria de la pestaña y no se envian a un servidor. El informe muestra puntuaciones directas; el material de referencia no incluye baremos normativos completos.
