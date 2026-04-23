const API_BASE = "http://localhost:4000/api";

const statGrid = document.getElementById("statGrid");
const slidesTrack = document.getElementById("slidesTrack");
const prevSlide = document.getElementById("prevSlide");
const nextSlide = document.getElementById("nextSlide");
const fileInput = document.getElementById("fileInput");
const fileList = document.getElementById("fileList");

async function loadDashboardStats() {
  try {
    const response = await fetch(`${API_BASE}/industry/dashboard`);
    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }

    const payload = await response.json();
    const totals = payload?.data?.totals ?? {};

    const labels = [
      ["Productions", totals.productions ?? 0],
      ["Shoot Days", totals.shoot_days ?? 0],
      ["Call Sheets", totals.call_sheets ?? 0],
      ["Script Sides", totals.script_sides ?? 0],
      ["Character Makeup", totals.character_makeup ?? 0],
      ["Continuity Photos", totals.continuity_photos ?? 0],
    ];

    statGrid.innerHTML = labels
      .map(
        ([label, value]) => `
          <article class="stat-card">
            <p class="stat-label">${label}</p>
            <p class="stat-value">${value}</p>
          </article>
        `
      )
      .join("");
  } catch (_error) {
    statGrid.innerHTML = `
      <article class="stat-card" style="grid-column: 1 / -1;">
        <p class="stat-label">Status</p>
        <p class="stat-value" style="font-size:1rem; line-height:1.4;">
          Dashboard API not reachable yet. Start backend with:<br />
          <strong>PYTHONPATH=. uvicorn src.server:app --reload --port 4000</strong>
        </p>
      </article>
    `;
  }
}

let currentSlide = 0;
const totalSlides = slidesTrack.children.length;

function renderSlide() {
  const offset = currentSlide * -100;
  slidesTrack.style.transform = `translateX(${offset}%)`;
}

function goToNextSlide() {
  currentSlide = (currentSlide + 1) % totalSlides;
  renderSlide();
}

function goToPreviousSlide() {
  currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
  renderSlide();
}

prevSlide.addEventListener("click", goToPreviousSlide);
nextSlide.addEventListener("click", goToNextSlide);

setInterval(goToNextSlide, 4200);

fileInput.addEventListener("change", () => {
  fileList.innerHTML = "";

  const files = Array.from(fileInput.files || []);
  if (!files.length) {
    return;
  }

  files.forEach((file) => {
    const item = document.createElement("li");
    const kb = Math.max(1, Math.round(file.size / 1024));
    item.textContent = `${file.name} (${kb} KB)`;
    fileList.appendChild(item);
  });
});

loadDashboardStats();
renderSlide();
