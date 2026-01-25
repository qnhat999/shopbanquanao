const API = "/api/admin/products";
const ORDER_API = "/api/admin/orders";

/* ===== LẤY INPUT ===== */
const productId = document.getElementById("productId");
const name = document.getElementById("name");
const price = document.getElementById("price");
const oldPrice = document.getElementById("oldPrice");
const image = document.getElementById("image");
const stock = document.getElementById("stock");
const description = document.getElementById("description");
const rating = document.getElementById("rating");
const type = document.getElementById("type");
const category = document.getElementById("category");

document.addEventListener("DOMContentLoaded", () => {
  loadProducts();
  loadOrders(); // ⭐ THÊM DÒNG NÀY

  document
    .getElementById("productForm")
    .addEventListener("submit", submitForm);
});


/* ===== LOAD ===== */
async function loadProducts() {
  const res = await fetch(API);
  const data = await res.json();

  document.getElementById("productList").innerHTML = data.map(p => `
    <tr>
      <td>${p.name}</td>
      <td>${Number(p.price).toLocaleString()} đ</td>
      <td>${p.type}</td>
      <td>${p.category}</td>
      <td>
        <img src="${p.image}" width="60" height="60">
      </td>
      <td>
        <button class="btn btn-warning btn-sm"
          onclick="editProduct(
            '${p._id}',
            '${p.name}',
            '${p.price}',
            '${p.oldPrice || ""}',
            '${p.image}',
            '${p.stock || ""}',
            '${p.rating || ""}',
            '${p.type}',
            '${p.category}',
            \`${p.description || ""}\`
          )">
          Sửa
        </button>

        <button class="btn btn-danger btn-sm"
          onclick="deleteProduct('${p._id}')">
          Xóa
        </button>
      </td>
    </tr>
  `).join("");
}

/* ===== SUBMIT ===== */
async function submitForm(e) {
  e.preventDefault();

  const id = productId.value;

  const body = {
    name: name.value,
    price: price.value,
    oldPrice: oldPrice.value,
    image: image.value,
    stock: stock.value,
    description: description.value,
    rating: rating.value,
    type: type.value,
    category: category.value
  };

  const method = id ? "PUT" : "POST";
  const url = id ? `${API}/${id}` : API;

  await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  e.target.reset();
  productId.value = "";
  loadProducts();
}

/* ===== DELETE ===== */
async function deleteProduct(id) {
  if (!confirm("Xóa sản phẩm này?")) return;
  await fetch(`${API}/${id}`, { method: "DELETE" });
  loadProducts();
}

/* ===== EDIT ===== */
function editProduct(
  id, nameP, priceP, oldPriceP, imageP,
  stockP, ratingP, typeP, categoryP, descP
) {
  productId.value = id;
  name.value = nameP;
  price.value = priceP;
  oldPrice.value = oldPriceP;
  image.value = imageP;
  stock.value = stockP;
  rating.value = ratingP;
  type.value = typeP;
  category.value = categoryP;
  description.value = descP;
}



async function loadOrders() {
  const res = await fetch(ORDER_API);
  if (!res.ok) return;

  const orders = await res.json();

  document.getElementById("orderList").innerHTML = orders.map(o => `
    <tr>
      <td>${o.userName}</td>
      <td>${o.userPhone}</td>
      <td>${o.name}</td>
      <td>${o.quantity}</td>
      <td>${Number(o.price).toLocaleString()} đ</td>
      <td>${Number(o.price * o.quantity).toLocaleString()} đ</td>

      <!-- ✅ THÊM -->
      <td>${o.address || "—"}</td>
      <td>${o.note || ""}</td>

      <td>${new Date(o.createdAt).toLocaleString()}</td>
    </tr>
  `).join("");
}


