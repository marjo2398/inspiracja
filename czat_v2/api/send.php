<?php
header('Content-Type: application/json');

require __DIR__ . '/../vendor/autoload.php';

$dbPath = __DIR__ . '/../chat_v2.db';

try {
    $pdo = new PDO('sqlite:' . $dbPath);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Read POST payload
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);

    if (empty($data['content'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Message content is required']);
        exit;
    }

    $content = $data['content'];
    $messageType = $data['message_type'] ?? 'text';
    if (!in_array($messageType, ['text', 'image'])) {
        $messageType = 'text';
    }

    $userId = 2; // Hardcoding user ID to 2 (Jules) for now

    // Insert the message
    $stmt = $pdo->prepare("INSERT INTO chat_messages_v2 (user_id, message_type, content) VALUES (:user_id, :message_type, :content)");
    $stmt->execute(['user_id' => $userId, 'message_type' => $messageType, 'content' => $content]);

    $messageId = $pdo->lastInsertId();

    // Fetch the newly inserted message joined with user info
    $query = "
        SELECT
            m.id,
            m.user_id,
            m.message_type,
            m.content,
            m.created_at,
            u.username,
            u.avatar
        FROM chat_messages_v2 m
        JOIN users u ON m.user_id = u.id
        WHERE m.id = :id
    ";

    $stmt = $pdo->prepare($query);
    $stmt->execute(['id' => $messageId]);
    $messageData = $stmt->fetch(PDO::FETCH_ASSOC);

    // Initialize Pusher (using placeholder keys)
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

    // Trigger the new-message event on global-chat-channel
    $pusher->trigger('global-chat-channel', 'new-message', $messageData);

    echo json_encode(['success' => true, 'message' => $messageData]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
} catch (\Pusher\ApiErrorException $e) {
    // Return success since it was saved to DB, but indicate pusher failed.
    echo json_encode(['success' => true, 'message' => $messageData, 'pusher_error' => $e->getMessage()]);
} catch (\GuzzleHttp\Exception\GuzzleException $e) {
    // Return success since it was saved to DB, but indicate pusher failed.
    echo json_encode(['success' => true, 'message' => $messageData, 'pusher_error' => $e->getMessage()]);
}
