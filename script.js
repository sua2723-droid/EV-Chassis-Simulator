// =====================
// 파트 데이터 (Link 3 / Suspension 2 / Brakes 3 / Steering 2)
// =====================
const partsData = {
  Link: [
    {
      name: "Front Double Wishbone",
      handling: 28,
      comfort: 15,
      efficiency: 14,
      safety: 18,
      price: 2200,
      image: "images/dw.png"
    },
    {
      name: "Front SLA (Short-Long Arm)",
      handling: 30,
      comfort: 14,
      efficiency: 13,
      safety: 19,
      price: 2600,
      image: "images/link_front_sla.png"
    },
    {
      name: "MacPherson strut",
      handling: 22,
      comfort: 22,
      efficiency: 17,
      safety: 18,
      price: 2000,
      image: "images/link_front_MacPhersonstrut.png"
    }
  ],

  Suspension: [
    {
      name: "coil spring",
      handling: 18,
      comfort: 22,
      efficiency: 18,
      safety: 15,
      price: 1500,
      image: "images/coil.png"
    },
    {
      name: "Air Suspension",
      handling: 24,
      comfort: 28,
      efficiency: 14,
      safety: 20,
      price: 2800,
      image: "images/air.png"
    }
  ],

  Brakes: [
    {
      name: "Module 1 – Comfort/City",
      handling: 12,
      comfort: 26,
      efficiency: 22,
      safety: 22,
      price: 1200,
      image: "images/brake_module1_city.png"
    },
    {
      name: "Module 2 – Sport",
      handling: 26,
      comfort: 16,
      efficiency: 16,
      safety: 32,
      price: 2200,
      image: "images/brake_module2_sport.png"
    },
    {
      name: "Module 3 – Off-road HD",
      handling: 18,
      comfort: 18,
      efficiency: 14,
      safety: 34,
      price: 2500,
      image: "images/brake_module3_offroad.png"
    }
  ],

  Steering: [
    {
      name: "Rack & Pinion EPS",
      handling: 26,
      comfort: 22,
      efficiency: 20,
      safety: 18,
      price: 1800,
      image: "images/steering_rack_eps.png"
    },
    {
      name: "Recirculating Ball + Assist",
      handling: 18,
      comfort: 18,
      efficiency: 15,
      safety: 24,
      price: 2000,
      image: "images/steering_recirculating_ball.png"
    }
  ]
};

// 왼쪽 카테고리 순서
const categoryOrder = ["Link", "Suspension", "Brakes", "Steering"];

let selectedParts = {};
let historyStack = [];      // { type: "part", ... } or { type: "preset", previousParts }
let toastTimeoutId = null;
let activePreset = null;

const categoriesDiv = document.getElementById("categories");

// =====================
// 카테고리 UI (3열 카드)
// =====================
categoryOrder.forEach(category => {
  const div = document.createElement("div");
  div.className = "category";

  const title = document.createElement("h3");
  title.innerText = category;
  div.appendChild(title);

  partsData[category].forEach((part, index) => {
    const card = document.createElement("div");
    card.className = "part-card";
    card.draggable = true;
    card.dataset.partName = part.name;

    card.title =
      `Handling: ${part.handling} | Comfort: ${part.comfort} | ` +
      `Efficiency: ${part.efficiency} | Safety: ${part.safety} | Price: $${part.price}`;

    const thumbWrap = document.createElement("div");
    thumbWrap.className = "part-card-thumbnail";
    const thumbImg = document.createElement("img");
    thumbImg.src = part.image;
    thumbWrap.appendChild(thumbImg);

    const body = document.createElement("div");
    body.className = "part-card-body";

    const nameEl = document.createElement("div");
    nameEl.className = "part-card-title";
    nameEl.innerText = part.name;

    const specEl = document.createElement("div");
    specEl.className = "part-card-spec";
    specEl.innerText =
      `H ${part.handling} | C ${part.comfort} | E ${part.efficiency} | S ${part.safety}`;

    body.appendChild(nameEl);
    body.appendChild(specEl);

    card.appendChild(thumbWrap);
    card.appendChild(body);

    card.onclick = () => selectPart(category, index);
    card.addEventListener("dragstart", e => {
      e.dataTransfer.setData("category", category);
      e.dataTransfer.setData("index", index);
    });

    div.appendChild(card);
  });

  categoriesDiv.appendChild(div);
});

// =====================
// 프리셋 정의 (새 인덱스 기준)
// =====================
const presets = {
  "off-road": {
    Link: 2,        // Rear 5-link + Coil
    Suspension: 1,  // Rear 5-link + Air
    Brakes: 2,      // Module 3 – Off-road HD
    Steering: 1     // Recirculating Ball + Assist
  },
  "Sport": {
    Link: 1,        // Front SLA
    Suspension: 0,  // Front MacPherson
    Brakes: 1,      // Module 2 – Sport
    Steering: 0     // Rack & Pinion EPS
  },
  "city": {
    Link: 0,        // Front Double Wishbone (예시)
    Suspension: 0,  // Front MacPherson
    Brakes: 0,      // Comfort/City
    Steering: 0     // Rack & Pinion EPS
  }
};

// =====================
// 합계 계산 (Comfort는 게이지에 아직 미사용)
// =====================
function getTotals() {
  let handling = 0;
  let efficiency = 0;
  let safety = 0;
  let totalPrice = 0;

  Object.values(selectedParts).forEach(part => {
    handling += part.handling;
    efficiency += part.efficiency;
    safety += part.safety;
    totalPrice += part.price;
  });

  return { handling, efficiency, safety, totalPrice };
}

function getSummaryText(handling, efficiency, safety) {
  const total = handling + efficiency + safety;
  if (total === 0) {
    return "Select a package to see performance summary.";
  }

  const h = handling / total;
  const e = efficiency / total;
  const s = safety / total;

  if (h >= 0.5 && handling >= 40) {
    return "Aggressive, handling‑focused sport setup.";
  }
  if (s >= 0.5 && safety >= 40) {
    return "Safety‑oriented, stable chassis configuration.";
  }
  if (e >= 0.5 && efficiency >= 30) {
    return "Efficiency‑focused setup for extended driving range.";
  }

  if (h >= s && h >= e) {
    return "Dynamic setup balancing agility and stability.";
  }
  if (s >= h && s >= e) {
    return "Comfortable, confidence‑inspiring daily setup.";
  }
  return "Balanced setup for versatile everyday driving.";
}

function updateChassisSummary(handling, efficiency, safety) {
  const el = document.getElementById("chassis-summary");
  if (!el) return;
  el.textContent = getSummaryText(handling, efficiency, safety);
}

// 샤시 하이라이트
function updateChassisHighlight(handling, safety) {
  const chassis = document.querySelector(".chassis-container");
  if (!chassis) return;

  chassis.classList.toggle("high-handling", handling >= 60);
  chassis.classList.toggle("low-safety", safety <= 30);
}

// 토스트
function showToast(message) {
  const toast = document.getElementById("toast");
  if (!toast) return;

  toast.textContent = message;
  toast.classList.add("show");

  if (toastTimeoutId) {
    clearTimeout(toastTimeoutId);
  }
  toastTimeoutId = setTimeout(() => {
    toast.classList.remove("show");
  }, 2000);
}

// 프리셋 버튼 하이라이트
function updatePresetButtons() {
  const buttons = document.querySelectorAll(".preset-controls button");
  buttons.forEach(btn => {
    const presetName = btn.getAttribute("data-preset");
    btn.classList.toggle("selected", presetName === activePreset);
  });
}

// =====================
// 프리셋 적용 (Undo 한 번에 전체 롤백)
// =====================
function applyPreset(name) {
  const preset = presets[name];
  if (!preset) return;

  const prevTotals = getTotals();
  const prevParts = { ...selectedParts }; // 스냅샷
  historyStack.push({ type: "preset", previousParts: prevParts });

  // 현재 레이어 초기화
  selectedParts = {};
  ["link", "suspension", "brakes", "steering"].forEach(id => {
    const layer = document.getElementById(id + "-part");
    if (layer) layer.classList.remove("show");
  });

  // 새 프리셋 파츠 적용 (히스토리 안 쌓고 바로 세팅)
  Object.entries(preset).forEach(([category, index]) => {
    const part = partsData[category][index];
    selectedParts[category] = part;

    const layer = document.getElementById(category.toLowerCase() + "-part");
    if (layer) {
      layer.src = part.image;
      layer.classList.add("show");
    }
  });

  const nextTotals = getTotals();

  updateDashboard();
  updateSelectionUI();
  updateButtonStates();

  activePreset = name;
  updatePresetButtons();

  const dh = nextTotals.handling - prevTotals.handling;
  const de = nextTotals.efficiency - prevTotals.efficiency;
  const ds = nextTotals.safety - prevTotals.safety;

  const sym = d => (d > 0 ? "+" : d < 0 ? "−" : "·");

  const labelMap = {
    "off-road": "Off-road",
    "Sport": "Sport",
    "city": "City"
  };
  const presetLabel = labelMap[name] || name;

  const msg = `${presetLabel} Package applied (H ${sym(dh)}, E ${sym(de)}, S ${sym(ds)})`;
  showToast(msg);
  playSwapSound();
}

// =====================
// 개별 파트 선택
// =====================
function selectPart(category, index) {
  const part = partsData[category][index];

  const previousPart = selectedParts[category] || null;
  historyStack.push({ type: "part", category, previousPart });

  selectedParts[category] = part;

  const layer = document.getElementById(category.toLowerCase() + "-part");
  if (layer) {
    layer.src = part.image;
    layer.classList.add("show");
  }

  playSwapSound();
  updateDashboard();
  updateSelectionUI();
  updateButtonStates();
}

// =====================
// Undo
// =====================
document.getElementById("undoBtn").addEventListener("click", () => {
  if (historyStack.length === 0) return;

  const last = historyStack.pop();

  if (last.type === "preset") {
    // 프리셋 전체 되돌리기
    selectedParts = { ...last.previousParts };

    ["steering", "suspension", "brakes"].forEach(id => {
      const layer = document.getElementById(id + "-part");
      if (layer) layer.classList.remove("show");
    });

    Object.entries(selectedParts).forEach(([category, part]) => {
      if (!part) return;
      const layer = document.getElementById(category.toLowerCase() + "-part");
      if (layer) {
        layer.src = part.image;
        layer.classList.add("show");
      }
    });

    activePreset = null;
    updatePresetButtons();
  } else if (last.type === "part") {
    const { category, previousPart } = last;
    const layer = document.getElementById(category.toLowerCase() + "-part");

    if (previousPart) {
      selectedParts[category] = previousPart;
      if (layer) {
        layer.src = previousPart.image;
        layer.classList.add("show");
      }
    } else {
      delete selectedParts[category];
      if (layer) layer.classList.remove("show");
    }
  }

  updateDashboard();
  updateSelectionUI();
  updateButtonStates();
});

// =====================
// Reset
// =====================
document.getElementById("resetBtn").addEventListener("click", () => {
  selectedParts = {};
  historyStack = [];
  activePreset = null;

  ["link", "steering", "suspension", "brakes"].forEach(id => {
    const layer = document.getElementById(id + "-part");
    if (layer) layer.classList.remove("show");
  });

  updateDashboard();
  updateSelectionUI();
  updateButtonStates();
  updatePresetButtons();
});

// =====================
// 카드 선택 상태 업데이트
// =====================
function updateButtonStates() {
  document.querySelectorAll(".category").forEach(div => {
    const category = div.querySelector("h3").innerText;
    const cards = div.querySelectorAll(".part-card");
    const selected = selectedParts[category];

    cards.forEach(card => {
      if (selected && card.dataset.partName === selected.name) {
        card.classList.add("selected");
      } else {
        card.classList.remove("selected");
      }
    });
  });
}

// =====================
// 대시보드
// =====================
function updateDashboard() {
  const { handling, efficiency, safety, totalPrice } = getTotals();

  updateChassisHighlight(handling, safety);
  updateChassisSummary(handling, efficiency, safety);

  drawGauge("handlingGauge", handling, "Handling");
  drawGauge("efficiencyGauge", efficiency, "Efficiency");
  drawGauge("safetyGauge", safety, "Safety");

  document.getElementById("total-price").innerText = totalPrice;
}

// =====================
// 선택 표시
// =====================
function updateSelectionUI() {
  const linkSpan = document.getElementById("current-link");
  if (linkSpan) {
    linkSpan.innerText = selectedParts.Link ? selectedParts.Link.name : "None";
  }

  document.getElementById("current-link").innerText =
    selectedParts.Link ? selectedParts.Link.name : "None";

  document.getElementById("current-suspension").innerText =
    selectedParts.Suspension ? selectedParts.Suspension.name : "None";

  document.getElementById("current-suspension").innerText =
    selectedParts.Suspension ? selectedParts.Suspension.name : "None";

  document.getElementById("current-brakes").innerText =
    selectedParts.Brakes ? selectedParts.Brakes.name : "None";
}

// =====================
// 게이지
// =====================
function drawGauge(id, value, label) {
  const canvas = document.getElementById(id);
  const ctx = canvas.getContext("2d");

  ctx.clearRect(0, 0, 200, 200);

  ctx.beginPath();
  ctx.arc(100, 100, 80, Math.PI, 0);
  ctx.strokeStyle = "#333";
  ctx.lineWidth = 15;
  ctx.stroke();

  const angle = Math.PI + (value / 100) * Math.PI;

  ctx.beginPath();
  ctx.moveTo(100, 100);
  ctx.lineTo(
    100 + 70 * Math.cos(angle),
    100 + 70 * Math.sin(angle)
  );
  ctx.strokeStyle = "#388BFF";
  ctx.lineWidth = 4;
  ctx.stroke();

  ctx.fillStyle = "white";
  ctx.font = "16px Arial";
  ctx.textAlign = "center";
  ctx.fillText(value, 100, 120);
  ctx.fillText(label, 100, 150);
}

// =====================
// 사운드
// =====================
function playSwapSound() {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const osc = ctx.createOscillator();
  osc.type = "square";
  osc.frequency.setValueAtTime(600, ctx.currentTime);
  osc.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.1);
}

// =====================
// 초기화
// =====================
updateDashboard();
updateSelectionUI();
updateButtonStates();
updatePresetButtons();

const dropZone = document.getElementById("drop-zone");

dropZone.addEventListener("dragover", (e) => {
  e.preventDefault();
});

dropZone.addEventListener("drop", (e) => {
  e.preventDefault();
  const category = e.dataTransfer.getData("category");
  const index = e.dataTransfer.getData("index");

  if (category && index !== "") {
    selectPart(category, Number(index));
  }
});