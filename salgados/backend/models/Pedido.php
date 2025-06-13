<?php
class Pedido {
    private $conn;
    private $table_name = "pedido";

    public $id_pedido;
    public $numero_pedido;
    public $valor;
    public $status;
    public $forma_pagamento;
    public $forma_entrega;
    public $data_pedido;
    public $data_entrega;
    public $codigo_cliente;
    public $observacoes;

    public function __construct($db) {
        $this->conn = $db;
    }

    // Criar pedido
    function create($itens) {
        try {
            $this->conn->beginTransaction();

            // Gerar número do pedido se não fornecido
            if(empty($this->numero_pedido)) {
                $this->numero_pedido = $this->generateOrderNumber();
            }

            // Criar o pedido
            $query = "INSERT INTO " . $this->table_name . " 
                      (numero_pedido, valor, status, forma_pagamento, forma_entrega, codigo_cliente, observacoes) 
                      VALUES (:numero_pedido, :valor, :status, :forma_pagamento, :forma_entrega, :codigo_cliente, :observacoes)";

            $stmt = $this->conn->prepare($query);

            // Sanitizar
            $this->numero_pedido = htmlspecialchars(strip_tags($this->numero_pedido));
            $this->forma_pagamento = htmlspecialchars(strip_tags($this->forma_pagamento));
            $this->forma_entrega = htmlspecialchars(strip_tags($this->forma_entrega));
            $this->status = $this->status ?? 'pendente';

            // Bind values
            $stmt->bindParam(":numero_pedido", $this->numero_pedido);
            $stmt->bindParam(":valor", $this->valor);
            $stmt->bindParam(":status", $this->status);
            $stmt->bindParam(":forma_pagamento", $this->forma_pagamento);
            $stmt->bindParam(":forma_entrega", $this->forma_entrega);
            $stmt->bindParam(":codigo_cliente", $this->codigo_cliente);
            $stmt->bindParam(":observacoes", $this->observacoes);

            if(!$stmt->execute()) {
                throw new Exception("Erro ao criar pedido");
            }

            $this->id_pedido = $this->conn->lastInsertId();

            // Inserir itens do pedido
            foreach($itens as $item) {
                $item_query = "INSERT INTO pedido_produto 
                              (id_pedido, id_produto, quantidade, preco_unitario, tipo_quantidade, quantidade_unidades) 
                              VALUES (:id_pedido, :id_produto, :quantidade, :preco_unitario, :tipo_quantidade, :quantidade_unidades)";

                $item_stmt = $this->conn->prepare($item_query);
                $item_stmt->bindParam(":id_pedido", $this->id_pedido);
                $item_stmt->bindParam(":id_produto", $item['id_produto']);
                $item_stmt->bindParam(":quantidade", $item['quantidade']);
                $item_stmt->bindParam(":preco_unitario", $item['preco_unitario']);
                $item_stmt->bindParam(":tipo_quantidade", $item['tipo_quantidade']);
                $item_stmt->bindParam(":quantidade_unidades", $item['quantidade_unidades']);

                if(!$item_stmt->execute()) {
                    throw new Exception("Erro ao inserir item do pedido");
                }
            }

            $this->conn->commit();
            return true;

        } catch (Exception $e) {
            $this->conn->rollBack();
            error_log("Erro ao criar pedido: " . $e->getMessage());
            return false;
        }
    }

    // Ler todos os pedidos
    function readAll() {
        $query = "SELECT p.*, c.nome as nome_cliente, c.telefone as telefone_cliente,
                         ci.nome as cidade_nome
                  FROM " . $this->table_name . " p
                  LEFT JOIN cliente c ON p.codigo_cliente = c.codigo
                  LEFT JOIN cidade ci ON c.sigla_cidade = ci.sigla
                  ORDER BY p.data_pedido DESC";

        $stmt = $this->conn->prepare($query);
        $stmt->execute();

        return $stmt;
    }

    // Ler pedidos por cliente
    function readByCliente($codigo_cliente) {
        $query = "SELECT * FROM " . $this->table_name . " 
                  WHERE codigo_cliente = :codigo_cliente 
                  ORDER BY data_pedido DESC";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":codigo_cliente", $codigo_cliente);
        $stmt->execute();

        return $stmt;
    }

    // Ler um pedido com itens
    function readOne() {
        $query = "SELECT p.*, c.nome as nome_cliente, c.telefone as telefone_cliente,
                         e.rua, e.numero, e.complemento, e.bairro,
                         ci.nome as cidade_nome
                  FROM " . $this->table_name . " p
                  LEFT JOIN cliente c ON p.codigo_cliente = c.codigo
                  LEFT JOIN endereco e ON c.id_endereco = e.id_endereco
                  LEFT JOIN cidade ci ON c.sigla_cidade = ci.sigla
                  WHERE p.id_pedido = :id_pedido";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id_pedido", $this->id_pedido);
        $stmt->execute();

        if($stmt->rowCount() > 0) {
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            
            $this->numero_pedido = $row['numero_pedido'];
            $this->valor = $row['valor'];
            $this->status = $row['status'];
            $this->forma_pagamento = $row['forma_pagamento'];
            $this->forma_entrega = $row['forma_entrega'];
            $this->data_pedido = $row['data_pedido'];
            $this->data_entrega = $row['data_entrega'];
            $this->codigo_cliente = $row['codigo_cliente'];
            $this->observacoes = $row['observacoes'];
            
            return true;
        }

        return false;
    }

    // Obter itens do pedido
    function getItens() {
        $query = "SELECT pp.*, pr.nome, pr.sabor, c.nome_categoria
                  FROM pedido_produto pp
                  JOIN produto pr ON pp.id_produto = pr.id_produto
                  LEFT JOIN categoria c ON pr.id_categoria = c.id_categoria
                  WHERE pp.id_pedido = :id_pedido";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id_pedido", $this->id_pedido);
        $stmt->execute();

        return $stmt;
    }

    // Atualizar status do pedido
    function updateStatus($novo_status, $observacoes = null) {
        $query = "UPDATE " . $this->table_name . " 
                  SET status = :status";
        
        if($observacoes) {
            $query .= ", observacoes = :observacoes";
        }
        
        if($novo_status === 'entregue') {
            $query .= ", data_entrega = CURRENT_TIMESTAMP";
        }
        
        $query .= " WHERE id_pedido = :id_pedido";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":status", $novo_status);
        $stmt->bindParam(":id_pedido", $this->id_pedido);
        
        if($observacoes) {
            $stmt->bindParam(":observacoes", $observacoes);
        }

        if($stmt->execute()) {
            $this->status = $novo_status;
            if($observacoes) {
                $this->observacoes = $observacoes;
            }
            return true;
        }

        return false;
    }

    // Criar delivery se necessário
    function createDelivery($endereco_entrega, $sigla_cidade, $hora_delivery = null) {
        $query = "INSERT INTO delivery (endereco, id_pedido, sigla_cidade, hora_delivery, id_preco) 
                  VALUES (:endereco, :id_pedido, :sigla_cidade, :hora_delivery, 
                         (SELECT cod_preco FROM preco_delivery WHERE valor = 10.00 LIMIT 1))";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":endereco", $endereco_entrega);
        $stmt->bindParam(":id_pedido", $this->id_pedido);
        $stmt->bindParam(":sigla_cidade", $sigla_cidade);
        $stmt->bindParam(":hora_delivery", $hora_delivery);

        return $stmt->execute();
    }

    // Gerar número do pedido
    private function generateOrderNumber() {
        $query = "SELECT COUNT(*) as count FROM " . $this->table_name;
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        
        $numeroPedido = $row['count'] + 1;
        $data = date('dmY');
        
        return sprintf("#%03d-%s", $numeroPedido, $data);
    }
}
?>