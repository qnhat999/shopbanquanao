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

    const resultSection = document.getElementById('search-results');
    resultSection.style.display = 'block';

    renderProductsTo(data, 'search-grid');

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
  const name = localStorage.getItem('userName');
  const phone = localStorage.getItem('userPhone');

  try {
    const res = await fetch(ORDER_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productId: product._id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: 1,
        userName: name || '',
        userPhone: phone || ''
      })
    });

    if (res.ok) {
      alert('🛒 Đã thêm vào giỏ hàng!');
      if (path.includes('cart.html')) loadCart();
    } else {
      alert('❌ Vui lòng đăng nhập.');
    }
  } catch {
    alert('⚠️ Lỗi server.');
  }
}

async function loadCart() {
  const name = localStorage.getItem('userName');
  const phone = localStorage.getItem('userPhone');
  const container = document.querySelector('.cart-items');
  const totalEl = document.getElementById('total-amount');
  if (!container) return;

  if (!name || !phone) {
    container.innerHTML = '<p>❗ Bạn chưa đăng nhập.</p>';
    totalEl.innerText = '0 VND';
    return;
  }

  const res = await fetch(`${ORDER_API}?name=${name}&phone=${phone}`);
  const data = await res.json();

  container.innerHTML = '';
  let total = 0;

  data.forEach(item => {
    total += item.price * item.quantity;
   container.innerHTML += `
  <div class="cart-item">
    <img src="/images/${item.image}" />

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
}

// ================= LOGIN =================
function setupLogin() {
  const form = document.querySelector('form');
  if (!form) return;

  form.onsubmit = e => {
    e.preventDefault();
    localStorage.setItem('userName', form.name.value.trim());
    localStorage.setItem('userPhone', form.phone.value.trim());
    alert('✅ Đăng nhập thành công!');
    window.location.href = 'index.html';
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

setInterval(() => {
  banners[index].classList.remove("active");
  index = (index + 1) % banners.length;
  banners[index].classList.add("active");
}, 4000);
document.querySelectorAll(".banner-img").forEach(img => {
  img.addEventListener("click", () => {
    const link = img.dataset.link;
    if (link) window.location.href = link;
  });
});







