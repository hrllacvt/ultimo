# Salgados da Sara - Backend API

Este é o backend em PHP com PostgreSQL para o sistema de pedidos "Salgados da Sara".

## Requisitos

- XAMPP (Apache + PHP 7.4+)
- PostgreSQL 12 ou superior
- Extensões PHP: pdo, pdo_pgsql, json

## Instalação no XAMPP

### 1. Configurar PostgreSQL

1. Instale o PostgreSQL se ainda não tiver
2. Crie o banco de dados:
   ```sql
   CREATE DATABASE salgados_da_sara;
   ```
3. Execute o schema:
   ```bash
   psql -U postgres -d salgados_da_sara -f database/schema.sql
   ```

### 2. Configurar PHP no XAMPP

1. Abra o arquivo `php.ini` do XAMPP (geralmente em `C:\xampp\php\php.ini`)
2. Descomente ou adicione as linhas:
   ```ini
   extension=pdo_pgsql
   extension=pgsql
   ```
3. Reinicie o Apache no XAMPP

### 3. Configurar o projeto

1. Copie a pasta `backend` para `C:\xampp\htdocs\salgados-da-sara\`
2. Edite o arquivo `config/database.php` com suas credenciais do PostgreSQL:
   ```php
   private $host = '127.0.0.1';
   private $db_name = 'salgados_da_sara';
   private $username = 'postgres';
   private $password = 'sua_senha_postgres';
   private $port = '5432';
   ```

### 4. Testar a instalação

1. Inicie o XAMPP (Apache)
2. Acesse: `http://localhost/salgados-da-sara/backend/api/test.php`
3. Deve retornar um JSON confirmando que está funcionando

## URLs da API

Com XAMPP, as URLs da API serão:
- Base: `http://localhost/salgados-da-sara/backend/api`
- Teste: `http://localhost/salgados-da-sara/backend/api/test.php`
- Produtos: `http://localhost/salgados-da-sara/backend/api/products`
- Login: `http://localhost/salgados-da-sara/backend/api/auth/login`

## Estrutura da API

### Autenticação
- `POST /api/auth/login` - Login de usuário
- `POST /api/auth/register` - Registro de usuário
- `POST /api/auth/forgot-password` - Recuperação de senha
- `POST /api/auth/admin-login` - Login de administrador

### Produtos
- `GET /api/products` - Listar produtos
- `POST /api/products/create` - Criar produto (admin)
- `POST /api/products/update` - Atualizar produto (admin)
- `POST /api/products/delete` - Excluir produto (admin)

### Pedidos
- `GET /api/orders` - Listar pedidos
- `GET /api/orders?user_id=X` - Listar pedidos de um usuário
- `POST /api/orders/create` - Criar pedido
- `POST /api/orders/update-status` - Atualizar status do pedido (admin)

### Administração
- `GET /api/admin/admins` - Listar administradores
- `POST /api/admin/admins` - Criar administrador
- `DELETE /api/admin/admins` - Excluir administrador

### Configurações
- `GET /api/config` - Obter configurações
- `GET /api/config?key=delivery_fee` - Obter configuração específica
- `POST /api/config` - Atualizar configuração

## Usuário Administrador Padrão

- **Usuário:** sara
- **Senha:** password

**IMPORTANTE:** Altere a senha padrão em produção!

## Troubleshooting

### Erro "Backend não está respondendo JSON"
1. Verifique se o Apache está rodando no XAMPP
2. Verifique se a extensão `pdo_pgsql` está habilitada
3. Teste a URL: `http://localhost/salgados-da-sara/backend/api/test.php`
4. Verifique os logs do Apache em `C:\xampp\apache\logs\error.log`

### Erro de conexão com PostgreSQL
1. Verifique se o PostgreSQL está rodando
2. Confirme as credenciais em `config/database.php`
3. Teste a conexão diretamente com `psql`

### Problemas de CORS
1. Verifique se o arquivo `.htaccess` está na pasta `backend`
2. Confirme que o mod_rewrite está habilitado no Apache
3. Verifique se os headers CORS estão sendo enviados

## Logs e Debug

Para debug, você pode:
1. Verificar logs do Apache: `C:\xampp\apache\logs\error.log`
2. Verificar logs do PHP: `C:\xampp\php\logs\php_error_log`
3. Usar `error_log()` nos arquivos PHP para debug
4. Acessar diretamente as URLs da API no navegador