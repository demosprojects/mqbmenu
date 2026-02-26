
let menuData = [];
let categoriaActiva = "";

const menuGrid        = document.getElementById('products-grid');
const sectionTitle    = document.getElementById('section-title');
const featuredSection = document.getElementById('featured-section');

// ─────────────────────────────────────────────
// Carga de datos → render único de TODO el menú
// ─────────────────────────────────────────────
async function cargarDatos() {
    try {
        const response = await fetch('menu.json');
        const dataRaw = await response.json();
        
        // Filtramos para ignorar los que tienen disponible: false
        menuData = dataRaw.filter(producto => producto.disponible !== false);
        
        renderTodo();
        mostrarCategoria("Burgers");
    } catch (error) {
        console.error("Error cargando el menú:", error);
    }
}

// ─────────────────────────────────────────────
// Render ÚNICO de todas las cards
// ─────────────────────────────────────────────
function renderTodo() {
    menuGrid.innerHTML = "";

    const categorias = [...new Set(menuData.map(p => p.categoria))];

    // Featured por categoría
    categorias.forEach(cat => {
        const destacado = menuData.find(p =>
            p.categoria.toLowerCase() === cat.toLowerCase() && p.destacado
        );
        if (!destacado) return;

        const clone = featuredSection.cloneNode(true);
        clone.id = `featured-${slugify(cat)}`;
        clone.style.display = "none";

        clone.querySelector('[id^=featured-img]').id   = `fi-${slugify(cat)}`;
        clone.querySelector('[id^=featured-title]').id = `ft-${slugify(cat)}`;
        clone.querySelector('[id^=featured-desc]').id  = `fd-${slugify(cat)}`;
        clone.querySelector('[id^=featured-price]').id = `fp-${slugify(cat)}`;
        clone.querySelector('[id^=featured-badge]').id = `fb-${slugify(cat)}`;

        const img = clone.querySelector(`#fi-${slugify(cat)}`);
        img.src = imgUrlFeatured(destacado.imagen, cat);
        img.onclick = () => openModal(destacado.imagen, destacado.nombre);

        clone.querySelector(`#ft-${slugify(cat)}`).innerText = destacado.nombre;
        clone.querySelector(`#fd-${slugify(cat)}`).innerText = destacado.descripcion;
        clone.querySelector(`#fp-${slugify(cat)}`).innerText = `$${destacado.precio.toLocaleString('es-AR')}`;
        clone.querySelector(`#fb-${slugify(cat)}`).innerText = destacado.etiqueta || "Destacado";

        featuredSection.parentNode.insertBefore(clone, featuredSection);
    });

    featuredSection.style.display = "none";

    // Cards normales
    const fragment = document.createDocumentFragment();

    menuData.filter(p => !p.destacado).forEach(producto => {
        const cat        = producto.categoria;
        const card       = document.createElement('div');
        const nombreSafe = producto.nombre.replace(/\\/g, '\\\\').replace(/'/g, "\\'");

        card.setAttribute('data-category', cat.toLowerCase());
        card.setAttribute('data-name',     producto.nombre);
        card.setAttribute('data-desc',     producto.descripcion);
        card.style.display = "none";
        card.className = "group bg-white p-4 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl hover:border-mqb-blue/20 transition-all duration-500";

        card.innerHTML = `
            <div class="aspect-video rounded-[2rem] overflow-hidden bg-gray-100 mb-6 cursor-pointer" onclick="openModal('${producto.imagen}', '${nombreSafe}')">
                <img src="${imgUrl(producto.imagen, cat)}" alt="${producto.nombre}" loading="lazy" decoding="async" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700">
            </div>
            <div class="px-2 space-y-4">
                <div class="flex justify-between items-start">
                    <h4 data-card-title class="font-impact text-2xl uppercase italic text-mqb-blue">${producto.nombre}</h4>
                    <span class="font-impact text-2xl">$${producto.precio.toLocaleString('es-AR')}</span>
                </div>
                <p data-card-desc class="text-sm text-gray-700 font-medium leading-snug">${producto.descripcion}</p>
                <div class="pt-2 border-t border-gray-50 flex justify-between items-center">
                    <span class="text-[10px] font-black uppercase text-gray-300 tracking-widest italic">Mas que Burgers</span>
                    <i class="fa-solid fa-burger text-gray-100 text-xl"></i>
                </div>
            </div>
        `;
        fragment.appendChild(card);
    });

    menuGrid.appendChild(fragment);

    // Mensajes "próximamente"
    categorias.forEach(cat => {
        const tieneProductos = menuData.some(p => p.categoria.toLowerCase() === cat.toLowerCase());
        if (tieneProductos) return;

        const msg = document.createElement('p');
        msg.setAttribute('data-empty-cat', cat.toLowerCase());
        msg.className = "col-span-full text-center text-gray-400 py-20 italic font-light";
        msg.style.display = "none";
        msg.innerText = "Próximamente más opciones en esta categoría...";
        menuGrid.appendChild(msg);
    });
}

// ─────────────────────────────────────────────
// Cambio de categoría: show/hide + scroll arriba
// ─────────────────────────────────────────────
function mostrarCategoria(categoria) {
    if (categoriaActiva.toLowerCase() === categoria.toLowerCase()) return;
    categoriaActiva = categoria;

    sectionTitle.innerText = categoria;
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Resetear buscador
    const searchInput  = document.getElementById('search-input');
    const clearBtn     = document.getElementById('clear-search');
    const resultsCount = document.getElementById('search-results-count');
    const noResults    = document.getElementById('no-results');
    if (searchInput)   searchInput.value = '';
    if (clearBtn)      clearBtn.style.display = 'none';
    if (resultsCount)  resultsCount.style.display = 'none';
    if (noResults)     noResults.classList.add('hidden');

    // Featured
    document.querySelectorAll('[id^="featured-"]').forEach(el => {
        el.style.display = el.id === `featured-${slugify(categoria)}` ? "grid" : "none";
    });

    // Cards
    const catLower = categoria.toLowerCase();
    menuGrid.querySelectorAll('[data-category]').forEach(card => {
        card.style.display = card.dataset.category === catLower ? "" : "none";
    });

    // Mensajes vacíos
    menuGrid.querySelectorAll('[data-empty-cat]').forEach(msg => {
        msg.style.display = msg.dataset.emptyCat === catLower ? "" : "none";
    });
}

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
function slugify(str) {
    return str.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

const CATS_SIN_OPTIMIZAR = ['con alcohol', 'sin alcohol', 'agregados'];

function imgUrl(url, categoria) {
    if (!url || !url.includes('res.cloudinary.com')) return url;
    if (CATS_SIN_OPTIMIZAR.includes((categoria || '').toLowerCase())) return url;
    return url.replace('/upload/', '/upload/w_600,q_auto,f_auto/');
}

function imgUrlFeatured(url, categoria) {
    if (!url || !url.includes('res.cloudinary.com')) return url;
    if (CATS_SIN_OPTIMIZAR.includes((categoria || '').toLowerCase())) return url;
    return url.replace('/upload/', '/upload/w_900,q_auto,f_auto/');
}

// ─────────────────────────────────────────────
// Activa visualmente un botón
// ─────────────────────────────────────────────
let botonActivo = null;

function activarBoton(btn) {
    if (botonActivo && botonActivo !== btn) {
        botonActivo.classList.remove('active');
        botonActivo.classList.add('bg-gray-50/50', 'text-gray-400', 'border-transparent');
    }
    btn.classList.add('active');
    btn.classList.remove('bg-gray-50/50', 'text-gray-400', 'border-transparent');
    botonActivo = btn;
}

// ─────────────────────────────────────────────
// Dropdown Bebidas
// ─────────────────────────────────────────────
let closeBebidasDropdown = () => {};

function initDropdown() {
    const toggle   = document.getElementById('bebidas-toggle');
    const dropdown = document.getElementById('bebidas-dropdown');
    const chevron  = document.getElementById('bebidas-chevron');

    if (!toggle || !dropdown) return;

    let isOpen = false;

    function openDropdown() {
        const rect      = toggle.getBoundingClientRect();
        const isMobile  = window.innerWidth < 768;
        const dropdownW = 220;
        const margin    = 12;

        dropdown.style.top = (rect.bottom + 8) + 'px';

        if (isMobile) {
            let left = rect.right - dropdownW;
            if (left < margin) left = margin;
            if (left + dropdownW > window.innerWidth - margin) left = window.innerWidth - dropdownW - margin;
            dropdown.style.left = left + 'px';
        } else {
            let left = rect.left;
            if (left + dropdownW > window.innerWidth - margin) left = window.innerWidth - dropdownW - margin;
            dropdown.style.left = left + 'px';
        }
        dropdown.style.right = 'auto';
        dropdown.classList.remove('hidden');
        dropdown.style.display  = 'flex';
        chevron.style.transform = 'rotate(180deg)';
        isOpen = true;
    }

    function closeDropdown() {
        dropdown.classList.add('hidden');
        dropdown.style.display  = 'none';
        chevron.style.transform = 'rotate(0deg)';
        isOpen = false;
    }

    closeBebidasDropdown = closeDropdown;

    toggle.addEventListener('click', (e) => {
        e.stopPropagation();
        isOpen ? closeDropdown() : openDropdown();
    });

    document.addEventListener('click', (e) => {
        if (!dropdown.contains(e.target) && e.target !== toggle) closeDropdown();
    });

    window.addEventListener('resize', () => {
        if (isOpen) openDropdown();
    });
}

// ─────────────────────────────────────────────
// Listeners de categorías
// ─────────────────────────────────────────────
function initCategoryButtons() {
    document.querySelectorAll('#category-nav .category-btn:not(.sub-btn)').forEach(btn => {
        if (btn.id === 'bebidas-toggle') return;
        btn.addEventListener('click', () => {
            activarBoton(btn);
            mostrarCategoria(btn.innerText.trim());
        });
    });

    document.querySelectorAll('#bebidas-dropdown .sub-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            closeBebidasDropdown();
            activarBoton(btn);
            mostrarCategoria(btn.innerText.trim());
        });
    });
}

// ─────────────────────────────────────────────
// Modal con zoom
// ─────────────────────────────────────────────
const modal          = document.getElementById('image-modal');
const modalImg       = document.getElementById('modal-img');
const modalContainer = document.getElementById('modal-container');

let zoomLevel   = 1;
const ZOOM_MIN  = 1;
const ZOOM_MAX  = 4;
const ZOOM_STEP = 0.5;

function applyZoom() {
    if (!modalImg) return;
    modalImg.style.transform  = `scale(${zoomLevel})`;
    modalImg.style.cursor     = zoomLevel > 1 ? 'grab' : 'default';
    const valueEl = document.getElementById('modal-zoom-value');
    const outBtn  = document.getElementById('modal-zoom-out');
    const inBtn   = document.getElementById('modal-zoom-in');
    if (valueEl) valueEl.innerText    = Math.round(zoomLevel * 100) + '%';
    if (outBtn)  outBtn.style.opacity = zoomLevel <= ZOOM_MIN ? '0.3' : '1';
    if (inBtn)   inBtn.style.opacity  = zoomLevel >= ZOOM_MAX ? '0.3' : '1';
}

window.openModal = (src, nombre) => {
    if (!modal || !modalImg) return;
    zoomLevel = 1;
    modalImg.src = src;
    modalImg.style.transform = 'scale(1)';
    const nameEl = document.getElementById('modal-product-name');
    if (nameEl) nameEl.innerText = nombre || '';
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    setTimeout(() => {
        modal.classList.remove('opacity-0');
        modalContainer.classList.remove('scale-95');
        modalContainer.classList.add('scale-100');
        applyZoom();
    }, 10);
    document.body.style.overflow = 'hidden';
};

window.closeModal = () => {
    if (!modal) return;
    modal.classList.add('opacity-0');
    modalContainer.classList.remove('scale-100');
    modalContainer.classList.add('scale-95');
    setTimeout(() => {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
        if (modalImg) modalImg.src = '';
        zoomLevel = 1;
        document.body.style.overflow = '';
    }, 300);
};

window.zoomIn = () => {
    if (zoomLevel < ZOOM_MAX) {
        zoomLevel = Math.min(ZOOM_MAX, zoomLevel + ZOOM_STEP);
        applyZoom();
    }
};

window.zoomOut = () => {
    if (zoomLevel > ZOOM_MIN) {
        zoomLevel = Math.max(ZOOM_MIN, zoomLevel - ZOOM_STEP);
        applyZoom();
    }
};

// Zoom con scroll de mouse
if (modal) {
    modal.addEventListener('wheel', (e) => {
        if (modal.classList.contains('hidden')) return;
        e.preventDefault();
        e.deltaY < 0 ? window.zoomIn() : window.zoomOut();
    }, { passive: false });
}

// Pinch-to-zoom mobile
let lastPinchDist = null;

if (modal) {
    modal.addEventListener('touchmove', (e) => {
        if (e.touches.length !== 2) return;
        e.preventDefault();
        const dx   = e.touches[0].clientX - e.touches[1].clientX;
        const dy   = e.touches[0].clientY - e.touches[1].clientY;
        const dist = Math.hypot(dx, dy);
        if (lastPinchDist !== null) {
            const delta = dist - lastPinchDist;
            if (Math.abs(delta) > 5) {
                zoomLevel = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, zoomLevel + (delta > 0 ? ZOOM_STEP : -ZOOM_STEP)));
                applyZoom();
            }
        }
        lastPinchDist = dist;
    }, { passive: false });

    modal.addEventListener('touchend', () => { lastPinchDist = null; });
}

// Cerrar con Escape
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal && !modal.classList.contains('hidden')) window.closeModal();
});

// ─────────────────────────────────────────────
// Init
// ─────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    botonActivo = document.querySelector('.category-btn.active') || null;
    initDropdown();
    initCategoryButtons();
    cargarDatos();
});
