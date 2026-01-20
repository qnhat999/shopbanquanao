let model;
const video = document.getElementById("video");
const resultText = document.getElementById("ai-result");

// 1️⃣ MỞ CAMERA
async function startCamera() {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: true
  });
  video.srcObject = stream;
}

// 2️⃣ LOAD MODEL
async function loadModel() {
  model = await mobilenet.load();
  console.log("✅ MobileNet loaded");
}

// 3️⃣ SCAN TRANG PHỤC
async function scanClothes() {
  if (!model) {
    alert("Model chưa sẵn sàng");
    return;
  }

  const predictions = await model.classify(video);

  if (predictions.length === 0) {
    resultText.innerText = "❌ Không nhận diện được";
    return;
  }

  const topResult = predictions[0];
  const label = topResult.className.toLowerCase();

  resultText.innerText = `🤖 Nhận diện: ${label}`;

  // GỬI LABEL VỀ BACKEND
  fetch("/api/scan", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ label })
  })
    .then(res => res.json())
    .then(data => {
      showProducts(data);
    });
}

// 4️⃣ HIỂN THỊ SẢN PHẨM GỢI Ý
function showProducts(data) {
  if (!data.products || data.products.length === 0) {
    alert("Không có sản phẩm phù hợp");
    return;
  }

  const grid = document.getElementById("recommend-grid");
  grid.innerHTML = "";

  data.products.forEach(p => {
    grid.innerHTML += `
      <div class="product-card">
        <img src="${p.image}">
        <h4>${p.name}</h4>
        <p>${p.price.toLocaleString()} đ</p>
        <button onclick="addToCart('${p._id}')">Thêm giỏ hàng</button>
      </div>
    `;
  });

  document.getElementById("recommend-section").style.display = "block";
}

// AUTO LOAD
startCamera();
loadModel();
