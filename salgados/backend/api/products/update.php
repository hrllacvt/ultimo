<?php
include_once '../../config/cors.php';
include_once '../../config/database.php';
include_once '../../models/Produto.php';

$database = new Database();
$db = $database->getConnection();

$produto = new Produto($db);

$data = json_decode(file_get_contents("php://input"));

if(!empty($data->id) && !empty($data->name) && !empty($data->price) && !empty($data->category)) {
    
    // Mapear categoria do formato antigo para novo
    $categoria_map = [
        'salgados' => 1,
        'sortidos' => 2,
        'assados' => 3,
        'especiais' => 4,
        'opcionais' => 5
    ];
    
    $produto->id_produto = $data->id;
    $produto->nome = $data->name;
    $produto->preco = $data->price;
    $produto->sabor = $data->flavor ?? '';
    $produto->id_categoria = $categoria_map[$data->category] ?? 1;
    $produto->eh_porcionado = $data->is_portioned ?? false;

    if($produto->update()) {
        http_response_code(200);
        echo json_encode(array(
            "sucesso" => true,
            "mensagem" => "Produto atualizado com sucesso!"
        ));
    } else {
        http_response_code(500);
        echo json_encode(array(
            "sucesso" => false,
            "mensagem" => "Erro ao atualizar produto"
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