<?php
include_once '../../config/cors.php';
include_once '../../config/database.php';
include_once '../../models/Cliente.php';

$database = new Database();
$db = $database->getConnection();

$cliente = new Cliente($db);

$data = json_decode(file_get_contents("php://input"));

if(!empty($data->phone) && !empty($data->password)) {
    
    if($cliente->login($data->phone, $data->password)) {
        
        $response = array(
            "sucesso" => true,
            "mensagem" => "Login realizado com sucesso!",
            "usuario" => array(
                "id" => $cliente->codigo,
                "nome" => $cliente->nome,
                "telefone" => $cliente->telefone,
                "email" => $cliente->email,
                "endereco" => $cliente->rua,
                "numero" => $cliente->numero,
                "complemento" => $cliente->complemento,
                "cidade" => $cliente->sigla_cidade,
                "bairro" => $cliente->bairro,
                "cep" => $cliente->cep,
                "criado_em" => $cliente->criado_em
            )
        );
        
        http_response_code(200);
        echo json_encode($response);
    } else {
        http_response_code(401);
        echo json_encode(array(
            "sucesso" => false,
            "mensagem" => "Telefone ou senha incorretos"
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