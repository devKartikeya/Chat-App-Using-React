import { useEffect, useRef, useState } from 'react'

function App() {
  const [value, setValue] = useState('');
  const socket = useRef();
  const [messages, setMessages] = useState([]);

  function generateRandomUsername() {
    const adjectives = ['Swift', 'Silent', 'Brave', 'Clever', 'Mighty'];
    const animals = ['Lion', 'Eagle', 'Shark', 'Wolf', 'Panther'];
    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const animal = animals[Math.floor(Math.random() * animals.length)];
    return `${adjective}${animal}${Math.floor(Math.random() * 1000)}`;
  }

  const username = prompt("Enter your username") || generateRandomUsername();

  useEffect(() => {
    socket.current = new WebSocket("ws://localhost:3000");

    if (username) {
      socket.current.onopen = () => {
        console.log("Connected");
        socket.current.send(JSON.stringify({ type: 'join', message: 'Hello Server!', username }));
      };

      socket.current.onmessage = (event) => {
        const message = JSON.parse(event.data);
        if (message.type === 'message') {
          setMessages(prev => [...prev, { text: `${message.username}: ${message.message}`, isSent: false }]);
        }
        if (message.type === 'join') {
          alert(`Welcome ${message.username} to the chat!`);
          setMessages(prev => [...prev, { text: `${message.username}: ${message.message}`, isSent: false }]);
        }
      };

      socket.current.onclose = () => {
        console.log("Disconnected");
      };

      return () => {
        socket.current.close();
      };
    } else {
      alert("Username is required to join the chat!");
    }
  }, []);

  function sendMessage() {
    if (!value.trim()) return;
    socket.current.send(JSON.stringify({ type: 'message', message: value, username }));
    setMessages(prev => [...prev, { text: `You: ${value}`, isSent: true }]);
    setValue('');
  }

  return (
    <div className='w-screen h-screen flex justify-center items-center bg-gradient-to-r from-purple-900 via-indigo-800 to-blue-900'>
      <div className='h-4/5 w-1/3 bg-gray-900 rounded-3xl flex flex-col p-4 shadow-2xl'>
        <h1 className='text-2xl text-white font-bold mb-2'>☁️ WebSocket Chat</h1>
        <div className='flex-1 p-2 bg-gray-800 w-full rounded-lg overflow-y-auto'>
          <ul className="w-full flex flex-col gap-2">
            {messages.map((msg, index) => (
              <li
                key={index}
                className={`flex ${msg.isSent ? "justify-end" : "justify-start"} font-bold`}
              >
                <span
                  className={`px-3 py-2 rounded-xl max-w-xs break-words text-sm ${msg.isSent
                    ? "bg-blue-500 text-white rounded-br-none"
                    : "bg-gray-300 text-black rounded-bl-none"
                    }`}
                >
                  {msg.text}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className='w-full mt-2 flex gap-2'>
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className='flex-1 p-2 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500'
            placeholder='Type your message...'
          />
          <button
            onClick={sendMessage}
            className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition'
          >
            Send
          </button>
        </div>
      </div>
    </div>
  )
}

export default App