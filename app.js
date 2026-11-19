// =============================================
// GOGO MOTOR – App Logic
// =============================================

// ---- State ----
let cart = JSON.parse(localStorage.getItem('gogo_cart') || '[]');
let currentProductQty = 1;
let currentProductId  = null;
let filteredProducts  = [...PRODUCTS];
let activeStep = 1;

// WhatsApp & Rekening
const WA_NUMBER  = '6281234567890';
const BANK_NO    = '000000000';
const BANK_NAME  = 'GoGo Motor';
const ONGKIR     = 15000;

// =============================================
// RENDER PRODUCTS
// =============================================
function renderProducts(list) {
  const grid = document.getElementById('productsGrid');
  if (!list.length) {
    grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:60px 0;color:var(--muted);">
      <i class="fas fa-search" style="font-size:3rem;margin-bottom:12px;display:block"></i>
      Produk tidak ditemukan.
    </div>`;
    return;
  }
  grid.innerHTML = list.map(p => `
    <div class="product-card" data-id="${p.id}">
      <div class="product-img-wrap" onclick="openProductModal(${p.id})">
        <img src="${p.image}" alt="${p.name}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=500&q=80'" />
        <span class="product-badge ${p.badgeClass}">${p.badge}</span>
      </div>
      <div class="product-info">
        <div class="product-category">${p.category}</div>
        <div class="product-name">${p.name}</div>
        <div class="product-brand">${p.brand}</div>
        <div class="product-price">
          ${formatRp(p.price)}
          ${p.oldPrice ? `<span class="product-old-price">${formatRp(p.oldPrice)}</span>` : ''}
        </div>
        <div class="product-actions">
          <button class="btn-add-cart" onclick="addToCart(${p.id}, event)">
            <i class="fas fa-cart-plus"></i> Keranjang
          </button>
          <button class="btn-detail" onclick="openProductModal(${p.id})" title="Detail">
            <i class="fas fa-eye"></i>
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

// =============================================
// FILTER & SEARCH
// =============================================
function filterCategory(cat) {
  filteredProducts = PRODUCTS.filter(p => p.category === cat);
  renderProducts(filteredProducts);
  document.getElementById('products').scrollIntoView({ behavior: 'smooth' });
  showToast(`Menampilkan kategori: ${cat}`);
}

function searchProducts() {
  const q = document.getElementById('searchInput').value.toLowerCase().trim();
  filteredProducts = PRODUCTS.filter(p =>
    p.name.toLowerCase().includes(q) ||
    p.brand.toLowerCase().includes(q) ||
    p.category.toLowerCase().includes(q)
  );
  renderProducts(filteredProducts);
}

// =============================================
// CART
// =============================================
function addToCart(id, e) {
  if (e) e.stopPropagation();
  const product = PRODUCTS.find(p => p.id === id);
  if (!product) return;
  const existing = cart.find(c => c.id === id);
  if (existing) {
    existing.qty++;
  } else {
    cart.push({ ...product, qty: 1 });
  }
  saveCart();
  updateCartUI();
  showToast(`✓ ${product.name} ditambahkan ke keranjang!`);
}

function removeFromCart(id) {
  cart = cart.filter(c => c.id !== id);
  saveCart();
  updateCartUI();
}

function changeQty(id, delta) {
  const item = cart.find(c => c.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) removeFromCart(id);
  else {
    saveCart();
    updateCartUI();
  }
}

function saveCart() {
  localStorage.setItem('gogo_cart', JSON.stringify(cart));
}

function cartTotal() {
  return cart.reduce((s, c) => s + c.price * c.qty, 0);
}

function cartItemCount() {
  return cart.reduce((s, c) => s + c.qty, 0);
}

function updateCartUI() {
  // Count badge
  const count = cartItemCount();
  document.getElementById('cartCount').textContent = count;

  // Items
  const container = document.getElementById('cartItems');
  const emptyEl   = document.getElementById('cartEmpty');
  const footerEl  = document.getElementById('cartFooter');

  if (!cart.length) {
    container.innerHTML = '';
    container.appendChild(emptyEl);
    emptyEl.style.display = 'flex';
    footerEl.style.display = 'none';
    return;
  }

  emptyEl.style.display = 'none';
  footerEl.style.display = 'block';

  container.innerHTML = cart.map(item => `
    <div class="cart-item">
      <img src="${item.image}" alt="${item.name}" onerror="this.src='https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400&q=70'" />
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">${formatRp(item.price)}</div>
        <div class="cart-item-qty">
          <button onclick="changeQty(${item.id}, -1)">−</button>
          <span>${item.qty}</span>
          <button onclick="changeQty(${item.id}, 1)">+</button>
        </div>
      </div>
      <button class="btn-remove" onclick="removeFromCart(${item.id})">
        <i class="fas fa-trash"></i>
      </button>
    </div>
  `).join('') + `<div id="cartEmpty" style="display:none"></div>`;

  document.getElementById('cartTotal').textContent = formatRp(cartTotal());
}

// =============================================
// CART SIDEBAR TOGGLE
// =============================================
function toggleCart() {
  document.getElementById('cartSidebar').classList.toggle('open');
  document.getElementById('cartOverlay').classList.toggle('open');
}
document.getElementById('cartBtn').addEventListener('click', toggleCart);

// =============================================
// PRODUCT MODAL
// =============================================
function openProductModal(id) {
  currentProductId  = id;
  currentProductQty = 1;
  const p = PRODUCTS.find(x => x.id === id);
  if (!p) return;

  const stars = '★'.repeat(Math.round(p.rating)) + '☆'.repeat(5 - Math.round(p.rating));
  const disc  = p.oldPrice ? Math.round((1 - p.price / p.oldPrice) * 100) : 0;

  document.getElementById('productModalContent').innerHTML = `
    <div class="product-modal-inner">
      <div class="product-modal-img">
        <img src="${p.image}" alt="${p.name}" onerror="this.src='https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=600&q=80'" />
      </div>
      <div class="product-modal-info">
        <div class="product-category">${p.category} ${disc ? `<span class="product-badge" style="position:static;margin-left:6px">-${disc}%</span>` : ''}</div>
        <h2>${p.name}</h2>
        <div class="brand"><i class="fas fa-tag"></i> ${p.brand}</div>
        <div style="color:#f4a261;font-size:1rem;margin-bottom:4px">${stars} <small style="color:var(--muted)">(${p.rating})</small></div>
        <div class="price">${formatRp(p.price)}</div>
        ${p.oldPrice ? `<div class="old-price">${formatRp(p.oldPrice)}</div>` : ''}
        <div class="desc">${p.description}</div>
        <div class="qty-row">
          <span style="font-weight:600;font-size:.88rem">Jumlah:</span>
          <button class="qty-btn" onclick="changeModalQty(-1)">−</button>
          <span class="qty-num" id="modalQty">1</span>
          <button class="qty-btn" onclick="changeModalQty(1)">+</button>
          <span style="font-size:.8rem;color:var(--muted)">Stok: ${p.stock}</span>
        </div>
        <div class="modal-actions">
          <button class="btn btn-primary" style="flex:1" onclick="addToCartFromModal(${p.id})">
            <i class="fas fa-cart-plus"></i> Tambah ke Keranjang
          </button>
          <button class="btn btn-success" onclick="buyNow(${p.id})">
            <i class="fas fa-bolt"></i> Beli
          </button>
        </div>
      </div>
    </div>
  `;
  openModal('productModal');
}

function changeModalQty(delta) {
  currentProductQty = Math.max(1, currentProductQty + delta);
  document.getElementById('modalQty').textContent = currentProductQty;
}

function addToCartFromModal(id) {
  const product = PRODUCTS.find(p => p.id === id);
  if (!product) return;
  const existing = cart.find(c => c.id === id);
  if (existing) existing.qty += currentProductQty;
  else cart.push({ ...product, qty: currentProductQty });
  saveCart();
  updateCartUI();
  closeModal('productModal');
  showToast(`✓ ${product.name} ×${currentProductQty} ditambahkan!`);
}

function buyNow(id) {
  addToCartFromModal(id);
  setTimeout(openCheckout, 350);
}

// =============================================
// CHECKOUT MODAL
// =============================================
function openCheckout() {
  if (!cart.length) { showToast('⚠ Keranjang masih kosong!'); return; }
  // Close cart sidebar first
  document.getElementById('cartSidebar').classList.remove('open');
  document.getElementById('cartOverlay').classList.remove('open');
  goToStep(1);
  openModal('checkoutModal');
}

function goToStep(n) {
  if (n === 2) {
    // Validasi step 1
    const name    = document.getElementById('buyerName').value.trim();
    const phone   = document.getElementById('buyerPhone').value.trim();
    const address = document.getElementById('buyerAddress').value.trim();
    if (!name || !phone || !address) {
      showToast('⚠ Lengkapi nama, nomor WhatsApp, dan alamat!');
      return;
    }
    renderSummary();
  }
  if (n === 3) {
    renderPayment();
  }

  activeStep = n;
  for (let i = 1; i <= 3; i++) {
    const el = document.getElementById(`checkoutStep${i}`);
    const btn = document.getElementById(`step${i}Btn`);
    if (el)  el.style.display = i === n ? 'block' : 'none';
    if (btn) {
      btn.className = 'step' + (i === n ? ' active' : i < n ? ' done' : '');
    }
  }
}

function renderSummary() {
  const sub = cartTotal();
  document.getElementById('orderSummaryItems').innerHTML = cart.map(item => `
    <div class="summary-item">
      <img src="${item.image}" alt="${item.name}" onerror="this.src='https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=200&q=70'" />
      <div class="summary-item-info">
        <div class="summary-item-name">${item.name}</div>
        <div class="summary-item-qty">${item.brand} · ${item.qty} pcs</div>
      </div>
      <div class="summary-item-price">${formatRp(item.price * item.qty)}</div>
    </div>
  `).join('');
  document.getElementById('summarySubtotal').textContent    = formatRp(sub);
  document.getElementById('summaryGrandTotal').textContent  = formatRp(sub + ONGKIR);
}

function renderPayment() {
  const grand = cartTotal() + ONGKIR;
  // Tambah angka unik (3 digit terakhir acak) untuk memudahkan verifikasi
  const unique = Math.floor(Math.random() * 900) + 100;
  const finalTotal = grand + unique;
  document.getElementById('paymentTotal').textContent = `${formatRp(finalTotal)} (termasuk angka unik: ${unique})`;
  window._finalTotal = finalTotal;
  window._uniqueCode = unique;
}

// =============================================
// WHATSAPP CONFIRM
// =============================================
function sendWhatsApp() {
  const name    = document.getElementById('buyerName').value.trim();
  const phone   = document.getElementById('buyerPhone').value.trim();
  const address = document.getElementById('buyerAddress').value.trim();
  const note    = document.getElementById('buyerNote').value.trim();

  const itemLines = cart.map(c =>
    `  - ${c.name} (${c.brand}) x${c.qty} = ${formatRp(c.price * c.qty)}`
  ).join('\n');

  const sub     = cartTotal();
  const grand   = window._finalTotal || (sub + ONGKIR);
  const unique  = window._uniqueCode || '-';

  const msg = `🛵 *PESANAN BARU – GoGo Motor*
——————————————————
👤 *Nama:* ${name}
📱 *WhatsApp:* ${phone}
📍 *Alamat:* ${address}
📝 *Catatan:* ${note || '-'}

🛒 *Detail Pesanan:*
${itemLines}

💰 *Subtotal:* ${formatRp(sub)}
🚚 *Ongkos Kirim:* ${formatRp(ONGKIR)}
🔢 *Angka Unik:* ${unique}
✅ *TOTAL TRANSFER:* ${formatRp(grand)}

🏦 *Pembayaran:*
  Bank  : BCA
  Rekening: ${BANK_NO}
  Atas Nama: ${BANK_NAME}

📸 _Silakan lampirkan bukti transfer pada pesan ini._
——————————————————
Dipesan via website GoGoMotor.id`;

  const url = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;
  window.open(url, '_blank');
}

function finishOrder() {
  cart = [];
  saveCart();
  updateCartUI();
  closeModal('checkoutModal');
  showToast('🎉 Pesanan berhasil dibuat! Jangan lupa kirim bukti transfer via WhatsApp.');
  setTimeout(() => {
    document.getElementById('buyerName').value    = '';
    document.getElementById('buyerPhone').value   = '';
    document.getElementById('buyerAddress').value = '';
    document.getElementById('buyerNote').value    = '';
  }, 500);
}

// =============================================
// MODAL HELPERS
// =============================================
function openModal(id) {
  document.getElementById(id).classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeModal(id) {
  document.getElementById(id).classList.remove('open');
  document.body.style.overflow = '';
}
function closeProductModal(e) {
  if (e.target === e.currentTarget) closeModal(e.currentTarget.id);
}

// =============================================
// TOAST
// =============================================
let toastTimer;
function showToast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 3000);
}

// =============================================
// COPY TEXT
// =============================================
function copyText(text) {
  navigator.clipboard.writeText(text).then(() => {
    showToast('✓ Nomor rekening disalin!');
  }).catch(() => {
    // Fallback
    const ta = document.createElement('textarea');
    ta.value = text; document.body.appendChild(ta);
    ta.select(); document.execCommand('copy'); document.body.removeChild(ta);
    showToast('✓ Nomor rekening disalin!');
  });
}

// =============================================
// HAMBURGER MENU
// =============================================
document.getElementById('hamburger').addEventListener('click', () => {
  document.getElementById('navLinks').classList.toggle('open');
});

// =============================================
// FORMAT CURRENCY
// =============================================
function formatRp(n) {
  return 'Rp ' + n.toLocaleString('id-ID');
}

// =============================================
// INIT
// =============================================
document.addEventListener('DOMContentLoaded', () => {
  renderProducts(PRODUCTS);
  updateCartUI();
});
