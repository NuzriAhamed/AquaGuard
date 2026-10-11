// AquaGuard: Integrated Water Safety Research Platform Logic

const modules = [
  {
    name: "Garbage Detection & GDI",
    who: "Lithurshna",
    model: "YOLOv8-nano (3.2M params)",
    aim: "Detect and classify floating garbage (plastic, polythene, glass, metal) in Sri Lankan rivers and convert detections into a weighted Garbage Density Index (0-100).",
    data: "~300 custom Sri Lankan river images (Kelani, Maha Oya) + 3,431 public Roboflow images, ~3,731 in total. Public classes were mapped to 4 target classes; augmentation: flips, rotation ±15°, brightness ±20%, mosaic, mixup 15%.",
    train: "640×640 resolution, 100-150 epochs, batch 16, Adam optimizer, lr 0.0005, patience 25-30, Google Colab T4 GPU.",
    method: "Detection → danger-weighted score (polythene 1.0, plastic 0.8, glass 0.7, metal 0.6) → pollution level (Low/Moderate/High/Critical) → GPS + timestamp storage → trend analysis and cleanup prioritisation.",
    metrics: "Targets: precision ≥ 0.80, recall ≥ 0.75, F1 ≥ 0.75, mAP@50 ≥ 0.75, mAP@50-95 ≥ 0.50, inference ≤ 50 ms."
  },
  {
    name: "Human-Wildlife Proximity",
    who: "Nuzri (Ahamed M.U.N - IT22197900)",
    model: "Decoupled Dual YOLOv8 (Animaldetect.pt + Human.pt) + Spatial-Temporal MOT",
    aim: "Detect humans and wildlife in recreational water / UAV video feeds and execute progressive threat escalation (SAFE, WARNING, CRITICAL) using dual spatial metrics: real-world meters (d_meters ≤ 3.5m) and physical edge clearance (d_edge_meters ≤ 1.5m).",
    data: "Dedicated human-detection dataset (Human.pt) + custom and public wildlife images across 12 animal classes, with 6 core wildlife targets evaluated in the final report (elephant, leopard, tiger, bear, buffalo, cow) plus person and background evaluation categories (~4,000 images). Preprocessing includes glare and illumination augmentation.",
    train: "Decoupled dual YOLOv8 branches trained up to 100 epochs on GPU. Evaluated across 10 checkpoints (epochs 0 to 100). Final epoch 100 results: Box loss 1.274 (-73.6%), Class loss 0.439 (-87.5%), DFL loss 0.891 (-57.7%). Precision: 0.914, Recall: 0.885, mAP@0.5: 0.927. An apparent convergence plateau was identified by epoch 57 (Precision: 0.914, Recall: 0.885, mAP@0.5: 0.927).",
    method: "Video intake (fixed/UAV) → glare augmentation → decoupled YOLOv8 (Animaldetect.pt & Human.pt) → spatial-temporal MOT (80% lock) → 6-stage spatial pipeline: (1) 2D Cartesian matrix C_animal, C_human & Base foot-points; (2) Anti-ghosting IoU suppression (IoU > 0.55, dist < 45px); (3) Boundary clearance d_edge_px = √(Δx² + Δy²); (4) Perspective depth scaling S_depth = 1.70m / h_human; (5) Multi-tiered escalation: CRITICAL (d_meters ≤ 3.5m OR d_edge_meters ≤ 1.5m, fallback ≤ 220px), WARNING (3.5m < d ≤ 8.0m or animal alone), SAFE (d > 8.0m or personnel only); (6) Empirical benchmark validation (Frame 125 resolved).",
    metrics: "Final measured metrics at Epoch 100: Precision = 0.914 (target ≥ 0.80 exceeded), Recall = 0.885 (target ≥ 0.75 exceeded), mAP@0.5 = 0.927 (target ≥ 0.75 exceeded). 8-class normalized confusion matrix diagonal rates: Elephant 0.95, Leopard 0.93, Tiger 0.94, Bear 0.91, Buffalo 0.91, Cow 0.90, Person 0.95, Background 0.82 (Foreground mean: 0.927; 8-class mean: 0.914). Verified against 12-case FSM boundary test matrix (T01-T12)."
  },
  {
    name: "Drowning Detection",
    who: "Ithayavelini M.A (IT22194480s)",
    model: "YOLOv8n Baseline (3.0M) & Fine-Tuned Detector (25.8M) + Temporal Emergency State Engine",
    aim: "Detect potential drowning in Sri Lankan bathing areas and rivers with annotated MJPEG streaming, 10-call temporal retention, and persistent SQLite incident logging.",
    data: "Water Rescue Dataset v1 (cuizh: 3,846 train, 369 val / 584 objects, 181 test; classes: drowning, float, swimmer) + Swimming and Drowning dataset (fadhil-fahim: 5,070 train, 1,478 val / 2,748 objects; classes: Drowning, Person out of water, Swimming) + Deployed 2-class dataset (drowning, swimming).",
    train: "Baseline: YOLOv8n, 5 epochs, imgsz 640, batch 8, SGD lr 0.01, Apple M1 CPU (1.13h). Fine-tuning: 20 epochs, imgsz 384, batch 8, AdamW lr 0.01, freeze 10 layers, Apple M1 MPS (5.57h). Deployed checkpoint: YOLOv8, 60 epochs (retained summary at epoch 40), batch 16, imgsz 640, SGD lr 0.001.",
    method: "OpenCV video stream (local file/webcam index 0) → YOLO inference (conf default 0.40) → 10-call sliding window history H_t: E_t = (d_t = 1) OR (sum(H_t) ≥ 2) → immediate CRITICAL alert on hit, held through 8 empty calls on repeated hits → AlertManager 8-second cooldown to suppress repeated incident writes → SQLite (surveillance.db) and static JPEG snapshot storage → FastAPI MJPEG & WebSocket stream → React dashboard with 800ms stats polling and Web Audio alert.",
    metrics: "Baseline (416 imgsz): Precision 71.13%, Recall 71.57%, mAP@0.5 73.04%, mAP@0.5-0.95 28.90%, F1 71.35%. Fine-tuned (416 imgsz): Precision 80.64%, Recall 74.51%, mAP@0.5 81.43%, mAP@0.5-0.95 45.46%, F1 77.46% (Drowning class AP@0.5 84.93%, AP@0.5-0.95 50.45%). Deployed checkpoint summary (epoch 40): Precision 90.67%, Recall 89.31%, mAP@0.5 93.22%, mAP@0.5-0.95 73.17%, F1 89.98%."
  },
  {
    name: "Crowd Monitoring & TankBot",
    who: "Binusha",
    model: "YOLO11m + ByteTrack; RAG chatbot (GPT-4o-mini)",
    aim: "Monitor crowd size at tanks and reservoirs from images, video and live camera, and answer visitor questions about Sri Lankan tanks and safety.",
    data: "Roboflow single-class person dataset: 3,212 train, 917 validation, 458 test images. Chatbot knowledge base: curated PDF from Irrigation Dept, Ministry of Environment, National Planning and Sri Lanka Life Saving sources.",
    train: "30 epochs, 640×640, AdamW, lr 0.001, weight decay 0.0005, 3 warm-up epochs, patience 20, Kaggle T4. Deployed with 960 px inference, conf 0.35, IoU 0.50. Chatbot: PyMuPDF → 800-char chunks, 150 overlap → llama-text-embed-v2 → Pinecone (284 vectors) → top 5 chunks, similarity ≥ 0.35.",
    method: "Detection → ByteTrack IDs → current and unique-person counts → threshold alert (demo limit 25, backend default 20) with audible alarm. TankBot keeps a 10-turn session memory and redirects out-of-scope questions.",
    metrics: "Detection metrics on the held-out test set; frame-level counts, peak crowd size and alert duration."
  },
  {
    name: "Emergency First-Aid Chatbot",
    who: "Parami H.K.B (IT22125934)",
    model: "RAG + CAG State Machine (WHO & Red Cross Medical Corpus)",
    aim: "Deliver domain-restricted, multi-modal emergency first-aid instructions for Sri Lankan reservoir visitors across drowning, bleeding, fractures, animal bites, and heatstroke, prioritizing urgent escalation.",
    data: "Authoritative emergency guidelines from the World Health Organization (WHO) and International Red Cross/Red Crescent, structured into versioned scenario-grounded passages and question-state pairs.",
    train: "Retrieval-Augmented Generation (RAG) with dense passage retrieval, coupled with Cache-Augmented Generation (CAG) for low latency. Strictly bounded prompt engineering with conservative abstention when evidence is absent.",
    method: "Voice/Text input → Speech-to-Text with water noise tolerance → Session State Manager (typed vitals: consciousness, breathing, bleeding) → Emergency Policy & Urgency Classifier → WHO/Red Cross RAG Retrieval + CAG Cache Lookup (invalidated on vital changes) → Structured Step-by-Step Guidance + Spoken Audio TTS + Emergency Escalation.",
    metrics: "Comprehensive verification framework: 7 functional & safety requirements (FR-01–FR-03, SR-01–SR-03, CAG-01), 12-case scenario matrix (A01–A12 / TC-01–TC-05). Explicitly audited as an unverified evaluation instrument pending clinical trials to maintain academic integrity."
  }
];

const lit = [
  ["Cao et al. (2025)", "SEDS-YOLOv8", "Sci. Reports", "Detection only, no types, no scoring"],
  ["Zhao et al. (2026)", "eCBAM-YOLOv11", "Applied Sciences", "6 classes, no pollution index or web app"],
  ["Wang et al. (2026)", "MFPF-YOLOv11s", "Frontiers Comp. Sci.", "No end-to-end system or location tracking"],
  ["Dong et al. (2026)", "YOLOv8-SST", "PLOS ONE", "Generic 'floating object', no severity"],
  ["MDPI Water (2024)", "YOLOv5 + DeepSORT", "Water", "Lab flume only, no real-river deployment"]
];

const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);

// ============================================================================
// Theme Management (Persistence + Auto Detection)
// ============================================================================
const themeBtn = $("#theme");
function updateThemeUI(theme) {
  const icon = themeBtn.querySelector(".theme-icon");
  const text = themeBtn.querySelector(".theme-text");
  if (theme === "dark") {
    if (icon) icon.textContent = "☀️";
    if (text) text.textContent = "Light";
    themeBtn.setAttribute("aria-label", "Switch to light theme");
  } else {
    if (icon) icon.textContent = "🌙";
    if (text) text.textContent = "Dark";
    themeBtn.setAttribute("aria-label", "Switch to dark theme");
  }
}

function initTheme() {
  const saved = localStorage.getItem("aquaguard-theme");
  const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const initialTheme = saved || (systemDark ? "dark" : "light");
  document.documentElement.dataset.theme = initialTheme;
  updateThemeUI(initialTheme);
}

if (themeBtn) {
  themeBtn.onclick = () => {
    const root = document.documentElement;
    const current = root.dataset.theme === "dark" ? "light" : "dark";
    root.dataset.theme = current;
    localStorage.setItem("aquaguard-theme", current);
    updateThemeUI(current);
  };
}

initTheme();

// ============================================================================
// Literature Review Table Population
// ============================================================================
const litTbody = $("#lit tbody");
if (litTbody) {
  litTbody.innerHTML = lit.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join("")}</tr>`).join("");
}

// ============================================================================
// Module Explorer Tabs & Panel
// ============================================================================
const tabs = $("#tabs");
const panel = $("#panel");

function showModule(i) {
  if (!tabs || !panel) return;
  const m = modules[i];
  [...tabs.children].forEach((b, j) => b.setAttribute("aria-selected", i === j));
  panel.innerHTML = `
    <h3>${m.name}</h3>
    <p>
      <span class="tag">Lead: ${m.who}</span>
      <span class="tag">Architecture: ${m.model}</span>
    </p>
    <dl>
      <dt>Research Aim</dt>
      <dd>${m.aim}</dd>
      <dt>Dataset &amp; Preprocessing</dt>
      <dd>${m.data}</dd>
      <dt>Model &amp; Training Spec</dt>
      <dd>${m.train}</dd>
      <dt>Inference Pipeline</dt>
      <dd>${m.method}</dd>
      <dt>Evaluation &amp; Target Metrics</dt>
      <dd>${m.metrics}</dd>
    </dl>
  `;
}

if (tabs && panel) {
  modules.forEach((m, i) => {
    const b = document.createElement("button");
    b.textContent = m.name;
    b.setAttribute("role", "tab");
    b.onclick = () => showModule(i);
    tabs.append(b);
  });
  showModule(0);
}

// ============================================================================
// Interactive GDI Calculator & Visual Meter Bar
// ============================================================================
const W = { polythene: 1.0, plastic: 0.8, glass: 0.7, metal: 0.6 };

function gdi() {
  let s = 0;
  for (const k in W) {
    const n = +$("#n_" + k)?.value || 0;
    const c = +$("#c_" + k)?.value || 0;
    s += n * c * W[k];
  }
  const area = +$("#area")?.value || 1;
  const v = Math.min(100, (s / area) * 20);
  const l = v < 25 ? "Low" : v < 50 ? "Moderate" : v < 75 ? "High" : "Critical";

  const gout = $("#gout");
  const gdiNeedle = $("#gdi-needle");
  const gdiFillBar = $("#gdi-fill-bar");
  const gdiBadge = $("#gdi-badge");

  const colors = {
    Low: "#16A34A",
    Moderate: "#CA8A04",
    High: "#EA580C",
    Critical: "#DC2626"
  };

  const levelColor = colors[l];

  if (gout) {
    gout.textContent = `GDI = ${v.toFixed(1)} / 100 → ${l.toUpperCase()} POLLUTION`;
    gout.style.background = levelColor;
  }

  if (gdiNeedle) {
    gdiNeedle.style.left = `${Math.max(1, Math.min(99, v))}%`;
  }

  if (gdiFillBar) {
    gdiFillBar.style.width = `${v}%`;
  }

  if (gdiBadge) {
    gdiBadge.textContent = `${v.toFixed(1)} • ${l.toUpperCase()}`;
    gdiBadge.style.background = levelColor;
  }
}

$$(".calc input").forEach(i => i.oninput = gdi);
gdi();

// ============================================================================
// Interactive Wildlife Proximity Spatial Threat Scale Bar
// ============================================================================
function updateThreatScale(dMeters, dEdgeMeters) {
  const needle = $("#threat-needle");
  const badge = $("#threat-badge");
  const telCentroid = $("#tel-centroid");
  const telEdge = $("#tel-edge");
  const telState = $("#tel-state");

  // Threat condition logic:
  // CRITICAL: d_meters <= 3.5 OR d_edge_meters <= 1.5
  // WARNING: 3.5 < d_meters <= 8.0
  // SAFE: d_meters > 8.0
  let state = "SAFE";
  let color = "#16A34A";
  let label = "SAFE (Perimeter Secure)";

  if (dMeters <= 3.5 || dEdgeMeters <= 1.5) {
    state = "CRITICAL";
    color = "#DC2626";
    label = "CRITICAL (Immediate Siren Fired)";
  } else if (dMeters <= 8.0) {
    state = "WARNING";
    color = "#EA580C";
    label = "WARNING (Caution Zone Active)";
  }

  // Scale map: 0m to 15m -> 0% to 100%
  const maxMeter = 15;
  const pct = Math.min(100, Math.max(1, (dMeters / maxMeter) * 100));

  if (needle) needle.style.left = `${pct}%`;
  if (badge) {
    badge.textContent = `STATE: ${state}`;
    badge.style.background = color;
  }
  if (telCentroid) telCentroid.textContent = `${dMeters.toFixed(2)} m`;
  if (telEdge) telEdge.textContent = `${dEdgeMeters.toFixed(2)} m`;
  if (telState) {
    telState.textContent = label;
    telState.style.color = color;
  }
}

const threatPresets = {
  f25: { d: 2.54, edge: 1.55 },
  f75: { d: 1.14, edge: 0.35 },
  f125: { d: 1.51, edge: 0.08 },
  safe: { d: 9.80, edge: 8.20 }
};

window.setThreatPreset = function(presetKey, btn) {
  $$(".threat-btn").forEach(b => b.classList.remove("active"));
  if (btn) btn.classList.add("active");
  const p = threatPresets[presetKey];
  if (p) updateThreatScale(p.d, p.edge);
};

// Initialize with Frame 125 benchmark (the key supervisor research case)
updateThreatScale(1.51, 0.08);

// ============================================================================
// Viva Q&A Accordion
// ============================================================================
$$(".q button").forEach(b => {
  b.onclick = () => {
    const parent = b.parentElement;
    const isOpen = parent.classList.toggle("open");
    b.setAttribute("aria-expanded", isOpen ? "true" : "false");
  };
});

// ============================================================================
// Top Navigation Active Link Highlighting & Reading Progress Bar
// ============================================================================
const secs = [...$$("section[id]")];
const links = [...$$(".nav a")];
const bar = $("#bar");
const topBtn = $("#top");

window.addEventListener("scroll", () => {
  const h = document.documentElement;
  const scrolled = window.scrollY;
  const maxScroll = h.scrollHeight - window.innerHeight;

  // Scroll Progress Bar
  if (bar && maxScroll > 0) {
    bar.style.width = (scrolled / maxScroll * 100) + "%";
  }

  // Floating Back-to-Top Button
  if (topBtn) {
    topBtn.classList.toggle("show", scrolled > 450);
  }

  // Active Link in Navigation
  let currentId = secs[0]?.id || "";
  secs.forEach(s => {
    if (scrolled >= s.offsetTop - 110) {
      currentId = s.id;
    }
  });

  links.forEach(a => {
    a.classList.toggle("on", a.getAttribute("href") === "#" + currentId);
  });
}, { passive: true });

if (topBtn) {
  topBtn.onclick = () => window.scrollTo({ top: 0, behavior: "smooth" });
}

// ============================================================================
// Animated Stats Numbers & Intersection Observers
// ============================================================================
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const countUp = el => {
  const target = parseFloat(el.dataset.n || 0);
  const isFloat = String(el.dataset.n).includes(".");
  const prefix = el.dataset.prefix || "";
  const suffix = el.dataset.suffix || "";

  if (reduceMotion) {
    el.textContent = `${prefix}${target}${suffix}`;
    return;
  }

  let startTime = null;
  const duration = 1800;

  const step = time => {
    if (!startTime) startTime = time;
    const progress = Math.min((time - startTime) / duration, 1);
    // Smooth easeOutCubic
    const ease = 1 - Math.pow(1 - progress, 3);
    const currentVal = target * ease;
    el.textContent = `${prefix}${isFloat ? currentVal.toFixed(1) : Math.round(currentVal)}${suffix}`;
    if (progress < 1) {
      requestAnimationFrame(step);
    } else {
      el.textContent = `${prefix}${target}${suffix}`;
    }
  };
  requestAnimationFrame(step);
};

const statsObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.querySelectorAll("b[data-n]").forEach(countUp);
      statsObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.3 });

const statsEl = document.querySelector(".stats");
if (statsEl) statsObserver.observe(statsEl);

// Content Fade-in Observer
$$("section .card, section .flow div, .tl > div, .q, .tw, .panel, .calc, .out, section h2").forEach((e, i) => {
  e.classList.add("rv", "in");
  e.style.transitionDelay = (i % 4) * 75 + "ms";
});

const contentObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("in");
      contentObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

$$(".rv").forEach(el => contentObserver.observe(el));
