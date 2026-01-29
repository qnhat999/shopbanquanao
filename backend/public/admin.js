/* ================== ANALYTICS ELEMENT ================== */

const totalViews = document.getElementById("totalViews");
const avgViewTime = document.getElementById("avgViewTime");
const repeatOnce = document.getElementById("visitOnce");
const repeatUser = document.getElementById("visitRepeat");

const PRODUCT_API = "/api/admin/products";
const ORDER_API = "/api/admin/orders";
const ANALYTICS_API = "/api/admin/analytics";

/* ================== ELEMENT ================== */
const productForm = document.getElementById("productForm");

const productId = document.getElementById("productId");
const nameInput = document.getElementById("name");
const priceInput = document.getElementById("price");
const oldPriceInput = document.getElementById("oldPrice");
const imageInput = document.getElementById("image");
const stockInput = document.getElementById("stock");
const ratingInput = document.getElementById("rating");
const typeInput = document.getElementById("type");
const categoryInput = document.getElementById("category");
const descriptionInput = document.getElementById("description");

const productList = document.getElementById("productList");
const orderList = document.getElementById("orderList");

/* KPI */
const totalOrders = document.getElementById("totalOrders");
const totalRevenue = document.getElementById("totalRevenue");
const totalProducts = document.getElementById("totalProducts");
const positiveCount = document.getElementById("positiveCount");
const negativeCount = document.getElementById("negativeCount");

/* CHART */
let sentimentChart = null;

/* ================== INIT ================== */
document.addEventListener("DOMContentLoaded", async () => {
  await checkAdmin();
  await loadProducts();
  await loadOrders();
  await loadAnalytics();

  productForm.addEventListener("submit", submitProduct);
});

/* ================== CHECK ADMIN ================== */
async function checkAdmin() {
  const res = await fetch("/api/admin/check");
  if (!res.ok) {
    alert("Bạn chưa đăng nhập admin!");
    location.href = "/adlogin.html";
  }
}

/* ================== LOAD PRODUCTS ================== */
async function loadProducts() {
  const res = await fetch(PRODUCT_API);
  const products = await res.json();

  productList.innerHTML = products.map(p => `
    <tr>
      <td>${p.name}</td>
      <td>${Number(p.price).toLocaleString()} đ</td>
      <td>${p.type}</td>
      <td>${p.category}</td>
      <td><img src="${p.image}" width="60"></td>
      <td>
        <button class="btn btn-warning btn-sm edit-btn"
          data-product='${JSON.stringify(p)}'>Sửa</button>
        <button class="btn btn-danger btn-sm"
          onclick="deleteProduct('${p._id}')">Xóa</button>
      </td>
    </tr>
  `).join("");

  document.querySelectorAll(".edit-btn").forEach(btn => {
    btn.onclick = () => fillForm(JSON.parse(btn.dataset.product));
  });
}

/* ================== FILL FORM ================== */
function fillForm(p) {
  productId.value = p._id;
  nameInput.value = p.name;
  priceInput.value = p.price;
  oldPriceInput.value = p.oldPrice || "";
  imageInput.value = p.image;
  stockInput.value = p.stock || "";
  ratingInput.value = p.rating || "";
  typeInput.value = p.type;
  categoryInput.value = p.category;
  descriptionInput.value = p.description || "";
}

/* ================== SUBMIT PRODUCT ================== */
async function submitProduct(e) {
  e.preventDefault();

  const id = productId.value;

  const body = {
    name: nameInput.value,
    price: priceInput.value,
    oldPrice: oldPriceInput.value,
    image: imageInput.value,
    stock: stockInput.value,
    rating: ratingInput.value,
    type: typeInput.value,
    category: categoryInput.value,
    description: descriptionInput.value
  };

  const method = id ? "PUT" : "POST";
  const url = id ? `${PRODUCT_API}/${id}` : PRODUCT_API;

  await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  productForm.reset();
  productId.value = "";
  loadProducts();
}

/* ================== DELETE PRODUCT ================== */
async function deleteProduct(id) {
  if (!confirm("Xóa sản phẩm này?")) return;
  await fetch(`${PRODUCT_API}/${id}`, { method: "DELETE" });
  loadProducts();
}

/* ================== LOAD ORDERS ================== */
async function loadOrders() {
  const res = await fetch(ORDER_API);
  const orders = await res.json();

  orderList.innerHTML = orders.map(o => `
    <tr>
      <td>${o.userName}</td>
      <td>${o.userPhone}</td>
      <td>${o.name}</td>
      <td>${o.quantity}</td>
      <td>${Number(o.price * o.quantity).toLocaleString()} đ</td>
      <td>${new Date(o.createdAt).toLocaleString()}</td>
      <td>${o.address || "—"}</td>
      <td>${o.note || "—"}</td>
    </tr>
  `).join("");
}

/* ================== LOAD ANALYTICS ================== */
async function loadAnalytics() {
  const res = await fetch(ANALYTICS_API);
  const data = await res.json();

  totalProducts.innerText = data.totalProducts;
  totalOrders.innerText = data.totalOrders;
  totalRevenue.innerText =
    data.totalRevenue.toLocaleString("vi-VN") + " đ";

  /* ====== TOTAL VIEWS ====== */
  if (totalViews) {
    totalViews.innerText = data.totalViews || 0;
  }

  /* ====== AVG VIEW TIME ====== */
  if (avgViewTime && Array.isArray(data.avgTime) && data.avgTime.length > 0) {
    const avg =
      data.avgTime.reduce((s, i) => s + i.avgTime, 0) /
      data.avgTime.length;
    avgViewTime.innerText = avg.toFixed(1) + "s";
  } else if (avgViewTime) {
    avgViewTime.innerText = "0s";
  }

  
 /* ====== VIEW BEHAVIOR ====== */
if (data.viewBehavior) {
  repeatOnce.innerText = data.viewBehavior.quick || 0;
  repeatUser.innerText =
    (data.viewBehavior.normal || 0) +
    (data.viewBehavior.deep || 0);
} else {
  repeatOnce.innerText = 0;
  repeatUser.innerText = 0;
}


  /* ====== SENTIMENT ====== */
  positiveCount.innerText = 0;
  negativeCount.innerText = 0;

  if (Array.isArray(data.sentiment)) {
    data.sentiment.forEach(s => {
      if (s._id === "positive") positiveCount.innerText = s.count;
      if (s._id === "negative") negativeCount.innerText = s.count;
    });
  }

  /* ====== CHART ====== */
  const canvas = document.getElementById("sentimentChart");
  if (!canvas) return;

  if (sentimentChart) sentimentChart.destroy();

  sentimentChart = new Chart(canvas, {
    type: "pie",
    data: {
      labels: ["Positive", "Negative"],
      datasets: [{
        data: [
          Number(positiveCount.innerText),
          Number(negativeCount.innerText)
        ]
      }]
    }
  });
  /* ====== TIME VIEW CHART ====== */
const timeCanvas = document.getElementById("timeChart");

if (timeCanvas && Array.isArray(data.avgTime)) {
  const labels = data.avgTime.map(i => i.product.name);
  const values = data.avgTime.map(i => i.avgTime);

  new Chart(timeCanvas, {
    type: "bar",
    data: {
      labels,
      datasets: [{
        label: "Thời gian xem (giây)",
        data: values
      }]
    }
  });
}

}


  
