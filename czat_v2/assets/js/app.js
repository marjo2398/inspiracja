document.addEventListener('DOMContentLoaded', () => {
    const chatWindow = document.getElementById('chat-window');
    const chatForm = document.getElementById('chat-form');
    const chatInput = document.getElementById('chat-input');
    const currentUserId = 2; // Hardcoded to Jules based on send.php logic

    // Function to render a single message bubble
    function renderMessage(msg) {
        const isMine = msg.user_id == currentUserId;
        const alignClass = isMine ? 'justify-end' : 'justify-start';
        const bubbleBgClass = isMine ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-200';
        const roundedClass = isMine ? 'rounded-tl-lg rounded-tr-lg rounded-bl-lg' : 'rounded-tl-lg rounded-tr-lg rounded-br-lg';

        const wrapper = document.createElement('div');
        wrapper.className = `flex ${alignClass} w-full`;

        const inner = document.createElement('div');
        inner.className = `flex max-w-[70%] ${isMine ? 'flex-row-reverse' : 'flex-row'} items-end space-x-2`;

        // Avatar
        const avatarImg = document.createElement('img');
        avatarImg.src = msg.avatar || 'https://ui-avatars.com/api/?name=User';
        avatarImg.alt = msg.username || 'User';
        avatarImg.className = `w-8 h-8 rounded-full flex-shrink-0 ${isMine ? 'ml-2' : 'mr-2'}`;

        // Bubble
        const bubbleContent = document.createElement('div');
        bubbleContent.className = `px-4 py-2 text-sm shadow ${bubbleBgClass} ${roundedClass} flex flex-col space-y-1`;

        const nameSpan = document.createElement('span');
        nameSpan.className = 'text-xs font-semibold opacity-75';
        nameSpan.innerText = msg.username;

        const textSpan = document.createElement('span');
        textSpan.innerText = msg.content;

        const timeSpan = document.createElement('span');
        timeSpan.className = 'text-[10px] opacity-50 text-right mt-1';
        // Basic time formatting
        const date = new Date(msg.created_at);
        timeSpan.innerText = isNaN(date.getTime()) ? msg.created_at : date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});

        bubbleContent.appendChild(nameSpan);
        bubbleContent.appendChild(textSpan);
        bubbleContent.appendChild(timeSpan);

        inner.appendChild(avatarImg);
        inner.appendChild(bubbleContent);

        wrapper.appendChild(inner);
        return wrapper;
    }

    // Function to auto-scroll to the bottom
    function scrollToBottom() {
        chatWindow.scrollTop = chatWindow.scrollHeight;
    }

    // Load initial messages
    fetch('api/fetch.php')
        .then(res => res.json())
        .then(data => {
            chatWindow.innerHTML = ''; // Clear "Initializing secure channel..."
            if (data.error) {
                console.error('Error fetching messages:', data.error);
                return;
            }

            data.forEach(msg => {
                chatWindow.appendChild(renderMessage(msg));
            });
            scrollToBottom();
        })
        .catch(err => {
            console.error('Fetch error:', err);
            chatWindow.innerHTML = '<div class="text-red-500 text-center w-full">Error loading messages.</div>';
        });

    // Handle form submission
    chatForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const content = chatInput.value.trim();
        if (!content) return;

        chatInput.value = '';

        fetch('api/send.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ content })
        })
        .then(res => res.json())
        .then(data => {
            if (data.error) {
                console.error('Error sending message:', data.error);
            } else if (data.success && data.message) {
                // If pusher errors locally, let's at least render optimistically since the user successfully sent.
                // But only if we didn't receive a pusher event for it yet (in a real app we'd check ID or handle differently)
                // For this demo, let's just optimistically render it to make it work locally if pusher is a placeholder.
                if(data.pusher_error) {
                     chatWindow.appendChild(renderMessage(data.message));
                     scrollToBottom();
                }
            }
        })
        .catch(err => {
            console.error('Send error:', err);
        });
    });

    // Initialize Pusher
    function initPusher() {
        // Placeholders match what was in chat-widget.js
        const pusher = new Pusher('YOUR_PUSHER_KEY_PLACEHOLDER', {
            cluster: 'YOUR_PUSHER_CLUSTER_PLACEHOLDER',
            forceTLS: true
        });

        const channel = pusher.subscribe('global-chat-channel');

        channel.bind('new-message', function(data) {
            chatWindow.appendChild(renderMessage(data));
            scrollToBottom();
        });
    }

    // Ensure Pusher is loaded
    if (typeof Pusher === 'undefined') {
        const script = document.createElement('script');
        script.src = 'https://js.pusher.com/8.2.0/pusher.min.js';
        script.onload = initPusher;
        document.head.appendChild(script);
    } else {
        initPusher();
    }
});
