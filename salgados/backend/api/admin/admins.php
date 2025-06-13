<?php
error_reporting(0);
ini_set('display_errors', 0);

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

try {
    include_once '../../config/database.php';
    include_once '../../models/Admin.php';

    $database = new Database();
    $db = $database->getConnection();

    if (!$db) {
        throw new Exception('Erro de conexão com banco de dados');
    }

    $admin = new Admin($db);

    $method = $_SERVER['REQUEST_METHOD'];

    switch($method) {
        case 'GET':
            // mostra os admins
            $stmt = $admin->readAll();
            $num = $stmt->rowCount();
            
            if($num > 0) {
                $admins_arr = array();
                
                while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                    extract($row);
                    
                    $admin_item = array(
                        "id" => $cod_admin,
                        "nome_usuario" => $login,
                        "funcao" => $super_admin ? 'super_admin' : 'admin',
                        "criado_em" => $criado_em
                    );
                    
                    array_push($admins_arr, $admin_item);
                }
                
                http_response_code(200);
                echo json_encode(array(
                    "sucesso" => true,
                    "dados" => $admins_arr
                ));
            } else {
                http_response_code(200);
                echo json_encode(array(
                    "sucesso" => true,
                    "dados" => array()
                ));
            }
            break;
            
        case 'POST':
            // cria admin
            $data = json_decode(file_get_contents("php://input"));
            
            if(!empty($data->username) && !empty($data->password) && !empty($data->role)) {
                
                $admin->login = $data->username;
                
                if($admin->loginExists()) {
                    http_response_code(400);
                    echo json_encode(array(
                        "sucesso" => false,
                        "mensagem" => "Nome de usuário já existe!"
                    ));
                    break;
                }
                
                $admin->senha = $data->password;
                $admin->super_admin = ($data->role === 'super_admin');

                if($admin->create()) {
                    http_response_code(201);
                    echo json_encode(array(
                        "sucesso" => true,
                        "mensagem" => "Administrador criado com sucesso!",
                        "id" => $admin->cod_admin
                    ));
                } else {
                    http_response_code(500);
                    echo json_encode(array(
                        "sucesso" => false,
                        "mensagem" => "Erro ao criar administrador"
                    ));
                }
            } else {
                http_response_code(400);
                echo json_encode(array(
                    "sucesso" => false,
                    "mensagem" => "Dados incompletos"
                ));
            }
            break;
            
        case 'DELETE':
            // Deleta admin
            $data = json_decode(file_get_contents("php://input"));
            
            if(!empty($data->id)) {
                $admin->cod_admin = $data->id;

                if($admin->delete()) {
                    http_response_code(200);
                    echo json_encode(array(
                        "sucesso" => true,
                        "mensagem" => "Administrador excluído com sucesso!"
                    ));
                } else {
                    http_response_code(500);
                    echo json_encode(array(
                        "sucesso" => false,
                        "mensagem" => "Erro ao excluir administrador"
                    ));
                }
            } else {
                http_response_code(400);
                echo json_encode(array(
                    "sucesso" => false,
                    "mensagem" => "ID do administrador é obrigatório"
                ));
            }
            break;
            
        default:
            http_response_code(405);
            echo json_encode(array(
                "sucesso" => false,
                "mensagem" => "Método não permitido"
            ));
            break;
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'sucesso' => false,
        'mensagem' => 'Erro interno: ' . $e->getMessage()
    ]);
}
?>