const partsData = {
  Steering: [
    { name: "Basic Steering", handling: 20, efficiency: 5, safety: 10, price: 1000, image: "images/steering.svg" },
    { name: "Sport Steering", handling: 30, efficiency: 3, safety: 12, price: 2000, image: "images/steering.svg" },
    { name: "Premium Steering", handling: 35, efficiency: 4, safety: 15, price: 3000, image: "images/steering.svg" }
  ],
  Suspension: [
    { name: "Standard Suspension", handling: 15, efficiency: 5, safety: 10, price: 1500, image: "images/suspension.svg" },
    { name: "Sport Suspension", handling: 25, efficiency: 4, safety: 12, price: 2500, image: "images/suspension.svg" },
    { name: "Air Suspension", handling: 20, efficiency: 8, safety: 15, price: 3500, image: "images/suspension.svg" }
  ],
  Brakes: [
    { name: "ABS Brakes", handling: 5, efficiency: 2, safety: 20, price: 1000, image: "images/brakes.svg" },
    { name: "Sport Brakes", handling: 10, efficiency: 3, safety: 25, price: 2000, image: "images/brakes.svg" },
    { name: "Carbon Brakes", handling: 15, efficiency: 4, safety: 30, price: 4000, image: "images/brakes.svg" }
  ]
};

let selectedParts = {};
let historyStack = [];

const categoriesDiv = document.getElementById("categories");

// 카테고리 UI 생성
Object.keys(partsData).forEach(category => {
  const div = document.createElement("div");
  div.className = "category";

  const title = document.createElement("h3");
  title.innerText = category;
  div.appendChild(title);

  partsData[category].forEach((part, index) => {

    const btn = document.createElement("button");
    btn.innerText = part.name;

    // 클릭 선택
    btn.onclick = () => selectPart(category, index);

    // 드래그 허용
    btn.draggable = true;

    btn.addEventListener("dragstart", e => {

      // 이미 선택된 카테고리면 드래그 차단
      if (selectedParts[category]) {
        e.preventDefault();
        return;
      }

      e.dataTransfer.setData("category", category);
      e.dataTransfer.setData("index", index);
    });

    div.appendChild(btn);
  });

  categoriesDiv.appendChild(div);
});

// =====================
// 선택
// =====================
function selectPart(category, index) {

  // 이미 선택된 경우 → 아무것도 안 함
  if (selectedParts[category]) return;

  const part = partsData[category][index];

  historyStack.push({ category });

  selectedParts[category] = part;

  const layer = document.getElementById(category.toLowerCase() + "-part");
  layer.src = part.image;
  layer.classList.add("show");

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

  delete selectedParts[last.category];

  const layer = document.getElementById(last.category.toLowerCase() + "-part");
  layer.classList.remove("show");

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

  ["steering","suspension","brakes"].forEach(id=>{
    document.getElementById(id + "-part").classList.remove("show");
  });

  updateDashboard();
  updateSelectionUI();
  updateButtonStates();
});

// =====================
// 버튼 상태 업데이트
// =====================
function updateButtonStates() {

  document.querySelectorAll(".category").forEach(div => {

    const category = div.querySelector("h3").innerText;
    const buttons = div.querySelectorAll("button");

    if (selectedParts[category]) {
      buttons.forEach(btn => {
        btn.classList.add("disabled");
        // ❌ btn.disabled = true; 제거
      });
    } else {
      buttons.forEach(btn => {
        btn.classList.remove("disabled");
        // ❌ btn.disabled = false; 제거
      });
    }

  });
}

// =====================
// 대시보드 (항상 재계산)
// =====================
function updateDashboard() {

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

  drawGauge("handlingGauge", handling, "Handling");
  drawGauge("efficiencyGauge", efficiency, "Efficiency");
  drawGauge("safetyGauge", safety, "Safety");

  document.getElementById("total-price").innerText = totalPrice;
}

// =====================
// 선택 표시
// =====================
function updateSelectionUI() {

  document.getElementById("current-steering").innerText =
    selectedParts.Steering ? selectedParts.Steering.name : "None";

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

  ctx.clearRect(0,0,200,200);

  ctx.beginPath();
  ctx.arc(100,100,80,Math.PI,0);
  ctx.strokeStyle="#333";
  ctx.lineWidth=15;
  ctx.stroke();

  const angle = Math.PI + (value/100)*Math.PI;

  ctx.beginPath();
  ctx.moveTo(100,100);
  ctx.lineTo(
    100 + 70*Math.cos(angle),
    100 + 70*Math.sin(angle)
  );
  ctx.strokeStyle="red";
  ctx.lineWidth=4;
  ctx.stroke();

  ctx.fillStyle="white";
  ctx.font="16px Arial";
  ctx.textAlign="center";
  ctx.fillText(value,100,120);
  ctx.fillText(label,100,150);
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

updateDashboard();
updateSelectionUI();
updateButtonStates();