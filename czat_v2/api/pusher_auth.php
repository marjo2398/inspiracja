<?php
header('Content-Type: application/json');

require __DIR__ . '/../vendor/autoload.php';

$dbPath = __DIR__ . '/../chat_v2.db';

try {
    $pdo = new PDO('sqlite:' . $dbPath);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Hardcoding user ID to 2 (Jules) for now
    $userId = 2;

    $stmt = $pdo->prepare("SELECT id, username, avatar FROM users WHERE id = :id");
    $stmt->execute(['id' => $userId]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        http_response_code(401);
        echo json_encode(['error' => 'Unauthorized: User not found']);
        exit;
    }

    $channel_name = $_POST['channel_name'] ?? '';
    $socket_id = $_POST['socket_id'] ?? '';

    if (empty($channel_name) || empty($socket_id)) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing channel_name or socket_id']);
        exit;
    }

    $options = array(
        'cluster' => 'YOUR_PUSHER_CLUSTER_PLACEHOLDER',
        'useTLS' => true
    );
    $pusher = new Pusher\Pusher(
        'YOUR_PUSHER_KEY_PLACEHOLDER',
        'YOUR_PUSHER_SECRET_PLACEHOLDER',
        'YOUR_PUSHER_APP_ID_PLACEHOLDER',
        $options
    );

    $presence_data = array(
        'id' => $user['id'],
        'user_info' => array(
            'username' => $user['username'],
            'avatar' => $user['avatar']
        )
    );

    $auth = $pusher->presence_auth($channel_name, $socket_id, $user['id'], $presence_data);

    echo $auth;

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
} catch (\Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Pusher error: ' . $e->getMessage()]);
}
