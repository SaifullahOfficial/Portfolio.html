/**
 * Mishi's Artwork - Main Application Controller
 * Handles Cart, Wishlist, Currency Conversion, Filters, Room Simulator, Lightboxes, and Form Handlers.
 * Touch & Mobile First Optimized
 */

// Application State
const state = {
  currency: 'GBP',
  cart: JSON.parse(localStorage.getItem('mishi_cart') || '[]'),
  wishlist: JSON.parse(localStorage.getItem('mishi_wishlist') || '[]'),
  discountCode: localStorage.getItem('mishi_discount') || '',
  discountPercent: 0,
  activeOriginalFilter: 'all',
  activePrintFilter: 'all',
  activeBookmarkFilter: 'all',
  currentRoomArtwork: null,
  currentModalArtwork: null
};

if (state.discountCode.toUpperCase() === 'MISHI10') {
  state.discountPercent = 0.10;
}

// Helpers for Currency Formatting
function formatPrice(amountGBP) {
  if (!amountGBP && amountGBP !== 0) return '';
  const currentCurr = (window.state && state.currency) ? state.currency : 'GBP';
  const rateInfo = (window.currencyRates && currencyRates[currentCurr]) ? currencyRates[currentCurr] : currencyRates.GBP;
  const converted = Math.round(amountGBP * rateInfo.rate);
  
  if (currentCurr === 'GBP') {
    return `£${converted.toLocaleString()}`;
  } else if (currentCurr === 'USD') {
    return `$${converted.toLocaleString()}`;
  } else if (currentCurr === 'EUR') {
    return `€${converted.toLocaleString()}`;
  } else if (currentCurr === 'PKR') {
    return `Rs ${converted.toLocaleString()}`;
  }
  return `£${converted.toLocaleString()}`;
} else if (state.currency === 'USD') {
    return `$${converted.toLocaleString()}`;
  } else if (state.currency === 'EUR') {
    return `€${converted.toLocaleString()}`;
  } else if (state.currency === 'PKR') {
    return `Rs ${converted.toLocaleString()}`;
  }
  return `£${converted.toLocaleString()}`;
} else if (state.currency === 'USD') {
    return `$${converted.toLocaleString()}`;
  } else if (state.currency === 'EUR') {
    return `€${converted.toLocaleString()}`;
  } else if (state.currency === 'PKR') {
    return `Rs ${converted.toLocaleString()}`;
  }
  return `£${converted.toLocaleString()}`;
} else if (state.currency === 'USD') {
    return `$${Math.round(converted)}`;
  } else if (state.currency === 'EUR') {
    return `€${Math.round(converted)}`;
  }
  return `£${Math.round(converted)}`;
}

// Toast Notification
function showToast(message, icon = 'check') {
  const container = document.getElementById('toast-container');
  if (!container) return;
  
  const toast = document.createElement('div');
  toast.className = 'toast-message';
  toast.innerHTML = `
    <i data-lucide="${icon}" class="w-4 h-4 text-emerald-300 shrink-0"></i>
    <span>${message}</span>
  `;
  container.appendChild(toast);
  if (window.lucide && lucide.createIcons) { try { lucide.createIcons(); } catch(e){} }
  
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 2800);
}

// Save State
function saveState() {
  localStorage.setItem('mishi_cart', JSON.stringify(state.cart));
  localStorage.setItem('mishi_wishlist', JSON.stringify(state.wishlist));
  localStorage.setItem('mishi_discount', state.discountCode);
  updateCartBadge();
  updateWishlistBadge();
}

function updateCartBadge() {
  const count = state.cart.reduce((acc, item) => acc + item.quantity, 0);
  const badges = document.querySelectorAll('.cart-count-badge');
  badges.forEach(b => {
    b.textContent = count;
    b.style.display = count > 0 ? 'flex' : 'none';
  });
}

function updateWishlistBadge() {
  const count = state.wishlist.length;
  const badges = document.querySelectorAll('.wishlist-count-badge');
  badges.forEach(b => {
    b.textContent = count;
    b.style.display = count > 0 ? 'flex' : 'none';
  });
}

function addToCart(item) {
  const existing = state.cart.find(c => c.id === item.id && c.selectedSize === item.selectedSize && c.selectedFrame === item.selectedFrame);
  if (existing) {
    existing.quantity += item.quantity || 1;
  } else {
    state.cart.push({
      ...item,
      quantity: item.quantity || 1
    });
  }
  saveState();
  renderCartDrawer();
  openCartDrawer();
  showToast(`Added "${item.title}" to bag`);
}

function toggleWishlist(artworkId) {
  const index = state.wishlist.indexOf(artworkId);
  if (index > -1) {
    state.wishlist.splice(index, 1);
    showToast('Removed from saved items', 'heart-off');
  } else {
    state.wishlist.push(artworkId);
    showToast('Saved to your wishlist', 'heart');
  }
  saveState();
  renderOriginals();
  renderPrints();
  renderBookmarks();
}

function setCurrency(curr) {
  if (!window.currencyRates || !currencyRates[curr]) return;
  state.currency = curr;
  try { localStorage.setItem('mishi_currency', curr); } catch (e) {}

  document.querySelectorAll('.currency-select-btn').forEach(btn => {
    const isCurr = btn.dataset.currency === curr;
    if (isCurr) {
      btn.className = 'currency-select-btn px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-semibold bg-stone-800 text-white transition-all shadow-sm';
    } else {
      btn.className = 'currency-select-btn px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-semibold text-stone-400 hover:text-white transition-all';
    }
  });
  
  document.querySelectorAll('.currency-drawer-btn').forEach(btn => {
    const isCurr = btn.dataset.currencyDrawer === curr;
    if (isCurr) {
      btn.className = 'currency-drawer-btn px-2.5 py-1 bg-stone-800 rounded text-white font-bold text-[11px] transition-all shadow-sm';
    } else {
      btn.className = 'currency-drawer-btn px-2.5 py-1 bg-stone-100 hover:bg-stone-200 rounded text-stone-700 text-[11px] transition-all';
    }
  });
  
  try { renderOriginals(); } catch (err) { console.error('renderOriginals err:', err); }
  try { renderPrints(); } catch (err) { console.error('renderPrints err:', err); }
  try { renderBookmarks(); } catch (err) { console.error('renderBookmarks err:', err); }
  try { renderCommissions(); } catch (err) { console.error('renderCommissions err:', err); }
  try { renderCartDrawer(); } catch (err) { console.error('renderCartDrawer err:', err); }
  if (state.currentModalArtwork) {
    try { renderModalDetails(state.currentModalArtwork); } catch (err) { console.error('renderModalDetails err:', err); }
  }
  try { showToast(`Currency: ${currencyRates[curr].name}`); } catch (err) {}
}

window.setCurrency = setCurrency;
window.formatPrice = formatPrice;

// -------------------------------------------------------------
// RENDERERS
// -------------------------------------------------------------

// 1. Render Originals Gallery
function renderOriginals() {
  const container = document.getElementById('originals-grid');
  if (!container) return;

  const filtered = artCatalog.originals.filter(art => {
    if (state.activeOriginalFilter === 'all') return true;
    if (state.activeOriginalFilter === 'available') return art.status === 'available';
    return art.category === state.activeOriginalFilter;
  });

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="col-span-full text-center py-12 text-stone-500 font-serif text-lg">
        No original paintings in this collection currently. Inquire for bespoke commissions.
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(art => {
    const isWishlisted = state.wishlist.includes(art.id);
    const statusBadge = art.status === 'available' 
      ? '<span class="badge-original">Available</span>'
      : (art.status === 'sold' ? '<span class="badge-sold">Sold</span>' : '<span class="badge-bestseller">Reserved</span>');

    return `
      <div class="art-card overflow-hidden flex flex-col group">
        <div class="image-container relative aspect-[4/5] overflow-hidden cursor-pointer" onclick="openArtworkModal('${art.id}', 'original')">
          <img src="${art.image}" alt="${art.title}" class="w-full h-full object-cover" onerror="this.onerror=null;this.src='https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80'">
          
          <div class="absolute top-3 left-3 z-10">
            ${statusBadge}
          </div>

          <button onclick="event.stopPropagation(); toggleWishlist('${art.id}')" 
                  class="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-white/85 backdrop-blur-md flex items-center justify-center text-stone-700 hover:text-rose-500 hover:bg-white shadow-sm transition-all"
                  title="Save to wishlist">
            <i data-lucide="heart" class="w-4 h-4 ${isWishlisted ? 'fill-rose-500 text-rose-500' : ''}"></i>
          </button>

          <!-- Always visible on mobile, slick hover on desktop -->
          <div class="absolute bottom-3 left-3 right-3 flex gap-1.5 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300">
            <button onclick="event.stopPropagation(); openRoomSimulator('${art.id}', 'original')" 
                    class="flex-1 bg-stone-900/90 hover:bg-stone-900 text-white text-[11px] py-2 px-2.5 rounded-full backdrop-blur-md flex items-center justify-center gap-1 shadow-md font-sans tracking-wider uppercase font-semibold">
              <i data-lucide="layout" class="w-3 h-3"></i>
              View in Room
            </button>
            <button onclick="event.stopPropagation(); openArtworkModal('${art.id}', 'original')" 
                    class="bg-white/90 hover:bg-white text-stone-800 text-xs p-2 rounded-full backdrop-blur-md flex items-center justify-center shadow-md">
              <i data-lucide="zoom-in" class="w-3.5 h-3.5"></i>
            </button>
          </div>
        </div>

        <div class="p-4 sm:p-5 flex flex-col flex-1 bg-white">
          <div class="flex items-start justify-between gap-2 mb-1.5">
            <span class="text-[10px] uppercase tracking-widest text-[#8FA387] font-semibold">${art.categoryLabel}</span>
            <span class="font-serif text-lg font-semibold text-stone-800">${formatPrice(art.priceGBP)}</span>
          </div>

          <h3 class="font-serif text-xl sm:text-2xl font-medium text-stone-900 mb-1 hover:text-[#5B7252] transition-colors cursor-pointer" onclick="openArtworkModal('${art.id}', 'original')">
            ${art.title}
          </h3>
          
          <p class="text-[11px] text-stone-500 mb-2 font-sans">${art.medium} • ${art.size}</p>
          <p class="text-xs text-stone-600 line-clamp-2 mb-4 leading-relaxed">${art.description}</p>

          <div class="mt-auto pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
            <button onclick="openRoomSimulator('${art.id}', 'original')" class="text-[11px] font-semibold uppercase tracking-wider text-stone-600 hover:text-stone-900 flex items-center gap-1">
              <i data-lucide="eye" class="w-3 h-3"></i> Wall Preview
            </button>

            ${art.status === 'available' ? `
              <button onclick="addToCart({ id: '${art.id}', title: '${art.title}', priceGBP: ${art.priceGBP}, image: '${art.image}', selectedSize: '${art.size}', selectedFrame: 'Original (Stretched)', type: 'Original Painting' })" 
                      class="btn-luxury-primary !py-1.5 !px-3.5 !text-[11px]">
                <i data-lucide="shopping-bag" class="w-3 h-3"></i> Acquire
              </button>
            ` : (art.status === 'sold' ? `
              <button onclick="scrollToSection('prints')" class="btn-luxury-blush !py-1.5 !px-3 !text-[11px]">
                View Prints
              </button>
            ` : `
              <button onclick="openCommissionModal('${art.title}')" class="btn-luxury-outline !py-1.5 !px-3 !text-[11px]">
                Inquire
              </button>
            `)}
          </div>
        </div>
      </div>
    `;
  }).join('');

  if (window.lucide && lucide.createIcons) { try { lucide.createIcons(); } catch(e){} }
}

// 2. Render Art Prints Collection
function renderPrints() {
  const container = document.getElementById('prints-grid');
  if (!container) return;

  const filtered = artCatalog.prints.filter(print => {
    if (state.activePrintFilter === 'all') return true;
    return print.category === state.activePrintFilter;
  });

  container.innerHTML = filtered.map(print => {
    const isWishlisted = state.wishlist.includes(print.id);

    return `
      <div class="art-card overflow-hidden flex flex-col group">
        <div class="image-container relative aspect-[4/5] overflow-hidden cursor-pointer" onclick="openArtworkModal('${print.id}', 'print')">
          <img src="${print.image}" alt="${print.title}" class="w-full h-full object-cover" onerror="this.onerror=null;this.src='https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80'">
          
          <div class="absolute top-3 left-3 z-10">
            ${print.bestseller ? '<span class="badge-bestseller">Archival Favorite</span>' : '<span class="badge-original">Fine Art Giclée</span>'}
          </div>

          <button onclick="event.stopPropagation(); toggleWishlist('${print.id}')" 
                  class="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-white/85 backdrop-blur-md flex items-center justify-center text-stone-700 hover:text-rose-500 hover:bg-white shadow-sm transition-all"
                  title="Save to wishlist">
            <i data-lucide="heart" class="w-4 h-4 ${isWishlisted ? 'fill-rose-500 text-rose-500' : ''}"></i>
          </button>

          <div class="absolute bottom-3 left-3 right-3 flex gap-1.5 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300">
            <button onclick="event.stopPropagation(); openRoomSimulator('${print.id}', 'print')" 
                    class="flex-1 bg-stone-900/90 hover:bg-stone-900 text-white text-[11px] py-2 px-2.5 rounded-full backdrop-blur-md flex items-center justify-center gap-1 shadow-md font-sans tracking-wider uppercase font-semibold">
              <i data-lucide="layout" class="w-3 h-3"></i>
              View in Room
            </button>
            <button onclick="event.stopPropagation(); openArtworkModal('${print.id}', 'print')" 
                    class="bg-white/90 hover:bg-white text-stone-800 text-xs p-2 rounded-full backdrop-blur-md flex items-center justify-center shadow-md">
              <i data-lucide="zoom-in" class="w-3.5 h-3.5"></i>
            </button>
          </div>
        </div>

        <div class="p-4 sm:p-5 flex flex-col flex-1 bg-white">
          <div class="flex items-start justify-between gap-2 mb-1.5">
            <span class="text-[10px] uppercase tracking-widest text-[#8FA387] font-semibold">${print.categoryLabel}</span>
            <span class="font-serif text-base sm:text-lg font-semibold text-stone-800">From ${formatPrice(print.basePriceGBP)}</span>
          </div>

          <h3 class="font-serif text-xl sm:text-2xl font-medium text-stone-900 mb-1 hover:text-[#5B7252] transition-colors cursor-pointer" onclick="openArtworkModal('${print.id}', 'print')">
            ${print.title}
          </h3>
          
          <p class="text-[11px] text-stone-500 mb-2 font-sans">${print.paper}</p>
          <p class="text-xs text-stone-600 line-clamp-2 mb-4 leading-relaxed">${print.description}</p>

          <div class="mt-auto pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
            <span class="text-[11px] text-stone-500 font-sans">A5 - A2</span>

            <button onclick="openArtworkModal('${print.id}', 'print')" class="btn-luxury-primary !py-1.5 !px-3.5 !text-[11px]">
              <i data-lucide="sliders" class="w-3 h-3"></i> Select Size
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');

  if (window.lucide && lucide.createIcons) { try { lucide.createIcons(); } catch(e){} }
}

// 3. Render Bookmarks Section
function renderBookmarks() {
  const container = document.getElementById('bookmarks-grid');
  if (!container) return;

  const filtered = artCatalog.bookmarks.filter(bm => {
    if (state.activeBookmarkFilter === 'all') return true;
    return bm.type === state.activeBookmarkFilter;
  });

  container.innerHTML = filtered.map(bm => {
    const isWishlisted = state.wishlist.includes(bm.id);

    return `
      <div class="art-card overflow-hidden flex flex-col group">
        <div class="image-container relative aspect-[3/4] overflow-hidden cursor-pointer" onclick="openArtworkModal('${bm.id}', 'bookmark')">
          <img src="${bm.image}" alt="${bm.title}" class="w-full h-full object-cover" onerror="this.onerror=null;this.src='https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80'">
          
          <div class="absolute top-3 left-3 z-10">
            <span class="badge-bestseller">${bm.badge}</span>
          </div>

          <button onclick="event.stopPropagation(); toggleWishlist('${bm.id}')" 
                  class="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-white/85 backdrop-blur-md flex items-center justify-center text-stone-700 hover:text-rose-500 hover:bg-white shadow-sm transition-all">
            <i data-lucide="heart" class="w-4 h-4 ${isWishlisted ? 'fill-rose-500 text-rose-500' : ''}"></i>
          </button>
        </div>

        <div class="p-4 sm:p-5 flex flex-col flex-1 bg-white">
          <div class="flex items-start justify-between gap-2 mb-1.5">
            <span class="text-[10px] uppercase tracking-widest text-[#8FA387] font-semibold">${bm.typeLabel}</span>
            <span class="font-serif text-lg font-semibold text-stone-800">${formatPrice(bm.priceGBP)}</span>
          </div>

          <h3 class="font-serif text-xl font-medium text-stone-900 mb-1 hover:text-[#5B7252] transition-colors cursor-pointer" onclick="openArtworkModal('${bm.id}', 'bookmark')">
            ${bm.title}
          </h3>

          <p class="text-[11px] text-stone-500 mb-2 font-sans">${bm.material}</p>
          <p class="text-xs text-stone-600 mb-4 leading-relaxed">${bm.details}</p>

          <div class="mt-auto pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
            <span class="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
              <i data-lucide="check" class="w-3 h-3"></i> In Stock
            </span>

            <button onclick="addToCart({ id: '${bm.id}', title: '${bm.title}', priceGBP: ${bm.priceGBP}, image: '${bm.image}', selectedSize: 'Bookmark (5x18cm)', selectedFrame: 'Silk Tassel & Sleeve', type: 'Handmade Bookmark' })" 
                    class="btn-luxury-primary !py-1.5 !px-3.5 !text-[11px]">
              <i data-lucide="shopping-bag" class="w-3 h-3"></i> Add
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');

  if (window.lucide && lucide.createIcons) { try { lucide.createIcons(); } catch(e){} }
}

// 4. Render Commission Tiers
function renderCommissions() {
  const container = document.getElementById('commissions-tiers-grid');
  if (!container) return;

  container.innerHTML = artCatalog.commissionTiers.map(tier => {
    return `
      <div class="p-6 sm:p-8 rounded-2xl bg-white border ${tier.popular ? 'border-[#8FA387] ring-2 ring-[#8FA387]/20 shadow-md' : 'border-stone-200 shadow-sm'} flex flex-col relative transition-all">
        ${tier.popular ? '<div class="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#8FA387] text-white text-[10px] font-bold tracking-widest uppercase py-0.5 px-3 rounded-full shadow-sm">Popular Choice</div>' : ''}
        
        <div class="mb-3">
          <span class="text-[10px] font-sans font-semibold uppercase tracking-widest text-[#8FA387]">${tier.size}</span>
          <h3 class="font-serif text-2xl font-semibold text-stone-900 mt-0.5">${tier.title}</h3>
        </div>

        <div class="mb-4 pb-4 border-b border-stone-100">
          <div class="flex items-baseline gap-1">
            <span class="text-xs font-sans text-stone-500">From</span>
            <span class="font-serif text-2xl sm:text-3xl font-semibold text-stone-900">${formatPrice(tier.startingPriceGBP)}</span>
          </div>
          <p class="text-[11px] text-stone-500 mt-0.5 font-sans">Turnaround: ${tier.timeline}</p>
        </div>

        <p class="text-xs text-stone-600 mb-4 italic leading-relaxed font-serif">"${tier.idealFor}"</p>

        <ul class="space-y-2 mb-6 text-xs text-stone-600 flex-1">
          ${tier.features.map(feat => `
            <li class="flex items-start gap-2">
              <i data-lucide="check-circle-2" class="w-3.5 h-3.5 text-[#8FA387] shrink-0 mt-0.5"></i>
              <span>${feat}</span>
            </li>
          `).join('')}
        </ul>

        <button onclick="openCommissionModal('${tier.title} (${tier.size})')" 
                class="${tier.popular ? 'btn-luxury-primary' : 'btn-luxury-outline'} w-full !text-xs !py-2.5">
          Reserve This Slot
        </button>
      </div>
    `;
  }).join('');

  if (window.lucide && lucide.createIcons) { try { lucide.createIcons(); } catch(e){} }
}

// 5. Render Reviews
function renderReviews() {
  const container = document.getElementById('reviews-grid');
  if (!container) return;

  container.innerHTML = artCatalog.reviews.map(rev => `
    <div class="p-5 sm:p-6 rounded-2xl bg-[#FAF7F2] border border-[#EBE3DA] flex flex-col justify-between shadow-sm">
      <div>
        <div class="flex gap-1 text-amber-500 mb-3">
          ${Array(rev.rating).fill('<i data-lucide="star" class="w-3.5 h-3.5 fill-amber-400"></i>').join('')}
        </div>
        <p class="font-serif text-base text-stone-800 italic leading-relaxed mb-4">"${rev.text}"</p>
      </div>
      <div class="pt-3 border-t border-[#DECFC0] flex items-center justify-between">
        <div>
          <h4 class="font-sans font-semibold text-xs text-stone-900">${rev.name}</h4>
          <span class="text-[11px] text-stone-500">${rev.location}</span>
        </div>
        <span class="text-[11px] font-serif text-[#8FA387] italic">${rev.artwork}</span>
      </div>
    </div>
  `).join('');

  if (window.lucide && lucide.createIcons) { try { lucide.createIcons(); } catch(e){} }
}

// 6. Render Instagram Grid
function renderInstagram() {
  const container = document.getElementById('instagram-grid');
  if (!container) return;

  container.innerHTML = artCatalog.instagramPosts.map(post => `
    <a href="${post.link}" target="_blank" rel="noopener noreferrer" 
       class="group relative aspect-square rounded-2xl overflow-hidden block shadow-sm border border-stone-200">
      <img src="${post.image}" alt="Instagram post" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
      
      <div class="absolute inset-0 bg-stone-900/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-3 sm:p-4 text-white">
        <div class="flex justify-between items-center text-[10px] uppercase font-semibold">
          <span>${post.handle}</span>
          <i data-lucide="arrow-up-right" class="w-3.5 h-3.5"></i>
        </div>
        
        <p class="text-[10px] sm:text-xs line-clamp-2 leading-relaxed text-stone-200">${post.caption}</p>
        
        <div class="flex gap-3 text-[10px] font-semibold">
          <span class="flex items-center gap-1"><i data-lucide="heart" class="w-3 h-3 fill-white"></i> ${post.likes}</span>
          <span class="flex items-center gap-1"><i data-lucide="message-circle" class="w-3 h-3"></i> ${post.comments}</span>
        </div>
      </div>
    </a>
  `).join('');

  if (window.lucide && lucide.createIcons) { try { lucide.createIcons(); } catch(e){} }
}

// -------------------------------------------------------------
// CART & CHECKOUT
// -------------------------------------------------------------

function renderCartDrawer() {
  const container = document.getElementById('cart-items-list');
  const emptyState = document.getElementById('cart-empty-state');
  const cartFooter = document.getElementById('cart-footer');
  const subtotalEl = document.getElementById('cart-subtotal');
  const discountRow = document.getElementById('cart-discount-row');
  const discountAmountEl = document.getElementById('cart-discount-amount');
  const shippingProgressText = document.getElementById('shipping-progress-text');
  const shippingProgressBar = document.getElementById('shipping-progress-bar');
  
  if (!container) return;

  if (state.cart.length === 0) {
    container.innerHTML = '';
    if (emptyState) emptyState.style.display = 'flex';
    if (cartFooter) cartFooter.style.display = 'none';
    return;
  }

  if (emptyState) emptyState.style.display = 'none';
  if (cartFooter) cartFooter.style.display = 'block';

  const subtotalGBP = state.cart.reduce((sum, item) => sum + (item.priceGBP * item.quantity), 0);
  const discountGBP = subtotalGBP * state.discountPercent;
  const finalGBP = subtotalGBP - discountGBP;

  const freeShippingThreshold = 50;
  const progressPercent = Math.min(100, Math.round((subtotalGBP / freeShippingThreshold) * 100));
  
  if (shippingProgressBar) {
    shippingProgressBar.style.width = `${progressPercent}%`;
  }
  
  if (shippingProgressText) {
    if (subtotalGBP >= freeShippingThreshold) {
      shippingProgressText.innerHTML = '🎉 <strong>Free UK Tracked Delivery</strong> unlocked!';
    } else {
      const remainingGBP = freeShippingThreshold - subtotalGBP;
      shippingProgressText.innerHTML = `Add <strong>${formatPrice(remainingGBP)}</strong> for Free UK Delivery`;
    }
  }

  if (subtotalEl) subtotalEl.textContent = formatPrice(finalGBP);

  if (discountRow) {
    if (state.discountPercent > 0) {
      discountRow.style.display = 'flex';
      discountAmountEl.textContent = `-${formatPrice(discountGBP)} (10% VIP)`;
    } else {
      discountRow.style.display = 'none';
    }
  }

  container.innerHTML = state.cart.map((item, index) => `
    <div class="flex gap-3 p-3 rounded-xl bg-white border border-stone-200">
      <img src="${item.image}" alt="${item.title}" class="w-16 h-20 object-cover rounded-lg shrink-0 border border-stone-100">
      
      <div class="flex flex-col flex-1 justify-between">
        <div class="flex justify-between items-start gap-1">
          <div>
            <h4 class="font-serif text-base font-medium text-stone-900 leading-tight">${item.title}</h4>
            <p class="text-[10px] text-stone-500 font-sans mt-0.5">${item.selectedSize}</p>
          </div>
          <button onclick="removeFromCart(${index})" class="text-stone-400 hover:text-rose-500 p-1" aria-label="Remove item">
            <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
          </button>
        </div>

        <div class="flex justify-between items-center mt-2">
          <div class="flex items-center border border-stone-200 rounded-full px-2 py-0.5 bg-stone-50">
            <button onclick="updateCartQuantity(${index}, -1)" class="text-stone-500 hover:text-stone-800 px-1 font-bold">-</button>
            <span class="mx-2 text-xs font-semibold text-stone-800">${item.quantity}</span>
            <button onclick="updateCartQuantity(${index}, 1)" class="text-stone-500 hover:text-stone-800 px-1 font-bold">+</button>
          </div>

          <span class="font-serif text-sm font-semibold text-stone-900">${formatPrice(item.priceGBP * item.quantity)}</span>
        </div>
      </div>
    </div>
  `).join('');

  if (window.lucide && lucide.createIcons) { try { lucide.createIcons(); } catch(e){} }
}

function updateCartQuantity(index, delta) {
  if (!state.cart[index]) return;
  state.cart[index].quantity += delta;
  if (state.cart[index].quantity <= 0) {
    state.cart.splice(index, 1);
  }
  saveState();
  renderCartDrawer();
}

function removeFromCart(index) {
  state.cart.splice(index, 1);
  saveState();
  renderCartDrawer();
  showToast('Item removed from bag');
}

function applyPromoCode() {
  const input = document.getElementById('promo-code-input');
  if (!input) return;
  const val = input.value.trim().toUpperCase();
  if (val === 'MISHI10' || val === 'ARTLOVE') {
    state.discountCode = val;
    state.discountPercent = 0.10;
    saveState();
    renderCartDrawer();
    showToast('Promo code applied: 10% Discount! ✨');
    input.value = '';
  } else {
    showToast('Try code "MISHI10"', 'alert-circle');
  }
}

function openCartDrawer() {
  const drawer = document.getElementById('cart-drawer');
  const backdrop = document.getElementById('cart-backdrop');
  if (drawer && backdrop) {
    drawer.classList.remove('translate-x-full');
    backdrop.classList.remove('opacity-0', 'pointer-events-none');
    renderCartDrawer();
  }
}

function closeCartDrawer() {
  const drawer = document.getElementById('cart-drawer');
  const backdrop = document.getElementById('cart-backdrop');
  if (drawer && backdrop) {
    drawer.classList.add('translate-x-full');
    backdrop.classList.add('opacity-0', 'pointer-events-none');
  }
}

// -------------------------------------------------------------
// ROOM PREVIEW SIMULATOR (AR / Wall Mockup)
// -------------------------------------------------------------

function openRoomSimulator(artworkId, type) {
  let artwork = null;
  if (type === 'original') {
    artwork = artCatalog.originals.find(a => a.id === artworkId);
  } else if (type === 'print') {
    artwork = artCatalog.prints.find(a => a.id === artworkId);
  } else {
    artwork = artCatalog.bookmarks.find(a => a.id === artworkId);
  }

  if (!artwork) return;
  state.currentRoomArtwork = artwork;

  const modal = document.getElementById('room-simulator-modal');
  const titleEl = document.getElementById('room-modal-title');
  const sizeEl = document.getElementById('room-modal-size');
  const imageEl = document.getElementById('room-modal-artwork-img');
  
  if (titleEl) titleEl.textContent = artwork.title;
  if (sizeEl) sizeEl.textContent = artwork.size || 'A3 Fine Art Print';
  if (imageEl) imageEl.src = artwork.roomPreviewImage || artwork.image;

  setRoomWallColor('linen');
  setRoomFrame('oak');

  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
  }
  if (window.lucide && lucide.createIcons) { try { lucide.createIcons(); } catch(e){} }
}

function closeRoomSimulator() {
  const modal = document.getElementById('room-simulator-modal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
}

function setRoomWallColor(color) {
  const wall = document.getElementById('room-wall-canvas');
  if (!wall) return;

  wall.className = 'room-canvas-container';
  if (color === 'linen') wall.classList.add('room-wall-linen');
  if (color === 'sage') wall.classList.add('room-wall-sage');
  if (color === 'blush') wall.classList.add('room-wall-blush');
  if (color === 'charcoal') wall.classList.add('room-wall-charcoal');
  if (color === 'ivory') wall.classList.add('room-wall-ivory');

  document.querySelectorAll('.wall-color-btn').forEach(btn => {
    btn.classList.toggle('ring-2', btn.dataset.wall === color);
    btn.classList.toggle('ring-stone-800', btn.dataset.wall === color);
  });
}

function setRoomFrame(frameType) {
  const frameRender = document.getElementById('room-frame-render');
  if (!frameRender) return;

  frameRender.className = 'artwork-frame-render';
  if (frameType === 'oak') frameRender.classList.add('frame-oak');
  if (frameType === 'gold') frameRender.classList.add('frame-gold');
  if (frameType === 'black') frameRender.classList.add('frame-black');
  if (frameType === 'none') frameRender.classList.add('frame-none');

  document.querySelectorAll('.frame-style-btn').forEach(btn => {
    btn.classList.toggle('bg-stone-900', btn.dataset.frame === frameType);
    btn.classList.toggle('text-white', btn.dataset.frame === frameType);
  });
}

// -------------------------------------------------------------
// ARTWORK DETAILS MODAL / LIGHTBOX
// -------------------------------------------------------------

function openArtworkModal(id, type) {
  let artwork = null;
  if (type === 'original') {
    artwork = artCatalog.originals.find(a => a.id === id);
    artwork.itemType = 'original';
  } else if (type === 'print') {
    artwork = artCatalog.prints.find(a => a.id === id);
    artwork.itemType = 'print';
  } else {
    artwork = artCatalog.bookmarks.find(a => a.id === id);
    artwork.itemType = 'bookmark';
  }

  if (!artwork) return;
  state.currentModalArtwork = artwork;
  renderModalDetails(artwork);

  const modal = document.getElementById('artwork-detail-modal');
  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
  }
}

function closeArtworkModal() {
  const modal = document.getElementById('artwork-detail-modal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
  state.currentModalArtwork = null;
}

let selectedModalSize = 'A4 (21 x 30 cm)';
let selectedModalPriceGBP = 28;

function renderModalDetails(art) {
  const container = document.getElementById('modal-artwork-body');
  if (!container) return;

  let pricingBlock = '';
  let optionsBlock = '';

  if (art.itemType === 'print') {
    const sizeKeys = Object.keys(art.sizes);
    selectedModalSize = sizeKeys[1] || sizeKeys[0];
    selectedModalPriceGBP = art.sizes[selectedModalSize];

    pricingBlock = `
      <div class="mb-3">
        <span class="text-[10px] uppercase tracking-widest text-[#8FA387] font-semibold">Fine Art Archival Print</span>
        <div class="flex items-baseline gap-2 mt-0.5">
          <span id="modal-calculated-price" class="font-serif text-2xl sm:text-3xl font-semibold text-stone-900">${formatPrice(selectedModalPriceGBP)}</span>
          <span class="text-[11px] text-stone-500 font-sans">Inclusive of VAT</span>
        </div>
      </div>
    `;

    optionsBlock = `
      <div class="space-y-3 mb-5">
        <div>
          <label class="text-[10px] font-semibold uppercase tracking-wider text-stone-700 block mb-1.5">Select Archival Size</label>
          <div class="grid grid-cols-2 gap-1.5" id="modal-size-selector">
            ${sizeKeys.map((sizeStr) => {
              const price = art.sizes[sizeStr];
              const isSelected = sizeStr === selectedModalSize;
              return `
                <button type="button" onclick="selectModalPrintSize('${sizeStr}', ${price})" 
                        class="modal-size-btn text-left p-2 sm:p-2.5 rounded-xl border ${isSelected ? 'border-stone-900 bg-stone-50 font-semibold' : 'border-stone-200'} hover:border-stone-800 transition-all text-xs"
                        data-size="${sizeStr}" data-price="${price}">
                  <div class="font-medium text-stone-900">${sizeStr}</div>
                  <div class="text-stone-500 mt-0.5 text-[11px]">${formatPrice(price)}</div>
                </button>
              `;
            }).join('')}
          </div>
        </div>

        <div>
          <label class="text-[10px] font-semibold uppercase tracking-wider text-stone-700 block mb-1.5">Presentation</label>
          <select id="modal-frame-select" class="w-full text-xs p-2.5 rounded-xl border border-stone-200 bg-white font-sans focus:outline-none focus:border-stone-800">
            <option value="Unframed (Archival Flat Pack)">Unframed with Backing Board & Glassine (+£0)</option>
            <option value="Bespoke Solid Oak Frame">Bespoke Solid Oak Frame (+£50)</option>
            <option value="Contemporary Satin Black">Contemporary Satin Black Frame (+£50)</option>
          </select>
        </div>
      </div>
    `;
  } else if (art.itemType === 'original') {
    pricingBlock = `
      <div class="mb-3">
        <span class="text-[10px] uppercase tracking-widest text-[#8FA387] font-semibold">${art.categoryLabel}</span>
        <div class="flex items-baseline gap-2 mt-0.5">
          <span class="font-serif text-2xl sm:text-3xl font-semibold text-stone-900">${formatPrice(art.priceGBP)}</span>
          <span class="text-xs ${art.status === 'available' ? 'text-emerald-700' : 'text-stone-500'} font-semibold font-sans">
            ${art.status === 'available' ? '• 1-of-1 Available' : '• In Private Collection'}
          </span>
        </div>
      </div>
    `;

    optionsBlock = `
      <div class="space-y-3 mb-5">
        <div>
          <label class="text-[10px] font-semibold uppercase tracking-wider text-stone-700 block mb-1.5">Framing Option</label>
          <select id="modal-frame-select" class="w-full text-xs p-2.5 rounded-xl border border-stone-200 bg-white font-sans focus:outline-none focus:border-stone-800">
            ${(art.framingOptions || ['Unframed']).map(opt => `<option value="${opt}">${opt}</option>`).join('')}
          </select>
        </div>
      </div>
    `;
  } else {
    pricingBlock = `
      <div class="mb-3">
        <span class="text-[10px] uppercase tracking-widest text-[#8FA387] font-semibold">${art.typeLabel}</span>
        <div class="flex items-baseline gap-2 mt-0.5">
          <span class="font-serif text-2xl sm:text-3xl font-semibold text-stone-900">${formatPrice(art.priceGBP)}</span>
        </div>
      </div>
    `;
  }

  container.innerHTML = `
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
      <div class="relative rounded-2xl overflow-hidden bg-stone-100 aspect-square max-w-sm mx-auto w-full">
        <img src="${art.image}" alt="${art.title}" class="w-full h-full object-cover" onerror="this.onerror=null;this.src='https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80'">
      </div>

      <div class="flex flex-col">
        ${pricingBlock}

        <h2 class="font-serif text-2xl sm:text-3xl font-medium text-stone-900 mb-1">${art.title}</h2>
        <p class="text-xs text-stone-500 mb-3 font-sans">${art.medium || art.paper || art.material} • ${art.size || ''}</p>

        <p class="text-xs sm:text-sm text-stone-600 leading-relaxed mb-4 font-sans">${art.description || art.details}</p>

        ${optionsBlock}

        <div class="flex gap-2">
          <button onclick="handleModalAddToCart()" class="btn-luxury-primary flex-1 !text-xs">
            <i data-lucide="shopping-bag" class="w-3.5 h-3.5"></i> Add to Bag
          </button>
          
          <button onclick="openRoomSimulator('${art.id}', '${art.itemType}')" class="btn-luxury-outline !text-xs">
            <i data-lucide="layout" class="w-3.5 h-3.5"></i> Wall Preview
          </button>
        </div>
      </div>
    </div>
  `;

  if (window.lucide && lucide.createIcons) { try { lucide.createIcons(); } catch(e){} }
}

function selectModalPrintSize(sizeStr, priceGBP) {
  selectedModalSize = sizeStr;
  selectedModalPriceGBP = priceGBP;

  document.querySelectorAll('.modal-size-btn').forEach(btn => {
    const isThis = btn.dataset.size === sizeStr;
    btn.classList.toggle('border-stone-900', isThis);
    btn.classList.toggle('bg-stone-50', isThis);
    btn.classList.toggle('font-semibold', isThis);
    btn.classList.toggle('border-stone-200', !isThis);
  });

  const priceEl = document.getElementById('modal-calculated-price');
  if (priceEl) {
    priceEl.textContent = formatPrice(priceGBP);
  }
}

function handleModalAddToCart() {
  if (!state.currentModalArtwork) return;
  const art = state.currentModalArtwork;
  const frameEl = document.getElementById('modal-frame-select');
  const selectedFrame = frameEl ? frameEl.value : 'Standard';

  const price = art.itemType === 'print' ? selectedModalPriceGBP : art.priceGBP;
  const size = art.itemType === 'print' ? selectedModalSize : (art.size || 'Standard');

  addToCart({
    id: art.id,
    title: art.title,
    priceGBP: price,
    image: art.image,
    selectedSize: size,
    selectedFrame: selectedFrame,
    type: art.itemType
  });

  closeArtworkModal();
}

// -------------------------------------------------------------
// BESPOKE COMMISSION MODAL & FORM HANDLER
// -------------------------------------------------------------

function openCommissionModal(prefillType = '') {
  const modal = document.getElementById('commission-modal');
  const typeSelect = document.getElementById('comm-type-select');
  if (typeSelect && prefillType) {
    typeSelect.value = prefillType;
  }
  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
  }
}

function closeCommissionModal() {
  const modal = document.getElementById('commission-modal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
}

function handleCommissionSubmit(e) {
  e.preventDefault();
  const name = document.getElementById('comm-name').value;
  closeCommissionModal();
  
  const confModal = document.getElementById('commission-success-modal');
  const confName = document.getElementById('conf-client-name');
  if (confName) confName.textContent = name || 'Friend';
  if (confModal) {
    confModal.classList.remove('hidden');
    confModal.classList.add('flex');
  }
  showToast('Inquiry sent! Mishi will review your notes.');
}

function closeCommissionSuccessModal() {
  const modal = document.getElementById('commission-success-modal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
}

// -------------------------------------------------------------
// CHECKOUT SIMULATION MODAL
// -------------------------------------------------------------

function openCheckoutModal() {
  closeCartDrawer();
  const modal = document.getElementById('checkout-modal');
  const totalEl = document.getElementById('checkout-total-val');
  
  const subtotalGBP = state.cart.reduce((sum, item) => sum + (item.priceGBP * item.quantity), 0);
  const discountGBP = subtotalGBP * state.discountPercent;
  const finalGBP = subtotalGBP - discountGBP;

  if (totalEl) totalEl.textContent = formatPrice(finalGBP);

  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
  }
}

function closeCheckoutModal() {
  const modal = document.getElementById('checkout-modal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
}

function handleCheckoutSubmit(e) {
  e.preventDefault();
  closeCheckoutModal();

  state.cart = [];
  saveState();
  renderCartDrawer();

  const successModal = document.getElementById('order-completed-modal');
  if (successModal) {
    successModal.classList.remove('hidden');
    successModal.classList.add('flex');
  }
  showToast('Order confirmed! UK dispatch preparation begun.');
}

function closeOrderCompletedModal() {
  const modal = document.getElementById('order-completed-modal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
}

// -------------------------------------------------------------
// MOBILE MENU DRAWER
// -------------------------------------------------------------

function toggleMobileMenu() {
  const menu = document.getElementById('mobile-menu-drawer');
  const backdrop = document.getElementById('mobile-menu-backdrop');
  if (!menu) return;

  const isOpen = !menu.classList.contains('-translate-x-full');
  if (isOpen) {
    menu.classList.add('-translate-x-full');
    backdrop.classList.add('opacity-0', 'pointer-events-none');
  } else {
    menu.classList.remove('-translate-x-full');
    backdrop.classList.remove('opacity-0', 'pointer-events-none');
  }
}

function toggleMobileAccordion(sectionId) {
  const content = document.getElementById(`mobile-acc-${sectionId}`);
  const icon = document.getElementById(`mobile-icon-${sectionId}`);
  if (!content) return;

  const isExpanded = !content.classList.contains('hidden');
  if (isExpanded) {
    content.classList.add('hidden');
    if (icon) icon.textContent = '+';
  } else {
    content.classList.remove('hidden');
    if (icon) icon.textContent = '−';
  }
}

// -------------------------------------------------------------
// SEARCH MODAL
// -------------------------------------------------------------

function openSearchModal() {
  const modal = document.getElementById('search-modal');
  const input = document.getElementById('search-input');
  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    if (input) {
      input.value = '';
      input.focus();
      handleSearchInput('');
    }
  }
}

function closeSearchModal() {
  const modal = document.getElementById('search-modal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
}

function handleSearchInput(query) {
  const q = query.toLowerCase().trim();
  const resultsContainer = document.getElementById('search-results');
  if (!resultsContainer) return;

  if (!q) {
    resultsContainer.innerHTML = '<p class="text-xs text-stone-400 py-4 text-center">Type to search originals, prints, bookmarks...</p>';
    return;
  }

  const matchesOriginals = artCatalog.originals.filter(a => a.title.toLowerCase().includes(q) || a.medium.toLowerCase().includes(q) || a.categoryLabel.toLowerCase().includes(q));
  const matchesPrints = artCatalog.prints.filter(a => a.title.toLowerCase().includes(q) || a.categoryLabel.toLowerCase().includes(q) || a.description.toLowerCase().includes(q));
  const matchesBookmarks = artCatalog.bookmarks.filter(a => a.title.toLowerCase().includes(q) || a.typeLabel.toLowerCase().includes(q));

  const all = [
    ...matchesOriginals.map(m => ({ ...m, kind: 'original' })),
    ...matchesPrints.map(m => ({ ...m, kind: 'print' })),
    ...matchesBookmarks.map(m => ({ ...m, kind: 'bookmark' }))
  ];

  if (all.length === 0) {
    resultsContainer.innerHTML = `<p class="text-xs text-stone-500 py-6 text-center">No results for "${query}".</p>`;
    return;
  }

  resultsContainer.innerHTML = all.map(item => `
    <div onclick="closeSearchModal(); openArtworkModal('${item.id}', '${item.kind}')" 
         class="flex items-center gap-3 p-2.5 rounded-xl hover:bg-stone-100 cursor-pointer transition-all border-b border-stone-100">
      <img src="${item.image}" alt="${item.title}" class="w-10 h-12 object-cover rounded-lg">
      <div class="flex-1">
        <h4 class="font-serif text-sm font-medium text-stone-900">${item.title}</h4>
        <span class="text-[10px] text-[#8FA387] font-semibold uppercase">${item.categoryLabel || item.typeLabel}</span>
      </div>
      <span class="font-serif text-sm font-semibold text-stone-800">${formatPrice(item.priceGBP || item.basePriceGBP)}</span>
    </div>
  `).join('');
}

// -------------------------------------------------------------
// FILTER CONTROLLERS & NAVIGATION
// -------------------------------------------------------------

function setOriginalFilter(cat) {
  state.activeOriginalFilter = cat;
  document.querySelectorAll('#original-filter-tabs .filter-tab').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.filter === cat);
  });
  renderOriginals();
}

function setPrintFilter(cat) {
  state.activePrintFilter = cat;
  document.querySelectorAll('#print-filter-tabs .filter-tab').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.filter === cat);
  });
  renderPrints();
}

function setBookmarkFilter(cat) {
  state.activeBookmarkFilter = cat;
  document.querySelectorAll('#bookmark-filter-tabs .filter-tab').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.filter === cat);
  });
  renderBookmarks();
}

function scrollToSection(id) {
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth' });
  }
}

function openArtCareModal() {
  const modal = document.getElementById('art-care-modal');
  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
  }
}

function closeArtCareModal() {
  const modal = document.getElementById('art-care-modal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
}

function handleNewsletter(e) {
  e.preventDefault();
  const email = document.getElementById('newsletter-email').value;
  if (email) {
    showToast('Welcome to the Collector’s Circle! Code: MISHI10');
    document.getElementById('newsletter-email').value = '';
  }
}

// -------------------------------------------------------------
// INITIALIZATION
// -------------------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {
  const savedCurrency = localStorage.getItem('mishi_currency');
  if (savedCurrency && currencyRates[savedCurrency]) {
    setCurrency(savedCurrency);
  } else {
    renderOriginals();
    renderPrints();
    renderBookmarks();
    renderCommissions();
    renderReviews();
    renderInstagram();
    updateCartBadge();
    updateWishlistBadge();
  }
  if (window.lucide && lucide.createIcons) { try { lucide.createIcons(); } catch(e){} }
});
