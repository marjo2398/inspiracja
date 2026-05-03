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

        let contentElement;
        if (msg.message_type === 'image') {
            contentElement = document.createElement('img');
            contentElement.src = msg.content;
            contentElement.className = 'max-w-xs md:max-w-sm rounded-lg shadow-md cursor-pointer mt-1 border border-gray-600';
            contentElement.alt = 'Uploaded Image';
            contentElement.addEventListener('click', () => {
                if (msg.content && (msg.content.startsWith('http://') || msg.content.startsWith('https://') || msg.content.startsWith('/'))) {
                    window.open(msg.content, '_blank');
                }
            });
        } else {
            contentElement = document.createElement('span');
            contentElement.innerText = msg.content;
        }

        const timeSpan = document.createElement('span');
        timeSpan.className = 'text-[10px] opacity-50 text-right mt-1';
        // Basic time formatting
        const date = new Date(msg.created_at);
        timeSpan.innerText = isNaN(date.getTime()) ? msg.created_at : date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});

        bubbleContent.appendChild(nameSpan);
        bubbleContent.appendChild(contentElement);
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

    // Sidebar dynamic users rendering
    const usersList = document.getElementById('users-list');
    let activeUserIds = new Set();
    let allUsers = [];

    function renderSidebar() {
        if (!usersList) return;
        usersList.innerHTML = '';
        allUsers.forEach(user => {
            const isActive = activeUserIds.has(user.id.toString());

            const li = document.createElement('li');
            li.className = `flex items-center space-x-3 transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-50 grayscale'}`;
            li.id = `sidebar-user-${user.id}`;

            const avatarContainer = document.createElement('div');
            avatarContainer.className = 'relative';

            const img = document.createElement('img');
            img.src = user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username)}`;
            img.alt = user.username;
            img.className = `w-10 h-10 rounded-full border-2 ${isActive ? 'border-green-500' : 'border-gray-500'}`;

            avatarContainer.appendChild(img);

            if (isActive) {
                const statusDot = document.createElement('span');
                statusDot.className = 'absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-gray-800 rounded-full';
                avatarContainer.appendChild(statusDot);
            }

            const nameSpan = document.createElement('span');
            const isMe = user.id == currentUserId;
            nameSpan.className = `font-medium ${isMe ? 'text-blue-400' : 'text-gray-200'}`;
            nameSpan.innerText = user.username + (isMe ? ' (You)' : '');

            li.appendChild(avatarContainer);
            li.appendChild(nameSpan);

            usersList.appendChild(li);
        });
    }

    // Fetch initial users list
    fetch('api/get_users.php')
        .then(res => res.json())
        .then(users => {
            if (Array.isArray(users)) {
                allUsers = users;
                renderSidebar();
            }
        })
        .catch(err => console.error('Error fetching users:', err));


    // Clipboard Paste Magic
    chatInput.addEventListener('paste', (e) => {
        const items = (e.clipboardData || e.originalEvent.clipboardData).items;
        for (let index in items) {
            const item = items[index];
            if (item.kind === 'file' && item.type.startsWith('image/')) {
                e.preventDefault(); // Stop normal paste
                const blob = item.getAsFile();

                const formData = new FormData();
                formData.append('image', blob);

                // Show some feedback ideally, but keeping it silent/simple as requested
                fetch('api/upload.php', {
                    method: 'POST',
                    body: formData
                })
                .then(res => res.json())
                .then(data => {
                    if (data.success && data.url) {
                        // Automatically send message with image URL
                        return fetch('api/send.php', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                content: data.url,
                                message_type: 'image'
                            })
                        });
                    } else {
                        console.error('Upload failed:', data.error);
                        alert(data.error || 'Upload failed');
                    }
                })
                .then(res => {
                    if (res) return res.json();
                })
                .then(sendData => {
                    if (sendData && sendData.error) {
                        console.error('Send error:', sendData.error);
                    } else if (sendData && sendData.success && sendData.message) {
                         if(sendData.pusher_error) {
                             chatWindow.appendChild(renderMessage(sendData.message));
                             scrollToBottom();
                         }
                    }
                })
                .catch(err => console.error('Error during paste upload pipeline:', err));
            }
        }
    });

    // Initialize Pusher
    function initPusher() {
        // Placeholders match what was in chat-widget.js
        const pusher = new Pusher('YOUR_PUSHER_KEY_PLACEHOLDER', {
            cluster: 'YOUR_PUSHER_CLUSTER_PLACEHOLDER',
            forceTLS: true,
            authEndpoint: 'api/pusher_auth.php'
        });

        // Global chat subscription
        const channel = pusher.subscribe('global-chat-channel');
        channel.bind('new-message', function(data) {
            chatWindow.appendChild(renderMessage(data));
            scrollToBottom();
        });

        // Presence channel subscription
        const presenceChannel = pusher.subscribe('presence-global-chat');

        presenceChannel.bind('pusher:subscription_succeeded', (members) => {
            members.each((member) => {
                activeUserIds.add(member.id.toString());
            });
            renderSidebar();
        });

        presenceChannel.bind('pusher:member_added', (member) => {
            activeUserIds.add(member.id.toString());
            renderSidebar();
        });

        presenceChannel.bind('pusher:member_removed', (member) => {
            activeUserIds.delete(member.id.toString());
            renderSidebar();
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
