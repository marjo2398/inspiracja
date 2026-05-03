<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Demons Chat V2</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        /* Custom scrollbar for chat window */
        #chat-window::-webkit-scrollbar {
            width: 8px;
        }
        #chat-window::-webkit-scrollbar-track {
            background: #1f2937; /* gray-800 */
        }
        #chat-window::-webkit-scrollbar-thumb {
            background-color: #4b5563; /* gray-600 */
            border-radius: 4px;
        }
    </style>
</head>
<body class="bg-gray-900 text-white min-h-screen flex flex-col h-screen overflow-hidden">
    <!-- Header -->
    <header class="bg-gray-800 p-4 shadow-md border-b border-gray-700 z-10">
        <div class="container mx-auto flex justify-between items-center">
            <h1 class="text-2xl font-bold text-blue-500 tracking-wide">Demons Chat V2 - Operations Center</h1>
            <span class="text-sm text-gray-400">Status: <span class="text-green-400 font-semibold">Online</span></span>
        </div>
    </header>

    <!-- Main Content Area -->
    <main class="flex-grow flex container mx-auto overflow-hidden">

        <!-- Left Sidebar: Users -->
        <aside class="w-1/4 bg-gray-800 border-r border-gray-700 p-4 flex flex-col h-full overflow-y-auto">
            <h2 class="text-lg font-semibold text-gray-300 mb-4 border-b border-gray-700 pb-2">Active Personnel</h2>
            <ul id="users-list" class="space-y-3">
                <!-- Users will be injected here dynamically -->
            </ul>
        </aside>

        <!-- Main Chat Area -->
        <section class="w-3/4 flex flex-col h-full bg-gray-900 relative">

            <!-- Chat Messages Window -->
            <div id="chat-window" class="flex-grow p-4 overflow-y-auto flex flex-col space-y-4">
                <!-- Messages will be injected here dynamically -->
                <div class="flex items-center justify-center h-full text-gray-500 italic">
                    Initializing secure channel...
                </div>
            </div>

            <!-- Input Area -->
            <div class="p-4 bg-gray-800 border-t border-gray-700">
                <form id="chat-form" class="flex space-x-4">
                    <input type="text" id="chat-input" autocomplete="off" placeholder="Type a message..."
                           class="flex-grow bg-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-gray-600 transition-colors placeholder-gray-400" required>
                    <button type="submit"
                            class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 flex items-center">
                        <span>Send</span>
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 ml-2 transform rotate-90" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                        </svg>
                    </button>
                </form>
            </div>
        </section>
    </main>

    <!-- Global Chat Widget Script -->
    <script src="/czat_v2/assets/js/chat-widget.js"></script>

    <!-- Application Logic -->
    <script src="/czat_v2/assets/js/app.js"></script>
</body>
</html>
