// Módulo do Carrinho
const Cart = {
    items: [],
    deliveryFee: 10.00,
    selectedAddress: null,

    // Inicializar carrinho
    init: () => {
        Cart.loadCart();
        Cart.updateCartCount();
        Cart.setupDeliveryOptions();
    },

    // Carregar carrinho do localStorage
    loadCart: () => {
        Cart.items = Utils.storage.get('cart') || [];
        Cart.renderCart();
        Cart.updateCartCount();
        Cart.updateCartSummary();
    },

    // Salvar carrinho no localStorage
    saveCart: () => {
        Utils.storage.set('cart', Cart.items);
        Cart.updateCartCount();
    },

    // Adicionar item ao carrinho
    addItem: (item) => {
        // Verificar se o item já existe no carrinho
        const existingItemIndex = Cart.items.findIndex(cartItem => 
            cartItem.id === item.id && 
            cartItem.quantityType === item.quantityType &&
            cartItem.unitCount === item.unitCount
        );

        if (existingItemIndex >= 0) {
            // Atualizar quantidade
            Cart.items[existingItemIndex].quantity = (Cart.items[existingItemIndex].quantity || 1) + 1;
            Cart.items[existingItemIndex].totalPrice = Cart.items[existingItemIndex].totalPrice + item.totalPrice;
        } else {
            // Adicionar novo item
            Cart.items.push({
                ...item,
                cartId: Utils.generateId(),
                quantity: 1,
                addedAt: new Date().toISOString()
            });
        }

        Cart.saveCart();
        Cart.renderCart();
        Cart.updateCartSummary();
    },

    // Remover item do carrinho
    removeItem: (cartId) => {
        Cart.items = Cart.items.filter(item => item.cartId !== cartId);
        Cart.saveCart();
        Cart.renderCart();
        Cart.updateCartSummary();
        Utils.showMessage('Item removido do carrinho!');
    },

    // Atualizar quantidade do item
    updateQuantity: (cartId, change) => {
        const item = Cart.items.find(item => item.cartId === cartId);
        if (!item) return;

        const newQuantity = (item.quantity || 1) + change;
        
        if (newQuantity <= 0) {
            Cart.removeItem(cartId);
            return;
        }

        // Calcular preço base por unidade
        const basePrice = item.totalPrice / (item.quantity || 1);
        
        item.quantity = newQuantity;
        item.totalPrice = basePrice * newQuantity;

        Cart.saveCart();
        Cart.renderCart();
        Cart.updateCartSummary();
    },

    // Atualizar contador do carrinho na navbar
    updateCartCount: () => {
        const cartCountEl = document.getElementById('cart-count');
        if (cartCountEl) {
            const totalItems = Cart.items.reduce((sum, item) => sum + (item.quantity || 1), 0);
            cartCountEl.textContent = totalItems;
            cartCountEl.style.display = totalItems > 0 ? 'flex' : 'none';
        }
    },

    // Renderizar itens do carrinho
    renderCart: () => {
        const cartItemsEl = document.getElementById('cart-items');
        if (!cartItemsEl) return;

        if (Cart.items.length === 0) {
            cartItemsEl.innerHTML = `
                <div class="cart-empty">
                    <h3>Seu carrinho está vazio</h3>
                    <p>Adicione alguns itens deliciosos do nosso cardápio!</p>
                    <button class="btn btn-primary" onclick="showPage('cardapio')">Ver Cardápio</button>
                </div>
            `;
            return;
        }

        cartItemsEl.innerHTML = Cart.items.map(item => `
            <div class="cart-item">
                <div class="cart-item-header">
                    <div class="cart-item-info">
                        <h3>${item.name}</h3>
                        <div class="quantity-type">
                            ${Utils.getQuantityLabel(item.quantityType, item.unitCount)}
                        </div>
                    </div>
                    <div class="cart-item-actions">
                        <div class="quantity-controls">
                            <button class="quantity-btn" onclick="Cart.updateQuantity('${item.cartId}', -1)">-</button>
                            <span class="quantity-display">${item.quantity || 1}</span>
                            <button class="quantity-btn" onclick="Cart.updateQuantity('${item.cartId}', 1)">+</button>
                        </div>
                        <button class="remove-btn" onclick="Cart.removeItem('${item.cartId}')">Remover</button>
                    </div>
                </div>
                <div class="cart-item-details">
                    <div class="unit-price">
                        ${Utils.formatCurrency(item.totalPrice / (item.quantity || 1))} cada
                    </div>
                    <div class="total-price">
                        ${Utils.formatCurrency(item.totalPrice)}
                    </div>
                </div>
            </div>
        `).join('');
    },

    // Configurar opções de entrega
    setupDeliveryOptions: () => {
        const deliveryOptions = document.querySelectorAll('input[name="delivery"]');
        deliveryOptions.forEach(option => {
            option.addEventListener('change', () => {
                Cart.updateCartSummary();
                Cart.toggleAddressSelection();
            });
        });
    },

    // Alternar seleção de endereço
    toggleAddressSelection: () => {
        const isDelivery = document.querySelector('input[name="delivery"]:checked')?.value === 'delivery';
        const addressSelection = document.getElementById('delivery-address-selection');
        
        if (addressSelection) {
            if (isDelivery) {
                addressSelection.style.display = 'block';
                Cart.loadAddressOptions();
            } else {
                addressSelection.style.display = 'none';
                Cart.selectedAddress = null;
            }
        }
    },

    // Carregar opções de endereço
    loadAddressOptions: () => {
        const addressOptionsEl = document.getElementById('address-options');
        if (!addressOptionsEl) return;

        const currentUser = Auth.getCurrentUser();
        if (!currentUser) return;

        // Obter endereço principal do usuário
        const mainAddress = {
            id: 'main',
            name: 'Endereço Principal',
            address: currentUser.address,
            number: currentUser.number,
            complement: currentUser.complement,
            city: currentUser.city
        };

        // Obter endereços adicionais
        const additionalAddresses = Utils.storage.get(`addresses_${currentUser.id}`) || [];
        const allAddresses = [mainAddress, ...additionalAddresses];

        addressOptionsEl.innerHTML = allAddresses.map(address => `
            <label class="radio-label address-option">
                <input type="radio" name="delivery-address" value="${address.id}" ${address.id === 'main' ? 'checked' : ''}>
                <span class="radio-custom"></span>
                <div class="address-info">
                    <strong>${address.name}</strong>
                    <div>${address.address}, ${address.number}${address.complement ? `, ${address.complement}` : ''}</div>
                    <div>${address.city}</div>
                </div>
            </label>
        `).join('');

        // Definir endereço selecionado padrão
        Cart.selectedAddress = mainAddress;

        // Adicionar event listeners
        document.querySelectorAll('input[name="delivery-address"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                const selectedId = e.target.value;
                Cart.selectedAddress = allAddresses.find(addr => addr.id === selectedId);
            });
        });
    },

    // Atualizar resumo do carrinho
    updateCartSummary: () => {
        const subtotalEl = document.getElementById('subtotal');
        const deliveryFeeEl = document.getElementById('delivery-fee');
        const totalEl = document.getElementById('total');
        const continueBtn = document.getElementById('continue-btn');

        if (!subtotalEl) return;

        const subtotal = Cart.items.reduce((sum, item) => sum + item.totalPrice, 0);
        const isDelivery = document.querySelector('input[name="delivery"]:checked')?.value === 'delivery';
        const deliveryFee = isDelivery ? Cart.getDeliveryFee() : 0;
        const total = subtotal + deliveryFee;

        subtotalEl.textContent = Utils.formatCurrency(subtotal);
        deliveryFeeEl.textContent = Utils.formatCurrency(deliveryFee);
        totalEl.textContent = Utils.formatCurrency(total);

        // Habilitar/desabilitar botão continuar
        if (continueBtn) {
            continueBtn.disabled = Cart.items.length === 0;
            continueBtn.style.opacity = Cart.items.length === 0 ? '0.5' : '1';
        }
    },

    // Obter taxa de entrega
    getDeliveryFee: () => {
        const config = Utils.storage.get('appConfig') || {};
        return config.deliveryFee || Cart.deliveryFee;
    },

    // Limpar carrinho
    clearCart: () => {
        Cart.items = [];
        Cart.saveCart();
        Cart.renderCart();
        Cart.updateCartSummary();
    },

    // Obter resumo do pedido
    getOrderSummary: () => {
        const subtotal = Cart.items.reduce((sum, item) => sum + item.totalPrice, 0);
        const isDelivery = document.querySelector('input[name="delivery"]:checked')?.value === 'delivery';
        const deliveryFee = isDelivery ? Cart.getDeliveryFee() : 0;
        const total = subtotal + deliveryFee;
        const paymentMethod = document.querySelector('input[name="payment"]:checked')?.value || 'cash';

        return {
            items: Cart.items,
            subtotal,
            deliveryFee,
            total,
            isDelivery,
            paymentMethod,
            selectedAddress: Cart.selectedAddress,
            itemCount: Cart.items.reduce((sum, item) => sum + (item.quantity || 1), 0)
        };
    }
};

// Funções globais
function showPayment() {
    if (Cart.items.length === 0) {
        Utils.showMessage('Seu carrinho está vazio!', 'error');
        return;
    }
    
    showPage('payment');
}

function finalizeOrder() {
    if (Cart.items.length === 0) {
        Utils.showMessage('Seu carrinho está vazio!', 'error');
        return;
    }

    const currentUser = Auth.getCurrentUser();
    if (!currentUser) {
        Utils.showMessage('Você precisa estar logado para finalizar o pedido!', 'error');
        return;
    }

    const orderSummary = Cart.getOrderSummary();
    
    // Determinar endereço de entrega
    let deliveryAddress = null;
    if (orderSummary.isDelivery && orderSummary.selectedAddress) {
        deliveryAddress = orderSummary.selectedAddress;
    }
    
    // Criar pedido
    const order = {
        id: Utils.generateId(),
        orderNumber: Utils.generateOrderNumber(),
        userId: currentUser.id,
        customer: {
            name: currentUser.name,
            phone: currentUser.phone,
            email: currentUser.email,
            address: deliveryAddress ? deliveryAddress.address : currentUser.address,
            number: deliveryAddress ? deliveryAddress.number : currentUser.number,
            complement: deliveryAddress ? deliveryAddress.complement : currentUser.complement,
            city: deliveryAddress ? deliveryAddress.city : currentUser.city
        },
        items: orderSummary.items,
        subtotal: orderSummary.subtotal,
        deliveryFee: orderSummary.deliveryFee,
        total: orderSummary.total,
        isDelivery: orderSummary.isDelivery,
        paymentMethod: orderSummary.paymentMethod,
        status: 'pending',
        statusHistory: [
            {
                status: 'pending',
                timestamp: new Date().toISOString(),
                description: 'Pedido recebido - Aguardando confirmação'
            }
        ],
        createdAt: new Date().toISOString()
    };

    // Salvar pedido
    const orders = Utils.storage.get('orders') || [];
    orders.push(order);
    Utils.storage.set('orders', orders);

    // Limpar carrinho
    Cart.clearCart();

    // Mostrar mensagem de sucesso
    Utils.showMessage(`Pedido ${order.orderNumber} realizado com sucesso!`);
    
    // Redirecionar para histórico
    setTimeout(() => {
        showPage('historico');
    }, 2000);
}

// Inicializar carrinho quando DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    Cart.init();
});