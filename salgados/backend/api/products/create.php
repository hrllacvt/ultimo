<?php
include_once '../../config/cors.php';
include_once '../../config/database.php';
include_once '../../models/Produto.php';

$database = new Database();
$db = $database->getConnection();

$produto = new Produto($db);

$data = json_decode(file_get_contents("php://input"));

if(!empty($data->name) && !empty($data->price) && !empty($data->category)) {
    
    // Mapear categoria do formato antigo para novo
    $categoria_map = [
        'salgados' => 1,
        'sortidos' => 2,
        'assados' => 3,
        'especiais' => 4,
        'opcionais' => 5
    ];
    
    $produto->nome = $data->name;
    $produto->preco = $data->price;
    $produto->sabor = $data->flavor ?? '';
    $produto->id_categoria = $categoria_map[$data->category] ?? 1;
    $produto->eh_porcionado = $data->is_portioned ?? false;
    $produto->eh_personalizado = true;

    if($produto->create()) {
        http_response_code(201);
        echo json_encode(array(
            "sucesso" => true,
            "mensagem" => "Produto criado com sucesso!",
            "id" => $produto->id_produto
        ));
    } else {
        http_response_code(500);
        echo json_encode(array(
            "sucesso" => false,
            "mensagem" => "Erro ao criar produto"
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