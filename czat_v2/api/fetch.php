<?php
header('Content-Type: application/json');

$dbPath = __DIR__ . '/../chat_v2.db';

try {
    $pdo = new PDO('sqlite:' . $dbPath);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Fetch the last 50 messages, joined with user info
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
        ORDER BY m.created_at DESC
        LIMIT 50
    ";

    $stmt = $pdo->query($query);
    $messages = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Reverse to get chronological order (oldest to newest for rendering)
    $messages = array_reverse($messages);

    echo json_encode($messages);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}
