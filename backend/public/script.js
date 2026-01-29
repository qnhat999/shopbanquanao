// 🔥 Tự động lấy domain + port (local hay deploy đều chạy)
const BASE_URL = window.location.origin;

const API_URL = `${BASE_URL}/api/products`;
const ORDER_API = `${BASE_URL}/api/orders`;

// ================= DETECT PAGE =================
const path = window.location.pathname;
let type = '';

if (path.includes('moi.html')) type = 'new';
else if (path.includes('banchay.html')) type = 'best';
else if (path.includes('thoitrang.html')) type = 'fashion';
else if (path.includes('khuyenmai.html')) type = 'sale';

if (type) loadProducts();
if (path.includes('cart.html')) loadCart();
if (path.includes('login.html')) setupLogin();

if (path === '/' || path.includes('index.html')) {
  loadTypeProducts('new', 'products-new');
  loadTypeProducts('best', 'products-best');
  loadTypeProducts('sale', 'products-sale');
}

// ================= RENDER STAR (⭐ ĐỘNG) =================
function renderStars(rating = 0) {
  rating = Number(rating) || 0;
  rating = Math.max(0, Math.min(5, rating));

  let html = '';
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  const empty = 5 - full - (half ? 1 : 0);

  for (let i = 0; i < full; i++) {
    html += '<i class="fas fa-star"></i>';
  }
  if (half) {
    html += '<i class="fas fa-star-half-alt"></i>';
  }
  for (let i = 0; i < empty; i++) {
    html += '<i class="far fa-star"></i>';
  }
  return html;
}



// ================= SEARCH =================
async function searchProducts() {
  const query = document.getElementById('searchInput').value.trim();
  if (!query) return;

  try {
    const res = await fetch(`${API_URL}/search?q=${encodeURIComponent(query)}`);
    const data = await res.json();
    if (!res.ok) throw new Error("Fetch failed");


    const resultSection = document.getElementById('search-results');
    resultSection.style.display = 'block';

    renderProductsTo(data, 'search-grid');
    if (data.length === 0) {
  document.getElementById('search-grid').innerHTML = '<p>Không tìm thấy sản phẩm</p>';
  return;
}


    // 🔥🔥 TỰ ĐỘNG CUỘN XUỐNG KẾT QUẢ
    resultSection.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });

  } catch (err) {
    console.error('Lỗi tìm kiếm:', err);
  }
}


// ================= LOAD PRODUCTS =================
async function loadProducts() {
  try {
    const res = await fetch(`${API_URL}?type=${type}`);
    const data = await res.json();
    renderProducts(data);
  } catch (err) {
    console.error('Lỗi tải sản phẩm:', err);
  }
}

function renderProducts(products) {
  const grid = document.querySelector('.product-grid');
  if (!grid) return;
  grid.innerHTML = '';
  products.forEach(p => grid.appendChild(createProductCard(p)));
}

// ================= PRODUCT CARD =================
function createProductCard(p) {
  console.log('PRODUCT:', p);
  console.log('RATING:', p.rating);
  const card = document.createElement('div');
  card.className = 'product-card';
  card.dataset.id = p._id;

  if (p.oldPrice) {
    const badge = document.createElement('div');
    badge.className = 'discount-badge';
    badge.innerText = 'GIẢM GIÁ';
    card.appendChild(badge);
  }

  const img = document.createElement('img');
img.src = `/images/${p.image}`;
img.className = 'zoom-hover';
card.appendChild(img);

card.innerHTML += `
  <p>${p.name}</p>
  <p class="price">
    ${
      p.oldPrice
        ? `<span class="discounted-price">${p.price.toLocaleString()} VND</span>
           <span class="original-price">${p.oldPrice.toLocaleString()} VND</span>`
        : `${p.price.toLocaleString()} VND`
    }
  </p>

  <div class="product-rating">
    ${renderStars(Number(p.rating) || 0)}
  </div>
`;


  const btn = document.createElement('button');
  btn.innerText = '🛒 Thêm giỏ hàng';
  btn.onclick = () => addToCart(p);
  card.appendChild(btn);

  return card;
}

// ================= LOAD BY TYPE (INDEX) =================
async function loadTypeProducts(type, containerId) {
  try {
    const res = await fetch(`${API_URL}?type=${type}&limit=4`);
    const data = await res.json();
    renderProductsTo(data, containerId);
  } catch (err) {
    console.error(err);
  }
}

function renderProductsTo(products, id) {
  const grid = document.getElementById(id);
  if (!grid) return;
  grid.innerHTML = '';
  products.forEach(p => grid.appendChild(createProductCard(p)));
}

// ================= CART =================
async function addToCart(product) {
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user) {
    alert("Bạn chưa đăng nhập");
    return;
  }

  try {
    const res = await fetch(ORDER_API, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId: product._id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: 1,
        userName: user.userName,
        userPhone: user.userPhone
      })
    });

    const data = await res.json();
    alert("🛒 Đã thêm vào giỏ hàng");
  } catch (err) {
    console.error(err);
    alert("Lỗi khi thêm giỏ hàng");
  }
}


async function loadCart() {
  const container = document.querySelector(".cart-items");
  const totalEl = document.getElementById("total-amount");

  if (!container || !totalEl) return;

  const user = JSON.parse(localStorage.getItem("user"));

  if (!user) {
    container.innerHTML = '<p>❗ Bạn chưa đăng nhập.</p>';
    totalEl.innerText = '0 VND';
    return;
  }

  const { userName, userPhone } = user;

  try {
    const res = await fetch(
      `/api/orders?name=${encodeURIComponent(userName)}&phone=${encodeURIComponent(userPhone)}`
    );

    if (!res.ok) {
      throw new Error("Không tải được giỏ hàng");
    }

    const data = await res.json();

    container.innerHTML = '';
    let total = 0;

    data.forEach(item => {
      total += item.price * item.quantity;

      container.innerHTML += `
        <div class="cart-item">
          <div class="cart-img-box">
            <img src="/images/${item.image}">
          </div>

          <div class="cart-item-info">
            <h5>${item.name}</h5>

            <p>
              <button onclick="changeQuantity('${item._id}', ${item.quantity - 1})">-</button>
              <span class="mx-2">${item.quantity}</span>
              <button onclick="changeQuantity('${item._id}', ${item.quantity + 1})">+</button>
            </p>

            <div class="cart-item-price">
              ${item.price.toLocaleString()} VND
            </div>
          </div>

          <button class="btn btn-sm btn-outline-danger"
            onclick="removeItem('${item._id}')">
            🗑️
          </button>
        </div>
      `;
    });

    totalEl.innerText = total.toLocaleString() + ' VND';
  } catch (err) {
    console.error(err);
    container.innerHTML = '<p>❌ Lỗi tải giỏ hàng</p>';
    totalEl.innerText = '0 VND';
  }
}


// ================= LOGIN =================
function setupLogin() {
  const form = document.querySelector('form');
  if (!form) return;

  form.onsubmit = e => {
    e.preventDefault();

    const user = {
      userName: form.name.value.trim(),
      userPhone: form.phone.value.trim()
    };

    localStorage.setItem("user", JSON.stringify(user));

    alert("✅ Đăng nhập thành công!");
    window.location.href = "index.html";
  };
}

// ================= SEARCH ENTER =================
document.addEventListener("DOMContentLoaded", function () {
  const searchInput = document.getElementById("searchInput");

  if (searchInput) {
    searchInput.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        e.preventDefault();
        console.log("✅ Enter search:", searchInput.value);
        searchProducts();
      }
    });
  }
});
// ===== ZOOM ẢNH SẢN PHẨM (FIX CHUẨN) =====
// ===== ZOOM ẢNH SẢN PHẨM (CHUẨN) =====
document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("imageModal");
  const modalImg = document.getElementById("modalImg");
  const closeBtn = document.querySelector(".close-modal");

  if (!modal || !modalImg || !closeBtn) return;

  document.addEventListener("click", e => {
    const img = e.target.closest(".product-card img");
    if (!img) return;

    modal.style.display = "flex";
    modalImg.src = img.src;
    document.body.style.overflow = "hidden";
  });

  closeBtn.onclick = () => {
    modal.style.display = "none";
    document.body.style.overflow = "auto";
  };

  modal.onclick = e => {
    if (e.target === modal) {
      modal.style.display = "none";
      document.body.style.overflow = "auto";
    }
  };
});
// ===== AUTO BANNER SLIDE =====
const banners = document.querySelectorAll(".banner-slider img");
let index = 0;

if (banners.length > 0) {
  setInterval(() => {
    banners[index].classList.remove("active");
    index = (index + 1) % banners.length;
    banners[index].classList.add("active");
  }, 4000);
}

window.changeQuantity = async function (orderId, newQty) {
  if (newQty < 1) return;

  try {
    await fetch(`${ORDER_API}/${orderId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quantity: newQty })
    });
    loadCart();
  } catch {
    alert("❌ Lỗi cập nhật số lượng");
  }
};
// ================= REMOVE ITEM =================
window.removeItem = async function (orderId) {
  if (!confirm("Xoá sản phẩm này?")) return;

  try {
    await fetch(`${ORDER_API}/${orderId}`, {
      method: "DELETE"
    });

    loadCart();
  } catch {
    alert("❌ Lỗi xoá sản phẩm");
  }
};


// ================= SUBMIT ORDER =================
async function submitOrder() {
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user) {
    alert("❌ Bạn chưa đăng nhập");
    return;
  }

  const { userName, userPhone } = user;
  const address = document.getElementById("orderAddress").value.trim();
  const note = document.getElementById("orderNote").value.trim();

  if (!address) {
    alert("❌ Vui lòng nhập địa chỉ giao hàng");
    return;
  }

  try {
    const res = await fetch("/api/orders/confirm", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userName,
        userPhone,
        address,
        note
      })
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "❌ Lỗi xác nhận đơn hàng");
      return;
    }

    alert("✅ Đặt hàng thành công!");
    closeOrderModal();
    location.reload();
  } catch (err) {
    console.error(err);
    alert("❌ Lỗi kết nối server");
  }
}



window.closeOrderModal = function () {
  document.getElementById("orderModal").style.display = "none";
};
// chỉ chạy ở trang user
if (!window.location.pathname.includes("admin.html")) {

  let currentProductId = null;
  let startTime = null;

  document.addEventListener("click", (e) => {
    const card = e.target.closest(".product-card");
    if (!card) return;
      fetch(`/api/products/${card.dataset.id}/view`, { method: "POST" });
        fetch("/api/visits", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      productId: card.dataset.id,
      userId: localStorage.getItem("userPhone") || "guest"
    })
  });


    if (currentProductId && startTime) sendViewTime();

    currentProductId = card.dataset.id;
    startTime = Date.now();
  });

  window.addEventListener("beforeunload", () => {
    if (currentProductId && startTime) sendViewTime();
  });
function sendViewTime() {
  const timeSpent = Math.floor((Date.now() - startTime) / 1000);
  const userId = localStorage.getItem("userPhone") || "guest";

  fetch("/api/analytics/view-time", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      productId: currentProductId,
      timeSpent,
      userId
    })
  });
}
window.openOrderModal = function () {
  document.getElementById("orderModal").style.display = "flex";
};

}
// ================= SUBMIT COMMENT =================
window.submitComment = async function (productId) {
  const user = JSON.parse(localStorage.getItem("user"));
  const content = document.getElementById("commentContent").value.trim();

  if (!content) {
    alert("❌ Vui lòng nhập nội dung đánh giá");
    return;
  }

  try {
    const res = await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId,
        userId: user?.userPhone || "guest",
        content
      })
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "❌ Lỗi gửi comment");
      return;
    }

    alert("✅ Gửi đánh giá thành công!");
    document.getElementById("commentContent").value = "";
  } catch (err) {
    console.error(err);
    alert("❌ Lỗi kết nối server");
  }
};







 










