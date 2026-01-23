// =====================
// GỬI CHAT
// =====================
async function sendChat() {
  const input = document.getElementById('chatInput');
  const chatbox = document.getElementById('chatbox');
  const message = input.value.trim();
  if (!message) return;

  // Hiển thị tin nhắn người dùng
  chatbox.innerHTML += `<div class="user-msg">👤 ${message}</div>`;
  input.value = '';
  chatbox.scrollTop = chatbox.scrollHeight;

  // Hiển thị đang trả lời
  const loadingId = `loading-${Date.now()}`;
  chatbox.innerHTML += `<div class="bot-msg" id="${loadingId}">🤖 Đang trả lời...</div>`;
  chatbox.scrollTop = chatbox.scrollHeight;

  try {
    const res = await fetch('/api/chatbot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message })
    });

    if (!res.ok) throw new Error('Server error');

    const data = await res.json();

    // Xóa loading
    document.getElementById(loadingId)?.remove();

    if (data.reply) {
      chatbox.innerHTML += `<div class="bot-msg">🤖 ${data.reply}</div>`;
    }

    if (data.products) {
      data.products.forEach(p => {
        chatbox.innerHTML += `
          <div class="bot-product">
            <img src="/images/${p.image || 'no-image.png'}" width="60"/>
            <div>
              <b>${p.name}</b><br/>
              ${p.price.toLocaleString()} VND
            </div>
          </div>
        `;
      });
    }

    chatbox.scrollTop = chatbox.scrollHeight;

  } catch (err) {
    console.error(err);
    document.getElementById(loadingId)?.remove();
    chatbox.innerHTML += `<div class="bot-msg">⚠️ Không kết nối được chatbot</div>`;
  }
}

// =====================
// ENTER ĐỂ GỬI CHAT
// =====================
document.getElementById("chatInput").addEventListener("keydown", function (e) {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault(); // không xuống dòng
    sendChat();
  }
});
function toggleChat() {
  const chat = document.getElementById('chat-container');
  const btn = document.getElementById('toggleChat');

  chat.classList.toggle('minimized');

  btn.innerText = chat.classList.contains('minimized')
    ? '➕'
    : '➖';
}
