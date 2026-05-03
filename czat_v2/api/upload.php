<?php
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

if (!isset($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
    http_response_code(400);
    echo json_encode(['error' => 'No image uploaded or upload error occurred']);
    exit;
}

$file = $_FILES['image'];

// Validate MIME type
$allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
$fileMimeType = mime_content_type($file['tmp_name']);

if (!in_array($fileMimeType, $allowedMimeTypes)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid file type. Only JPG, PNG, GIF, and WEBP are allowed.']);
    exit;
}

// Extension resolution
$extensions = [
    'image/jpeg' => 'jpg',
    'image/png'  => 'png',
    'image/gif'  => 'gif',
    'image/webp' => 'webp'
];
$ext = $extensions[$fileMimeType];

$uploadDir = __DIR__ . '/../uploads/images/';

// Generate unique filename
$filename = uniqid('img_', true) . '.' . $ext;
$targetPath = $uploadDir . $filename;

if (move_uploaded_file($file['tmp_name'], $targetPath)) {
    // Return relative URL for rendering
    $url = '/czat_v2/uploads/images/' . $filename;
    echo json_encode(['success' => true, 'url' => $url]);
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to save the uploaded image.']);
}
