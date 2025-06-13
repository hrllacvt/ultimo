<?php
include_once '../../config/cors.php';
include_once '../../config/database.php';
include_once '../../models/Pedido.php';

$database = new Database();
$db = $database->getConnection();

$pedido = new Pedido($db);

$data = json_decode(file_get_contents("php://input"));

if(!empty($data->id) && !empty($data->status)) {
    
    $pedido->id_pedido = $data->id;
    
    if($pedido->readOne()) {
        $observacoes = $data->rejection_reason ?? $data->description ?? null;
        
        if($pedido->updateStatus($data->status, $observacoes)) {
            http_response_code(200);
            echo json_encode(array(
                "sucesso" => true,
                "mensagem" => "Status do pedido atualizado com sucesso!"
            ));
        } else {
            http_response_code(500);
            echo json_encode(array(
                "sucesso" => false,
                "mensagem" => "Erro ao atualizar status do pedido"
            ));
        }
    } else {
        http_response_code(404);
        echo json_encode(array(
            "sucesso" => false,
            "mensagem" => "Pedido não encontrado"
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