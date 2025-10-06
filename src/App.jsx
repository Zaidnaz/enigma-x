import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';

// ---SETUP---
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);
const modelIdentifier = "gemini-2.0-flash";
const voiceModel = genAI.getGenerativeModel({ model: modelIdentifier });

const generateDummyData = () => {
  const data = [];
  for (let i = 10; i >= 0; i--) { data.push({ time: `-${i}s`, val: Math.random() * 100 }); }
  return data;
};

// === MAIN APP COMPONENT ===
export default function App() {
  const [focusedWidget, setFocusedWidget] = useState(null);

  const col1Widgets = ['camera', 'performance', 'nav_readings'];
  const col2Widgets = ['floor_maps', 'robot', 'slam']; // Reordered and removed 'orientation'
  const col3Widgets = ['voice', 'status', 'controls'];

  const getColumnClass = (colWidgets) => {
    if (!focusedWidget) return 'w-full md:w-1/3';
    if (colWidgets.includes(focusedWidget)) return 'w-full md:w-3/5';
    return 'w-full md:w-1/5';
  };

  const backgroundStyles = {
    backgroundColor: '#050b16',
    backgroundImage: `
      repeating-linear-gradient(0deg, rgba(30, 41, 54, 0.5), rgba(30, 41, 54, 0.5) 1px, transparent 1px, transparent 40px),
      repeating-linear-gradient(90deg, rgba(30, 41, 54, 0.5), rgba(30, 41, 54, 0.5) 1px, transparent 1px, transparent 40px),
      radial-gradient(circle at center, #1e2936 0%, #050b16 100%)
    `,
    backgroundSize: '40px 40px',
  };

  return (
    <div 
      className="p-4 min-h-screen flex flex-col text-[#e0e0e0] font-['Inter',_sans-serif] overflow-x-hidden"
      style={backgroundStyles}
    >
      <Header />
      <DisclaimerNote />
      
      <main className="flex-grow flex flex-col md:flex-row gap-6">
        
        <div className={`flex flex-col gap-6 transition-all duration-500 ${getColumnClass(col1Widgets)}`}>
          <CameraFeed setFocusedWidget={setFocusedWidget} focusedWidget={focusedWidget} />
          <SystemPerformance setFocusedWidget={setFocusedWidget} focusedWidget={focusedWidget} />
          <NavigationReadings setFocusedWidget={setFocusedWidget} focusedWidget={focusedWidget} />
        </div>

        <div className={`flex flex-col gap-6 transition-all duration-500 ${getColumnClass(col2Widgets)}`}>
          {/* Floor Maps moved to top, Orientation removed */}
          <FloorMaps setFocusedWidget={setFocusedWidget} focusedWidget={focusedWidget} />
          <RobotImage setFocusedWidget={setFocusedWidget} focusedWidget={focusedWidget} />
          <SlamMap setFocusedWidget={setFocusedWidget} focusedWidget={focusedWidget} />
        </div>

        <div className={`flex flex-col gap-6 transition-all duration-500 ${getColumnClass(col3Widgets)}`}>
          <VoiceChatWidget setFocusedWidget={setFocusedWidget} focusedWidget={focusedWidget} />
          <RobotStatus setFocusedWidget={setFocusedWidget} focusedWidget={focusedWidget} />
          <ManualControls setFocusedWidget={setFocusedWidget} focusedWidget={focusedWidget} />
        </div>

      </main>
    </div>
  );
}

// === WIDGET WRAPPER ===
const WidgetPanel = ({ title, children, focusedWidget, setFocusedWidget, widgetName }) => (
  <div className="bg-slate-900/40 backdrop-blur-sm p-4 rounded-xl border border-slate-700/80 flex flex-col h-full">
    <div className="flex justify-between items-center mb-2">
      <h2 className="text-lg text-white font-semibold">{title}</h2>
      {widgetName && (
        <button 
          onClick={() => setFocusedWidget(focusedWidget === widgetName ? null : widgetName)} 
          className="text-slate-400 hover:text-white text-xl"
        >
          {focusedWidget === widgetName ? '⤡' : '⤢'}
        </button>
      )}
    </div>
    <div className="flex-grow flex flex-col">{children}</div>
  </div>
);


// === ALL WIDGET COMPONENTS ===
const DisclaimerNote = () => (
  <div className="w-full p-3 mb-6 rounded-lg bg-yellow-900/30 border border-yellow-700/50 text-yellow-200 text-sm text-center">
    <span className="font-bold">ℹ️ Prototype Notice:</span> This dashboard is a prototype to showcase our robot's controls and interface. The build is still under progress, and some data may appear vague as we aim to build everything from scratch.
  </div>
);

const Header = () => (
    <header className="w-full grid grid-cols-3 items-center p-4 rounded-xl bg-slate-900/50 backdrop-blur-sm border border-slate-700/80 mb-6">
      <div className="text-left text-lg">
        <span className="text-slate-300 font-semibold">Status:</span>
        <span className="text-[#b968c7] ml-2 font-bold">Connected</span>
      </div>
      
      <div className="text-center">
        <h1 className="text-4xl font-bold text-slate-100" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>
          ENIGMA_X
        </h1>
      </div>
      
      <div className="text-right text-lg">
        <span className="text-slate-300 font-semibold">Time:</span>
        <span className="text-[#00bcd4] ml-2 font-bold">02:15</span>
      </div>
    </header>
);

const CameraFeed = (props) => (
  <WidgetPanel title="Camera Feed" widgetName="camera" {...props}>
    <div className="bg-black flex-grow min-h-[200px] w-full rounded-lg border border-slate-700 flex flex-col items-center justify-center text-slate-500 p-2">
      <img 
        src="https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExbmJ3MHAzZjN5eTRhOHN2OGZlM2Ricjg0dWZ2Z3VnYTY1eWs0ZnFveiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/ecStCn2NUoyDEFClin/giphy.gif" 
        alt="Camera Feed Placeholder GIF" 
        className="w-full h-auto max-h-full object-contain mb-1" 
      />
      <p className="text-xs text-slate-400 mt-1">
        *This is a placeholder GIF from an online source, not a live feed from our robot.
      </p>
    </div>
  </WidgetPanel>
);

const StatusIndicator = ({ label, colorClass, isPulsing }) => (
  <div className="flex items-center justify-between text-sm">
    <span>{label}</span>
    <div className="flex items-center gap-2">
      <span className={colorClass === 'text-green-400' ? 'text-green-400' : 'text-slate-400'}>
        {colorClass === 'text-green-400' ? 'Nominal' : 'Offline'}
      </span>
      <div className={`w-3 h-3 rounded-full ${colorClass === 'text-green-400' ? 'bg-green-400' : 'bg-slate-600'} ${isPulsing ? 'animate-pulse-green' : ''}`}></div>
    </div>
  </div>
);

const RobotStatus = (props) => (
  <WidgetPanel title="System Status" widgetName="status" {...props}>
    <div className="space-y-3">
      <StatusIndicator label="SLAM System" colorClass="text-green-400" isPulsing={true} />
      <StatusIndicator label="LIDAR Sensor" colorClass="text-green-400" isPulsing={false} />
      <StatusIndicator label="Mega Controller 1" colorClass="text-green-400" isPulsing={false} />
      <StatusIndicator label="Voice AI Module" colorClass="text-green-400" isPulsing={false} />
      <StatusIndicator label="GSM Module" colorClass="text-green-400" isPulsing={false} />
    </div>
  </WidgetPanel>
);

const PerfChart = ({ data, label }) => (
    <div className="text-center h-full flex flex-col">
        <div className="flex-grow h-24 w-full">
            <ResponsiveContainer>
                <LineChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <Line type="monotone" dataKey="val" stroke="#8884d8" strokeWidth={2} dot={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#1e2936', border: '1px solid #334155' }}/>
                    <YAxis domain={[0, 100]} hide={true} />
                </LineChart>
            </ResponsiveContainer>
        </div>
        <div className="mt-1 text-cyan-300 text-sm">{label}: {data[data.length - 1].val.toFixed(0)}%</div>
    </div>
);

const SystemPerformance = (props) => {
    const [stats, setStats] = useState({ cpu: generateDummyData(), ram: generateDummyData() });
    useEffect(() => {
        const interval = setInterval(() => { setStats(prev => ({ cpu: [...prev.cpu.slice(1), { time: '0s', val: Math.random() * 100 }], ram: [...prev.ram.slice(1), { time: '0s', val: Math.random() * 100 }] })); }, 1500);
        return () => clearInterval(interval);
    }, []);
    return (
        <WidgetPanel title="Performance" widgetName="performance" {...props}>
             <div className="grid grid-cols-1 gap-4 h-full">
                <PerfChart data={stats.cpu} label="CPU Usage"/>
                <PerfChart data={stats.ram} label="RAM Usage"/>
            </div>
        </WidgetPanel>
    );
};

const RobotImage = (props) => {
  const images = ["robot.png", "robot2.png"];
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <WidgetPanel title="Robot Schematic" widgetName="robot" {...props}>
        <p className="text-sm font-bold text-slate-200 mb-2 text-center">
          This is our robot, made by us and still under build.
        </p>
        <div className="relative w-full flex-grow grid place-items-center">
            {images.map((imageName, index) => (
                <img
                    key={imageName}
                    src={`/images/${imageName}`}
                    alt={`Robot Schematic ${index + 1}`}
                    className={`w-full h-full object-contain transition-opacity duration-1000 col-start-1 row-start-1 ${
                        index === currentIndex ? 'opacity-100' : 'opacity-0'
                    }`}
                />
            ))}
        </div>
    </WidgetPanel>
  );
};

const SlamMap = (props) => {
  const canvasRef = useRef(null);
  const [waypoint, setWaypoint] = useState(null);
  const handleCanvasClick = (event) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    setWaypoint({ x, y });
    console.log(`New dummy waypoint set at: { x: ${x.toFixed(0)}, y: ${y.toFixed(0)} }`);
  };
  useEffect(() => {
    const ctx = canvasRef.current.getContext('2d');
    let x = 50, y = 120, trail = [], animationFrameId;
    const drawMap = () => {
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      trail.push({ x, y }); if (trail.length > 40) trail.shift();
      trail.forEach((p, i) => { ctx.fillStyle = `rgba(185,104,199,${i / trail.length})`; ctx.fillRect(p.x, p.y, 4, 4); });
      ctx.beginPath(); ctx.arc(x, y, 8, 0, 2 * Math.PI); ctx.fillStyle = "#00bcd4"; ctx.shadowColor = "#00bcd4"; ctx.shadowBlur = 10; ctx.fill();
      if(waypoint) { ctx.beginPath(); ctx.arc(waypoint.x, waypoint.y, 10, 0, 2 * Math.PI); ctx.strokeStyle = "#f43f5e"; ctx.lineWidth = 3; ctx.stroke(); }
      x += Math.random() * 8 - 4; y += Math.random() * 8 - 4;
      if (x < 10) x = 10; if (x > canvasRef.current.width-10) x = canvasRef.current.width-10; if (y < 10) y = 10; if (y > canvasRef.current.height-10) y = canvasRef.current.height-10;
      animationFrameId = requestAnimationFrame(drawMap);
    };
    drawMap();
    return () => cancelAnimationFrame(animationFrameId);
  }, [waypoint]);
  return (
    <WidgetPanel title="SLAM Visualization" widgetName="slam" {...props}>
        <div className="w-full aspect-video">
            <canvas ref={canvasRef} onClick={handleCanvasClick} width="400" height="250" className="w-full h-full bg-[url('/images/map-grid.png')] bg-cover rounded-xl cursor-crosshair"></canvas>
        </div>
    </WidgetPanel>
  );
};

const FloorMaps = (props) => {
  const floorImages = ["floor.jpg", "floor1.jpg", "floor2.jpg", "floor3.jpg", "floor4.jpg"];
  const openMap = (src) => {
    const w = window.open("", "_blank", "width=800,height=600");
    w.document.write(`<body style="margin:0; background:black;"><img src="${src}" style="width:100%;height:auto;"></body>`);
  };
  return (
    <WidgetPanel title="Floor Maps" widgetName="floor_maps" {...props}>
      <div className="grid grid-cols-5 gap-2">
        {floorImages.map((img, i) => (
          <img
            key={`floor-${i}`}
            src={`/images/${img}`}
            className="hover:scale-110 transition-all rounded-xl cursor-pointer"
            onClick={() => openMap(`/images/${img}`)}
            alt={`Floor map ${i + 1}`}
          />
        ))}
      </div>
    </WidgetPanel>
  );
};

const ManualControls = (props) => {
    const sendCommand = (cmd) => { console.log(`Dummy Command Sent: ${cmd}`); };
    return (
        <WidgetPanel title="Manual Control" widgetName="controls" {...props}>
            <div className="flex items-center justify-center h-full">
                <div className="grid grid-cols-3 gap-2 w-40">
                    <div></div>
                    <button onClick={() => sendCommand('FORWARD')} className="bg-slate-700 hover:bg-cyan-500 rounded p-4 text-xl">↑</button>
                    <div></div>
                    <button onClick={() => sendCommand('LEFT')} className="bg-slate-700 hover:bg-cyan-500 rounded p-4 text-xl">←</button>
                    <button onClick={() => sendCommand('STOP')} className="bg-slate-700 hover:bg-red-500 rounded p-4">🛑</button>
                    <button onClick={() => sendCommand('RIGHT')} className="bg-slate-700 hover:bg-cyan-500 rounded p-4 text-xl">→</button>
                    <div></div>
                    <button onClick={() => sendCommand('BACKWARD')} className="bg-slate-700 hover:bg-cyan-500 rounded p-4 text-xl">↓</button>
                    <div></div>
                </div>
            </div>
        </WidgetPanel>
    )
}

// Updated NavigationReadings component
const NavigationReadings = (props) => {
    const initialMetrics = [
        { name: "YDLIDAR X2", value: 0, max: 12 },
        { name: "SLAM Accuracy", value: 0, max: 100 },
        { name: "Path Confidence", value: 0, max: 100 },
        { name: "Obstacle Detection", value: 0, max: 50 },
        { name: "ReSpeaker Mic", value: 0, max: 12 },
        { name: "Battery Health", value: 0, max: 100 },
        { name: "Motor Temp (Left)", value: 0, max: 90 },
        { name: "Motor Temp (Right)", value: 0, max: 90 },
        { name: "Network Latency (ms)", value: 0, max: 200 },
    ];
    const [metrics, setMetrics] = useState(initialMetrics);

    useEffect(() => {
        const interval = setInterval(() => {
            setMetrics(prevMetrics =>
                prevMetrics.map(metric => ({
                    ...metric,
                    value: Math.random() * metric.max
                }))
            );
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    return (
        <WidgetPanel title="Nav Readings" widgetName="nav_readings" {...props}>
            <div className="space-y-3">
                {metrics.map(metric => (
                    <div key={metric.name}>
                        <div className='flex justify-between text-sm mb-1'>
                            <span>{metric.name}</span>
                            <span className='text-cyan-300'>{metric.value.toFixed(1)}</span>
                        </div>
                        <div className='h-2 bg-slate-700 rounded overflow-hidden'>
                            <div
                                className='h-full bg-gradient-to-r from-[#00bcd4] to-[#b968c7] transition-all duration-500'
                                style={{ width: `${(metric.value / metric.max) * 100}%` }}
                            ></div>
                        </div>
                    </div>
                ))}
            </div>
        </WidgetPanel>
    );
};

const VoiceChatWidget = (props) => {
    const [log, setLog] = useState([]);
    const [status, setStatus] = useState('Idle');
    const [textInput, setTextInput] = useState('');
    const recognitionRef = useRef(null);
    const logEndRef = useRef(null);

    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) { setStatus('No Speech API'); return; }
        const recognition = new SpeechRecognition();
        recognition.lang = 'en-US'; recognition.interimResults = false;
        recognition.onstart = () => { setStatus('Listening...'); };
        recognition.onend = () => { setStatus('Idle'); };
        recognition.onerror = () => { setStatus('Mic Error'); };
        recognition.onresult = (e) => {
            const transcript = e.results[0][0].transcript;
            appendLog('user', transcript);
            sendVoiceText(transcript);
        };
        recognitionRef.current = recognition;
    }, []);

    useEffect(() => { logEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [log]);

    const appendLog = (sender, text) => {
        setLog(prev => [...prev, { sender, text }]);
        if (sender === 'bot') {
            try {
                const utterance = new SpeechSynthesisUtterance(text);
                speechSynthesis.speak(utterance);
            } catch (err) { console.warn('Speech synthesis failed', err); }
        }
    };

    const sendVoiceText = async (message) => {
        setStatus('Processing...');
        const prompt = `You are a voice assistant for a robot. Be conversational and concise. The user said: ${message}`;
        try {
            const result = await voiceModel.generateContent(prompt);
            const response = await result.response;
            const text = response.text();
            appendLog('bot', text || '[No response]');
        } catch (e) {
            appendLog('bot', '[Error contacting server]');
        } finally { 
            setStatus('Idle'); 
        }
    };

    const handleMicToggle = () => {
        if (status === 'Listening...') { recognitionRef.current?.stop(); } else { recognitionRef.current?.start(); }
    };

    const handleTextSubmit = (e) => {
        e.preventDefault();
        if (!textInput.trim()) return;
        appendLog('user', textInput);
        sendVoiceText(textInput);
        setTextInput('');
    };

    return (
        <WidgetPanel title="Voice AI" widgetName="voice" {...props}>
            <div className="flex items-center gap-2 mb-2">
                <button onClick={handleMicToggle} className="bg-[#b968c7] hover:brightness-110 text-white px-3 py-1 rounded-lg text-sm">
                    {status === 'Listening...' ? 'Stop Mic' : 'Start Mic'}
                </button>
                <button onClick={() => setLog([])} className="bg-slate-600 hover:bg-slate-500 text-white px-3 py-1 rounded-lg text-sm">Clear</button>
                <span className="text-xs text-cyan-300">{status}</span>
            </div>
            <div className="h-40 overflow-y-auto text-xs bg-slate-900/60 border border-slate-700 rounded p-2 space-y-1">
                {log.map((entry, i) => (
                    <div key={i}>
                        <span className={entry.sender === 'user' ? 'text-[#b968c7] font-semibold' : 'text-cyan-300 font-semibold'}>
                            {entry.sender === 'user' ? 'You: ' : 'Gemini: '}
                        </span>
                        {entry.text}
                    </div>
                ))}
                <div ref={logEndRef}></div>
            </div>
            <form onSubmit={handleTextSubmit} className="mt-2 flex gap-2">
                <input type="text" placeholder="Type message..." value={textInput} onChange={(e) => setTextInput(e.target.value)} className="flex-grow bg-slate-700 text-white rounded px-2 py-1 text-sm focus:outline-none" autoComplete="off" />
                <button className="bg-[#00bcd4] text-white px-3 py-1 rounded text-sm" type="submit">Send</button>
            </form>
             <div className="mt-2 text-[10px] text-slate-400">Responses are also spoken aloud.</div>
        </WidgetPanel>
    );
};