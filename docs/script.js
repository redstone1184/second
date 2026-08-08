// -------------------------------------------------------------------
// 1. DATA CATALOG & STATE (Edit placeholder items here)
// -------------------------------------------------------------------
const catalog = [
  { id: 'item1', name: 'GORB', dailyRate: 100000, hourlyRate: 12000, icon: '📦', category: 'Category A' },
  { id: 'item2', name: 'SunBloom', dailyRate: 25000, hourlyRate: 7000, icon: '📦', category: 'Category A' },
  { id: 'item3', name: 'Blaff/Gaunt/Soul/Luma/luma wings', dailyRate: 30000, hourlyRate: 10000, icon: '📦', category: 'Category B' },
  { id: 'item4', name: 'Black Pearl/Eno gem', dailyRate: 13000, hourlyRate: 5000, icon: '📦', category: 'Category B' },
  { id: 'item5', name: 'Prismatic w EVO Boots ', dailyRate: 15000, hourlyRate: 5000, icon: '📦', category: 'Category C' },
  { id: 'item6', name: 'Fruits', dailyRate: 80000, hourlyRate: 10000, icon: '📦', category: 'Category C' },
  { id: 'item7', name: 'Pickaxes', dailyRate: 20000, hourlyRate: 5000, icon: '📦', category: 'Category D' }
];

let cart = []; // Stores cart items: { id, days, hours }

// DOM Elements
const catalogContainer = document.getElementById('catalog-grid');
const cartContainer = document.getElementById('cart-items-container');
const countBadge = document.getElementById('cart-count-badge');
const checkoutBtn = document.getElementById('checkout-btn');
const discountSlider = document.getElementById('global-discount-slider');
const discountSliderDisplay = document.getElementById('discount-slider-display');

const subtotalValEl = document.getElementById('subtotal-val');
const discountValEl = document.getElementById('discount-val');
const finalTotalValEl = document.getElementById('final-total-val');
const headerTotalEl = document.getElementById('header-total');

// Helper function to format currency
function formatCurrency(amount) {
  return `$${amount.toFixed(2)}`;
}

// -------------------------------------------------------------------
// 2. RENDER CATALOG
// -------------------------------------------------------------------
function renderCatalog() {
  catalogContainer.innerHTML = catalog.map(item => `
    <div class="bg-zinc-950 border border-zinc-800 p-4 rounded-xl flex flex-col justify-between hover:border-zinc-700 transition">
      <div>
        <div class="flex justify-between items-start mb-2">
          <span class="text-2xl">${item.icon}</span>
          <span class="text-[10px] bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded uppercase font-semibold">${item.category}</span>
        </div>
        <h3 class="font-semibold text-sm text-zinc-100">${item.name}</h3>
        
        <div class="mt-2 space-y-0.5 font-mono">
          <div class="text-xs text-emerald-400 font-semibold">${formatCurrency(item.dailyRate)} / day</div>
          <div class="text-[11px] text-teal-400">${formatCurrency(item.hourlyRate)} / hour</div>
        </div>
      </div>

      <button 
        data-id="${item.id}"
        class="add-to-cart-btn mt-4 w-full py-2 bg-zinc-800 hover:bg-emerald-600 hover:text-zinc-950 text-zinc-200 text-xs font-semibold rounded transition duration-150 flex items-center justify-center gap-1"
      >
        <span>+</span> Add to Cart
      </button>
    </div>
  `).join('');

  // Attach Event Listeners to Catalog Buttons
  document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const itemId = e.currentTarget.getAttribute('data-id');
      addToCart(itemId);
    });
  });
}

// -------------------------------------------------------------------
// 3. CART ACTIONS
// -------------------------------------------------------------------
function addToCart(itemId) {
  const existing = cart.find(i => i.id === itemId);
  if (existing) {
    existing.days += 1;
  } else {
    cart.push({ id: itemId, days: 1, hours: 0 }); // Default = 1 Day, 0 Hours
  }
  updateCartUI();
}

function updateDuration(itemId, field, value) {
  const item = cart.find(i => i.id === itemId);
  if (item) {
    item[field] = Math.max(0, parseInt(value) || 0);
    updateCartUI();
  }
}

function removeFromCart(itemId) {
  cart = cart.filter(i => i.id !== itemId);
  updateCartUI();
}

// -------------------------------------------------------------------
// 4. CALCULATION ENGINE & UI UPDATER
// -------------------------------------------------------------------
function updateCartUI() {
  const discountPercent = parseFloat(discountSlider.value);

  discountSliderDisplay.textContent = `${discountPercent}% Off`;
  countBadge.textContent = `${cart.length} ${cart.length === 1 ? 'Item' : 'Items'}`;
  checkoutBtn.disabled = cart.length === 0;

  if (cart.length === 0) {
    cartContainer.innerHTML = `
      <div class="text-center py-10 text-zinc-600 space-y-2">
        <div class="text-3xl">🛒</div>
        <p class="text-xs">Your cart is empty.</p>
        <p class="text-[11px] text-zinc-700">Add items from the catalog to build your order.</p>
      </div>
    `;
  } else {
    cartContainer.innerHTML = cart.map(cartItem => {
      const catItem = catalog.find(c => c.id === cartItem.id);
      
      // Formula: (Days * Daily Rate) + (Hours * Hourly Rate)
      const daysTotal = cartItem.days * catItem.dailyRate;
      const hoursTotal = cartItem.hours * catItem.hourlyRate;
      const itemSubtotal = daysTotal + hoursTotal;

      return `
        <div class="bg-zinc-950 p-3 rounded-lg border border-zinc-800 space-y-2.5 relative">
          <div class="flex justify-between items-start">
            <div class="flex items-center gap-2">
              <span class="text-lg">${catItem.icon}</span>
              <div>
                <div class="text-xs font-semibold text-zinc-200">${catItem.name}</div>
                <div class="text-[10px] text-zinc-400 font-mono">Rates: ${formatCurrency(catItem.dailyRate)}/d | ${formatCurrency(catItem.hourlyRate)}/h</div>
              </div>
            </div>
            <button data-id="${catItem.id}" class="remove-btn text-zinc-500 hover:text-red-400 text-xs px-1">✕</button>
          </div>

          <div class="flex justify-between items-center bg-zinc-900/80 p-2 rounded border border-zinc-800/80 gap-2">
            <div class="flex items-center gap-3">
              <!-- Days Input -->
              <div class="flex items-center gap-1">
                <input 
                  type="number" 
                  min="0" 
                  max="60" 
                  value="${cartItem.days}" 
                  data-id="${catItem.id}"
                  data-field="days"
                  class="duration-input w-10 bg-zinc-950 border border-zinc-700 text-xs text-center rounded text-emerald-400 font-mono py-0.5 focus:outline-none focus:border-emerald-500"
                >
                <span class="text-[11px] text-zinc-400">Days</span>
              </div>

              <!-- Hours Input -->
              <div class="flex items-center gap-1">
                <input 
                  type="number" 
                  min="0" 
                  max="23" 
                  value="${cartItem.hours}" 
                  data-id="${catItem.id}"
                  data-field="hours"
                  class="duration-input w-10 bg-zinc-950 border border-zinc-700 text-xs text-center rounded text-emerald-400 font-mono py-0.5 focus:outline-none focus:border-emerald-500"
                >
                <span class="text-[11px] text-zinc-400">Hours</span>
              </div>
            </div>

            <div class="text-right font-mono">
              <div class="text-xs font-bold text-zinc-200">${formatCurrency(itemSubtotal)}</div>
              <div class="text-[9px] text-zinc-500">(${formatCurrency(daysTotal)}d + ${formatCurrency(hoursTotal)}h)</div>
            </div>
          </div>
        </div>
      `;
    }).join('');

    // Attach Event Listeners to Dynamic Cart Controls
    document.querySelectorAll('.remove-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const itemId = e.currentTarget.getAttribute('data-id');
        removeFromCart(itemId);
      });
    });

    document.querySelectorAll('.duration-input').forEach(input => {
      input.addEventListener('change', (e) => {
        const itemId = e.currentTarget.getAttribute('data-id');
        const field = e.currentTarget.getAttribute('data-field');
        updateDuration(itemId, field, e.currentTarget.value);
      });
    });
  }

  // Calculate Subtotals & Discount Amounts
  let grossSubtotal = 0;

  cart.forEach(cartItem => {
    const catItem = catalog.find(c => c.id === cartItem.id);
    grossSubtotal += (cartItem.days * catItem.dailyRate) + (cartItem.hours * catItem.hourlyRate);
  });

  const discountAmount = grossSubtotal * (discountPercent / 100);
  const finalTotal = Math.max(0, grossSubtotal - discountAmount);

  // Render Display Amounts
  subtotalValEl.textContent = formatCurrency(grossSubtotal);
  discountValEl.textContent = `-${formatCurrency(discountAmount)}`;
  finalTotalValEl.textContent = formatCurrency(finalTotal);
  headerTotalEl.textContent = formatCurrency(finalTotal);
}

function checkout() {
  alert('Rental order submitted successfully!');
  cart = [];
  updateCartUI();
}

// -------------------------------------------------------------------
// 5. EVENT LISTENERS & INITIALIZATION
// -------------------------------------------------------------------
discountSlider.addEventListener('input', updateCartUI);
checkoutBtn.addEventListener('click', checkout);

// Initialize App
renderCatalog();
updateCartUI();
