// 🔥 Tự động lấy domain + port (local hay deploy đều chạy)
const BASE_URL = window.location.origin;

const API_URL = `${BASE_URL}/api/products`;
const ORDER_API = `${BASE_URL}/api/orders`;
const IMAGE_BASE = `${BASE_URL}/images`;

// Detect page
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
// ============== TÌM KIẾM SẢN PHẨM ===================
async function searchProducts() {
  const query = document.getElementById('searchInput').value.trim();
  if (!query) return;

  try {
    const res = await fetch(`${API_URL}/search?q=${encodeURIComponent(query)}`);
    const data = await res.json();
    const section = document.getElementById('search-results');
    section.style.display = 'block';
    renderProductsTo(data, 'search-grid');
  } catch (err) {
    console.error('Lỗi tìm kiếm:', err);
  }
}

// ============== LOAD SẢN PHẨM TỪ API ================
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

  products.forEach(p => {
    const card = createProductCard(p);
    grid.appendChild(card);
  });
}

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
  img.src = `${IMAGE_BASE}/${p.image}`;
  card.appendChild(img);

  const name = document.createElement('p');
  name.textContent = p.name;
  card.appendChild(name);

  const price = document.createElement('p');
  price.className = 'price';
  price.innerHTML = p.oldPrice
    ? `<span class="discounted-price">${p.price.toLocaleString()} VND</span> <span class="original-price">${p.oldPrice.toLocaleString()} VND</span>`
    : `${p.price.toLocaleString()} VND`;
  card.appendChild(price);

  const rating = document.createElement('div');
  rating.className = 'product-rating';
  rating.textContent = '★★★★★';
  card.appendChild(rating);

  const btn = document.createElement('button');
  btn.innerText = '🛒 Thêm giỏ hàng';
  btn.onclick = () => addToCart(p);
  card.appendChild(btn);

  return card;
}

// ============ HIỂN THỊ NHIỀU LOẠI SẢN PHẨM (index) ============
async function loadTypeProducts(type, containerId) {
  try {
    const res = await fetch(`${API_URL}?type=${type}&limit=4`);
    const data = await res.json();
    renderProductsTo(data, containerId);
  } catch (err) {
    console.error(`Lỗi khi tải ${type}:`, err);
  }
}

function renderProductsTo(products, id) {
  const grid = document.getElementById(id);
  if (!grid) return;

  grid.innerHTML = '';
  products.forEach(p => {
    const card = createProductCard(p);
    grid.appendChild(card);
  });
}

// ============== GIỎ HÀNG ============================
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
  updateCartCount();

      // 👉 Nếu đang ở trang giỏ hàng thì hiển thị luôn sản phẩm vừa thêm
      if (window.location.pathname.includes('cart.html')) {
        const container = document.querySelector('.cart-items');
        if (container) {
          const div = document.createElement('div');
          div.className = 'cart-item';
          div.innerHTML = `
            <img src="${IMAGE_BASE}/${product.image}" alt="${product.name}" />
            <div class="item-info">
              <p><strong>${product.name}</strong></p>
              <p>${product.price.toLocaleString()} VND</p>
              <p>Số lượng: 1</p>
            </div>
            <button onclick="removeItem('${product._id}')">🗑️ Xóa</button>
          `;
          container.appendChild(div);
        }
      }

    } else {
      alert('❌ Không thể thêm vào giỏ hàng. Vui lòng điền thông tin ở Đăng nhập.');
    }
  } catch {
    alert('⚠️ Lỗi kết nối server.');
  }
}

async function loadCart() {
  const name = localStorage.getItem('userName');
  const phone = localStorage.getItem('userPhone');
  const container = document.querySelector('.cart-items');
  const totalAmountEl = document.getElementById('total-amount');
  if (!container) return;

  if (!name || !phone) {
    container.innerHTML = '<p>❗ Bạn chưa đăng nhập.</p>';
    totalAmountEl.innerText = '0 VND';
    return;
  }

  try {
    const res = await fetch(`${ORDER_API}?name=${encodeURIComponent(name)}&phone=${encodeURIComponent(phone)}`);
    const data = await res.json();

    if (data.length === 0) {
      container.innerHTML = '<p>🛒 Giỏ hàng trống.</p>';
      totalAmountEl.innerText = '0 VND';
      return;
    }

    container.innerHTML = '';
    let total = 0;

    data.forEach(item => {
      total += item.price * item.quantity;

      const div = document.createElement('div');
      div.className = 'cart-item';
      div.innerHTML = `
        <img src="${IMAGE_BASE}/${item.image}" alt="${item.name}" />
        <div class="item-info">
          <p><strong>${item.name}</strong></p>
          <p>${item.price.toLocaleString()} VND</p>
          <p>
            Số lượng: 
            <button onclick="changeQuantity('${item._id}', ${item.quantity - 1})">-</button>
            <span>${item.quantity}</span>
            <button onclick="changeQuantity('${item._id}', ${item.quantity + 1})">+</button>
          </p>
        </div>
        <button class="remove-btn" onclick="removeItem('${item._id}')">🗑️ Xóa</button>
      `;
      container.appendChild(div);
    });

    totalAmountEl.innerText = total.toLocaleString() + ' VND';

  } catch (err) {
    console.error('Lỗi tải giỏ hàng:', err);
  }
}
async function changeQuantity(orderId, newQty) {
  if (newQty < 1) return;

  try {
    const res = await fetch(`${ORDER_API}/${orderId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantity: newQty })
    });

    if (res.ok) {
      loadCart();
    } else {
      alert('❌ Không thể cập nhật số lượng.');
    }
  } catch (err) {
    alert('⚠️ Lỗi kết nối khi cập nhật số lượng.');
  }
}



async function removeItem(id) {
  if (!confirm('Xóa sản phẩm khỏi giỏ hàng?')) return;

  try {
    const res = await fetch(`${ORDER_API}/${id}`, { method: 'DELETE' });
    if (res.ok) {
      alert('✅ Đã xóa!');
      loadCart();
      updateCartCount();
    } else {
      alert('❌ Xóa thất bại.');
    }
  } catch (err) {
    console.error(err);
  }
}



async function checkoutCart() {
  const name = localStorage.getItem('userName');
  const phone = localStorage.getItem('userPhone');

  if (!name || !phone) {
    alert('🔒 Bạn cần đăng nhập để xác nhận đơn hàng!');
    window.location.href = 'login.html';
    return;
  }

  try {
    const res = await fetch(`${ORDER_API}/confirm`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, phone }) // ❌ Không cần gửi cart từ localStorage
    });

    if (res.ok) {
      alert('✅ Đã xác nhận đơn hàng!');

      // ✅ Xóa toàn bộ thông tin đăng nhập & giỏ hàng khỏi localStorage
      localStorage.removeItem('userName');
      localStorage.removeItem('userPhone');
      localStorage.removeItem('cart'); // dù không dùng vẫn xóa cho sạch

      // ✅ Chuyển về trang login hoặc trang chính
      window.location.href = 'index.html';
    } else {
      alert('❌ Không thể xác nhận đơn hàng.');
    }
  } catch (err) {
    alert('⚠️ Lỗi khi xác nhận đơn hàng.');
  }
}


async function updateCartCount() {
  try {
    const res = await fetch(`${ORDER_API}`);
    const data = await res.json();
    document.getElementById('cart-count').innerText = data.length;
  } catch {
    document.getElementById('cart-count').innerText = '0';
  }
}



// ==================== LOGIN =====================
function setupLogin() {
  const form = document.querySelector('form');
  if (!form) return;

  form.onsubmit = (e) => {
    e.preventDefault();

    const name = form.querySelector('[name="name"]').value.trim();
    const phone = form.querySelector('[name="phone"]').value.trim();

    if (name && phone) {
      localStorage.setItem('userName', name);
      localStorage.setItem('userPhone', phone);
      alert('✅ Đăng nhập thành công!');
      window.location.href = 'index.html';
    } else {
      alert('❗ Vui lòng nhập đủ thông tin.');
    }
  };
}
// === Zoom ảnh sản phẩm khi hover ===
document.addEventListener('DOMContentLoaded', () => {
  const style = document.createElement('style');
  style.innerHTML = `
    .zoom-hover {
      transition: transform 0.3s ease-in-out !important;
    }
    .zoom-hover:hover {
      transform: scale(1.1) !important;
    }
  `;
  document.head.appendChild(style);
});

