const menuToggle = document.querySelector(".menu-toggle");
const siteNav = document.querySelector("#site-nav");

if (menuToggle && siteNav) {
  const closeMenu = () => {
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Abrir menú");
    siteNav.classList.remove("is-open");
  };

  menuToggle.addEventListener("click", () => {
    const isExpanded = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!isExpanded));
    menuToggle.setAttribute(
      "aria-label",
      isExpanded ? "Abrir menú" : "Cerrar menú",
    );
    siteNav.classList.toggle("is-open", !isExpanded);
  });

  siteNav.addEventListener("click", (event) => {
    if (event.target instanceof Element && event.target.closest("a")) {
      closeMenu();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMenu();
    }
  });
}

const questions = Array.isArray(window.testQuestions)
  ? window.testQuestions
  : [];
const scoring = window.testScoring;
const factorNames = {
  N: "Neuroticismo",
  E: "Extraversión",
  O: "Apertura",
  A: "Amabilidad",
  C: "Responsabilidad",
};
const scoringReady =
  Array.isArray(scoring?.keys) &&
  scoring.keys.length === 240 &&
  scoring.keys.every(
    (key) =>
      Array.isArray(key) &&
      key.length === 5 &&
      key.every((score) => Number.isInteger(score) && score >= 0 && score <= 4),
  ) &&
  Array.isArray(scoring.facets) &&
  scoring.facets.length === 240;
const pageSize = 10;
const responseOptions = [
  { code: "TD", label: "Totalmente en desacuerdo" },
  { code: "D", label: "En desacuerdo" },
  { code: "N", label: "Ni de acuerdo ni en desacuerdo" },
  { code: "A", label: "De acuerdo" },
  { code: "TA", label: "Totalmente de acuerdo" },
];
const quizIntro = document.querySelector("#quiz-intro");
const quizForm = document.querySelector("#quiz-form");
const questionList = document.querySelector("#question-list");
const startButton = document.querySelector("#start-test");
const showDemoButton = document.querySelector("#show-demo");
const previousButton = document.querySelector("#previous-page");
const nextButton = document.querySelector("#next-page");
const restartButton = document.querySelector("#restart-test");
const quizComplete = document.querySelector("#quiz-complete");
const pageCount = document.querySelector("#page-count");
const answerCount = document.querySelector("#answer-count");
const progressTrack = document.querySelector("#progress-track");
const progressFill = document.querySelector("#progress-fill");
const quizError = document.querySelector("#quiz-error");
const resultsGrid = document.querySelector("#results-grid");
const radarArea = document.querySelector("#radar-area");
const radarMarkers = document.querySelector("#radar-markers");
const radarLegend = document.querySelector("#radar-legend");
const radarDescription = document.querySelector("#radar-description");
const reportDate = document.querySelector("#report-date");
const printReportButton = document.querySelector("#print-report");
const demoIndicator = document.querySelector("#demo-indicator");
const reportTitle = document.querySelector("#report-title");
const reportSummary = document.querySelector("#report-summary");

const renderResults = (answers, { demo = false } = {}) => {
  reportTitle.textContent = demo
    ? "Informe de demostración NEO PI-R"
    : "Informe de resultados NEO PI-R";
  reportSummary.textContent = demo
    ? "Este ejemplo usa respuestas generadas automáticamente. No corresponde a una persona ni a una evaluación real."
    : "Cuestionario completado: 240 afirmaciones respondidas. Este perfil presenta puntuaciones directas, sin baremos ni interpretación diagnóstica.";
  demoIndicator.hidden = !demo;
  restartButton.textContent = demo ? "Hacer el cuestionario" : "Volver a empezar";

  const generatedAt = new Date();
  reportDate.dateTime = generatedAt.toISOString();
  reportDate.textContent = new Intl.DateTimeFormat("es-ES", {
    dateStyle: "long",
  }).format(generatedAt);

  const facetScores = new Map();

  answers.forEach((answer, index) => {
    const facet = scoring.facets[index];
    facetScores.set(
      facet,
      (facetScores.get(facet) ?? 0) + scoring.keys[index][answer],
    );
  });

  const factorScores = Object.fromEntries(
    Object.keys(factorNames).map((code) => [
      code,
      [...facetScores.entries()]
        .filter(([facet]) => facet.startsWith(code))
        .reduce((total, [, score]) => total + score, 0),
    ]),
  );
  const factorCodes = Object.keys(factorNames);
  const radarPoints = factorCodes.map((code, index) => {
    const angle = ((-90 + index * 72) * Math.PI) / 180;
    const radius = 92 * (factorScores[code] / 192);
    return {
      code,
      x: 180 + Math.cos(angle) * radius,
      y: 145 + Math.sin(angle) * radius,
    };
  });

  radarArea.setAttribute(
    "points",
    radarPoints.map(({ x, y }) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" "),
  );
  radarMarkers.replaceChildren();
  radarLegend.replaceChildren();

  radarPoints.forEach(({ code, x, y }) => {
    const marker = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    marker.setAttribute("cx", x.toFixed(1));
    marker.setAttribute("cy", y.toFixed(1));
    marker.setAttribute("r", "5");
    marker.setAttribute("class", `radar-marker marker-${code.toLowerCase()}`);
    radarMarkers.append(marker);

    const item = document.createElement("li");
    item.className = "radar-legend-item";
    item.dataset.factor = code;
    const swatch = document.createElement("span");
    swatch.className = "radar-swatch";
    swatch.setAttribute("aria-hidden", "true");
    const name = document.createElement("span");
    name.textContent = factorNames[code];
    const score = document.createElement("strong");
    score.textContent = `${factorScores[code]} / 192`;
    item.append(swatch, name, score);
    radarLegend.append(item);
  });

  radarDescription.textContent = `Puntuaciones directas: ${factorCodes
    .map((code) => `${factorNames[code]} ${factorScores[code]} de 192`)
    .join(", ")}.`;

  resultsGrid.replaceChildren();

  Object.entries(factorNames).forEach(([code, name]) => {
    const section = document.createElement("section");
    section.className = "factor-result";
    section.dataset.factor = code;

    const header = document.createElement("div");
    header.className = "factor-result-header";
    const factorCode = document.createElement("span");
    factorCode.className = "factor-code";
    factorCode.textContent = code;
    const title = document.createElement("h4");
    title.textContent = name;
    const factorScore = factorScores[code];
    const scoreLabel = document.createElement("strong");
    scoreLabel.textContent = `${factorScore} / 192`;
    header.append(factorCode, title, scoreLabel);

    const factorMeter = document.createElement("div");
    factorMeter.className = "score-meter factor-meter";
    factorMeter.setAttribute("role", "progressbar");
    factorMeter.setAttribute("aria-label", `${name}, puntuación directa`);
    factorMeter.setAttribute("aria-valuemin", "0");
    factorMeter.setAttribute("aria-valuemax", "192");
    factorMeter.setAttribute("aria-valuenow", String(factorScore));
    const factorFill = document.createElement("span");
    factorFill.style.width = `${(factorScore / 192) * 100}%`;
    factorMeter.append(factorFill);

    const facets = document.createElement("div");
    facets.className = "facet-results";

    [...facetScores.entries()]
      .filter(([facet]) => facet.startsWith(code))
      .forEach(([facet, score]) => {
        const facetResult = document.createElement("div");
        facetResult.className = "facet-result";
        const facetHeader = document.createElement("div");
        facetHeader.className = "facet-result-header";
        const facetCode = document.createElement("span");
        facetCode.textContent = facet;
        const facetScore = document.createElement("strong");
        facetScore.textContent = `${score} / 40`;
        facetHeader.append(facetCode, facetScore);

        const facetMeter = document.createElement("div");
        facetMeter.className = "score-meter facet-meter";
        facetMeter.setAttribute("role", "progressbar");
        facetMeter.setAttribute("aria-label", `${facet}, puntuación directa`);
        facetMeter.setAttribute("aria-valuemin", "0");
        facetMeter.setAttribute("aria-valuemax", "40");
        facetMeter.setAttribute("aria-valuenow", String(score));
        const facetFill = document.createElement("span");
        facetFill.style.width = `${(score / 40) * 100}%`;
        facetMeter.append(facetFill);

        facetResult.append(facetHeader, facetMeter);
        facets.append(facetResult);
      });

    section.append(header, factorMeter, facets);
    resultsGrid.append(section);
  });
};

if (
  quizIntro &&
  quizForm &&
  questionList &&
  startButton &&
  showDemoButton &&
  previousButton &&
  nextButton &&
  restartButton &&
  quizComplete &&
  resultsGrid &&
  reportDate &&
  printReportButton &&
  demoIndicator &&
  reportTitle &&
  reportSummary &&
  pageCount &&
  answerCount &&
  progressTrack &&
  progressFill &&
  quizError
) {
  let currentPage = 0;
  const answers = Array(questions.length).fill(null);
  const pageTotal = Math.ceil(questions.length / pageSize);

  const updateProgress = () => {
    const answered = answers.filter((answer) => answer !== null).length;
    answerCount.textContent = `${answered} de ${questions.length} respondidas`;
    progressTrack.setAttribute("aria-valuenow", String(answered));
    progressFill.style.width = `${questions.length ? (answered / questions.length) * 100 : 0}%`;
    pageCount.textContent = `Bloque ${currentPage + 1} de ${pageTotal}`;
  };

  const renderPage = () => {
    questionList.replaceChildren();
    const firstQuestion = currentPage * pageSize;
    const lastQuestion = Math.min(firstQuestion + pageSize, questions.length);

    for (
      let questionIndex = firstQuestion;
      questionIndex < lastQuestion;
      questionIndex += 1
    ) {
      const fieldset = document.createElement("fieldset");
      fieldset.className = "question-item";

      const legend = document.createElement("legend");
      const number = document.createElement("span");
      number.className = "question-number";
      number.textContent = String(questionIndex + 1).padStart(3, "0");
      const text = document.createElement("span");
      text.textContent = questions[questionIndex];
      legend.append(number, text);

      const scale = document.createElement("div");
      scale.className = "answer-scale";

      responseOptions.forEach((option, value) => {
        const label = document.createElement("label");
        label.className = "answer-option";
        const input = document.createElement("input");
        input.type = "radio";
        input.name = `question-${questionIndex + 1}`;
        input.value = String(value);
        input.checked = answers[questionIndex] === value;
        input.setAttribute("aria-label", option.label);
        input.addEventListener("change", () => {
          answers[questionIndex] = value;
          updateProgress();
          quizError.hidden = true;
        });

        const code = document.createElement("span");
        code.className = "answer-code";
        code.setAttribute("aria-hidden", "true");
        code.textContent = option.code;
        const accessibleLabel = document.createElement("span");
        accessibleLabel.className = "visually-hidden";
        accessibleLabel.textContent = option.label;

        label.append(input, code, accessibleLabel);
        scale.append(label);
      });

      fieldset.append(legend, scale);
      questionList.append(fieldset);
    }

    previousButton.disabled = currentPage === 0;
    nextButton.innerHTML =
      currentPage === pageTotal - 1
        ? 'Finalizar <span aria-hidden="true">→</span>'
        : 'Continuar <span aria-hidden="true">→</span>';
    updateProgress();
  };

  const showMissingAnswers = () => {
    const firstQuestion = currentPage * pageSize;
    const lastQuestion = Math.min(firstQuestion + pageSize, questions.length);
    const firstMissing = answers.findIndex(
      (answer, index) =>
        index >= firstQuestion && index < lastQuestion && answer === null,
    );

    if (firstMissing === -1) {
      return false;
    }

    quizError.hidden = false;
    questionList
      .querySelector(`input[name="question-${firstMissing + 1}"]`)
      ?.focus();
    return true;
  };

  startButton.addEventListener("click", () => {
    if (questions.length !== 240 || !scoringReady) {
      return;
    }
    quizIntro.hidden = true;
    quizForm.hidden = false;
    renderPage();
    quizForm.scrollIntoView({ behavior: "smooth", block: "start" });
    questionList.querySelector("input")?.focus({ preventScroll: true });
  });

  showDemoButton.addEventListener("click", () => {
    if (questions.length !== 240 || !scoringReady) {
      return;
    }

    const simulatedAnswers = questions.map((_, index) => {
      const seed = (Math.imul(index + 1, 1103515245) + 12345) >>> 0;
      return seed % 5;
    });

    quizIntro.hidden = true;
    quizForm.hidden = true;
    quizError.hidden = true;
    renderResults(simulatedAnswers, { demo: true });
    quizComplete.hidden = false;
    quizComplete.scrollIntoView({ behavior: "smooth", block: "start" });
    quizComplete.focus();
  });

  previousButton.addEventListener("click", () => {
    if (currentPage > 0) {
      currentPage -= 1;
      quizError.hidden = true;
      renderPage();
      quizForm.scrollIntoView({ behavior: "smooth", block: "start" });
      questionList.querySelector("input")?.focus({ preventScroll: true });
    }
  });

  nextButton.addEventListener("click", () => {
    if (showMissingAnswers()) {
      return;
    }

    if (currentPage < pageTotal - 1) {
      currentPage += 1;
      quizError.hidden = true;
      renderPage();
      quizForm.scrollIntoView({ behavior: "smooth", block: "start" });
      questionList.querySelector("input")?.focus({ preventScroll: true });
      return;
    }

    quizForm.hidden = true;
    renderResults(answers);
    quizComplete.hidden = false;
    quizComplete.focus();
  });

  restartButton.addEventListener("click", () => {
    answers.fill(null);
    currentPage = 0;
    quizComplete.hidden = true;
    quizError.hidden = true;
    quizIntro.hidden = false;
    quizIntro.scrollIntoView({ behavior: "smooth", block: "center" });
    updateProgress();
  });

  printReportButton.addEventListener("click", () => window.print());

  startButton.disabled = questions.length !== 240 || !scoringReady;
  showDemoButton.disabled = questions.length !== 240 || !scoringReady;
  if (!questions.length) {
    quizError.textContent = "No se pudo cargar el banco de preguntas.";
    quizError.hidden = false;
  } else if (!scoringReady) {
    quizError.textContent = "No se pudo cargar la clave de puntuación.";
    quizError.hidden = false;
  }
  updateProgress();
}
