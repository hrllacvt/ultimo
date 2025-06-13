<?php
include_once '../../config/cors.php';
include_once '../../config/database.php';
include_once '../../models/Cliente.php';

$database = new Database();
$db = $database->getConnection();

$cliente = new Cliente($db);

$data = json_decode(file_get_contents("php://input"));

if(!empty($data->phone)) {
    
    $clienteData = $cliente->getByPhone($data->phone);
    
    if($clienteData) {
       
        http_response_code(200);
        echo json_encode(array(
            "sucesso" => true,
            "mensagem" => "Instruções de recuperação de senha foram enviadas para seu telefone"
        ));
    } else {
        http_response_code(404);
        echo json_encode(array(
            "sucesso" => false,
            "mensagem" => "Usuário não encontrado"
        ));
    }
} else {
    http_response_code(400);
    echo json_encode(array(
        "sucesso" => false,
        "mensagem" => "Telefone é obrigatório"
    ));
}
?>