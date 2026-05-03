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

    // Fetch reactions for the retrieved messages
    if (!empty($messages)) {
        $messageIds = array_column($messages, 'id');
        $placeholders = implode(',', array_fill(0, count($messageIds), '?'));

        $reactionStmt = $pdo->prepare("SELECT message_id, user_id, emoji FROM chat_reactions_v2 WHERE message_id IN ($placeholders)");
        $reactionStmt->execute($messageIds);
        $allReactions = $reactionStmt->fetchAll(PDO::FETCH_ASSOC);

        $reactionsByMessageId = [];
        foreach ($allReactions as $reaction) {
            $reactionsByMessageId[$reaction['message_id']][] = [
                'user_id' => $reaction['user_id'],
                'emoji' => $reaction['emoji']
            ];
        }

        foreach ($messages as &$msg) {
            $msg['reactions'] = $reactionsByMessageId[$msg['id']] ?? [];
        }
    }

    echo json_encode($messages);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}
