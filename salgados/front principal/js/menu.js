// Menu Module
const Menu = {
    // Menu items data
    items: [
        // SALGADOS FRITOS
        { id: 1, name: 'Bolinha de queijo', price: 110.00, category: 'salgados', description: 'Deliciosas bolinhas de queijo douradas' },
        { id: 2, name: 'Coxinha frango', price: 110.00, category: 'salgados', description: 'Coxinha tradicional de frango' },
        { id: 3, name: 'Coxinha brócolis/queijo', price: 110.00, category: 'salgados', description: 'Coxinha especial de brócolis com queijo' },
        { id: 4, name: 'Bombinha calabresa/queijo', price: 110.00, category: 'salgados', description: 'Bombinha recheada com calabresa e queijo' },
        { id: 5, name: 'Enroladinho de salsicha', price: 110.00, category: 'salgados', description: 'Massa crocante envolvendo salsicha' },
        { id: 6, name: 'Croquetes', price: 110.00, category: 'salgados', description: 'Croquetes dourados e crocantes' },
        { id: 7, name: 'Pastel simples (gado/frango/queijo)', price: 100.00, category: 'salgados', description: 'Pastel tradicional com recheios variados' },
        { id: 8, name: 'Travesseirinho de gado', price: 110.00, category: 'salgados', description: 'Travesseirinho recheado com carne' },
        { id: 9, name: 'Risoles de gado', price: 120.00, category: 'salgados', description: 'Risoles cremosos de carne' },
        { id: 10, name: 'Risoles frango', price: 120.00, category: 'salgados', description: 'Risoles cremosos de frango' },
        
        // SORTIDOS
        { id: 11, name: 'Barquetes (legumes ou frango)', price: 180.00, category: 'sortidos', description: 'Barquetes delicados com recheios especiais' },
        { id: 12, name: 'Canudinhos (legumes ou frango)', price: 120.00, category: 'sortidos', description: 'Canudinhos crocantes com recheio saboroso' },
        { id: 13, name: 'Torradinhas', price: 170.00, category: 'sortidos', description: 'Torradinhas douradas e temperadas' },
        { id: 14, name: 'Espetinho', price: 180.00, category: 'sortidos', description: 'Espetinhos variados para petiscar' },
        { id: 15, name: 'Mini Pizza', price: 160.00, category: 'sortidos', description: 'Mini pizzas com coberturas diversas' },
        { id: 16, name: 'Mini Sanduíches', price: 160.00, category: 'sortidos', description: 'Mini sanduíches perfeitos para festas' },
        
        // ASSADOS
        { id: 17, name: 'Presunto e Queijo', price: 160.00, category: 'assados', description: 'Salgado assado com presunto e queijo' },
        { id: 18, name: 'Gado', price: 160.00, category: 'assados', description: 'Salgado assado com recheio de carne' },
        { id: 19, name: 'Frango', price: 160.00, category: 'assados', description: 'Salgado assado com recheio de frango' },
        { id: 20, name: 'Legumes', price: 160.00, category: 'assados', description: 'Salgado assado com mix de legumes' },
        { id: 21, name: 'Brócolis c/ Ricota', price: 160.00, category: 'assados', description: 'Salgado assado com brócolis e ricota' },
        { id: 22, name: 'Palmito', price: 160.00, category: 'assados', description: 'Salgado assado com palmito' },
        
        // ESPECIAIS
        { id: 23, name: 'Mini Cachorro Quente', price: 220.00, category: 'especiais', description: 'Mini hot dogs completos' },
        { id: 24, name: 'Mini Hambúrguer', price: 220.00, category: 'especiais', description: 'Mini hambúrgueres gourmet' },
        { id: 25, name: 'Empadinhas', price: 200.00, category: 'especiais', description: 'Empadinhas tradicionais com recheios variados' },
        
        // OPCIONAIS
        { id: 26, name: 'Batata Frita (Porção)', price: 6.50, category: 'opcionais', description: 'Porção de batata frita sequinha', isPortioned: true }
    ],

    currentFilter: 'todos',
    currentItem: null,

    // Initialize menu
    init: () => {
        // Load product overrides
        Menu.loadProductOverrides();
        Menu.loadMenuItems();
        Menu.setupQuantityModal();
    },

    // Load product overrides from admin
    loadProductOverrides: () => {
        const productOverrides = Utils.storage.get('defaultProductOverrides') || {};
        Menu.items.forEach(item => {
            if (productOverrides[item.id]) {
                // Apply all overrides
                Object.assign(item, productOverrides[item.id]);
            }
        });
    },

    // Load menu items
    loadMenuItems: () => {
        const menuItemsEl = document.getElementById('menu-items');
        if (!menuItemsEl) return;

        // Get custom items from localStorage
        const customItems = Utils.storage.get('customMenuItems') || [];
        const allItems = [...Menu.items, ...customItems];

        // Filter items
        const filteredItems = Menu.currentFilter === 'todos' 
            ? allItems 
            : allItems.filter(item => item.category === Menu.currentFilter);

        if (filteredItems.length === 0) {
            menuItemsEl.innerHTML = `
                <div class="menu-empty">
                    <h3>Nenhum item encontrado</h3>
                    <p>Não há itens nesta categoria no momento.</p>
                </div>
            `;
            return;
        }

        menuItemsEl.innerHTML = filteredItems.map(item => `
            <div class="menu-item" onclick="Menu.selectItem(${item.id})">
                <h3>${item.name}</h3>
                <div class="price">
                    ${item.isPortioned ? Utils.formatCurrency(item.price) : Utils.formatCurrency(item.price) + ' / cento'}
                </div>
                <div class="category">${Menu.getCategoryName(item.category)}</div>
                ${item.description ? `<div class="description">${item.description}</div>` : ''}
            </div>
        `).join('');
    },

    // Get category display name
    getCategoryName: (category) => {
        const names = {
            'salgados': 'Salgados Fritos',
            'sortidos': 'Sortidos',
            'assados': 'Assados',
            'especiais': 'Especiais',
            'opcionais': 'Opcionais'
        };
        return names[category] || category;
    },

    // Filter menu
    filterMenu: (category) => {
        Menu.currentFilter = category;
        
        // Update active button
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        event.target.classList.add('active');
        
        Menu.loadMenuItems();
    },

    // Select menu item
    selectItem: (itemId) => {
        // Check if user is logged in before allowing to add items
        if (!Auth.isLoggedIn()) {
            App.showAuthPages();
            Utils.showMessage('Você precisa fazer login para adicionar itens ao carrinho!', 'error');
            return;
        }

        const customItems = Utils.storage.get('customMenuItems') || [];
        const allItems = [...Menu.items, ...customItems];
        
        Menu.currentItem = allItems.find(item => item.id === itemId);
        
        if (Menu.currentItem) {
            if (Menu.currentItem.isPortioned) {
                // For portioned items, add directly to cart
                Cart.addItem({
                    ...Menu.currentItem,
                    quantityType: 'porção',
                    unitCount: 1,
                    totalPrice: Menu.currentItem.price
                });
                Utils.showMessage(`${Menu.currentItem.name} adicionado ao carrinho!`);
            } else {
                Menu.showQuantityModal();
            }
        }
    },

    // Show quantity selection modal
    showQuantityModal: () => {
        if (!Menu.currentItem) return;

        const modal = document.getElementById('quantity-modal');
        const itemName = document.getElementById('modal-item-name');
        const priceCento = document.getElementById('price-cento');
        const priceMeioCento = document.getElementById('price-meio-cento');
        const priceUnidade = document.getElementById('price-unidade');
        const unitQuantity = document.getElementById('unit-quantity');
        const unitCount = document.getElementById('unit-count');

        // Set item name
        itemName.textContent = Menu.currentItem.name;

        // Set prices
        priceCento.textContent = Utils.formatCurrency(Menu.currentItem.price);
        priceMeioCento.textContent = Utils.formatCurrency(Menu.currentItem.price / 2);
        priceUnidade.textContent = Utils.formatCurrency(Menu.currentItem.price / 100);

        // Reset form
        document.querySelector('input[name="quantity-type"][value="cento"]').checked = true;
        unitCount.value = 10;
        unitQuantity.style.display = 'none';

        // Show modal
        modal.style.display = 'flex';
    },

    // Setup quantity modal events
    setupQuantityModal: () => {
        // Handle quantity type change
        document.querySelectorAll('input[name="quantity-type"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                const unitQuantity = document.getElementById('unit-quantity');
                if (e.target.value === 'unidade') {
                    unitQuantity.style.display = 'block';
                } else {
                    unitQuantity.style.display = 'none';
                }
            });
        });

        // Handle unit count change
        document.getElementById('unit-count').addEventListener('input', (e) => {
            const count = parseInt(e.target.value);
            if (count < 10) {
                e.target.value = 10;
            }
        });
    }
};

// Global functions
function filterMenu(category) {
    Menu.currentFilter = category;
    
    // Update active button
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Find and activate the clicked button
    const activeBtn = Array.from(document.querySelectorAll('.category-btn')).find(btn => 
        btn.textContent.toLowerCase().includes(category) || 
        (category === 'todos' && btn.textContent === 'TODOS')
    );
    if (activeBtn) {
        activeBtn.classList.add('active');
    }
    
    Menu.loadMenuItems();
}

function closeModal() {
    document.getElementById('quantity-modal').style.display = 'none';
    Menu.currentItem = null;
}

function addToCart() {
    if (!Menu.currentItem) return;

    const quantityType = document.querySelector('input[name="quantity-type"]:checked').value;
    const unitCount = parseInt(document.getElementById('unit-count').value) || 10;

    const cartItem = {
        ...Menu.currentItem,
        quantityType: quantityType,
        unitCount: quantityType === 'unidade' ? unitCount : 1,
        totalPrice: Utils.calculateItemPrice(Menu.currentItem.price, quantityType, unitCount)
    };

    Cart.addItem(cartItem);
    closeModal();
    
    const quantityLabel = Utils.getQuantityLabel(quantityType, unitCount);
    Utils.showMessage(`${Menu.currentItem.name} (${quantityLabel}) adicionado ao carrinho!`);
}

// Initialize menu when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('menu-items')) {
        Menu.init();
    }
});