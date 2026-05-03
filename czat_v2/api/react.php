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

    if (empty($data['message_id']) || empty($data['emoji'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Message ID and Emoji are required']);
        exit;
    }

    $messageId = (int)$data['message_id'];
    $emoji = $data['emoji'];
    $userId = 2; // Hardcoding user ID to 2 (Jules) for now

    // Check if reaction exists
    $stmt = $pdo->prepare("SELECT id FROM chat_reactions_v2 WHERE message_id = :message_id AND user_id = :user_id AND emoji = :emoji");
    $stmt->execute(['message_id' => $messageId, 'user_id' => $userId, 'emoji' => $emoji]);
    $existing = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($existing) {
        // Remove it
        $stmt = $pdo->prepare("DELETE FROM chat_reactions_v2 WHERE id = :id");
        $stmt->execute(['id' => $existing['id']]);
    } else {
        // Add it
        $stmt = $pdo->prepare("INSERT INTO chat_reactions_v2 (message_id, user_id, emoji) VALUES (:message_id, :user_id, :emoji)");
        $stmt->execute(['message_id' => $messageId, 'user_id' => $userId, 'emoji' => $emoji]);
    }

    // Fetch all reactions for this message to broadcast
    $stmt = $pdo->prepare("SELECT user_id, emoji FROM chat_reactions_v2 WHERE message_id = :message_id");
    $stmt->execute(['message_id' => $messageId]);
    $reactions = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Initialize Pusher
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

    $eventData = [
        'message_id' => $messageId,
        'reactions' => $reactions
    ];

    $pusherError = null;
    try {
        $pusher->trigger('global-chat-channel', 'reaction-updated', $eventData);
    } catch (\Exception $e) {
        $pusherError = $e->getMessage();
    }

    $response = ['success' => true, 'message_id' => $messageId, 'reactions' => $reactions];
    if ($pusherError) {
        $response['pusher_error'] = $pusherError;
    }

    echo json_encode($response);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}
