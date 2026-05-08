const steps = [
  {
    id: "basics",
    title: "Student Basics",
    intro:
      "Start with context that helps compare opportunity, background, and school environment without reducing a student to marks alone.",
    fields: [
      { id: "name", label: "Student name", type: "text", required: true, placeholder: "Aarav Sharma" },
      { id: "grade", label: "Grade", type: "select", required: true, options: ["6", "7", "8", "9", "10", "11", "12"] },
      { id: "school", label: "School or learning center", type: "text", placeholder: "HiddenSpark Public School" },
      { id: "language", label: "Primary learning language", type: "select", options: ["English", "Hindi", "Marathi", "Tamil", "Telugu", "Bengali", "Other"] },
      { id: "support", label: "Available learning support", type: "textarea", placeholder: "Mentors, family support, internet access, library, clubs..." },
    ],
  },
  {
    id: "academics",
    title: "Academic Patterns",
    intro:
      "Capture uneven performance, growth, and overlooked strengths. Talent often appears as a pattern before it appears as a rank.",
    questions: [
      {
        id: "academicGrowth",
        prompt: "How has the student's academic performance changed recently?",
        axis: "persistence",
        choices: [
          ["1", "Declining", "Needs immediate support and confidence rebuilding."],
          ["2", "Stable", "Consistent but may need richer challenges."],
          ["3", "Improving", "Shows growth momentum and learning recovery."],
        ],
      },
      {
        id: "conceptTransfer",
        prompt: "Can the student apply classroom ideas to new situations?",
        axis: "curiosity",
        choices: [
          ["1", "Rarely", "Mostly repeats taught methods."],
          ["2", "Sometimes", "Transfers ideas with guidance."],
          ["3", "Often", "Finds links beyond the lesson."],
        ],
      },
      {
        id: "deepWork",
        prompt: "How well does the student stay with difficult tasks?",
        axis: "persistence",
        choices: [
          ["1", "Avoids difficulty", "Stops quickly when stuck."],
          ["2", "Tries with prompts", "Benefits from structure and feedback."],
          ["3", "Persists independently", "Keeps testing approaches."],
        ],
      },
    ],
  },
  {
    id: "interests",
    title: "Interests & Creativity",
    intro:
      "Unrealized potential often hides in side projects, questions, hobbies, and unusual combinations of interests.",
    questions: [
      {
        id: "selfProjects",
        prompt: "Does the student create or explore things outside assigned work?",
        axis: "creativity",
        choices: [
          ["1", "Not yet", "No visible self-led exploration."],
          ["2", "Occasionally", "Creates when encouraged or inspired."],
          ["3", "Frequently", "Starts projects without being asked."],
        ],
      },
      {
        id: "questionQuality",
        prompt: "What kind of questions does the student ask?",
        axis: "curiosity",
        choices: [
          ["1", "Clarifying", "Mostly asks what to do next."],
          ["2", "Connecting", "Links topics and asks why."],
          ["3", "Original", "Asks unusual, investigative questions."],
        ],
      },
      {
        id: "expression",
        prompt: "Which expression style seems strongest?",
        axis: "creativity",
        choices: [
          ["1", "Still emerging", "No clear mode yet."],
          ["2", "Single strength", "Strong in one mode such as writing, speaking, art, or building."],
          ["3", "Multimodal", "Combines multiple modes to explain ideas."],
        ],
      },
    ],
  },
  {
    id: "behavior",
    title: "Behavior & Environment",
    intro:
      "The same ability can look different depending on classroom safety, peer dynamics, confidence, and access to resources.",
    questions: [
      {
        id: "confidence",
        prompt: "How confident is the student when sharing ideas?",
        axis: "persistence",
        choices: [
          ["1", "Very reserved", "May hide ability due to fear or low confidence."],
          ["2", "Selective", "Shares in safe or familiar settings."],
          ["3", "Confident", "Shares ideas and responds to feedback."],
        ],
      },
      {
        id: "collaboration",
        prompt: "How does the student contribute in group work?",
        axis: "creativity",
        choices: [
          ["1", "Quiet observer", "May need a defined role."],
          ["2", "Reliable contributor", "Completes assigned responsibilities."],
          ["3", "Idea catalyst", "Helps others think in new ways."],
        ],
      },
      {
        id: "resourceGap",
        prompt: "Are there barriers that may be masking potential?",
        axis: "opportunity",
        choices: [
          ["1", "Major barriers", "Access, language, time, or support gaps are significant."],
          ["2", "Some barriers", "A few constraints affect performance."],
          ["3", "Few barriers", "Environment mostly supports growth."],
        ],
      },
    ],
  },
  {
    id: "evidence",
    title: "Evidence Notes",
    intro:
      "Add human evidence: teacher observations, parent input, peer feedback, projects, competitions, attendance, and digital learning traces.",
    fields: [
      { id: "teacherNotes", label: "Teacher observations", type: "textarea", placeholder: "Moments where the student surprised you, improved, helped peers, or solved differently..." },
      { id: "parentNotes", label: "Parent or guardian input", type: "textarea", placeholder: "At-home interests, responsibilities, curiosity, unusual strengths..." },
      { id: "studentVoice", label: "Student voice", type: "textarea", placeholder: "What does the student want to learn, build, become, or understand?" },
    ],
  },
];

const state = {
  currentStep: 0,
  answers: JSON.parse(localStorage.getItem("hiddenSparkDraft") || "{}"),
};

const form = document.querySelector("#questionnaireForm");
const stepContent = document.querySelector("#stepContent");
const stepList = document.querySelector("#stepList");
const stepTitle = document.querySelector("#stepTitle");
const stepEyebrow = document.querySelector("#stepEyebrow");
const progressBar = document.querySelector("#progressBar");
const progressText = document.querySelector("#progressText");
const backButton = document.querySelector("#backButton");
const nextButton = document.querySelector("#nextButton");
const saveButton = document.querySelector("#saveButton");
const resultPanel = document.querySelector("#resultPanel");
const restartButton = document.querySelector("#restartButton");

function renderStepList() {
  stepList.innerHTML = steps
    .map((step, index) => {
      const complete = index < state.currentStep ? "complete" : "";
      const active = index === state.currentStep ? "active" : "";
      return `
        <button class="step-item ${complete} ${active}" type="button" data-step="${index}">
          <span class="step-number">${complete ? "OK" : index + 1}</span>
          <span>${step.title}</span>
        </button>
      `;
    })
    .join("");
}

function renderField(field) {
  const value = state.answers[field.id] || "";
  if (field.type === "select") {
    return `
      <div class="field">
        <label for="${field.id}">${field.label}</label>
        <select id="${field.id}" name="${field.id}" ${field.required ? "required" : ""}>
          <option value="">Select</option>
          ${field.options.map((option) => `<option ${value === option ? "selected" : ""}>${option}</option>`).join("")}
        </select>
      </div>
    `;
  }

  if (field.type === "textarea") {
    return `
      <div class="field full">
        <label for="${field.id}">${field.label}</label>
        <textarea id="${field.id}" name="${field.id}" placeholder="${field.placeholder || ""}">${value}</textarea>
      </div>
    `;
  }

  return `
    <div class="field">
      <label for="${field.id}">${field.label}</label>
      <input id="${field.id}" name="${field.id}" type="${field.type}" value="${value}" placeholder="${field.placeholder || ""}" ${field.required ? "required" : ""} />
    </div>
  `;
}

function renderQuestion(question) {
  const selected = state.answers[question.id] || "";
  return `
    <fieldset class="choice-group">
      <legend>${question.prompt}</legend>
      <div class="choice-list">
        ${question.choices
          .map(([value, title, copy]) => `
            <label class="choice-card">
              <input type="radio" name="${question.id}" value="${value}" data-axis="${question.axis}" ${selected === value ? "checked" : ""} required />
              <span class="choice-title">${title}</span>
              <span class="choice-copy">${copy}</span>
            </label>
          `)
          .join("")}
      </div>
    </fieldset>
  `;
}

function renderStep() {
  const step = steps[state.currentStep];
  const progress = Math.round((state.currentStep / steps.length) * 100);

  form.classList.remove("hidden");
  resultPanel.classList.add("hidden");
  stepTitle.textContent = step.title;
  stepEyebrow.textContent = `Step ${state.currentStep + 1} of ${steps.length}`;
  progressBar.style.width = `${progress}%`;
  progressText.textContent = `${progress}%`;
  backButton.disabled = state.currentStep === 0;
  nextButton.textContent = state.currentStep === steps.length - 1 ? "Reveal Profile" : "Continue";

  const body = step.fields
    ? `<div class="form-grid">${step.fields.map(renderField).join("")}</div>`
    : step.questions.map(renderQuestion).join("");

  stepContent.innerHTML = `<p class="step-intro">${step.intro}</p>${body}`;
  renderStepList();
  updatePreview();
}

function collectCurrentStep() {
  const formData = new FormData(form);
  for (const [key, value] of formData.entries()) {
    state.answers[key] = value.trim();
  }
}

function saveDraft(showMessage = true) {
  collectCurrentStep();
  localStorage.setItem("hiddenSparkDraft", JSON.stringify(state.answers));
  updatePreview();
  updateSignals();
  if (showMessage) showToast("Draft saved");
}

function updatePreview() {
  const name = state.answers.name || "New assessment";
  const grade = state.answers.grade ? `Grade ${state.answers.grade}` : "Grade not selected";
  const school = state.answers.school || "School not added";

  document.querySelector("#studentNamePreview").textContent = name;
  document.querySelector("#studentMetaPreview").textContent = `${grade} - ${school}`;
}

function calculateScores() {
  const scores = { curiosity: 0, persistence: 0, creativity: 0, opportunity: 0 };
  const counts = { curiosity: 0, persistence: 0, creativity: 0, opportunity: 0 };

  steps.forEach((step) => {
    (step.questions || []).forEach((question) => {
      const value = Number(state.answers[question.id] || 0);
      if (value) {
        scores[question.axis] += value;
        counts[question.axis] += 1;
      }
    });
  });

  return Object.fromEntries(
    Object.keys(scores).map((axis) => {
      const score = counts[axis] ? Math.round((scores[axis] / (counts[axis] * 3)) * 100) : 0;
      return [axis, score];
    }),
  );
}

function updateSignals() {
  const scores = calculateScores();
  document.querySelector("#curiositySignal").textContent = scores.curiosity;
  document.querySelector("#persistenceSignal").textContent = scores.persistence;
  document.querySelector("#creativitySignal").textContent = scores.creativity;
}

function getPotentialBand(average) {
  if (average >= 78) return ["High signal", "Strong evidence of underdeveloped talent. Prioritize advanced mentoring and project pathways."];
  if (average >= 55) return ["Emerging signal", "Several strengths are visible. The student needs better opportunities, feedback, and confidence-building."];
  return ["Needs discovery", "Potential may be masked. Start with supportive observation, low-pressure exploration, and barrier removal."];
}

function renderResults() {
  saveDraft(false);
  const scores = calculateScores();
  const average = Math.round((scores.curiosity + scores.persistence + scores.creativity + (100 - Math.abs(scores.opportunity - 65))) / 4);
  const [band, bandCopy] = getPotentialBand(average);

  document.querySelector("#scoreGrid").innerHTML = [
    ["Potential index", average, bandCopy],
    ["Curiosity", scores.curiosity, "Measures questions, transfer of learning, and desire to explore."],
    ["Persistence", scores.persistence, "Measures academic growth, confidence recovery, and effort through difficulty."],
    ["Creativity", scores.creativity, "Measures original projects, expression, and contribution to group thinking."],
    ["Opportunity context", scores.opportunity, "Lower context scores may mean talent is hidden by access or support gaps."],
    ["Readiness band", band, "Use this band to select the intensity of enrichment and mentoring."],
  ]
    .map(([label, value, copy]) => `
      <article class="score-card">
        <span class="panel-label">${label}</span>
        <strong>${value}</strong>
        <p>${copy}</p>
      </article>
    `)
    .join("");

  const strengths = [
    scores.curiosity >= 67 ? "Learns by connecting ideas across subjects." : "May need prompts that invite better questions.",
    scores.persistence >= 67 ? "Shows resilience when challenged." : "Confidence and task stamina should be built gradually.",
    scores.creativity >= 67 ? "Produces original ideas through projects, expression, or collaboration." : "Creative strengths may need safer formats to become visible.",
    scores.opportunity <= 55 ? "Performance may be underestimated because of environmental barriers." : "Current environment can support targeted enrichment.",
  ];

  const recommendations = [
    "Create a 4-week talent sprint with one mentor, one project, and weekly evidence notes.",
    "Compare questionnaire results with marks, attendance, project work, teacher comments, and parent observations.",
    "Give the student a choice-based challenge in the strongest signal area.",
    "Review progress monthly and update the potential profile with new evidence.",
  ];

  document.querySelector("#strengthList").innerHTML = strengths.map((item) => `<li>${item}</li>`).join("");
  document.querySelector("#recommendationList").innerHTML = recommendations.map((item) => `<li>${item}</li>`).join("");

  form.classList.add("hidden");
  resultPanel.classList.remove("hidden");
  progressBar.style.width = "100%";
  progressText.textContent = "100%";
  stepEyebrow.textContent = "Complete";
  stepTitle.textContent = "HiddenSpark assessment complete";
}

function showToast(message) {
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  document.body.append(toast);
  window.setTimeout(() => toast.remove(), 1800);
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!form.reportValidity()) return;

  collectCurrentStep();
  updateSignals();

  if (state.currentStep === steps.length - 1) {
    renderResults();
    return;
  }

  state.currentStep += 1;
  renderStep();
});

backButton.addEventListener("click", () => {
  saveDraft(false);
  state.currentStep = Math.max(0, state.currentStep - 1);
  renderStep();
});

saveButton.addEventListener("click", () => saveDraft(true));

stepList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-step]");
  if (!button) return;
  saveDraft(false);
  state.currentStep = Number(button.dataset.step);
  renderStep();
});

restartButton.addEventListener("click", () => {
  localStorage.removeItem("hiddenSparkDraft");
  state.answers = {};
  state.currentStep = 0;
  renderStep();
  updateSignals();
});

renderStep();
updateSignals();
