// Sistema Universal de Carrito & Cotizador para 123AcademiaTech
// Soporta Cursos Presenciales, Combos Empresariales B2B y Herramientas/Productos de Taller

function getCart() {
  const stored = localStorage.getItem('academia_cart');
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch (e) {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem('academia_cart', JSON.stringify(cart));
  updateCartBadge();
  if (typeof renderCartDrawer === 'function') {
    renderCartDrawer();
  }
}

function addToCart(item) {
  let cart = getCart();
  const existingIndex = cart.findIndex(i => i.id === item.id);
  
  if (existingIndex > -1) {
    cart[existingIndex].quantity = (cart[existingIndex].quantity || 1) + (item.quantity || 1);
  } else {
    cart.push({
      id: item.id,
      title: item.title || item.name,
      price: item.price,
      rawPrice: parsePriceToNumber(item.price),
      type: item.type || 'producto', // 'curso', 'combo', 'producto'
      image: item.image,
      badge: item.badge || '',
      subtitle: item.subtitle || item.category || '',
      quantity: item.quantity || 1
    });
  }
  
  saveCart(cart);
  showToastNotification(`¡Añadido al Carrito! ${item.title || item.name}`);
  openCartDrawer();
}

function removeFromCart(id) {
  let cart = getCart();
  cart = cart.filter(i => i.id !== id);
  saveCart(cart);
}

function updateCartQuantity(id, delta) {
  let cart = getCart();
  const item = cart.find(i => i.id === id);
  if (item) {
    item.quantity = (item.quantity || 1) + delta;
    if (item.quantity <= 0) {
      removeFromCart(id);
      return;
    }
  }
  saveCart(cart);
}

function clearCart() {
  if (confirm('¿Deseas vaciar todos los artículos y cotizaciones del carrito?')) {
    localStorage.removeItem('academia_cart');
    updateCartBadge();
    if (typeof renderCartDrawer === 'function') {
      renderCartDrawer();
    }
  }
}

function parsePriceToNumber(priceStr) {
  if (!priceStr) return 0;
  const num = priceStr.toString().replace(/[^0-9.]/g, '');
  return parseFloat(num) || 0;
}

function getCartSubtotal() {
  const cart = getCart();
  return cart.reduce((sum, item) => sum + (item.rawPrice * (item.quantity || 1)), 0);
}

function updateCartBadge() {
  const cart = getCart();
  const totalCount = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
  
  document.querySelectorAll('.cart-badge-count').forEach(el => {
    el.innerText = totalCount;
    if (totalCount > 0) {
      el.classList.remove('hidden');
    } else {
      el.classList.add('hidden');
    }
  });
}

function showToastNotification(message) {
  let toast = document.getElementById('cart-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'cart-toast';
    toast.className = 'fixed bottom-6 right-6 z-[120] bg-primary text-white py-3 px-5 rounded-2xl shadow-2xl border border-white/10 flex items-center gap-3 transform translate-y-20 opacity-0 transition-all duration-300 pointer-events-none font-headline font-semibold text-xs';
    toast.innerHTML = `
      <span class="material-symbols-outlined text-secondary text-lg">check_circle</span>
      <span id="cart-toast-msg">${message}</span>
    `;
    document.body.appendChild(toast);
  } else {
    document.getElementById('cart-toast-msg').innerText = message;
  }
  
  toast.classList.remove('translate-y-20', 'opacity-0', 'pointer-events-none');
  setTimeout(() => {
    toast.classList.add('translate-y-20', 'opacity-0', 'pointer-events-none');
  }, 3000);
}

function openCartDrawer() {
  const drawer = document.getElementById('cart-drawer');
  if (drawer) {
    drawer.classList.remove('hidden');
    setTimeout(() => {
      const panel = document.getElementById('cart-drawer-panel');
      if (panel) panel.classList.remove('translate-x-full');
    }, 10);
    renderCartDrawer();
  }
}

function closeCartDrawer() {
  const panel = document.getElementById('cart-drawer-panel');
  if (panel) panel.classList.add('translate-x-full');
  setTimeout(() => {
    const drawer = document.getElementById('cart-drawer');
    if (drawer) drawer.classList.add('hidden');
  }, 300);
}

function renderCartDrawer() {
  const container = document.getElementById('cart-items-container');
  const footerSubtotal = document.getElementById('cart-drawer-subtotal');
  const footerTotal = document.getElementById('cart-drawer-total');
  const emptyState = document.getElementById('cart-empty-state');
  const filledState = document.getElementById('cart-filled-state');
  
  if (!container) return;
  const cart = getCart();
  
  if (cart.length === 0) {
    if (emptyState) emptyState.classList.remove('hidden');
    if (filledState) filledState.classList.add('hidden');
    container.innerHTML = '';
    return;
  }
  
  if (emptyState) emptyState.classList.add('hidden');
  if (filledState) filledState.classList.remove('hidden');
  
  const subtotal = getCartSubtotal();
  if (footerSubtotal) footerSubtotal.innerText = `$${subtotal.toFixed(2)} USD`;
  if (footerTotal) footerTotal.innerText = `$${subtotal.toFixed(2)} USD`;
  
  container.innerHTML = cart.map(item => `
    <div class="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex items-center justify-between gap-3 group hover:border-secondary/40 transition-colors">
      <div class="flex items-center gap-3 min-w-0">
        <img src="${item.image || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=200&q=80'}" alt="${item.title}" class="w-14 h-14 rounded-xl object-cover shrink-0 bg-slate-100 border border-slate-100"/>
        <div class="min-w-0">
          <span class="text-[10px] font-headline font-bold uppercase tracking-wider ${item.type === 'combo' ? 'text-secondary' : (item.type === 'curso' ? 'text-primary' : 'text-slate-500')}">
            ${item.type === 'combo' ? '🏢 Combo Empresarial' : (item.type === 'curso' ? '🎓 Curso Presencial' : '🛠️ Producto / Herramienta')}
          </span>
          <h4 class="font-headline font-bold text-xs text-primary truncate block">${item.title}</h4>
          <p class="font-headline font-bold text-secondary text-xs mt-0.5">${item.price}</p>
        </div>
      </div>
      
      <div class="flex flex-col items-end gap-2 shrink-0">
        <button onclick="removeFromCart('${item.id}')" class="text-slate-300 hover:text-rose-500 transition-colors" title="Eliminar del Carrito">
          <span class="material-symbols-outlined text-base">delete</span>
        </button>
        <div class="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg p-0.5">
          <button onclick="updateCartQuantity('${item.id}', -1)" class="w-6 h-6 rounded flex items-center justify-center text-slate-600 hover:bg-white text-xs font-bold transition-colors">-</button>
          <span class="text-xs font-headline font-bold px-1.5 text-primary">${item.quantity || 1}</span>
          <button onclick="updateCartQuantity('${item.id}', 1)" class="w-6 h-6 rounded flex items-center justify-center text-slate-600 hover:bg-white text-xs font-bold transition-colors">+</button>
        </div>
      </div>
    </div>
  `).join('');
}

function checkoutViaWhatsApp() {
  const cart = getCart();
  if (cart.length === 0) return;
  
  let msg = "¡Hola 123AcademiaTech! Deseo solicitar presupuesto y formalizar mi pedido/inscripción con los siguientes ítems:%0A%0A";
  cart.forEach((item, idx) => {
    msg += `${idx + 1}. *${item.title}* (${item.type.toUpperCase()}) - Cant: ${item.quantity} - Precio: ${item.price}%0A`;
  });
  
  const subtotal = getCartSubtotal();
  msg += `%0A*TOTAL ESTIMADO:* $${subtotal.toFixed(2)} USD%0A%0APor favor contáctenme para coordinar detalles de pago, entrega o inicio de clases.`;
  
  window.open(`https://wa.me/584129640005?text=${msg}`, '_blank');
}

function transferCartToContactForm() {
  const cart = getCart();
  if (cart.length === 0) return;
  
  const titles = cart.map(i => `${i.title} (x${i.quantity})`).join(', ');
  window.location.href = `contacto.html?course=${encodeURIComponent(titles)}&type=cart`;
}

document.addEventListener('DOMContentLoaded', () => {
  updateCartBadge();
});
