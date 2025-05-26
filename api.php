<?php
// Ler o corpo da requisição (raw JSON)
$input = file_get_contents('php://input');

// Tentar converter para array PHP
$data = json_decode($input, true);

// Mostrar o que foi recebido (só para teste)
header('Content-Type: application/json');
echo json_encode([
    'recebido' => $data,
    'bruto' => $input
]);
exit;

define('DB_HOST', 'localhost');      // Endereço do servidor MySQL
define('DB_NAME', 'biblioteca_laura'); // Nome do banco de dados
define('DB_USER', 'root');           // Usuário do MySQL
define('DB_PASS', '');               // Senha do MySQL
header('Content-Type: application/json');
require_once 'db_config.php';
<?php
header('Content-Type: application/json'); // Define o cabeçalho como JSON
require_once 'db_config.php'; // Inclui as configurações do banco

// Lê os dados brutos enviados pelo front-end e decodifica de JSON para array PHP
$data = json_decode(file_get_contents('php://input'), true);

try {
    // Cria a conexão PDO com o MySQL
    $pdo = new PDO(
        "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME,
        DB_USER,
        DB_PASS
    );
    // Configura o PDO para lançar exceções em caso de erro
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Prepara a consulta SQL recebida do front-end
    $stmt = $pdo->prepare($data['sql']);
    // Executa a consulta com os parâmetros (se houver)
    $stmt->execute($data['params'] ?? []);

    // Monta a resposta padrão
    $result = [
        'success' => true,
        'affectedRows' => $stmt->rowCount() // Número de linhas afetadas
    ];

    // Se for uma consulta SELECT, inclui os dados retornados
    if (stripos($data['sql'], 'SELECT') === 0) {
        $result['data'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
    } 
    // Se for um INSERT, inclui o último ID inserido
    else if (stripos($data['sql'], 'INSERT') === 0) {
        $result['lastInsertId'] = $pdo->lastInsertId();
    }

    // Retorna o resultado como JSON
    echo json_encode($result);
} catch (PDOException $e) {
    // Em caso de erro, retorna uma mensagem de erro
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}