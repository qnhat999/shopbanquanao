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

// ================= SEARCH =================
async function searchProducts() {
  const query = document.getElementById('searchInput').value.trim();
  if (!query) return;

  try {
    const res = await fetch(`${API_URL}/search?q=${encodeURIComponent(query)}`);
    const data = await res.json();
    document.getElementById('search-results').style.display = 'block';
    renderProductsTo(data, 'search-grid');
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
  const card = document.createElement('div');
  card.className = 'product-card';

  if (p.oldPrice) {
    const badge = document.createElement('div');
    badge.className = 'discount-badge';
    badge.innerText = 'GIẢM GIÁ';
    card.appendChild(badge);
  }

  const img = document.createElement('img');
  // ✅ FIX QUAN TRỌNG: GHÉP ĐƯỜNG DẪN ẢNH ĐÚNG
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
    <div class="product-rating">★★★★★</div>
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
        image: product.image, // ✅ DB chỉ lưu tên file
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
        <!-- ✅ FIX ẢNH GIỎ HÀNG -->
        <img src="/images/${item.image}" />
        <div class="item-info">
          <p><strong>${item.name}</strong></p>
          <p>${item.price.toLocaleString()} VND</p>
          <p>
            <button onclick="changeQuantity('${item._id}', ${item.quantity - 1})">-</button>
            ${item.quantity}
            <button onclick="changeQuantity('${item._id}', ${item.quantity + 1})">+</button>
          </p>
        </div>
        <button onclick="removeItem('${item._id}')">🗑️</button>
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
