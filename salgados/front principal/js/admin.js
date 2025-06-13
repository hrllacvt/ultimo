// Módulo Administrativo
const Admin = {
    currentSection: 'pedidos',

    // Inicializar painel administrativo
    init: () => {
        Admin.checkPermissions();
        Admin.loadOrders();
        Admin.loadProducts();
        Admin.loadAdmins();
        Admin.loadConfig();
    },

    // Verificar permissões do administrador e ocultar/mostrar seções
    checkPermissions: () => {
        const admin = Auth.getCurrentAdmin();
        if (!admin) return;

        // Ocultar seções baseado na função
        if (admin.role === 'funcionario') {
            // Funcionário só vê pedidos
            const restrictedSections = ['produtos', 'administradores', 'configuracoes'];
            restrictedSections.forEach(section => {
                const btn = document.querySelector(`.admin-btn[onclick*="${section}"]`);
                if (btn) {
                    btn.style.display = 'none';
                }
                const sectionEl = document.getElementById(`admin-${section}`);
                if (sectionEl) {
                    sectionEl.style.display = 'none';
                }
            });
        }
    },

    // Carregar pedidos para o administrador
    loadOrders: () => {
        const ordersContainer = document.getElementById('admin-orders');
        if (!ordersContainer) return;

        const orders = Utils.storage.get('orders') || [];
        const sortedOrders = orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        if (sortedOrders.length === 0) {
            ordersContainer.innerHTML = `
                <div class="text-center">
                    <h4>Nenhum pedido encontrado</h4>
                    <p>Os pedidos aparecerão aqui quando forem realizados.</p>
                </div>
            `;
            return;
        }

        ordersContainer.innerHTML = sortedOrders.map(order => `
            <div class="admin-order ${order.status}">
                <div class="order-header">
                    <div class="order-id">${order.orderNumber}</div>
                    <div class="order-status ${order.status}">
                        ${Admin.getStatusLabel(order.status)}
                    </div>
                </div>
                
                <div class="order-details">
                    <div class="order-customer">
                        <div class="customer-info">
                            <strong>Cliente:</strong>
                            ${order.customer.name}
                        </div>
                        <div class="customer-info">
                            <strong>Telefone:</strong>
                            ${order.customer.phone}
                        </div>
                        <div class="customer-info">
                            <strong>Entrega:</strong>
                            ${order.isDelivery ? 'Delivery' : 'Retirada'}
                        </div>
                        <div class="customer-info">
                            <strong>Pagamento:</strong>
                            ${Admin.getPaymentLabel(order.paymentMethod)}
                        </div>
                        <div class="customer-info">
                            <strong>Data:</strong>
                            ${Utils.formatDate(order.createdAt)}
                        </div>
                        <div class="customer-info">
                            <strong>Total:</strong>
                            ${Utils.formatCurrency(order.total)}
                        </div>
                    </div>
                    
                    ${order.isDelivery ? `
                        <div class="customer-info">
                            <strong>Endereço:</strong>
                            ${order.customer.address}, ${order.customer.number}
                            ${order.customer.complement ? `, ${order.customer.complement}` : ''}
                            - ${order.customer.city}
                        </div>
                    ` : ''}
                    
                    <div class="order-items">
                        <strong>Itens:</strong>
                        ${order.items.map(item => `
                            <div class="order-item">
                                <span>
                                    ${item.quantity}x ${item.name}
                                    (${Utils.getQuantityLabel(item.quantityType, item.unitCount)})
                                </span>
                                <span>${Utils.formatCurrency(item.totalPrice)}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div class="order-actions">
                    ${order.status === 'pending' ? `
                        <button class="btn btn-success" onclick="Admin.updateOrderStatus('${order.id}', 'confirmed')">
                            Confirmar
                        </button>
                        <button class="btn btn-danger" onclick="Admin.showRejectModal('${order.id}')">
                            Recusar
                        </button>
                    ` : ''}
                    
                    ${order.status === 'confirmed' ? `
                        <button class="btn btn-primary" onclick="Admin.updateOrderStatus('${order.id}', 'ready')">
                            Pronto
                        </button>
                    ` : ''}
                    
                    ${order.status === 'ready' ? `
                        <button class="btn btn-success" onclick="Admin.updateOrderStatus('${order.id}', 'delivered')">
                            Entregue
                        </button>
                    ` : ''}
                    
                    ${order.status === 'rejected' && order.rejectionReason ? `
                        <div class="rejection-reason">
                            <strong>Motivo da recusa:</strong> ${order.rejectionReason}
                        </div>
                    ` : ''}
                </div>
            </div>
        `).join('');
    },

    // Obter rótulo do status
    getStatusLabel: (status) => {
        const labels = {
            'pending': 'Aguardando Confirmação',
            'confirmed': 'Em Preparação',
            'ready': 'Pronto',
            'delivered': 'Entregue',
            'rejected': 'Recusado'
        };
        return labels[status] || status;
    },

    // Obter rótulo do pagamento
    getPaymentLabel: (method) => {
        const labels = {
            'cash': 'Dinheiro',
            'card': 'Cartão',
            'pix': 'PIX'
        };
        return labels[method] || method;
    },

    // Atualizar status do pedido
    updateOrderStatus: (orderId, newStatus) => {
        const orders = Utils.storage.get('orders') || [];
        const orderIndex = orders.findIndex(order => order.id === orderId);
        
        if (orderIndex >= 0) {
            orders[orderIndex].status = newStatus;
            orders[orderIndex].statusHistory.push({
                status: newStatus,
                timestamp: new Date().toISOString(),
                description: Admin.getStatusLabel(newStatus)
            });
            
            Utils.storage.set('orders', orders);
            Admin.loadOrders();
            Utils.showMessage(`Pedido ${orders[orderIndex].orderNumber} atualizado para: ${Admin.getStatusLabel(newStatus)}`);
        }
    },

    // Mostrar modal de recusa
    showRejectModal: (orderId) => {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Recusar Pedido</h3>
                    <span class="close" onclick="this.closest('.modal').remove()">&times;</span>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label for="rejection-reason">Motivo da recusa:</label>
                        <textarea id="rejection-reason" rows="4" placeholder="Explique o motivo da recusa do pedido..." required></textarea>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">Cancelar</button>
                    <button class="btn btn-danger" onclick="Admin.rejectOrder('${orderId}', document.getElementById('rejection-reason').value, this.closest('.modal'))">Recusar Pedido</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        modal.style.display = 'flex';
    },

    // Recusar pedido
    rejectOrder: (orderId, reason, modal) => {
        if (!reason || reason.trim() === '') {
            Utils.showMessage('Por favor, informe o motivo da recusa!', 'error');
            return;
        }

        const orders = Utils.storage.get('orders') || [];
        const orderIndex = orders.findIndex(order => order.id === orderId);
        
        if (orderIndex >= 0) {
            orders[orderIndex].status = 'rejected';
            orders[orderIndex].rejectionReason = reason.trim();
            orders[orderIndex].statusHistory.push({
                status: 'rejected',
                timestamp: new Date().toISOString(),
                description: `Pedido recusado: ${reason.trim()}`
            });
            
            Utils.storage.set('orders', orders);
            Admin.loadOrders();
            Utils.showMessage(`Pedido ${orders[orderIndex].orderNumber} foi recusado.`);
            modal.remove();
        }
    },

    // Carregar produtos para o administrador
    loadProducts: () => {
        if (!Auth.hasAdminPermission('produtos')) return;
        
        const productsContainer = document.getElementById('admin-products');
        if (!productsContainer) return;

        const customItems = Utils.storage.get('customMenuItems') || [];
        const allItems = [...Menu.items, ...customItems];

        productsContainer.innerHTML = allItems.map(item => `
            <div class="admin-product">
                <div class="product-info">
                    <h4>${item.name}</h4>
                    <div class="product-price">
                        ${item.isPortioned ? Utils.formatCurrency(item.price) : Utils.formatCurrency(item.price) + ' / cento'}
                    </div>
                    <div class="product-category">${Menu.getCategoryName(item.category)}</div>
                    ${item.description ? `<p>${item.description}</p>` : ''}
                </div>
                <div class="product-actions">
                    <button class="btn btn-secondary" onclick="Admin.editProduct(${item.id})">Editar</button>
                    ${item.id > 26 ? `
                        <button class="btn btn-danger" onclick="Admin.deleteProduct(${item.id})">Excluir</button>
                    ` : ''}
                </div>
            </div>
        `).join('');
    },

    // Mostrar modal de adicionar produto
    showAddProduct: () => {
        if (!Auth.hasAdminPermission('produtos')) {
            Utils.showMessage('Você não tem permissão para esta ação!', 'error');
            return;
        }
        
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content admin-modal">
                <div class="modal-header">
                    <h3>Adicionar Produto</h3>
                    <span class="close" onclick="this.closest('.modal').remove()">&times;</span>
                </div>
                <form id="add-product-form">
                    <div class="form-group">
                        <label for="product-name">Nome do Produto</label>
                        <input type="text" id="product-name" name="name" required>
                    </div>
                    <div class="form-group">
                        <label for="product-price">Preço (R$)</label>
                        <input type="number" id="product-price" name="price" step="0.01" min="0" required>
                    </div>
                    <div class="form-group">
                        <label for="product-category">Categoria</label>
                        <select id="product-category" name="category" required>
                            <option value="salgados">Salgados Fritos</option>
                            <option value="sortidos">Sortidos</option>
                            <option value="assados">Assados</option>
                            <option value="especiais">Especiais</option>
                            <option value="opcionais">Opcionais</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="product-description">Descrição</label>
                        <textarea id="product-description" name="description" rows="3"></textarea>
                    </div>
                    <div class="form-group">
                        <label>
                            <input type="checkbox" name="isPortioned"> Item vendido por porção
                        </label>
                    </div>
                    <div class="form-actions">
                        <button type="button" class="btn btn-secondary" onclick="this.closest('.modal').remove()">Cancelar</button>
                        <button type="submit" class="btn btn-primary">Adicionar</button>
                    </div>
                </form>
            </div>
        `;

        document.body.appendChild(modal);
        modal.style.display = 'flex';

        // Manipular envio do formulário
        modal.querySelector('#add-product-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            
            const newProduct = {
                id: Date.now(),
                name: formData.get('name'),
                price: parseFloat(formData.get('price')),
                category: formData.get('category'),
                description: formData.get('description'),
                isPortioned: formData.has('isPortioned')
            };

            const customItems = Utils.storage.get('customMenuItems') || [];
            customItems.push(newProduct);
            Utils.storage.set('customMenuItems', customItems);

            Admin.loadProducts();
            Utils.showMessage('Produto adicionado com sucesso!');
            modal.remove();
        });
    },

    // Editar produto
    editProduct: (productId) => {
        if (!Auth.hasAdminPermission('produtos')) {
            Utils.showMessage('Você não tem permissão para esta ação!', 'error');
            return;
        }
        
        // Encontrar produto nos itens padrão e customizados
        let product = Menu.items.find(item => item.id === productId);
        let isCustomProduct = false;
        
        if (!product) {
            const customItems = Utils.storage.get('customMenuItems') || [];
            product = customItems.find(item => item.id === productId);
            isCustomProduct = true;
        }
        
        if (!product) return;

        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content admin-modal">
                <div class="modal-header">
                    <h3>Editar Produto</h3>
                    <span class="close" onclick="this.closest('.modal').remove()">&times;</span>
                </div>
                <form id="edit-product-form">
                    <div class="form-group">
                        <label for="edit-product-name">Nome do Produto</label>
                        <input type="text" id="edit-product-name" name="name" value="${product.name}" required>
                    </div>
                    <div class="form-group">
                        <label for="edit-product-price">Preço (R$)</label>
                        <input type="number" id="edit-product-price" name="price" value="${product.price}" step="0.01" min="0" required>
                    </div>
                    <div class="form-group">
                        <label for="edit-product-category">Categoria</label>
                        <select id="edit-product-category" name="category" required>
                            <option value="salgados" ${product.category === 'salgados' ? 'selected' : ''}>Salgados Fritos</option>
                            <option value="sortidos" ${product.category === 'sortidos' ? 'selected' : ''}>Sortidos</option>
                            <option value="assados" ${product.category === 'assados' ? 'selected' : ''}>Assados</option>
                            <option value="especiais" ${product.category === 'especiais' ? 'selected' : ''}>Especiais</option>
                            <option value="opcionais" ${product.category === 'opcionais' ? 'selected' : ''}>Opcionais</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="edit-product-description">Descrição</label>
                        <textarea id="edit-product-description" name="description" rows="3">${product.description || ''}</textarea>
                    </div>
                    <div class="form-group">
                        <label>
                            <input type="checkbox" name="isPortioned" ${product.isPortioned ? 'checked' : ''}> Item vendido por porção
                        </label>
                    </div>
                    <div class="form-actions">
                        <button type="button" class="btn btn-secondary" onclick="this.closest('.modal').remove()">Cancelar</button>
                        <button type="submit" class="btn btn-primary">Salvar</button>
                    </div>
                </form>
            </div>
        `;

        document.body.appendChild(modal);
        modal.style.display = 'flex';

        // Manipular envio do formulário
        modal.querySelector('#edit-product-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            
            if (isCustomProduct) {
                // Editar produto customizado
                const customItems = Utils.storage.get('customMenuItems') || [];
                const productIndex = customItems.findIndex(item => item.id === productId);
                if (productIndex >= 0) {
                    customItems[productIndex] = {
                        ...customItems[productIndex],
                        name: formData.get('name'),
                        price: parseFloat(formData.get('price')),
                        category: formData.get('category'),
                        description: formData.get('description'),
                        isPortioned: formData.has('isPortioned')
                    };
                    Utils.storage.set('customMenuItems', customItems);
                }
            } else {
                // Editar produto padrão - salvar como override
                const defaultProductOverrides = Utils.storage.get('defaultProductOverrides') || {};
                defaultProductOverrides[productId] = {
                    name: formData.get('name'),
                    price: parseFloat(formData.get('price')),
                    category: formData.get('category'),
                    description: formData.get('description'),
                    isPortioned: formData.has('isPortioned')
                };
                Utils.storage.set('defaultProductOverrides', defaultProductOverrides);
                
                // Atualizar o array Menu.items
                const itemIndex = Menu.items.findIndex(item => item.id === productId);
                if (itemIndex >= 0) {
                    Menu.items[itemIndex] = {
                        ...Menu.items[itemIndex],
                        name: formData.get('name'),
                        price: parseFloat(formData.get('price')),
                        category: formData.get('category'),
                        description: formData.get('description'),
                        isPortioned: formData.has('isPortioned')
                    };
                }
            }

            Admin.loadProducts();
            Menu.loadMenuItems(); // Atualizar menu para mostrar produtos atualizados
            Utils.showMessage('Produto atualizado com sucesso!');
            modal.remove();
        });
    },

    // Excluir produto
    deleteProduct: (productId) => {
        if (!Auth.hasAdminPermission('produtos')) {
            Utils.showMessage('Você não tem permissão para esta ação!', 'error');
            return;
        }
        
        if (confirm('Tem certeza que deseja excluir este produto?')) {
            const customItems = Utils.storage.get('customMenuItems') || [];
            const filteredItems = customItems.filter(item => item.id !== productId);
            Utils.storage.set('customMenuItems', filteredItems);
            
            Admin.loadProducts();
            Utils.showMessage('Produto excluído com sucesso!');
        }
    },

    // Carregar administradores
    loadAdmins: () => {
        if (!Auth.hasAdminPermission('administradores')) return;
        
        const adminsContainer = document.getElementById('admin-admins');
        if (!adminsContainer) return;

        const admins = Utils.storage.get('adminUsers') || [];

        adminsContainer.innerHTML = admins.map(admin => `
            <div class="admin-admin">
                <div class="admin-info">
                    <h4>${admin.username}</h4>
                    <div class="admin-role">${admin.role === 'gerente' ? 'Gerente' : 'Funcionário'}</div>
                </div>
                <div class="admin-actions">
                    ${admin.username !== 'sara' ? `
                        <button class="btn btn-danger" onclick="Admin.deleteAdmin('${admin.id}')">Excluir</button>
                    ` : `
                        <small>Administrador principal</small>
                    `}
                </div>
            </div>
        `).join('');
    },

    // Mostrar modal de adicionar administrador
    showAddAdmin: () => {
        if (!Auth.hasAdminPermission('administradores')) {
            Utils.showMessage('Você não tem permissão para esta ação!', 'error');
            return;
        }
        
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content admin-modal">
                <div class="modal-header">
                    <h3>Adicionar Administrador</h3>
                    <span class="close" onclick="this.closest('.modal').remove()">&times;</span>
                </div>
                <form id="add-admin-form">
                    <div class="form-group">
                        <label for="admin-username">Nome de Usuário</label>
                        <input type="text" id="admin-username" name="username" required>
                    </div>
                    <div class="form-group">
                        <label for="admin-password">Senha</label>
                        <input type="password" id="admin-password" name="password" required>
                    </div>
                    <div class="form-group">
                        <label for="admin-role">Função</label>
                        <select id="admin-role" name="role" required>
                            <option value="gerente">Gerente</option>
                            <option value="funcionario">Funcionário</option>
                        </select>
                    </div>
                    <div class="form-actions">
                        <button type="button" class="btn btn-secondary" onclick="this.closest('.modal').remove()">Cancelar</button>
                        <button type="submit" class="btn btn-primary">Adicionar</button>
                    </div>
                </form>
            </div>
        `;

        document.body.appendChild(modal);
        modal.style.display = 'flex';

        // Manipular envio do formulário
        modal.querySelector('#add-admin-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            
            const newAdmin = {
                id: Utils.generateId(),
                username: formData.get('username'),
                password: formData.get('password'),
                role: formData.get('role'),
                createdAt: new Date().toISOString()
            };

            const admins = Utils.storage.get('adminUsers') || [];
            
            // Verificar se o nome de usuário já existe
            if (admins.find(admin => admin.username === newAdmin.username)) {
                Utils.showMessage('Nome de usuário já existe!', 'error');
                return;
            }

            admins.push(newAdmin);
            Utils.storage.set('adminUsers', admins);

            Admin.loadAdmins();
            Utils.showMessage('Administrador adicionado com sucesso!');
            modal.remove();
        });
    },

    // Excluir administrador
    deleteAdmin: (adminId) => {
        if (!Auth.hasAdminPermission('administradores')) {
            Utils.showMessage('Você não tem permissão para esta ação!', 'error');
            return;
        }
        
        if (confirm('Tem certeza que deseja excluir este administrador?')) {
            const admins = Utils.storage.get('adminUsers') || [];
            const filteredAdmins = admins.filter(admin => admin.id !== adminId);
            Utils.storage.set('adminUsers', filteredAdmins);
            
            Admin.loadAdmins();
            Utils.showMessage('Administrador excluído com sucesso!');
        }
    },

    // Carregar configuração
    loadConfig: () => {
        if (!Auth.hasAdminPermission('configuracoes')) return;
        
        const deliveryPriceInput = document.getElementById('delivery-price');
        if (!deliveryPriceInput) return;

        const config = Utils.storage.get('appConfig') || {};
        deliveryPriceInput.value = config.deliveryFee || 10.00;
    },

    // Atualizar preço da entrega
    updateDeliveryPrice: () => {
        if (!Auth.hasAdminPermission('configuracoes')) {
            Utils.showMessage('Você não tem permissão para esta ação!', 'error');
            return;
        }
        
        const deliveryPriceInput = document.getElementById('delivery-price');
        const newPrice = parseFloat(deliveryPriceInput.value) || 0;

        const config = Utils.storage.get('appConfig') || {};
        config.deliveryFee = newPrice;
        Utils.storage.set('appConfig', config);

        Utils.showMessage('Valor da entrega atualizado com sucesso!');
    }
};

// Funções globais
function showAdminSection(section) {
    // Verificar permissões
    if (!Auth.hasAdminPermission(section)) {
        Utils.showMessage('Você não tem permissão para acessar esta seção!', 'error');
        return;
    }
    
    Admin.currentSection = section;
    
    // Atualizar botão ativo
    document.querySelectorAll('.admin-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Ocultar todas as seções
    document.querySelectorAll('.admin-section').forEach(section => {
        section.style.display = 'none';
    });
    
    // Mostrar seção selecionada
    document.getElementById(`admin-${section}`).style.display = 'block';
    
    // Carregar dados da seção
    switch (section) {
        case 'pedidos':
            Admin.loadOrders();
            break;
        case 'produtos':
            Admin.loadProducts();
            break;
        case 'administradores':
            Admin.loadAdmins();
            break;
        case 'configuracoes':
            Admin.loadConfig();
            break;
    }
}

function showAddProduct() {
    Admin.showAddProduct();
}

function showAddAdmin() {
    Admin.showAddAdmin();
}

function updateDeliveryPrice() {
    Admin.updateDeliveryPrice();
}

// Inicializar admin quando DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('admin-page')) {
        Admin.init();
    }
});