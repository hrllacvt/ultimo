// Authentication Module
const Auth = {
    // Initialize default users
    init: () => {
        const users = Utils.storage.get('users') || [];
        if (users.length === 0) {
            // Create default admin user
            const defaultUsers = [
                {
                    id: Utils.generateId(),
                    name: 'Administrador',
                    phone: '(00) 00000-0000',
                    email: 'admin@salgadosdasara.com',
                    address: 'Rua Ida Berlet, 1738 B',
                    number: '1738',
                    complement: 'B',
                    city: 'Quinze de Novembro',
                    password: 'Admin123!',
                    isAdmin: true,
                    createdAt: new Date().toISOString()
                }
            ];
            Utils.storage.set('users', defaultUsers);
        }

        // Initialize admin users
        const adminUsers = Utils.storage.get('adminUsers') || [];
        if (adminUsers.length === 0) {
            const defaultAdmins = [
                {
                    id: Utils.generateId(),
                    username: 'sara',
                    password: '123',
                    role: 'gerente',
                    createdAt: new Date().toISOString()
                }
            ];
            Utils.storage.set('adminUsers', defaultAdmins);
        }
    },

    // Validate password strength
    validatePassword: (password) => {
        const errors = [];
        
        if (password.length < 6) {
            errors.push('A senha deve ter pelo menos 6 caracteres');
        }
        
        if (password.length > 15) {
            errors.push('A senha deve ter no máximo 15 caracteres');
        }
        
        if (!/[A-Z]/.test(password)) {
            errors.push('A senha deve conter pelo menos 1 letra maiúscula');
        }
        
        if (!/[0-9]/.test(password)) {
            errors.push('A senha deve conter pelo menos 1 número');
        }
        
        if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
            errors.push('A senha deve conter pelo menos 1 caractere especial');
        }
        
        return errors;
    },

    // Login user
    login: (phone, password) => {
        const users = Utils.storage.get('users') || [];
        const user = users.find(u => u.phone === phone && u.password === password);
        
        if (user) {
            Utils.storage.set('currentUser', user);
            return { success: true, user };
        }
        
        return { success: false, message: 'Telefone ou senha incorretos' };
    },

    // Register user
    register: (userData) => {
        const users = Utils.storage.get('users') || [];
        
        // Check if user already exists
        const existingUser = users.find(u => u.phone === userData.phone || u.email === userData.email);
        if (existingUser) {
            return { success: false, message: 'Usuário já cadastrado com este telefone ou email' };
        }

        // Validate password strength
        const passwordErrors = Auth.validatePassword(userData.password);
        if (passwordErrors.length > 0) {
            return { success: false, message: passwordErrors.join('. ') };
        }

        // Check if passwords match
        if (userData.password !== userData.confirmPassword) {
            return { success: false, message: 'As senhas não coincidem' };
        }

        // Validate required fields
        const requiredFields = ['name', 'phone', 'email', 'address', 'number', 'city', 'password'];
        for (const field of requiredFields) {
            if (!userData[field] || userData[field].trim() === '') {
                const fieldNames = {
                    name: 'Nome completo',
                    phone: 'Telefone',
                    email: 'Email',
                    address: 'Endereço',
                    number: 'Número',
                    city: 'Cidade',
                    password: 'Senha'
                };
                return { success: false, message: `${fieldNames[field]} é obrigatório` };
            }
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(userData.email)) {
            return { success: false, message: 'Email inválido' };
        }

        // Create new user
        const newUser = {
            id: Utils.generateId(),
            name: userData.name.trim(),
            phone: Utils.formatPhone(userData.phone),
            email: userData.email.trim(),
            address: userData.address.trim(),
            number: userData.number.trim(),
            complement: userData.complement ? userData.complement.trim() : '',
            city: userData.city,
            password: userData.password,
            isAdmin: false,
            createdAt: new Date().toISOString()
        };

        users.push(newUser);
        Utils.storage.set('users', users);
        Utils.storage.set('currentUser', newUser);

        return { success: true, user: newUser };
    },

    // Forgot password
    forgotPassword: (phone) => {
        const users = Utils.storage.get('users') || [];
        const user = users.find(u => u.phone === phone);
        
        if (user) {
            // In a real app, this would send an email/SMS
            // For demo purposes, we'll just show the password
            return { 
                success: true, 
                message: `Sua senha é: ${user.password}` 
            };
        }
        
        return { success: false, message: 'Usuário não encontrado' };
    },

    // Admin login
    adminLogin: (username, password) => {
        const adminUsers = Utils.storage.get('adminUsers') || [];
        const admin = adminUsers.find(a => a.username === username && a.password === password);
        
        if (admin) {
            Utils.storage.set('currentAdmin', admin);
            return { success: true, admin };
        }
        
        return { success: false, message: 'Usuário ou senha incorretos' };
    },

    // Logout
    logout: () => {
        Utils.storage.remove('currentUser');
        Utils.storage.remove('currentAdmin');
    },

    // Check if user is logged in
    isLoggedIn: () => {
        return Utils.storage.get('currentUser') !== null;
    },

    // Check if admin is logged in
    isAdminLoggedIn: () => {
        return Utils.storage.get('currentAdmin') !== null;
    },

    // Get current user
    getCurrentUser: () => {
        return Utils.storage.get('currentUser');
    },

    // Get current admin
    getCurrentAdmin: () => {
        return Utils.storage.get('currentAdmin');
    },

    // Check admin permissions
    hasAdminPermission: (permission) => {
        const admin = Auth.getCurrentAdmin();
        if (!admin) return false;
        
        if (admin.role === 'gerente') return true; // Gerente tem acesso total
        
        if (admin.role === 'funcionario') {
            // Funcionário só tem acesso ao menu de pedidos
            return permission === 'pedidos';
        }
        
        return false;
    }
};

// Form handlers
document.addEventListener('DOMContentLoaded', () => {
    // Login form
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const formData = new FormData(loginForm);
            const phone = formData.get('phone');
            const password = formData.get('password');

            const result = Auth.login(phone, password);
            
            if (result.success) {
                Utils.showMessage('Login realizado com sucesso!');
                setTimeout(() => {
                    App.showMainApp();
                }, 1500);
            } else {
                Utils.showMessage(result.message, 'error');
            }
        });
    }

    // Register form
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const formData = new FormData(registerForm);
            const userData = {
                name: formData.get('name'),
                phone: formData.get('phone'),
                email: formData.get('email'),
                address: formData.get('address'),
                number: formData.get('number'),
                complement: formData.get('complement'),
                city: formData.get('city'),
                password: formData.get('password'),
                confirmPassword: formData.get('confirmPassword')
            };

            const result = Auth.register(userData);
            
            if (result.success) {
                Utils.showMessage('Conta criada com sucesso!');
                setTimeout(() => {
                    App.showMainApp();
                }, 1500);
            } else {
                Utils.showMessage(result.message, 'error');
            }
        });
    }

    // Forgot password form
    const forgotForm = document.getElementById('forgot-password-form');
    if (forgotForm) {
        forgotForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const formData = new FormData(forgotForm);
            const phone = formData.get('phone');

            const result = Auth.forgotPassword(phone);
            
            if (result.success) {
                Utils.showMessage(result.message);
            } else {
                Utils.showMessage(result.message, 'error');
            }
        });
    }

    // Admin login form
    const adminLoginForm = document.getElementById('admin-login-form');
    if (adminLoginForm) {
        adminLoginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const formData = new FormData(adminLoginForm);
            const username = formData.get('username');
            const password = formData.get('password');

            const result = Auth.adminLogin(username, password);
            
            if (result.success) {
                Utils.showMessage('Login realizado com sucesso!');
                document.getElementById('admin-login').style.display = 'none';
                document.getElementById('admin-panel').style.display = 'flex';
                Admin.loadOrders();
            } else {
                Utils.showMessage(result.message, 'error');
            }
        });
    }
});

// Navigation functions
function showLogin() {
    document.getElementById('login-page').style.display = 'flex';
    document.getElementById('register-page').style.display = 'none';
    document.getElementById('forgot-password-page').style.display = 'none';
}

function showRegister() {
    document.getElementById('login-page').style.display = 'none';
    document.getElementById('register-page').style.display = 'flex';
    document.getElementById('forgot-password-page').style.display = 'none';
}

function showForgotPassword() {
    document.getElementById('login-page').style.display = 'none';
    document.getElementById('register-page').style.display = 'none';
    document.getElementById('forgot-password-page').style.display = 'flex';
}

function logout() {
    Auth.logout();
    Utils.showMessage('Logout realizado com sucesso!');
    setTimeout(() => {
        App.showAuthPages();
    }, 1000);
}

function adminLogout() {
    Auth.logout();
    Utils.showMessage('Logout realizado com sucesso!');
    setTimeout(() => {
        window.location.href = '/';
    }, 1000);
}

// Initialize auth
Auth.init();