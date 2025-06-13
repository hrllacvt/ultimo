<?php
include_once '../../config/cors.php';
include_once '../../config/database.php';
include_once '../../models/Produto.php';

$database = new Database();
$db = $database->getConnection();

$produto = new Produto($db);

$data = json_decode(file_get_contents("php://input"));

if(!empty($data->id)) {
    
    $produto->id_produto = $data->id;

    if($produto->delete()) {
        http_response_code(200);
        echo json_encode(array(
            "sucesso" => true,
            "mensagem" => "Produto excluído com sucesso!"
        ));
    } else {
        http_response_code(500);
        echo json_encode(array(
            "sucesso" => false,
            "mensagem" => "Erro ao excluir produto ou produto não é personalizado"
        ));
    }
} else {
    http_response_code(400);
    echo json_encode(array(
        "sucesso" => false,
        "mensagem" => "ID do produto é obrigatório"
    ));
}
?>