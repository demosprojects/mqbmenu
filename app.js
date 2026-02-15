let menuData = [];

const menuGrid        = document.getElementById('products-grid');
const sectionTitle    = document.getElementById('section-title');
const featuredSection = document.getElementById('featured-section');

// ─────────────────────────────────────────────
// Carga de datos
// ─────────────────────────────────────────────
async function cargarDatos() {
    try {
        const response = await fetch('menu.json');
        menuData = await response.json();
        renderMenu("Burgers");
    } catch (error) {
        console.error("Error cargando el menú:", error);
    }
}

// ─────────────────────────────────────────────
// Render de categoría
// ─────────────────────────────────────────────
const renderMenu = (categoria) => {
    menuGrid.innerHTML = "";
    sectionTitle.innerText = `Nuestras ${categoria}`;

    const searchInput  = document.getElementById('search-input');
    const clearBtn     = document.getElementById('clear-search');
    const resultsCount = document.getElementById('search-results-count');
    const noResults    = document.getElementById('no-results');
    if (searchInput)   searchInput.value = '';
    if (clearBtn)      clearBtn.style.display = 'none';
    if (resultsCount)  resultsCount.style.display = 'none';
    if (noResults)     noResults.classList.add('hidden');

    const productoDestacado = menuData.find(p =>
        p.categoria.toLowerCase() === categoria.toLowerCase() && p.destacado
    );

    if (productoDestacado) {
        featuredSection.style.display = "grid";
        document.getElementById('featured-img').src         = productoDestacado.imagen;
        document.getElementById('featured-title').innerText = productoDestacado.nombre;
        document.getElementById('featured-desc').innerText  = productoDestacado.descripcion;
        document.getElementById('featured-price').innerText = `$${productoDestacado.precio.toLocaleString('es-AR')}`;
        document.getElementById('featured-badge').innerText = productoDestacado.etiqueta || "Destacado";
    } else {
        featuredSection.style.display = "none";
    }

    const productosFiltrados = menuData.filter(p =>
        p.categoria.toLowerCase() === categoria.toLowerCase() && !p.destacado
    );

    if (productosFiltrados.length === 0 && !productoDestacado) {
        menuGrid.innerHTML = `<p class="col-span-full text-center text-gray-400 py-20 italic font-light">Próximamente más opciones en esta categoría...</p>`;
        return;
    }

    productosFiltrados.forEach(producto => {
        const card = document.createElement('div');
        card.setAttribute('data-name', producto.nombre);
        card.setAttribute('data-desc', producto.descripcion);
        card.className = "group bg-white p-4 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl hover:border-mqb-blue/20 transition-all duration-500 animate-fade-in";
        card.innerHTML = `
            <div class="aspect-video rounded-[2rem] overflow-hidden bg-gray-100 mb-6">
                <img src="${producto.imagen}" alt="${producto.nombre}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700">
            </div>
            <div class="px-2 space-y-4">
                <div class="flex justify-between items-start">
                    <h4 data-card-title class="font-impact text-2xl uppercase italic text-mqb-blue">${producto.nombre}</h4>
                    <span class="font-impact text-2xl">$${producto.precio.toLocaleString('es-AR')}</span>
                </div>
                <p data-card-desc class="text-sm text-gray-400 leading-snug">${producto.descripcion}</p>
                <div class="pt-2 border-t border-gray-50 flex justify-between items-center">
                    <span class="text-[10px] font-black uppercase text-gray-300 tracking-widest italic">Mas que Burger's</span>
                    <i class="fa-solid fa-burger text-gray-100 text-xl"></i>
                </div>
            </div>
        `;
        menuGrid.appendChild(card);
    });
};

// ─────────────────────────────────────────────
// Activa visualmente un botón
// ─────────────────────────────────────────────
function activarBoton(btn) {
    const toggle = document.getElementById('bebidas-toggle');

    // Limpiar active en todos EXCEPTO el toggle de bebidas (nunca se activa)
    document.querySelectorAll('.category-btn').forEach(b => {
        if (b.id === 'bebidas-toggle') return;
        b.classList.remove('active');
        b.classList.add('bg-gray-50/50', 'text-gray-400', 'border-transparent');
    });

    btn.classList.add('active');
    btn.classList.remove('bg-gray-50/50', 'text-gray-400', 'border-transparent');

    // Si sub-btn activo: toggle con borde verde. Si categoría principal: resetear toggle.
    if (btn.classList.contains('sub-btn')) {
        toggle.style.outline       = '2px solid #014926';
        toggle.style.outlineOffset = '2px';
        toggle.style.color         = '#014926';
    } else {
        toggle.style.outline       = '';
        toggle.style.outlineOffset = '';
        toggle.style.color         = '';
    }
}

// ─────────────────────────────────────────────
// Dropdown Bebidas con posicionamiento fixed
// El dropdown está fuera del nav (evita overflow-x-auto que lo cortaba)
// ─────────────────────────────────────────────
function initDropdown() {
    const toggle   = document.getElementById('bebidas-toggle');
    const dropdown = document.getElementById('bebidas-dropdown');
    const chevron  = document.getElementById('bebidas-chevron');

    if (!toggle || !dropdown) return;

    let isOpen = false;

    function openDropdown() {
        // Calcular posición en pantalla del botón toggle
        const rect = toggle.getBoundingClientRect();
        dropdown.style.top  = (rect.bottom + 8) + 'px';
        dropdown.style.left = rect.left + 'px';

        dropdown.classList.remove('hidden');
        dropdown.style.display = 'flex';
        chevron.style.transform = 'rotate(180deg)';
        isOpen = true;
    }

    function closeDropdown() {
        dropdown.classList.add('hidden');
        dropdown.style.display = 'none';
        chevron.style.transform = 'rotate(0deg)';
        isOpen = false;
    }

    toggle.addEventListener('click', (e) => {
        e.stopPropagation();
        isOpen ? closeDropdown() : openDropdown();
    });

    // Cerrar al hacer click fuera
    document.addEventListener('click', (e) => {
        if (!dropdown.contains(e.target) && e.target !== toggle) {
            closeDropdown();
        }
    });

    // Reposicionar si cambia el tamaño de pantalla
    window.addEventListener('resize', () => {
        if (isOpen) openDropdown();
    });
}

// ─────────────────────────────────────────────
// Listeners de categorías
// ─────────────────────────────────────────────
function initCategoryButtons() {
    // Botones principales del nav (los directos, no sub-btn)
    document.querySelectorAll('#category-nav .category-btn:not(.sub-btn)').forEach(btn => {
        // Excluir el toggle de bebidas (tiene su propia lógica)
        if (btn.id === 'bebidas-toggle') return;

        btn.addEventListener('click', () => {
            activarBoton(btn);
            const categoria = btn.innerText.trim();
            renderMenu(categoria);
            scrollToMenu();
        });
    });

    // Sub-botones del dropdown
    document.querySelectorAll('#bebidas-dropdown .sub-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            activarBoton(btn);
            const categoria = btn.innerText.trim();
            renderMenu(categoria);
            scrollToMenu();
        });
    });
}

function scrollToMenu() {
    const menuSection = document.getElementById('menu-section');
    if (menuSection) {
        window.scrollTo({ top: menuSection.offsetTop - 100, behavior: 'smooth' });
    }
}

// ─────────────────────────────────────────────
// Init
// ─────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    initDropdown();
    initCategoryButtons();
    cargarDatos();
});