<?php
include_once '../../config/cors.php';
include_once '../../config/database.php';
include_once '../../models/Admin.php';

$database = new Database();
$db = $database->getConnection();

$admin = new Admin($db);

// Get posted data
$data = json_decode(file_get_contents("php://input"));

if(!empty($data->username) && !empty($data->password)) {
    
    if($admin->login($data->username, $data->password)) {
        
        $response = array(
            "sucesso" => true,
            "mensagem" => "Login realizado com sucesso!",
            "admin" => array(
                "id" => $admin->cod_admin,
                "nome_usuario" => $admin->login,
                "funcao" => $admin->super_admin ? 'super_admin' : 'admin',
                "criado_em" => $admin->criado_em
            )
        );
        
        http_response_code(200);
        echo json_encode($response);
    } else {
        http_response_code(401);
        echo json_encode(array(
            "sucesso" => false,
            "mensagem" => "Usuário ou senha incorretos"
        ));
    }
} else {
    http_response_code(400);
    echo json_encode(array(
        "sucesso" => false,
        "mensagem" => "Dados incompletos"
    ));
}
?>