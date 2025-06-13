<?php
class Admin {
    private $conn;
    private $table_name = "admin";

    public $cod_admin;
    public $login;
    public $senha;
    public $super_admin;
    public $criado_em;

    public function __construct($db) {
        $this->conn = $db;
    }

    // Criar admin
    function create() {
        $query = "INSERT INTO " . $this->table_name . " 
                  (login, senha, super_admin) 
                  VALUES (:login, :senha, :super_admin)";

        $stmt = $this->conn->prepare($query);

        // Sanitizar
        $this->login = htmlspecialchars(strip_tags($this->login));
        $this->senha = password_hash($this->senha, PASSWORD_DEFAULT);
        $this->super_admin = $this->super_admin ?? false;

        // Bind values
        $stmt->bindParam(":login", $this->login);
        $stmt->bindParam(":senha", $this->senha);
        $stmt->bindParam(":super_admin", $this->super_admin, PDO::PARAM_BOOL);

        if($stmt->execute()) {
            $this->cod_admin = $this->conn->lastInsertId();
            return true;
        }

        return false;
    }

    // Login admin
    function login($login, $senha) {
        $query = "SELECT cod_admin, login, senha, super_admin, criado_em 
                  FROM " . $this->table_name . " 
                  WHERE login = :login";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":login", $login);
        $stmt->execute();

        if($stmt->rowCount() > 0) {
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if(password_verify($senha, $row['senha'])) {
                $this->cod_admin = $row['cod_admin'];
                $this->login = $row['login'];
                $this->super_admin = $row['super_admin'];
                $this->criado_em = $row['criado_em'];
                return true;
            }
        }

        return false;
    }

    // Obter todos os admins
    function readAll() {
        $query = "SELECT cod_admin, login, super_admin, criado_em 
                  FROM " . $this->table_name . " 
                  ORDER BY criado_em DESC";

        $stmt = $this->conn->prepare($query);
        $stmt->execute();

        return $stmt;
    }

    // Excluir admin
    function delete() {
        $query = "DELETE FROM " . $this->table_name . " 
                  WHERE cod_admin = :cod_admin AND login != 'sara'";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":cod_admin", $this->cod_admin);

        if($stmt->execute()) {
            return true;
        }

        return false;
    }

    // Verificar se login existe
    function loginExists() {
        $query = "SELECT cod_admin FROM " . $this->table_name . " 
                  WHERE login = :login";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":login", $this->login);
        $stmt->execute();

        return $stmt->rowCount() > 0;
    }
}
?>