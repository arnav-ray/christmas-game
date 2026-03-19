import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, onSnapshot, updateDoc, arrayUnion, increment, getDoc, runTransaction } from "firebase/firestore";
import { getAuth, signInAnonymously } from "firebase/auth";
import { 
  Clock, Target, RotateCcw, Crown, Snowflake, Trash2, Plus, 
  Play, BookOpen, Shield, Zap, Sparkles, Volume2, VolumeX, 
  User, Check, X, Minus, Edit3
} from 'lucide-react';

// ==========================================
// 1. FIREBASE CONFIGURATION
// ==========================================
// Credentials are loaded from environment variables.
// Copy .env.example to .env.local and fill in your project values.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// ==========================================
// 2. GAME DATA & CONSTANTS
// ==========================================

// REQ 4: Reduced hit requirements
const LEVELS = [
  { id: 0, name: 'Golden Star', icon: '⭐', hitsRequired: 10 },
  { id: 1, name: 'Magic Lights', icon: '💡', hitsRequired: 15 },
  { id: 2, name: 'Guardian Snowman', icon: '⛄', hitsRequired: 25 },
  { id: 3, name: 'Polar Express', icon: '🚂', hitsRequired: 30 },
  { id: 4, name: 'Toy Factory', icon: '🏭', hitsRequired: 40 }
];

const RANKS = [
  { level: 0, title: 'Elf Apprentice', icon: '🎄' },
  { level: 1, title: 'Snowball Scout', icon: '⚪' },
  { level: 3, title: 'Winter Warrior', icon: '❄️' },
  { level: 5, title: 'Frost Guardian', icon: '🛡️' },
  { level: 10, title: 'North Pole Hero', icon: '⭐' },
  { level: 20, title: 'Christmas Champion', icon: '👑' }
];

// FULL DATA RESTORED: 5 Kids with 5 unique tasks each
const INITIAL_KIDS = [
  { 
    id: 1, name: 'AG', nice: 0, naughty: 0, claimedBy: null, 
    tasks: [
      { id: 1, task: 'Doing Maths', done: false },
      { id: 2, task: 'Learning Music', done: false },
      { id: 3, task: 'Helping Parents', done: false },
      { id: 4, task: 'Eating Veggies', done: false },
      { id: 5, task: 'Being Kind', done: false }
    ]
  },
  { 
    id: 2, name: 'LG', nice: 0, naughty: 0, claimedBy: null, 
    tasks: [
      { id: 1, task: 'Homework', done: false },
      { id: 2, task: 'Piano Practice', done: false },
      { id: 3, task: 'Cleaning Room', done: false },
      { id: 4, task: 'Finish Dinner', done: false },
      { id: 5, task: 'Sharing Toys', done: false }
    ]
  },
  { 
    id: 3, name: 'FG', nice: 0, naughty: 0, claimedBy: null, 
    tasks: [
      { id: 1, task: 'Reading Books', done: false },
      { id: 2, task: 'Guitar Practice', done: false },
      { id: 3, task: 'Helping Dishes', done: false },
      { id: 4, task: 'Trying Foods', done: false },
      { id: 5, task: 'Playing Nice', done: false }
    ]
  },
  { 
    id: 4, name: 'AR', nice: 0, naughty: 0, claimedBy: null, 
    tasks: [
      { id: 1, task: 'Studying Hard', done: false },
      { id: 2, task: 'Violin Practice', done: false },
      { id: 3, task: 'Helping Cook', done: false },
      { id: 4, task: 'Eating Fruits', done: false },
      { id: 5, task: 'Being Polite', done: false }
    ]
  },
  { 
    id: 5, name: 'SG', nice: 0, naughty: 0, claimedBy: null, 
    tasks: [
      { id: 1, task: 'Homework', done: false },
      { id: 2, task: 'Drum Practice', done: false },
      { id: 3, task: 'Tidying Up', done: false },
      { id: 4, task: 'Healthy Eating', done: false },
      { id: 5, task: 'Listening Well', done: false }
    ]
  }
];

const WISDOM_MESSAGES = [
  { title: "The Gift of Kindness", message: "Like the boy who shared his last bread with a stranger in the forest, remember: the smallest act of kindness can light up the darkest winter night. True magic lives in helping others." },
  { title: "The Power of Patience", message: "The wise owl waits, the hasty hare stumbles. Good things come to those who work steadily toward their goals." },
  { title: "Courage in Small Steps", message: "Even the mightiest oak tree started as a tiny acorn. You don't need to be the strongest—you just need to keep trying, one small brave step at a time." },
  { title: "The Value of Honesty", message: "The woodcutter who told the truth received riches, while the liar lost everything. Your word is your treasure—keep it pure and bright." },
  { title: "Strength in Unity", message: "The bundle of sticks cannot be broken, though each twig alone is weak. When we work together with our family and friends, we become unstoppable." },
  { title: "The Magic of Gratitude", message: "In every old story, those who said 'thank you' received blessings. Count your blessings like stars in the sky—there are always more than you think." },
  { title: "Wisdom of Listening", message: "The fox who listened to the wise old badger survived the winter, while the proud rabbit who ignored advice was lost. Sometimes the best thing we can do is listen." },
  { title: "Joy in Simple Things", message: "The poorest child in the village found happiness in a pinecone, while the rich merchant's son was never satisfied. True joy comes from the wonder we find in small treasures." }
];

const STORIES = {
  intro: "Long ago, when the world was younger and magic still danced on winter winds, there lived an ice witch in the deepest forest. Jealous of the joy that Christmas brought to children, she cast a terrible spell upon the North Pole.\n\nThe magical Christmas Star fell from the heavens, plunging Santa's village into eternal darkness. Without its light, the elves could not work, the reindeer could not fly, and the toy machines fell silent.\n\nBut prophecy speaks of brave young agents who would one day restore the light. These heroes must prove their worth through good deeds, survive the corrupted sorting machine, and defeat the Grinch's minions in battle.\n\nOnly then would the five sacred treasures be restored, and Christmas would shine bright once more.\n\nAre you ready to become the hero of this tale?",
  
  afterSetup: "The agents have passed the first trial! Like the brave children in tales of old who earned wisdom through honest deeds, you have proven your worth.\n\nBut the ice witch has corrupted Santa's Great Sorting Machine. For the next 15 seconds, it will judge you... but beware! The witch's curse makes it unpredictable. Sometimes good becomes bad, and bad becomes good.\n\nSteel your courage. The Great Sorting begins NOW!",
  
  afterGame: "You survived the Sorting! Despite the witch's interference, you have generated spirit coins—ancient currency of the North Pole.\n\nBut deep in his cave, the Grinch has awakened. This twisted creature guards the five sacred treasures with jealous rage.\n\nTo restore the Christmas Star, you must reclaim each treasure by defeating the Grinch in battle. Five items. Five battles. Each victory will weaken the witch's curse.\n\nGrab your snowballs! Your quest begins with the Golden Star...",
  
  afterBoss: "The Grinch stumbles backward, defeated! One sacred treasure has been reclaimed. The northern lights flicker above, the snow sparkles brighter.\n\nBut the witch's curse still holds. More treasures remain. More battles stand between you and Christmas.\n\nRest for now, young heroes. The next battle awaits...",
  
  victory: "The fifth treasure is restored! The Golden Star, the Magic Lights, the Guardian Snowman, the Polar Express, and the Toy Factory—all glow with ancient power!\n\nTogether, they summon the Christmas Star from the void! Light EXPLODES across the North Pole! The ice witch's tower crumbles, her curse shattered forever.\n\nThe elves dance, the reindeer fly in loops of joy, and the toy machines roar back to life. Even the Grinch smiles for the first time in years.\n\nChristmas is SAVED! And it was YOU who broke the curse and restored the magic.\n\nNever forget: the greatest magic lives not in stars or spells, but in the courage and kindness of those who refuse to give up."
};

// ==========================================
// 3. UTILITIES & AUDIO
// ==========================================

const playShootSound = () => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 800 + Math.random() * 200; // Pitch variation
    osc.type = 'sine';
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.1);
  } catch (e) {
    console.log("Audio Error", e);
  }
};

// Cryptographically secure room code — avoids visually ambiguous chars (0/O, 1/I/l)
const ROOM_CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const generateRoomCode = () => {
  const arr = new Uint8Array(4);
  crypto.getRandomValues(arr);
  return Array.from(arr).map(b => ROOM_CODE_CHARS[b % ROOM_CODE_CHARS.length]).join('');
};

// ==========================================
// 4. MAIN APP COMPONENT
// ==========================================

export default function App() {
  const [user, setUser] = useState(null);
  const [roomCode, setRoomCode] = useState('');
  const [isInGame, setIsInGame] = useState(false);
  const [hostId, setHostId] = useState(null);
  const [myIdentity, setMyIdentity] = useState(null); // ID of the kid this user is controlling

  // Auto-login anonymously
  useEffect(() => {
    signInAnonymously(auth).then(c => setUser(c.user));
  }, []);

  const createRoom = async () => {
    try {
      const code = generateRoomCode();
      await setDoc(doc(db, "rooms", code), {
        hostId: user.uid,
        page: 'intro',
        kids: INITIAL_KIDS,
        timer: 10, // REQ 2: Mad Rush (10 seconds)
        level: 0,
        hits: 0,
        shotsFired: 0,
        startTime: Date.now(),
        totalWins: 0,
        players: [user.uid],
        lastUpdate: Date.now()
      });
      setRoomCode(code);
      setHostId(user.uid);
      setIsInGame(true);
    } catch (e) {
      console.error("Failed to create room:", e);
      alert("Failed to create room. Please check your connection and try again.");
    }
  };

  const joinRoom = async (codeInput) => {
    const code = codeInput.trim().toUpperCase();
    if (!/^[A-Z0-9]{4}$/.test(code)) {
      alert("Please enter a valid 4-character room code.");
      return;
    }
    try {
      const ref = doc(db, "rooms", code);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        setRoomCode(code);
        setHostId(snap.data().hostId);
        await updateDoc(ref, { players: arrayUnion(user.uid) });
        setIsInGame(true);
      } else {
        alert("Room not found!");
      }
    } catch (e) {
      console.error("Failed to join room:", e);
      alert("Failed to join room. Please check your connection and try again.");
    }
  };

  if (!user) return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">Loading...</div>;

  return isInGame ? (
    <GameRoom 
      user={user} 
      roomCode={roomCode} 
      isHost={user.uid === hostId} 
      myIdentity={myIdentity} 
      setMyIdentity={setMyIdentity} 
    />
  ) : (
    <Lobby onCreate={createRoom} onJoin={joinRoom} />
  );
}

// ==========================================
// 5. SCREEN COMPONENTS
// ==========================================

function Lobby({ onCreate, onJoin }) {
  const [code, setCode] = useState('');
  const [stats] = useState(() => {
    try {
      const saved = localStorage.getItem('xmas-game-stats');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed.totalWins === 'number' && typeof parsed.bestScore === 'number') {
          return parsed;
        }
      }
    } catch (e) {
      // Ignore malformed data and fall back to defaults
    }
    return { totalWins: 0, bestScore: 0 };
  });

  const currentRank = RANKS.slice().reverse().find(r => stats.totalWins >= r.level) || RANKS[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-700 to-green-800 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-2xl text-center space-y-6 border-4 border-yellow-400">
        <div className="text-6xl animate-bounce">🎄</div>
        <h1 className="text-4xl font-black text-gray-800">Christmas Quest</h1>
        
        <div className="bg-gray-100 p-4 rounded-xl border-2 border-gray-200">
          <div className="text-4xl mb-2">{currentRank.icon}</div>
          <div className="text-gray-800 font-bold uppercase tracking-widest text-sm">Current Rank</div>
          <div className="text-2xl font-black text-purple-600">{currentRank.title}</div>
        </div>

        <div className="flex justify-center gap-4 text-sm font-bold text-gray-500">
          <div className="bg-gray-100 px-3 py-1 rounded-full">🏆 Wins: {stats.totalWins}</div>
          <div className="bg-gray-100 px-3 py-1 rounded-full">⭐ Best: {stats.bestScore}</div>
        </div>

        <button onClick={onCreate} className="w-full py-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-xl shadow-lg transition-transform hover:scale-105 flex items-center justify-center gap-2">
          <Play size={24} /> Host Game
        </button>
        
        <div className="relative border-t border-gray-200 pt-6">
          <p className="text-sm text-gray-400 mb-4 uppercase tracking-widest font-bold">Or Join Squad</p>
          <div className="flex gap-2">
            <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Room Code" maxLength={4} className="flex-1 bg-gray-100 border-2 focus:border-green-500 rounded-xl px-4 text-center font-mono text-xl uppercase" />
            <button onClick={() => onJoin(code)} className="px-6 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold shadow-lg">JOIN</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function GameRoom({ user, roomCode, isHost, myIdentity, setMyIdentity }) {
  const [gameState, setGameState] = useState(null);
  const [isMuted, setIsMuted] = useState(false);

  // Sync with Firestore
  useEffect(() => {
    return onSnapshot(
      doc(db, "rooms", roomCode),
      (snapshot) => snapshot.exists() && setGameState(snapshot.data()),
      (error) => console.error("Firestore sync error:", error)
    );
  }, [roomCode]);

  // Host Logic Loop
  useEffect(() => {
    if (!isHost || !gameState || gameState.page !== 'game') return;
    const interval = setInterval(() => {
      if (gameState.timer > 0) updateDoc(doc(db, "rooms", roomCode), { timer: gameState.timer - 1 });
      else updateDoc(doc(db, "rooms", roomCode), { page: 'story-afterGame' });
    }, 1000);
    return () => clearInterval(interval);
  }, [isHost, gameState?.page, gameState?.timer]);

  if (!gameState) return <div className="text-white text-center mt-20">Connecting to North Pole...</div>;

  // Identity Selection Screen (If not yet selected)
  if (!myIdentity && !isHost && gameState.page !== 'intro' && gameState.page !== 'setup') {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-6 text-white">
        <h1 className="text-3xl font-black mb-8 text-yellow-400">Who Are You?</h1>
        <div className="grid grid-cols-1 gap-4 w-full max-w-md">
          {gameState.kids.map(kid => (
            <button key={kid.id}
              disabled={kid.claimedBy && kid.claimedBy !== user.uid}
              onClick={async () => {
                try {
                  const roomRef = doc(db, "rooms", roomCode);
                  await runTransaction(db, async (transaction) => {
                    const roomDoc = await transaction.get(roomRef);
                    if (!roomDoc.exists()) throw new Error("Room not found");
                    const kids = roomDoc.data().kids;
                    const target = kids.find(k => k.id === kid.id);
                    if (target?.claimedBy && target.claimedBy !== user.uid) {
                      throw new Error("Already claimed");
                    }
                    const newKids = kids.map(k => k.id === kid.id ? { ...k, claimedBy: user.uid } : k);
                    transaction.update(roomRef, { kids: newKids });
                  });
                  setMyIdentity(kid.id);
                } catch (e) {
                  if (e.message === "Already claimed") {
                    alert("This character was just claimed by another player!");
                  } else {
                    console.error("Failed to claim identity:", e);
                    alert("Failed to claim identity. Please try again.");
                  }
                }
              }}
              className={`p-6 rounded-xl font-bold text-xl flex justify-between items-center ${kid.claimedBy ? 'bg-gray-700 opacity-50' : 'bg-green-600 hover:bg-green-500 shadow-lg'}`}
            >
              <span>{kid.name}</span>
              {kid.claimedBy && <span className="text-sm">Taken</span>}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-800 to-green-900 relative overflow-hidden select-none">
      {/* REQ 3: HUGE KID-FRIENDLY ROOM CODE */}
      <div className="absolute top-4 left-4 z-50 flex gap-4 items-center">
        <div className="bg-black/50 backdrop-blur px-6 py-3 rounded-2xl text-white font-mono border-2 border-white/30 shadow-2xl">
          <span className="text-sm uppercase font-bold text-gray-300 block text-xs">Room Code</span>
          <span className="text-4xl font-black text-yellow-300 tracking-widest">{roomCode}</span> 
        </div>
        {myIdentity && <div className="bg-green-600 px-4 py-2 rounded-full text-white font-bold shadow-lg">
          You are: {gameState.kids.find(k => k.id === myIdentity)?.name}
        </div>}
      </div>

      <div className="absolute top-4 right-4 z-50">
        <button onClick={() => setIsMuted(!isMuted)} className="bg-black/40 p-3 rounded-full text-white hover:bg-black/60 transition-colors">
          {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
        </button>
      </div>

      {/* Screen Router */}
      {gameState.page === 'intro' && <IntroScreen isHost={isHost} roomCode={roomCode} story={STORIES.intro} />}
      {gameState.page === 'setup' && <SetupScreen isHost={isHost} roomCode={roomCode} kids={gameState.kids} />}
      {gameState.page.startsWith('story-') && <StoryScreen isHost={isHost} roomCode={roomCode} page={gameState.page} />}
      {gameState.page === 'game' && <SortingGame gameState={gameState} roomCode={roomCode} isMuted={isMuted} />}
      {gameState.page === 'boss' && <BossBattle gameState={gameState} roomCode={roomCode} isHost={isHost} isMuted={isMuted} />}
      {gameState.page === 'victory' && <VictoryScreen gameState={gameState} isHost={isHost} roomCode={roomCode} />}
    </div>
  );
}

// --- SUB-COMPONENTS ---

function IntroScreen({ isHost, roomCode, story }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative z-10">
      <div className="max-w-2xl w-full bg-white rounded-3xl p-8 shadow-2xl text-center border-b-8 border-green-600">
        <h1 className="text-5xl font-black text-gray-800 mb-6">The Curse of the Frozen North</h1>
        <div className="bg-gray-100 p-6 rounded-2xl border-2 border-green-500 mb-8">
          <p className="text-lg text-gray-600 leading-relaxed whitespace-pre-line">{story}</p>
        </div>
        {isHost ? (
          <button onClick={() => updateDoc(doc(db, "rooms", roomCode), { page: 'setup' })} className="w-full py-6 bg-green-600 hover:bg-green-700 text-white font-black text-2xl rounded-2xl shadow-xl transition-transform hover:scale-105">ASSEMBLE TEAM</button>
        ) : <div className="text-gray-500 font-bold animate-pulse">Waiting for Host...</div>}
      </div>
    </div>
  );
}

// FULLY RESTORED: Detailed Setup Dashboard
function SetupScreen({ isHost, roomCode, kids }) {
  // Toggle Task Completion
  const toggleTask = (kidId, taskId) => {
    const newKids = kids.map(k => {
      if (k.id === kidId) {
        const newTasks = k.tasks.map(t => t.id === taskId ? { ...t, done: !t.done } : t);
        return { ...k, tasks: newTasks };
      }
      return k;
    });
    updateDoc(doc(db, "rooms", roomCode), { kids: newKids });
  };

  // Add a new blank task
  const addTask = (kidId) => {
    const newKids = kids.map(k => {
      if (k.id === kidId) {
        return { ...k, tasks: [...k.tasks, { id: Date.now(), task: 'New Task', done: false }] };
      }
      return k;
    });
    updateDoc(doc(db, "rooms", roomCode), { kids: newKids });
  };

  // Remove a task
  const removeTask = (kidId, taskId) => {
    const newKids = kids.map(k => {
      if (k.id === kidId) {
        return { ...k, tasks: k.tasks.filter(t => t.id !== taskId) };
      }
      return k;
    });
    updateDoc(doc(db, "rooms", roomCode), { kids: newKids });
  };

  // Edit Task Name
  const editTaskName = (kidId, taskId, newName) => {
    const newKids = kids.map(k => {
      if (k.id === kidId) {
        return { ...k, tasks: k.tasks.map(t => t.id === taskId ? { ...t, task: newName } : t) };
      }
      return k;
    });
    updateDoc(doc(db, "rooms", roomCode), { kids: newKids });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative z-10">
      <div className="max-w-6xl w-full bg-white rounded-3xl p-8 shadow-2xl">
        <h2 className="text-3xl font-black text-gray-800 mb-2 text-center">Agent Registration</h2>
        {/* REQ 1: Added Instruction Text */}
        <p className="text-center text-gray-500 mb-6 font-bold bg-blue-50 py-2 rounded-lg">
          👇 Tap a task to check it off, or click text to edit!
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6 max-h-[60vh] overflow-y-auto">
          {kids.map((kid, idx) => (
            <div key={kid.id} className="bg-gray-50 p-4 rounded-2xl border border-gray-200 shadow-sm relative">
              {/* Agent Name Header */}
              <div className="flex gap-2 mb-4">
                <input
                  disabled={!isHost}
                  value={kid.name}
                  maxLength={30}
                  onChange={(e) => {
                    const newKids = [...kids];
                    newKids[idx].name = e.target.value;
                    updateDoc(doc(db, "rooms", roomCode), { kids: newKids }).catch(console.error);
                  }}
                  className="flex-1 bg-white p-3 rounded-xl font-bold text-xl border-2 border-gray-200 focus:border-blue-500 outline-none"
                  placeholder={`Agent ${idx+1}`}
                />
                {isHost && kids.length > 1 && (
                  <button onClick={() => updateDoc(doc(db, "rooms", roomCode), { kids: kids.filter(k => k.id !== kid.id) })} className="p-3 bg-red-100 text-red-500 rounded-xl hover:bg-red-200"><Trash2 /></button>
                )}
              </div>
              
              {/* Task List */}
              <div className="space-y-2">
                {kid.tasks.map(task => (
                  <div key={task.id} className="flex gap-2 items-center group">
                    <div 
                      className={`flex-1 p-2 rounded-lg flex items-center justify-between border-2 transition-all ${task.done ? 'bg-green-100 border-green-400' : 'bg-white border-gray-200'}`}
                    >
                      {isHost ? (
                        <input
                          value={task.task}
                          maxLength={100}
                          onChange={(e) => editTaskName(kid.id, task.id, e.target.value)}
                          className="bg-transparent font-semibold text-gray-700 text-sm outline-none w-full"
                        />
                      ) : (
                        <span className="font-semibold text-gray-700 text-sm">{task.task}</span>
                      )}
                      
                      {/* Checkbox Toggle */}
                      <div onClick={() => isHost && toggleTask(kid.id, task.id)} className="cursor-pointer ml-2">
                        {task.done ? <Check className="text-green-600" size={16} /> : <div className="w-4 h-4 rounded-full border-2 border-gray-300" />}
                      </div>
                    </div>
                    
                    {isHost && (
                      <button onClick={() => removeTask(kid.id, task.id)} className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Minus size={16} />
                      </button>
                    )}
                  </div>
                ))}
                {isHost && (
                  <button onClick={() => addTask(kid.id)} className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-400 hover:border-blue-400 hover:text-blue-500 flex justify-center text-sm font-bold">
                    + Add Task
                  </button>
                )}
              </div>
            </div>
          ))}
          
          {isHost && (
            <button onClick={() => updateDoc(doc(db, "rooms", roomCode), { kids: [...kids, { id: Date.now(), name: '', nice: 0, naughty: 0, claimedBy: null, tasks: [{id:1, task:'Be Good', done:false}] }] })} className="p-4 bg-blue-100 text-blue-600 rounded-xl font-bold flex flex-col justify-center items-center gap-2 border-2 border-dashed border-blue-300 hover:bg-blue-200 min-h-[300px]">
              <Plus size={48} /> 
              <span>Add New Agent</span>
            </button>
          )}
        </div>
        
        {isHost ? (
          <button onClick={() => updateDoc(doc(db, "rooms", roomCode), { page: 'story-setup' })} className="w-full py-6 bg-yellow-500 hover:bg-yellow-600 text-white font-black text-2xl rounded-2xl shadow-xl">CONFIRM TEAM</button>
        ) : <p className="text-center text-gray-400">Host is setting up...</p>}
      </div>
    </div>
  );
}

function StoryScreen({ isHost, roomCode, page }) {
  const storyText = page === 'story-setup' ? STORIES.afterSetup : page === 'story-afterGame' ? STORIES.afterGame : STORIES.afterBoss;
  const nextAction = () => {
    // REQ 2: Timer set to 10 seconds for Mad Rush
    if(page === 'story-setup') updateDoc(doc(db, "rooms", roomCode), { page: 'game', timer: 10 });
    else if(page === 'story-afterGame') updateDoc(doc(db, "rooms", roomCode), { page: 'boss' });
    else if(page === 'story-afterBoss') updateDoc(doc(db, "rooms", roomCode), { page: 'boss' });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative z-10">
      <div className="max-w-2xl w-full bg-white rounded-3xl p-8 shadow-2xl text-center border-b-8 border-yellow-500">
        <h2 className="text-4xl font-black text-yellow-600 mb-6">Chapter {page.includes('setup') ? '1' : page.includes('Game') ? '2' : '3'}</h2>
        <div className="bg-gray-100 p-6 rounded-2xl border-2 border-yellow-500 mb-8">
          <p className="text-xl text-gray-700 leading-relaxed whitespace-pre-line">{storyText}</p>
        </div>
        {isHost ? <button onClick={nextAction} className="px-12 py-4 bg-yellow-500 text-white font-black text-xl rounded-2xl shadow-lg">CONTINUE</button> : <div className="text-yellow-600 font-bold animate-pulse">Waiting for Host...</div>}
      </div>
    </div>
  );
}

// RESTORED: Grid UI for Sorting Game (Solved "Bad Table" defect)
function SortingGame({ gameState, roomCode, isMuted }) {
  const [malfunction, setMalfunction] = useState(false);

  const speak = (text) => {
    if (isMuted) return;
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 1.3;
    window.speechSynthesis.speak(u);
  };

  const vote = async (kidId, type) => {
    const kName = gameState.kids.find(k => k.id === kidId)?.name;
    // 20% Chance of Malfunction
    const isMalfunction = Math.random() < 0.2;
    const actualType = isMalfunction ? (type === 'nice' ? 'naughty' : 'nice') : type;
    
    if (isMalfunction) {
      setMalfunction(true);
      setTimeout(() => setMalfunction(false), 1000);
      speak("System Failure!");
    } else {
      speak(`${actualType} ${kName}`);
    }
    
    const newKids = gameState.kids.map(k => k.id === kidId ? { ...k, [actualType]: k[actualType] + 1 } : k);
    await updateDoc(doc(db, "rooms", roomCode), { kids: newKids });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative z-10">
      {malfunction && (
        <div className="absolute top-20 bg-red-600 text-yellow-300 px-8 py-2 rounded-full font-black text-2xl animate-pulse shadow-xl border-4 border-yellow-300 z-50">
          ⚠️ MALFUNCTION! BUTTONS SWAPPED! ⚠️
        </div>
      )}

      <div className="mb-8 bg-white text-red-600 font-black text-6xl px-8 py-4 rounded-3xl shadow-2xl flex items-center gap-4 border-b-8 border-red-200">
        <Clock size={48} /> {gameState.timer}s
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-7xl">
        {gameState.kids.map(kid => (
          <div key={kid.id} className="bg-white p-6 rounded-3xl shadow-xl flex flex-col items-center transform transition-all hover:scale-105 border-4 border-gray-100">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
              <User size={32} className="text-gray-500"/>
            </div>
            <h3 className="text-3xl font-black text-gray-800 mb-6">{kid.name}</h3>
            <div className="flex gap-4 w-full">
              <button onClick={() => vote(kid.id, 'naughty')} className="flex-1 bg-red-100 hover:bg-red-200 text-red-600 py-6 rounded-2xl font-black text-xl flex flex-col items-center active:scale-95 transition-transform border-b-4 border-red-300">
                <span className="text-4xl mb-2">😈</span>
                <span>{kid.naughty}</span>
              </button>
              <button onClick={() => vote(kid.id, 'nice')} className="flex-1 bg-green-100 hover:bg-green-200 text-green-600 py-6 rounded-2xl font-black text-xl flex flex-col items-center active:scale-95 transition-transform border-b-4 border-green-300">
                <span className="text-4xl mb-2">👼</span>
                <span>{kid.nice}</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// REQ 5: Boss Random Movement (Front/Back/Left/Right)
function BossBattle({ gameState, roomCode, isHost, isMuted }) {
  const [snowballs, setSnowballs] = useState([]);
  const [bossX, setBossX] = useState(50);
  const [bossY, setBossY] = useState(30);
  const [targetX, setTargetX] = useState(50);
  const [targetY, setTargetY] = useState(30);
  const { level, hits } = gameState;
  const currentLevel = LEVELS[level];

  // Random Wander Logic
  useEffect(() => {
    const pickTarget = () => {
      setTargetX(10 + Math.random() * 80); // 10% to 90% width
      setTargetY(10 + Math.random() * 40); // 10% to 50% height (Front/Back)
    };
    
    // Pick new target every 1-2 seconds
    const targetInterval = setInterval(pickTarget, 1500);
    
    // Smooth move loop (60fps)
    const moveInterval = setInterval(() => {
      setBossX(prev => prev + (targetX - prev) * 0.05);
      setBossY(prev => prev + (targetY - prev) * 0.05);
    }, 16);

    return () => { clearInterval(targetInterval); clearInterval(moveInterval); };
  }, [targetX, targetY]);

  const shoot = async (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    const id = Date.now();
    setSnowballs(prev => [...prev, { id, x, y, hit: false }]);
    if(!isMuted) playShootSound();
    
    await updateDoc(doc(db, "rooms", roomCode), { shotsFired: increment(1) });

    // Hit Logic (Account for 3D depth scale)
    const scale = 0.5 + (bossY / 50); // Lower Y = closer = bigger
    const hitRadius = 15 * scale;

    if (Math.abs(x - bossX) < hitRadius && Math.abs(y - bossY) < hitRadius) {
      setSnowballs(prev => prev.map(s => s.id === id ? { ...s, hit: true } : s));
      await updateDoc(doc(db, "rooms", roomCode), { hits: increment(1) });
    }
    setTimeout(() => setSnowballs(prev => prev.filter(s => s.id !== id)), 800);
  };

  const nextLevel = async () => {
    if (level < LEVELS.length - 1) {
      await updateDoc(doc(db, "rooms", roomCode), { level: increment(1), hits: 0, page: 'story-afterBoss' }).catch(console.error);
    } else {
      // Save stats safely
      try {
        let stats = { totalWins: 0, bestScore: 0 };
        try {
          const saved = localStorage.getItem('xmas-game-stats');
          if (saved) {
            const parsed = JSON.parse(saved);
            if (parsed && typeof parsed.totalWins === 'number' && typeof parsed.bestScore === 'number') {
              stats = parsed;
            }
          }
        } catch (e) {
          // Use default stats if storage is corrupt
        }
        const currentScore = gameState.kids.reduce((acc, k) => acc + (k.nice - k.naughty), 0);
        stats.totalWins += 1;
        if (currentScore > stats.bestScore) stats.bestScore = currentScore;
        localStorage.setItem('xmas-game-stats', JSON.stringify(stats));
      } catch (e) {
        console.error("Failed to save stats:", e);
      }

      await updateDoc(doc(db, "rooms", roomCode), { totalWins: increment(1), page: 'victory' }).catch(console.error);
    }
  };

  // Calculate dynamic scale for pseudo-3D
  const scale = 0.5 + (bossY / 60);

  return (
    <div className="fixed inset-0 z-50 cursor-crosshair touch-none" onClick={shoot}>
      <div className="absolute top-24 left-0 right-0 flex justify-center pointer-events-none z-10">
        <div className="bg-black/50 text-white px-6 py-2 rounded-full font-bold border border-white/20">
          LEVEL {level + 1}: {currentLevel.name} ({hits}/{currentLevel.hitsRequired})
        </div>
      </div>

      <div className="absolute top-32 left-4 right-4 h-4 bg-gray-900 rounded-full overflow-hidden border-2 border-gray-700 pointer-events-none">
         <div className="h-full bg-gradient-to-r from-red-500 to-yellow-500 transition-all duration-300" 
              style={{ width: `${(hits / currentLevel.hitsRequired) * 100}%` }} />
      </div>

      <div className="absolute transition-transform duration-75 pointer-events-none text-9xl drop-shadow-2xl"
           style={{ 
             left: `${bossX}%`, 
             top: `${bossY}%`,
             transform: `translate(-50%, -50%) scale(${scale})`
           }}>
        {currentLevel.icon}
      </div>

      {snowballs.map(s => (
        <div key={s.id} className="absolute text-4xl pointer-events-none" 
             style={{ left: `${s.x}%`, top: `${s.y}%`, transform: 'translate(-50%, -50%)' }}>
          {s.hit ? '💥' : '❄️'}
        </div>
      ))}

      {isHost && hits >= currentLevel.hitsRequired && (
        <div className="absolute bottom-32 w-full flex justify-center z-50">
          <button onClick={(e) => { e.stopPropagation(); nextLevel(); }} className="bg-green-500 text-white font-black text-3xl px-12 py-6 rounded-3xl shadow-2xl animate-bounce border-4 border-white">
            VICTORY! NEXT ➡️
          </button>
        </div>
      )}
    </div>
  );
}

function VictoryScreen({ gameState, isHost, roomCode }) {
  const leaders = [...gameState.kids].sort((a,b) => (b.nice - b.naughty) - (a.nice - a.naughty));
  const sessionTime = Math.floor((Date.now() - (gameState.startTime || Date.now())) / 1000);
  const accuracy = gameState.shotsFired > 0 ? Math.floor((gameState.hits / gameState.shotsFired) * 100) : 0;
  const wisdomIdx = Math.floor(Math.random() * WISDOM_MESSAGES.length);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative z-10 bg-yellow-500">
      <div className="max-w-4xl w-full bg-white rounded-3xl p-8 shadow-2xl text-center">
        <div className="text-8xl animate-bounce mb-4">🏆</div>
        <h1 className="text-6xl font-black text-yellow-600 mb-8">VICTORY!</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-gray-400 uppercase">Leaderboard</h3>
            {leaders.map((kid, idx) => (
              <div key={kid.id} className={`flex items-center justify-between p-4 rounded-2xl ${idx === 0 ? 'bg-yellow-100 border-2 border-yellow-400' : 'bg-gray-50'}`}>
                <div className="flex items-center gap-4">
                  <span className="text-4xl font-black text-gray-400">#{idx + 1}</span>
                  <span className="text-2xl font-bold">{kid.name}</span>
                  {idx === 0 && <Crown className="text-yellow-600" />}
                </div>
                <div className="text-2xl font-bold text-green-600">
                  {kid.nice - kid.naughty} pts
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-bold text-gray-400 uppercase">Mission Stats</h3>
            <div className="bg-blue-50 p-4 rounded-2xl">
              <div className="text-3xl font-black text-blue-600">{Math.floor(sessionTime/60)}m {sessionTime%60}s</div>
              <div className="text-sm font-bold text-blue-400">Total Time</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-2xl">
              <div className="text-3xl font-black text-purple-600">{accuracy}%</div>
              <div className="text-sm font-bold text-purple-400">Accuracy</div>
            </div>
            
            <div className="bg-yellow-50 p-6 rounded-2xl border-2 border-yellow-200 mt-4">
              <h4 className="text-lg font-bold text-yellow-700 mb-2">{WISDOM_MESSAGES[wisdomIdx].title}</h4>
              <p className="italic text-gray-600">"{WISDOM_MESSAGES[wisdomIdx].message}"</p>
            </div>
          </div>
        </div>

        {isHost && (
          <button onClick={() => updateDoc(doc(db, "rooms", roomCode), { page: 'intro' })} className="w-full py-6 mt-8 bg-blue-600 hover:bg-blue-700 text-white font-black text-2xl rounded-2xl shadow-xl flex items-center justify-center gap-2">
            <RotateCcw /> PLAY AGAIN
          </button>
        )}
      </div>
    </div>
  );
}