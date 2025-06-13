<?php
class Cliente {
    private $conn;
    private $table_name = "cliente";

    public $codigo;
    public $nome;
    public $telefone;
    public $email;
    public $senha;
    public $id_endereco;
    public $sigla_cidade;
    public $criado_em;

    // Dados do endereço
    public $rua;
    public $numero;
    public $cep;
    public $complemento;
    public $bairro;

    public function __construct($db) {
        $this->conn = $db;
    }

    // Criar cliente
    function create() {
        try {
            $this->conn->beginTransaction();

            // Primeiro, criar o endereço
            $endereco_query = "INSERT INTO endereco (rua, numero, cep, complemento, bairro) 
                              VALUES (:rua, :numero, :cep, :complemento, :bairro) 
                              RETURNING id_endereco";

            $endereco_stmt = $this->conn->prepare($endereco_query);
            $endereco_stmt->bindParam(":rua", $this->rua);
            $endereco_stmt->bindParam(":numero", $this->numero);
            $endereco_stmt->bindParam(":cep", $this->cep);
            $endereco_stmt->bindParam(":complemento", $this->complemento);
            $endereco_stmt->bindParam(":bairro", $this->bairro);

            if (!$endereco_stmt->execute()) {
                throw new Exception("Erro ao criar endereço");
            }

            $endereco_result = $endereco_stmt->fetch(PDO::FETCH_ASSOC);
            $this->id_endereco = $endereco_result['id_endereco'];

            // Depois, criar o cliente
            $cliente_query = "INSERT INTO " . $this->table_name . " 
                             (nome, telefone, email, senha, id_endereco, sigla_cidade) 
                             VALUES (:nome, :telefone, :email, :senha, :id_endereco, :sigla_cidade)";

            $cliente_stmt = $this->conn->prepare($cliente_query);

            // Sanitizar
            $this->nome = htmlspecialchars(strip_tags($this->nome));
            $this->telefone = htmlspecialchars(strip_tags($this->telefone));
            $this->email = htmlspecialchars(strip_tags($this->email));
            $this->senha = password_hash($this->senha, PASSWORD_DEFAULT);

            // Bind values
            $cliente_stmt->bindParam(":nome", $this->nome);
            $cliente_stmt->bindParam(":telefone", $this->telefone);
            $cliente_stmt->bindParam(":email", $this->email);
            $cliente_stmt->bindParam(":senha", $this->senha);
            $cliente_stmt->bindParam(":id_endereco", $this->id_endereco);
            $cliente_stmt->bindParam(":sigla_cidade", $this->sigla_cidade);

            if ($cliente_stmt->execute()) {
                $this->codigo = $this->conn->lastInsertId();
                $this->conn->commit();
                return true;
            }

            throw new Exception("Erro ao criar cliente");

        } catch (Exception $e) {
            $this->conn->rollBack();
            error_log("Erro ao criar cliente: " . $e->getMessage());
            return false;
        }
    }

    // Login cliente
    function login($telefone, $senha) {
        $query = "SELECT c.codigo, c.nome, c.telefone, c.email, c.senha, c.criado_em,
                         e.rua, e.numero, e.cep, e.complemento, e.bairro,
                         ci.nome as cidade_nome, c.sigla_cidade
                  FROM " . $this->table_name . " c
                  LEFT JOIN endereco e ON c.id_endereco = e.id_endereco
                  LEFT JOIN cidade ci ON c.sigla_cidade = ci.sigla
                  WHERE c.telefone = :telefone";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":telefone", $telefone);
        $stmt->execute();

        if($stmt->rowCount() > 0) {
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if(password_verify($senha, $row['senha'])) {
                $this->codigo = $row['codigo'];
                $this->nome = $row['nome'];
                $this->telefone = $row['telefone'];
                $this->email = $row['email'];
                $this->criado_em = $row['criado_em'];
                $this->rua = $row['rua'];
                $this->numero = $row['numero'];
                $this->cep = $row['cep'];
                $this->complemento = $row['complemento'];
                $this->bairro = $row['bairro'];
                $this->sigla_cidade = $row['sigla_cidade'];
                return true;
            }
        }

        return false;
    }

    // Verificar se cliente existe
    function clienteExists() {
        $query = "SELECT codigo FROM " . $this->table_name . " 
                  WHERE telefone = :telefone OR email = :email";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":telefone", $this->telefone);
        $stmt->bindParam(":email", $this->email);
        $stmt->execute();

        return $stmt->rowCount() > 0;
    }

    // Obter cliente por ID
    function readOne() {
        $query = "SELECT c.codigo, c.nome, c.telefone, c.email, c.criado_em,
                         e.rua, e.numero, e.cep, e.complemento, e.bairro,
                         ci.nome as cidade_nome, c.sigla_cidade
                  FROM " . $this->table_name . " c
                  LEFT JOIN endereco e ON c.id_endereco = e.id_endereco
                  LEFT JOIN cidade ci ON c.sigla_cidade = ci.sigla
                  WHERE c.codigo = :codigo";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":codigo", $this->codigo);
        $stmt->execute();

        if($stmt->rowCount() > 0) {
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            
            $this->nome = $row['nome'];
            $this->telefone = $row['telefone'];
            $this->email = $row['email'];
            $this->criado_em = $row['criado_em'];
            $this->rua = $row['rua'];
            $this->numero = $row['numero'];
            $this->cep = $row['cep'];
            $this->complemento = $row['complemento'];
            $this->bairro = $row['bairro'];
            $this->sigla_cidade = $row['sigla_cidade'];
            return true;
        }

        return false;
    }

    // Obter cliente por telefone para recuperação de senha
    function getByPhone($telefone) {
        $query = "SELECT codigo, nome, telefone, email FROM " . $this->table_name . " 
                  WHERE telefone = :telefone";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":telefone", $telefone);
        $stmt->execute();

        if($stmt->rowCount() > 0) {
            return $stmt->fetch(PDO::FETCH_ASSOC);
        }

        return false;
    }

    // Obter todas as cidades
    function getCidades() {
        $query = "SELECT sigla, nome FROM cidade ORDER BY nome";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt;
    }
}
?>