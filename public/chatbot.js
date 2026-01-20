async function sendChat() {
  const input = document.getElementById('chatInput');
  const chatbox = document.getElementById('chatbox');
  const message = input.value.trim();
  if (!message) return;

  chatbox.innerHTML += `<div class="user-msg">👤 ${message}</div>`;
  input.value = '';
  chatbox.scrollTop = chatbox.scrollHeight;

  try {
    const res = await fetch('/api/chatbot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message })
    });

    if (!res.ok) throw new Error('Server error');

    const data = await res.json();

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
    chatbox.innerHTML += `<div class="bot-msg">⚠️ Không kết nối được chatbot</div>`;
  }
}
