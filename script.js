function calcularResultado() {
  // Obtener información del paciente
  const nombre = document.getElementById("nombre").value;
  const genero = document.getElementById("genero").value;
  const edad = document.getElementById("edad").value;
  const estadoCivil = document.getElementById("estadoCivil").value;

  // Procesar respuestas del test
  let puntuacion = 0;

  // Obtener respuestas del test
  const q1 = document.querySelector('input[name="q1"]:checked').value;
  const q2 = document.querySelector('input[name="q2"]:checked').value;

  // Asignar puntuaciones según la escala de respuestas
  const escalaRespuestas = {
    TD: 0,
    D: 1,
    N: 2,
    A: 3,
    TA: 4,
  };

  // Calcular puntuación según las respuestas del usuario y la escala definida
  puntuacion += escalaRespuestas[q1];
  puntuacion += escalaRespuestas[q2];

  // Determinar el resultado basado en la puntuación
  let resultado = "Tu resultado es: ";

  if (puntuacion < 4) {
    resultado += "Bajo";
  } else if (puntuacion >= 4 && puntuacion <= 6) {
    resultado += "Medio";
  } else {
    resultado += "Alto";
  }

  // Mostrar el resultado
  document.getElementById("resultado").innerHTML = resultado;

  // Aquí podrías también guardar la información del paciente y sus respuestas en una base de datos o realizar otras acciones necesarias.
}
