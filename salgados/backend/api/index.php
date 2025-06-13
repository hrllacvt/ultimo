<?php
include_once '../config/cors.php';

$endpoints = array(
    "message" => "Salgados da Sara API",
    "version" => "1.0.0",
    "endpoints" => array(
        "auth" => array(
            "POST /api/auth/login" => "Login de usuário",
            "POST /api/auth/register" => "Registro de usuário", 
            "POST /api/auth/forgot-password" => "Recuperação de senha",
            "POST /api/auth/admin-login" => "Login de administrador"
        ),
        "products" => array(
            "GET /api/products" => "Listar produtos",
            "POST /api/products/create" => "Criar produto",
            "POST /api/products/update" => "Atualizar produto",
            "POST /api/products/delete" => "Excluir produto"
        ),
        "orders" => array(
            "GET /api/orders" => "Listar pedidos",
            "POST /api/orders/create" => "Criar pedido",
            "POST /api/orders/update-status" => "Atualizar status do pedido"
        ),
        "admin" => array(
            "GET /api/admin/admins" => "Listar administradores",
            "POST /api/admin/admins" => "Criar administrador",
            "DELETE /api/admin/admins" => "Excluir administrador"
        ),
        "config" => array(
            "GET /api/config" => "Obter configurações",
            "POST /api/config" => "Atualizar configuração"
        )
    )
);

http_response_code(200);
echo json_encode($endpoints, JSON_PRETTY_PRINT);
?>