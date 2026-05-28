import { useEffect, useRef, useState } from 'react'

function App() {
  const [value, setValue] = useState('');
  const socket = useRef(null);
  const [messages, setMessages] = useState([]);

  const usernameRef = useRef(null);

  function generateRandomUsername() {
    const adjectives = ['Swift', 'Silent', 'Brave', 'Clever', 'Mighty'];
    const animals = ['Lion', 'Eagle', 'Shark', 'Wolf', 'Panther'];
    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const animal = animals[Math.floor(Math.random() * animals.length)];
    return `${adjective}${animal}${Math.floor(Math.random() * 1000)}`;
  }

  if (!usernameRef.current) {
    usernameRef.current = prompt("Enter your username") || generateRandomUsername();
  }

  const username = usernameRef.current;

  useEffect(() => {
    socket.current = new WebSocket("wss://chat-app-using-react-kwrs.onrender.com");

    socket.current.onopen = () => {
      console.log("Connected");
      socket.current.send(JSON.stringify({
        type: 'join',
        message: 'joined the chat!',
        username
      }));
    };

    socket.current.onmessage = (event) => {
      const message = JSON.parse(event.data);

      if (message.username === username) return;

      if (message.type === 'message' || message.type === 'join') {
        setMessages(prev => [
          ...prev,
          { text: `${message.username}: ${message.message}`, isSent: false }
        ]);
      }
    };

    socket.current.onclose = () => {
      console.log("Disconnected");
    };

    return () => {
      socket.current.close();
    };
  }, [username]);

  function sendMessage() {
    if (!value.trim()) return;

    socket.current.send(JSON.stringify({
      type: 'message',
      message: value,
      username
    }));

    setMessages(prev => [
      ...prev,
      { text: `You: ${value}`, isSent: true }
    ]);

    setValue('');
  }

  return (
    <div className='w-screen h-screen flex justify-center items-center bg-black text-white p-2 sm:p-4'>

      <div className='relative w-full h-full sm:h-[90%] sm:max-w-md md:max-w-lg lg:max-w-xl 
                      bg-gradient-to-br from-gray-900 via-black to-gray-950 
                      rounded-2xl sm:rounded-3xl flex flex-col p-3 sm:p-4 
                      shadow-[0_0_25px_rgba(0,0,0,0.8)] border border-gray-700'>

        {/* Glowing C background */}
        <div className="absolute inset-0 flex justify-center items-center pointer-events-none">
          <span className="text-[10rem] sm:text-[14rem] font-extrabold text-white/10 
                           drop-shadow-[0_0_25px_rgba(255,255,255,0.6)] select-none">
            C
          </span>
        </div>

        <h1 className='text-lg sm:text-2xl font-bold mb-2 text-white tracking-wide relative z-10'>
          ⚡Confab - Real-time Chat App
        </h1>

        {/* Messages */}
        <div className='flex-1 p-2 bg-black/40 backdrop-blur-md w-full rounded-lg overflow-y-auto border border-gray-700 relative z-10'>
          <ul className="w-full flex flex-col gap-2">
            {messages.map((msg, index) => (
              <li
                key={index}
                className={`flex ${msg.isSent ? "justify-end" : "justify-start"} font-medium`}
              >
                <span
                  className={`px-3 py-2 rounded-xl max-w-[75%] sm:max-w-xs break-words text-xs sm:text-sm shadow-md transition 
                    ${msg.isSent
                      ? "bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-br-none hover:shadow-blue-500/50"
                      : "bg-gradient-to-r from-gray-200 to-gray-300 text-black rounded-bl-none hover:shadow-gray-400/50"
                    }`}
                >
                  {msg.text}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Input */}
        <div className='w-full mt-2 flex gap-2 relative z-10'>
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            className='flex-1 p-2 text-sm sm:text-base rounded-lg bg-black/60 text-white 
                       placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-700'
            placeholder='Type your message...'
          />
          <button
            onClick={sendMessage}
            className='px-3 sm:px-4 py-2 text-sm sm:text-base bg-gradient-to-r from-blue-600 to-indigo-700 
                       text-white rounded-lg hover:from-blue-700 hover:to-indigo-800 transition shadow-md'
          >
            Send
          </button>
        </div>

      </div>
    </div>
  );
}

export default App;