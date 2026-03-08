// =====================
// 파트 데이터
// =====================
const partsData = {
  Link: [
    {
      name: "MacPherson strut",
      handling: 22,
      comfort: 22,
      efficiency: 17,
      safety: 18,
      image: "images/link_front_macpherson.png"   // 단독용 이미지
    },
    {
      name: "Front Double Wishbone",
      handling: 28,
      comfort: 15,
      efficiency: 14,
      safety: 18,
      image: "images/link_front_dw.png"
    },
    {
      name: "Front SLA (Short-Long Arm)",
      handling: 30,
      comfort: 14,
      efficiency: 13,
      safety: 19,
      image: "images/link_front_sla.png"
    }
  ],

  Suspension: [
    {
      name: "coil spring",
      handling: 18,
      comfort: 22,
      efficiency: 18,
      safety: 15,
      image: "images/coil.png"
    },
    {
      name: "Air Suspension",
      handling: 24,
      comfort: 28,
      efficiency: 14,
      safety: 20,
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
      image: "images/brake_module1_city.png",
      imageLeft:  "images/brake_module1_city_left.png",
      imageRight: "images/brake_module1_city_right.png"
    },
    {
      name: "Module 2 – Sport",
      handling: 26,
      comfort: 16,
      efficiency: 16,
      safety: 32,
      image: "images/brake_module2_sport.png",
      imageLeft:  "images/brake_module2_sport_left.png",
      imageRight: "images/brake_module2_sport_right.png"
    },
    {
      name: "Module 3 – Off-road HD",
      handling: 18,
      comfort: 18,
      efficiency: 14,
      safety: 34,
      image: "images/brake_module3_offroad.png",
      imageLeft:  "images/brake_module3_offroad_left.png",
      imageRight: "images/brake_module3_offroad_right.png"
    }
  ],

  Steering: [
    {
      name: "Rack & Pinion EPS",
      handling: 26,
      comfort: 22,
      efficiency: 20,
      safety: 18,
      image: "images/steering_rack_eps.png"
    },
    {
      name: "Recirculating Ball + Assist",
      handling: 18,
      comfort: 18,
      efficiency: 15,
      safety: 24,
      image: "images/steering_recirculating_ball.png"
    }
  ]
};

const categoryOrder = ["Link", "Suspension", "Brakes", "Steering"];

let selectedParts = {};
let historyStack = [];
let toastTimeoutId = null;
let activePreset = null;
let summaryHidden = false;

// 🔹 이전 게이지 값 저장
let lastGaugeValues = {
  handling: 0,
  efficiency: 0,
  safety: 0,
  comfort: 0
};

const categoriesDiv = document.getElementById("categories");

// =====================
// 카테고리 UI
// =====================
categoryOrder.forEach(category => {
  const div = document.createElement("div");
  div.className = "category";
  div.dataset.category = category;

  const title = document.createElement("h3");
  // Suspension → Shock Absorbers 로 표시
  if (category === "Suspension") {
    title.innerText = "Shock Absorbers";
  } else {
    title.innerText = category;
  }
  div.appendChild(title);

  partsData[category].forEach((part, index) => {
    const card = document.createElement("div");
    card.className = "part-card";
    card.draggable = true;
    card.dataset.partName = part.name;

    card.title =
      `Handling: ${part.handling} | Comfort: ${part.comfort} | ` +
      `Efficiency: ${part.efficiency} | Safety: ${part.safety}`;

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

      const dragImg = document.createElement("img");
      dragImg.src = part.image;

      const DRAG_SIZE = 640;                // 드래그 썸네일 한 변 길이
  dragImg.style.width = DRAG_SIZE + "px";
  dragImg.style.height = DRAG_SIZE + "px";
  dragImg.style.objectFit = "contain";  // 잘리지 않게 전체 보이기
  dragImg.style.imageRendering = "auto"; // (기본값이지만 명시)
  dragImg.style.position = "absolute";
  dragImg.style.top = "-9999px";
  dragImg.style.left = "-9999px";
  document.body.appendChild(dragImg);

  // 🔹 포인터 위치: 정중앙 근처
  const offsetX = DRAG_SIZE *0.35;
  const offsetY = DRAG_SIZE *0.55;
  /*
      dragImg.style.width = "400px";
      dragImg.style.height = "400px";
      dragImg.style.objectFit = "contain";
      dragImg.style.position = "absolute";
      dragImg.style.top = "-9999px";
      dragImg.style.left = "-9999px";
      document.body.appendChild(dragImg);

      const DRAG_SIZE = 240;
      const offsetX = DRAG_SIZE * 0.55;
      const offsetY = DRAG_SIZE * 0.80;
*/
      e.dataTransfer.setDragImage(dragImg, offsetX, offsetY);

      card.addEventListener("dragend", () => {
        dragImg.remove();
      }, { once: true });
    });

    div.appendChild(card);
  });

  categoriesDiv.appendChild(div);
});

// =====================
// 프리셋
// =====================
const presets = {
  "city": {
    Link: 0,
    Suspension: 0,
    Brakes: 0,
    Steering: 0
  },
  "Sport": {
    Link: 2,
    Suspension: 0,
    Brakes: 1,
    Steering: 0
  },
  "off-road": {
    Link: 1,
    Suspension: 1,
    Brakes: 2,
    Steering: 1
  }
};

// =====================
// 합계 계산
// =====================
function getTotals() {
  let handling = 0;
  let efficiency = 0;
  let safety = 0;
  let comfort = 0;

  Object.values(selectedParts).forEach(part => {
    handling   += part.handling   || 0;
    efficiency += part.efficiency || 0;
    safety     += part.safety     || 0;
    comfort    += part.comfort    || 0;
  });

  return { handling, efficiency, safety, comfort };
}

// =====================
// 샤시 코너 이미지 업데이트 (맥퍼슨 조합 포함)
// =====================
function updateCornerLayers() {
  const link  = selectedParts.Link  || null;
  const susp  = selectedParts.Suspension || null;
  const brake = selectedParts.Brakes || null;
  const steer = selectedParts.Steering || null;

  const linkLayer   = document.getElementById("link-part");
  const suspLayer   = document.getElementById("suspension-part");
  const brakeLeft   = document.getElementById("brakes-left-part");
  const brakeRight  = document.getElementById("brakes-right-part");
  const steerLayer  = document.getElementById("steering-part");

  if (!linkLayer || !suspLayer || !brakeLeft || !brakeRight || !steerLayer) return;

  [linkLayer, suspLayer, brakeLeft, brakeRight, steerLayer].forEach(el => {
    el.classList.remove("show");
  });

  // 스티어링
  if (steer) {
    steerLayer.src = steer.image;
    steerLayer.classList.add("show");
  }

  // 브레이크 좌/우
  if (brake) {
    if (brake.imageLeft) {
      brakeLeft.src = brake.imageLeft;
      brakeLeft.classList.add("show");
    }
    if (brake.imageRight) {
      brakeRight.src = brake.imageRight;
      brakeRight.classList.add("show");
    }
  }

  // MacPherson + Suspension 조합
  if (link && link.name === "MacPherson strut") {
    if (!susp) {
      linkLayer.src = "images/link_front_macpherson.png";
      linkLayer.classList.add("show");
    } else if (susp.name === "coil spring") {
      linkLayer.src = "images/macpherson_coil.png";
      linkLayer.classList.add("show");
    } else if (susp.name === "Air Suspension") {
      linkLayer.src = "images/macpherson_air.png";
      linkLayer.classList.add("show");
    } else {
      linkLayer.src = "images/link_front_macpherson.png";
      linkLayer.classList.add("show");
      suspLayer.src = susp.image;
      suspLayer.classList.add("show");
    }
    return;
  }

  // 나머지 링크 타입 (DW, SLA 등)
  if (link) {
    linkLayer.src = link.image;
    linkLayer.classList.add("show");
  }
  if (susp) {
    suspLayer.src = susp.image;
    suspLayer.classList.add("show");
  }
}

// =====================
// 요약 텍스트 (선택 전만 표시)
// =====================
function updateChassisSummary() {
  const el = document.getElementById("chassis-summary");
  if (!el) return;

  if (summaryHidden) {
    // 🔹 선택 이후엔 배지 전체를 숨김
    el.style.display = "none";
  } else {
    // 초기 상태: 배지 보이고 텍스트 표시
    el.style.display = "block";
    el.textContent = "Select chassis parts";
  }
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

  if (toastTimeoutId) clearTimeout(toastTimeoutId);
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
// 프리셋 적용
// =====================
function applyPreset(name) {
  const preset = presets[name];
  if (!preset) return;

  const prevTotals = getTotals();
  const prevParts = { ...selectedParts };
  historyStack.push({ type: "preset", previousParts: prevParts });

  selectedParts = {};
  Object.entries(preset).forEach(([category, index]) => {
    selectedParts[category] = partsData[category][index];
  });

  const nextTotals = getTotals();

  summaryHidden = true;
  updateCornerLayers();
  updateDashboard();
  updateButtonStates();

  activePreset = name;
  updatePresetButtons();

  const dh = nextTotals.handling - prevTotals.handling;
  const de = nextTotals.efficiency - prevTotals.efficiency;
  const ds = nextTotals.safety - prevTotals.safety;
  const dc = nextTotals.comfort - prevTotals.comfort;

  /*
  const sym = d => (d > 0 ? "+" : d < 0 ? "−" : "·");
  const labelMap = { "off-road": "Off-road", "Sport": "Sport", "city": "City" };
  const presetLabel = labelMap[name] || name;

  const msg = `${presetLabel} Package applied (H ${sym(dh)}, E ${sym(de)}, S ${sym(ds)}, C ${sym(dc)})`;
  showToast(msg);
*/
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

  summaryHidden = true;
  updateCornerLayers();
  playSwapSound();
  updateDashboard();
  updateButtonStates();
}

// =====================
// Undo
// =====================
document.getElementById("undoBtn").addEventListener("click", () => {
  if (historyStack.length === 0) return;

  const last = historyStack.pop();

  if (last.type === "preset") {
    selectedParts = { ...last.previousParts };
    activePreset = null;
    updatePresetButtons();
  } else if (last.type === "part") {
    const { category, previousPart } = last;
    if (previousPart) {
      selectedParts[category] = previousPart;
    } else {
      delete selectedParts[category];
    }
  }

  if (Object.keys(selectedParts).length === 0) {
    summaryHidden = false;
  }

  updateCornerLayers();
  updateDashboard();
  updateButtonStates();
});

// =====================
// Reset
// =====================
document.getElementById("resetBtn").addEventListener("click", () => {
  selectedParts = {};
  historyStack = [];
  activePreset = null;

  summaryHidden = false;
  
    lastGaugeValues = {
    handling: 0,
    efficiency: 0,
    safety: 0,
    comfort: 0
  };

  updateCornerLayers();
  updateDashboard();
  updateButtonStates();
  updatePresetButtons();
});

// =====================
// 카드 선택 상태 업데이트
// =====================
function updateButtonStates() {
  document.querySelectorAll(".category").forEach(div => {
    const category = div.dataset.category;
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
// 게이지 애니메이션 + Δ 표시
// =====================
function animateGauge(id, from, to, label, duration = 400) {
  const canvas = document.getElementById(id);
  const ctx = canvas.getContext("2d");
  const start = performance.now();
  const diff = to - from;

  function frame(now) {
    const t = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - t, 3); // ease-out
    const current = from + diff * eased;

    ctx.clearRect(0, 0, 200, 200);

    // 배경 아크
    ctx.beginPath();
    ctx.arc(100, 100, 80, Math.PI, 0);
    ctx.strokeStyle = "#333";
    ctx.lineWidth = 15;
    ctx.stroke();

    // 바늘
    const angle = Math.PI + (current / 100) * Math.PI;
    ctx.beginPath();
    ctx.moveTo(100, 100);
    ctx.lineTo(
      100 + 70 * Math.cos(angle),
      100 + 70 * Math.sin(angle)
    );

    // 🔹 바늘 색/글로우: +면 파란색 글로우, -면 빨간색, 0이면 기본 파랑
    if (diff > 0) {
      ctx.strokeStyle = "#4ea1ff"; // 파랑
      ctx.shadowColor = "rgba(78, 161, 255, 0.9)";
      ctx.shadowBlur = 14;
    } else if (diff < 0) {
      ctx.strokeStyle = "#ff6b6b"; // 빨강
      ctx.shadowColor = "rgba(255, 107, 107, 0.8)";
      ctx.shadowBlur = 8;
    } else {
      ctx.strokeStyle = "#388BFF"; // 변화 없음
      ctx.shadowColor = "transparent";
      ctx.shadowBlur = 0;
    }

    ctx.lineWidth = 4;
    ctx.stroke();

    // 글로우 리셋
    ctx.shadowBlur = 0;
    ctx.shadowColor = "transparent";

    // 값 + 라벨
    ctx.fillStyle = "white";
    ctx.font = "16px Arial";
    ctx.textAlign = "center";
    ctx.fillText(Math.round(current), 100, 120);
    ctx.fillText(label, 100, 150);

    // 🔹 Δ값: 더 크게, 굵게
    if (diff !== 0) {
      ctx.font = "bold 13px Arial";
      ctx.fillStyle = diff > 0 ? "#8cff9a" : "#ff8c8c";
      const sign = diff > 0 ? "+" : "−";
      ctx.fillText(`${sign}${Math.abs(diff)}`, 100, 95);
    }

    if (t < 1) {
      requestAnimationFrame(frame);
    }
  }

  requestAnimationFrame(frame);
}

// =====================
// 대시보드
// =====================
function updateDashboard() {
  const prev = { ...lastGaugeValues };
  const { handling, efficiency, safety, comfort } = getTotals();

  updateChassisHighlight(handling, safety);
  updateChassisSummary();

  animateGauge("handlingGauge",   prev.handling,   handling,   "Handling");
  animateGauge("efficiencyGauge", prev.efficiency, efficiency, "Efficiency");
  animateGauge("safetyGauge",     prev.safety,     safety,     "Safety");
  animateGauge("comfortGauge",    prev.comfort,    comfort,    "Comfort");

  lastGaugeValues = { handling, efficiency, safety, comfort };
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
lastGaugeValues = {
  handling: 0,
  efficiency: 0,
  safety: 0,
  comfort: 0
};

updateCornerLayers();
updateDashboard();
updateButtonStates();
updatePresetButtons();

const dropZone = document.getElementById("drop-zone");
dropZone.addEventListener("dragover", e => e.preventDefault());
dropZone.addEventListener("drop", e => {
  e.preventDefault();
  const category = e.dataTransfer.getData("category");
  const index = e.dataTransfer.getData("index");
  if (category && index !== "") {
    selectPart(category, Number(index));
  }
});