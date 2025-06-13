// Funções Utilitárias
const Utils = {
    // Formatar moeda
    formatCurrency: (value) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    },

    // Formatar data
    formatDate: (date) => {
        return new Intl.DateTimeFormat('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(new Date(date));
    },

    // Gerar ID único
    generateId: () => {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },

    // Gerar número do pedido
    generateOrderNumber: () => {
        const orderNumber = Math.floor(Math.random() * 1000) + 1;
        const date = new Date().toLocaleDateString('pt-BR').replace(/\//g, '');
        return `#${orderNumber.toString().padStart(3, '0')}-${date}`;
    },

    // Mostrar mensagem
    showMessage: (message, type = 'success') => {
        const messageEl = document.getElementById('message');
        messageEl.textContent = message;
        messageEl.className = `message ${type}`;
        messageEl.style.display = 'block';

        setTimeout(() => {
            messageEl.style.display = 'none';
        }, 3000);
    },

    // Validar formulário
    validateForm: (formData, rules) => {
        const errors = {};

        for (const field in rules) {
            const value = formData[field];
            const rule = rules[field];

            if (rule.required && (!value || value.trim() === '')) {
                errors[field] = `${rule.label} é obrigatório`;
                continue;
            }

            if (rule.minLength && value && value.length < rule.minLength) {
                errors[field] = `${rule.label} deve ter pelo menos ${rule.minLength} caracteres`;
                continue;
            }

            if (rule.email && value && !this.isValidEmail(value)) {
                errors[field] = 'Email inválido';
                continue;
            }

            if (rule.phone && value && !this.isValidPhone(value)) {
                errors[field] = 'Telefone inválido';
                continue;
            }

            if (rule.match && formData[rule.match] && value !== formData[rule.match]) {
                errors[field] = 'Senhas não coincidem';
                continue;
            }
        }

        return errors;
    },

    // Validar email
    isValidEmail: (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    // Validar telefone
    isValidPhone: (phone) => {
        const phoneRegex = /^\(\d{2}\)\s\d{4,5}-\d{4}$/;
        return phoneRegex.test(phone) || phone.replace(/\D/g, '').length >= 10;
    },

    // Formatar telefone
    formatPhone: (phone) => {
        const cleaned = phone.replace(/\D/g, '');
        const match = cleaned.match(/^(\d{2})(\d{4,5})(\d{4})$/);
        if (match) {
            return `(${match[1]}) ${match[2]}-${match[3]}`;
        }
        return phone;
    },

    // Calcular preço do item
    calculateItemPrice: (basePrice, quantityType, unitCount = 1) => {
        const price = parseFloat(basePrice);
        
        switch (quantityType) {
            case 'cento':
                return price;
            case 'meio-cento':
                return price / 2;
            case 'unidade':
                return (price / 100) * unitCount;
            case 'porção':
                return price;
            default:
                return price;
        }
    },

    // Obter rótulo da quantidade
    getQuantityLabel: (quantityType, unitCount = 1) => {
        switch (quantityType) {
            case 'cento':
                return 'Cento';
            case 'meio-cento':
                return 'Meio Cento';
            case 'unidade':
                return `${unitCount} unidades`;
            case 'porção':
                return 'Porção';
            default:
                return 'Cento';
        }
    },

    // Função debounce
    debounce: (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Clonar objeto profundamente
    deepClone: (obj) => {
        return JSON.parse(JSON.stringify(obj));
    },

    // Verificar se usuário está logado
    isLoggedIn: () => {
        return localStorage.getItem('currentUser') !== null;
    },

    // Obter usuário atual
    getCurrentUser: () => {
        return JSON.parse(localStorage.getItem('currentUser') || 'null');
    },

    // Definir estado de carregamento
    setLoading: (isLoading) => {
        const loadingEl = document.getElementById('loading');
        if (isLoading) {
            loadingEl.style.display = 'flex';
        } else {
            loadingEl.style.display = 'none';
        }
    },

    // Rolagem suave para elemento
    smoothScrollTo: (element) => {
        element.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    },

    // Auxiliares do localStorage
    storage: {
        get: (key) => {
            try {
                return JSON.parse(localStorage.getItem(key) || 'null');
            } catch (e) {
                console.error('Erro ao analisar dados do localStorage:', e);
                return null;
            }
        },

        set: (key, value) => {
            try {
                localStorage.setItem(key, JSON.stringify(value));
            } catch (e) {
                console.error('Erro ao salvar no localStorage:', e);
            }
        },

        remove: (key) => {
            localStorage.removeItem(key);
        },

        clear: () => {
            localStorage.clear();
        }
    }
};

// Tornar Utils disponível globalmente
window.Utils = Utils;