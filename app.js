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
        precargarImagenes();
    } catch (error) {
        console.error("Error cargando el menú:", error);
    }
}

function precargarImagenes() {
    // Deduplica URLs y las precarga en segundo plano sin bloquear nada
    const urls = [...new Set(menuData.map(p => p.imagen).filter(Boolean))];
    urls.forEach(url => {
        const img = new Image();
        img.src = url;
    });
}

// ─────────────────────────────────────────────
// Render de categoría
// ─────────────────────────────────────────────
const renderMenu = (categoria) => {
    menuGrid.innerHTML = "";
    sectionTitle.innerText = `${categoria}`;

    const searchInput  = document.getElementById('search-input');
    const clearBtn     = document.getElementById('clear-search');
    const resultsCount = document.getElementById('search-results-count');
    const noResults    = document.getElementById('no-results');
    
    // Resetear buscador visualmente al cambiar categoría
    if (searchInput)   searchInput.value = '';
    if (clearBtn)      clearBtn.style.display = 'none';
    if (resultsCount)  resultsCount.style.display = 'none';
    if (noResults)     noResults.classList.add('hidden');

    const productoDestacado = menuData.find(p =>
        p.categoria.toLowerCase() === categoria.toLowerCase() && p.destacado
    );

    if (productoDestacado) {
        featuredSection.style.display = "grid";
        
        const featuredImg = document.getElementById('featured-img');
        featuredImg.src = productoDestacado.imagen;
        // Asignar evento al destacado también
        featuredImg.onclick = () => window.openModal(productoDestacado.imagen); 
        
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

    const fragment = document.createDocumentFragment();

    productosFiltrados.forEach(producto => {
        const card = document.createElement('div');
        card.setAttribute('data-name', producto.nombre);
        card.setAttribute('data-desc', producto.descripcion);
        card.className = "group bg-white p-4 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl hover:border-mqb-blue/20 transition-all duration-500";
        
        card.innerHTML = `
            <div class="aspect-video rounded-[2rem] overflow-hidden bg-gray-100 mb-6 cursor-pointer" onclick="openModal('${producto.imagen}')">
                <img src="${producto.imagen}" alt="${producto.nombre}" loading="lazy" decoding="async" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700">
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
};

// ─────────────────────────────────────────────
// Activa visualmente un botón
// ─────────────────────────────────────────────
let botonActivo = null;

function activarBoton(btn) {
    // Solo toca 2 elementos: el anterior y el nuevo
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
        const rect         = toggle.getBoundingClientRect();
        const isMobile     = window.innerWidth < 768;
        const dropdownW    = 220; 
        const margin       = 12;  

        // Posición vertical
        dropdown.style.top = (rect.bottom + 8) + 'px';

        if (isMobile) {
            let left = rect.right - dropdownW;
            if (left < margin) left = margin;
            if (left + dropdownW > window.innerWidth - margin) {
                left = window.innerWidth - dropdownW - margin;
            }
            dropdown.style.left  = left + 'px';
            dropdown.style.right = 'auto';
        } else {
            let left = rect.left;
            if (left + dropdownW > window.innerWidth - margin) {
                left = window.innerWidth - dropdownW - margin;
            }
            dropdown.style.left  = left + 'px';
            dropdown.style.right = 'auto';
        }

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
    // Botones principales
    document.querySelectorAll('#category-nav .category-btn:not(.sub-btn)').forEach(btn => {
        if (btn.id === 'bebidas-toggle') return;

        btn.addEventListener('click', () => {
            activarBoton(btn);
            const categoria = btn.innerText.trim();
            renderMenu(categoria);
            // Scroll eliminado aquí
        });
    });

    // Sub-botones del dropdown
    document.querySelectorAll('#bebidas-dropdown .sub-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            closeBebidasDropdown();   
            activarBoton(btn);
            const categoria = btn.innerText.trim();
            renderMenu(categoria);
            // Scroll eliminado aquí
        });
    });
}

// ─────────────────────────────────────────────
// Lógica del Modal de Imágenes
// ─────────────────────────────────────────────
const modal = document.getElementById('image-modal');
const modalImg = document.getElementById('modal-img');
const modalContainer = document.getElementById('modal-container');

window.openModal = (src) => {
    if (!modal || !modalImg) return;
    
    modalImg.src = src;
    modal.classList.remove('hidden');
    modal.classList.add('flex'); 
    
    setTimeout(() => {
        modal.classList.remove('opacity-0');
        modalContainer.classList.remove('scale-95');
        modalContainer.classList.add('scale-100');
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
        modalImg.src = '';
        document.body.style.overflow = ''; 
    }, 300); 
};

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
        window.closeModal();
    }
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
