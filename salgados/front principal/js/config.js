// Configuração da API
const API_CONFIG = {
    baseURL: 'http://localhost/salgados-da-sara/backend/api',
    endpoints: {
        // Auth
        login: '/auth/login',
        register: '/auth/register',
        forgotPassword: '/auth/forgot-password',
        adminLogin: '/auth/admin-login',
        
        // Products
        products: '/products',
        createProduct: '/products/create',
        updateProduct: '/products/update',
        deleteProduct: '/products/delete',
        
        // Orders
        orders: '/orders',
        createOrder: '/orders/create',
        updateOrderStatus: '/orders/update-status',
        
        // Admin
        admins: '/admin/admins',
        
        // Config
        config: '/config'
    }
};

// Função para fazer requisições HTTP
const ApiClient = {
    async request(endpoint, options = {}) {
        const url = `${API_CONFIG.baseURL}${endpoint}`;
        
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
            },
        };
        
        const config = { ...defaultOptions, ...options };
        
        try {
            const response = await fetch(url, config);
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.mensagem || 'Erro na requisição');
            }
            
            return data;
        } catch (error) {
            console.error('Erro na API:', error);
            throw error;
        }
    },
    
    get(endpoint) {
        return this.request(endpoint, { method: 'GET' });
    },
    
    post(endpoint, data) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },
    
    put(endpoint, data) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    },
    
    delete(endpoint, data) {
        return this.request(endpoint, {
            method: 'DELETE',
            body: JSON.stringify(data)
        });
    }
};

// Tornar disponível globalmente
window.API_CONFIG = API_CONFIG;
window.ApiClient = ApiClient;