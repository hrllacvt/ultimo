<?php
class Produto {
    private $conn;
    private $table_name = "produto";

    public $id_produto;
    public $nome;
    public $preco;
    public $sabor;
    public $id_categoria;
    public $eh_porcionado;
    public $eh_personalizado;
    public $criado_em;

    public function __construct($db) {
        $this->conn = $db;
    }

    // Criar produto
    function create() {
        $query = "INSERT INTO " . $this->table_name . " 
                  (nome, preco, sabor, id_categoria, eh_porcionado, eh_personalizado) 
                  VALUES (:nome, :preco, :sabor, :id_categoria, :eh_porcionado, :eh_personalizado)";

        $stmt = $this->conn->prepare($query);

        // Sanitizar
        $this->nome = htmlspecialchars(strip_tags($this->nome));
        $this->sabor = htmlspecialchars(strip_tags($this->sabor));
        $this->eh_porcionado = $this->eh_porcionado ?? false;
        $this->eh_personalizado = $this->eh_personalizado ?? true;

        // Bind values
        $stmt->bindParam(":nome", $this->nome);
        $stmt->bindParam(":preco", $this->preco);
        $stmt->bindParam(":sabor", $this->sabor);
        $stmt->bindParam(":id_categoria", $this->id_categoria);
        $stmt->bindParam(":eh_porcionado", $this->eh_porcionado, PDO::PARAM_BOOL);
        $stmt->bindParam(":eh_personalizado", $this->eh_personalizado, PDO::PARAM_BOOL);

        if($stmt->execute()) {
            $this->id_produto = $this->conn->lastInsertId();
            return true;
        }

        return false;
    }

    // Ler todos os produtos
    function readAll() {
        $query = "SELECT p.id_produto, p.nome, p.preco, p.sabor, p.eh_porcionado, 
                         p.eh_personalizado, p.criado_em,
                         c.nome_categoria, c.descricao_categoria
                  FROM " . $this->table_name . " p
                  LEFT JOIN categoria c ON p.id_categoria = c.id_categoria
                  ORDER BY c.nome_categoria, p.nome, p.sabor";

        $stmt = $this->conn->prepare($query);
        $stmt->execute();

        return $stmt;
    }

    // Ler um produto
    function readOne() {
        $query = "SELECT p.id_produto, p.nome, p.preco, p.sabor, p.eh_porcionado, 
                         p.eh_personalizado, p.criado_em, p.id_categoria,
                         c.nome_categoria, c.descricao_categoria
                  FROM " . $this->table_name . " p
                  LEFT JOIN categoria c ON p.id_categoria = c.id_categoria
                  WHERE p.id_produto = :id_produto";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id_produto", $this->id_produto);
        $stmt->execute();

        if($stmt->rowCount() > 0) {
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            
            $this->nome = $row['nome'];
            $this->preco = $row['preco'];
            $this->sabor = $row['sabor'];
            $this->id_categoria = $row['id_categoria'];
            $this->eh_porcionado = $row['eh_porcionado'];
            $this->eh_personalizado = $row['eh_personalizado'];
            $this->criado_em = $row['criado_em'];
            return true;
        }

        return false;
    }

    // Atualizar produto
    function update() {
        $query = "UPDATE " . $this->table_name . " 
                  SET nome = :nome, preco = :preco, sabor = :sabor, 
                      id_categoria = :id_categoria, eh_porcionado = :eh_porcionado 
                  WHERE id_produto = :id_produto AND eh_personalizado = true";

        $stmt = $this->conn->prepare($query);

        // Sanitizar
        $this->nome = htmlspecialchars(strip_tags($this->nome));
        $this->sabor = htmlspecialchars(strip_tags($this->sabor));
        $this->eh_porcionado = $this->eh_porcionado ?? false;

        // Bind values
        $stmt->bindParam(":nome", $this->nome);
        $stmt->bindParam(":preco", $this->preco);
        $stmt->bindParam(":sabor", $this->sabor);
        $stmt->bindParam(":id_categoria", $this->id_categoria);
        $stmt->bindParam(":eh_porcionado", $this->eh_porcionado, PDO::PARAM_BOOL);
        $stmt->bindParam(":id_produto", $this->id_produto);

        if($stmt->execute()) {
            return true;
        }

        return false;
    }

    // Excluir produto
    function delete() {
        $query = "DELETE FROM " . $this->table_name . " 
                  WHERE id_produto = :id_produto AND eh_personalizado = true";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id_produto", $this->id_produto);

        if($stmt->execute()) {
            return true;
        }

        return false;
    }

    // Obter categorias
    function getCategorias() {
        $query = "SELECT id_categoria, nome_categoria, descricao_categoria 
                  FROM categoria ORDER BY nome_categoria";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt;
    }
}
?>