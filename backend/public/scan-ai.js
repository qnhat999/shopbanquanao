let model;
let isScanning = false;

const video = document.getElementById("video");
const resultText = document.getElementById("ai-result");
const scanBtn = document.getElementById("scan-btn");

// =====================
// 1️⃣ MỞ CAMERA
// =====================
async function startCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "environment" }
    });
    video.srcObject = stream;
  } catch (err) {
    alert("❌ Không thể mở camera");
  }
}

// =====================
// 2️⃣ LOAD MODEL
// =====================
async function loadModel() {
  model = await mobilenet.load();
  console.log("✅ MobileNet loaded");
  resultText.innerText = "📷 Camera sẵn sàng, bấm Scan";
}



// =====================
// 4️⃣ SCAN TRANG PHỤC
// =====================
async function scanClothes() {
  if (!model || isScanning) return;

  isScanning = true;
  scanBtn.disabled = true;
  resultText.innerText = "🤖 Đang phân tích...";

  const predictions = await model.classify(video);

  if (!predictions || predictions.length === 0) {
    resultText.innerText = "❌ Không nhận diện được";
    resetScan();
    return;
  }

  const top = predictions[0];
  console.log("🤖 RAW:", top.className, top.probability);

  // Kiểm tra độ tin cậy
 if (top.probability < 0.15) {
  resultText.innerText = "❌ Không nhận diện được rõ";
  resetScan();
  return;
}

if (top.probability < 0.3) {
  resultText.innerText = "⚠️ Độ tin cậy thấp, đang tìm sản phẩm gần đúng...";
}


  // Chuẩn hóa label
  const label = top.className;

resultText.innerText = `
🤖 AI nhận diện:
${label}
Độ tin cậy: ${(top.probability * 100).toFixed(1)}%
`;


  // GỬI LABEL VỀ BACKEND
  try {
    const res = await fetch("/api/scan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label })
    });

    const data = await res.json();
    showProducts(data);
  } catch (err) {
    resultText.innerText = "❌ Lỗi kết nối server";
  }

  resetScan();
}

// =====================
// 5️⃣ HIỂN THỊ SẢN PHẨM
// =====================
function showProducts(data) {
  const grid = document.getElementById("ai-products");
  grid.innerHTML = "";

  if (!data.products || data.products.length === 0) {
    resultText.innerText = `
🤖 AI nhận diện:
${data.label}

⚠️ Hiện shop chưa có sản phẩm phù hợp
`;
    return;
  }

  resultText.innerText = `
🤖 AI nhận diện:
${data.label}

✅ Tìm thấy ${data.products.length} sản phẩm
`;

  data.products.forEach(p => {
    grid.innerHTML += `
      <div class="ai-product">
        <img src="/images/${p.image}" alt="${p.name}">
        <h4>${p.name}</h4>
        <p>${p.price.toLocaleString()} đ</p>
        <button onclick="addToCart('${p._id}')">🛒 Thêm giỏ hàng</button>
      </div>
    `;
  });
}


// =====================
// RESET SCAN
// =====================
function resetScan() {
  isScanning = false;
  scanBtn.disabled = false;
}

// =====================
// AUTO LOAD
// =====================
startCamera();
loadModel();
