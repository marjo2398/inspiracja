(function() {
    // Inject styles for the widget using raw CSS (emulating Tailwind classes)
    const style = document.createElement('style');
    style.innerHTML = `
        #demons-chat-widget {
            position: fixed;
            bottom: 24px;
            right: 24px;
            width: 64px;
            height: 64px;
            background-color: #3b82f6; /* blue-500 */
            border-radius: 9999px;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
            cursor: pointer;
            z-index: 50;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s ease-in-out;
        }
        #demons-chat-widget:hover {
            background-color: #2563eb; /* blue-600 */
            transform: scale(1.05);
        }
        #demons-chat-widget svg {
            width: 32px;
            height: 32px;
            fill: #ffffff;
        }
        #demons-chat-badge {
            position: absolute;
            top: -4px;
            right: -4px;
            background-color: #ef4444; /* red-500 */
            color: #ffffff;
            font-size: 12px;
            font-weight: bold;
            font-family: ui-sans-serif, system-ui, sans-serif;
            min-width: 24px;
            height: 24px;
            border-radius: 9999px;
            display: none;
            align-items: center;
            justify-content: center;
            padding: 0 6px;
            box-sizing: border-box;
            border: 2px solid #ffffff;
        }
    `;
    document.head.appendChild(style);

    // Create the widget container
    const widget = document.createElement('div');
    widget.id = 'demons-chat-widget';

    // SVG icon for chat
    const icon = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
        </svg>
    `;

    // Unread badge
    const badge = document.createElement('div');
    badge.id = 'demons-chat-badge';
    badge.innerText = '0';

    widget.innerHTML = icon;
    widget.appendChild(badge);
    document.body.appendChild(widget);

    // Widget click handler: redirect to V2 Chat Operations Center
    widget.addEventListener('click', () => {
        window.location.href = '/czat_v2/index.php';
    });

    // Audio for pop sound (base64 string)
    // Using a tiny placeholder WAV file for the pop sound
    const popSound = new Audio('data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA');

    let unreadCount = 0;

    // Initialize Pusher
    function initChatWidget() {
        // Placeholders for Pusher keys
        const pusher = new Pusher('YOUR_PUSHER_KEY_PLACEHOLDER', {
            cluster: 'YOUR_PUSHER_CLUSTER_PLACEHOLDER',
            forceTLS: true
        });

        const channel = pusher.subscribe('global-chat-channel');

        channel.bind('new-message', function(data) {
            unreadCount++;
            badge.innerText = unreadCount > 99 ? '99+' : unreadCount;
            badge.style.display = 'flex';

            // Play pop sound
            popSound.play().catch(err => {
                console.log('Audio playback prevented by browser policy', err);
            });
        });
    }

    // Load Pusher library dynamically if not present
    if (typeof Pusher === 'undefined') {
        const script = document.createElement('script');
        script.src = 'https://js.pusher.com/8.2.0/pusher.min.js';
        script.onload = initChatWidget;
        document.head.appendChild(script);
    } else {
        initChatWidget();
    }
})();
