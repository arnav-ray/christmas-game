import React, { useState, useEffect } from 'react';
import { Trophy, Clock, Target, RotateCcw, Crown, Sparkles, Snowflake, Trash2, Plus } from 'lucide-react';

const App = () => {
  const [page, setPage] = useState('intro');
  const [kidIdx, setKidIdx] = useState(0);
  const [timer, setTimer] = useState(15);
  const [active, setActive] = useState(false);
  const [anim, setAnim] = useState({ show: false, type: '', name: '' });
  const [confetti, setConfetti] = useState([]);
  const [malfunction, setMalfunction] = useState(false);
  const [level, setLevel] = useState(0);
  const [snowmanPos, setSnowmanPos] = useState(50);
  const [snowmanDir, setSnowmanDir] = useState(1);
  const [hits, setHits] = useState(0);
  const [snowballs, setSnowballs] = useState([]);
  const [totalShots, setTotalShots] = useState(0);
  const [sessionStart] = useState(Date.now());
  const [messageIndex, setMessageIndex] = useState(0);
  
  const [stats, setStats] = useState(() => {
    const saved = localStorage.getItem('xmas-game-stats');
    return saved ? JSON.parse(saved) : {
      gamesPlayed: 0,
      bestScore: 0,
      bestTime: 999,
      bestAccuracy: 0,
      totalWins: 0,
      currentRank: 0
    };
  });

  const [kids, setKids] = useState([
    { id: 1, name: 'AG', nice: 0, naughty: 0, tasks: [
      { id: 1, task: 'Doing Maths', done: false },
      { id: 2, task: 'Learning Music', done: false },
      { id: 3, task: 'Helping Parents', done: false },
      { id: 4, task: 'Eating Veggies', done: false },
      { id: 5, task: 'Being Kind', done: false }
    ]},
    { id: 2, name: 'LG', nice: 0, naughty: 0, tasks: [
      { id: 1, task: 'Homework', done: false },
      { id: 2, task: 'Piano Practice', done: false },
      { id: 3, task: 'Cleaning Room', done: false },
      { id: 4, task: 'Finish Dinner', done: false },
      { id: 5, task: 'Sharing Toys', done: false }
    ]},
    { id: 3, name: 'FG', nice: 0, naughty: 0, tasks: [
      { id: 1, task: 'Reading Books', done: false },
      { id: 2, task: 'Guitar Practice', done: false },
      { id: 3, task: 'Helping Dishes', done: false },
      { id: 4, task: 'Trying Foods', done: false },
      { id: 5, task: 'Playing Nice', done: false }
    ]},
    { id: 4, name: 'AR', nice: 0, naughty: 0, tasks: [
      { id: 1, task: 'Studying Hard', done: false },
      { id: 2, task: 'Violin Practice', done: false },
      { id: 3, task: 'Helping Cook', done: false },
      { id: 4, task: 'Eating Fruits', done: false },
      { id: 5, task: 'Being Polite', done: false }
    ]},
    { id: 5, name: 'SG', nice: 0, naughty: 0, tasks: [
      { id: 1, task: 'Homework', done: false },
      { id: 2, task: 'Drum Practice', done: false },
      { id: 3, task: 'Tidying Up', done: false },
      { id: 4, task: 'Healthy Eating', done: false },
      { id: 5, task: 'Listening Well', done: false }
    ]}
  ]);

  const levels = [
    { id: 0, name: 'Golden Star', icon: '⭐', hitsRequired: 10 + Math.floor(stats.currentRank * 2) },
    { id: 1, name: 'Magic Lights', icon: '💡', hitsRequired: 15 + Math.floor(stats.currentRank * 2) },
    { id: 2, name: 'Guardian Snowman', icon: '⛄', hitsRequired: 20 + Math.floor(stats.currentRank * 3) },
    { id: 3, name: 'Polar Express', icon: '🚂', hitsRequired: 25 + Math.floor(stats.currentRank * 3) },
    { id: 4, name: 'Toy Factory', icon: '🏭', hitsRequired: 30 + Math.floor(stats.currentRank * 4) }
  ];

  const ranks = [
    { level: 0, title: 'Elf Apprentice', icon: '🎄' },
    { level: 5, title: 'Snowball Scout', icon: '⚪' },
    { level: 10, title: 'Winter Warrior', icon: '❄️' },
    { level: 20, title: 'Frost Guardian', icon: '🛡️' },
    { level: 35, title: 'North Pole Hero', icon: '⭐' },
    { level: 50, title: 'Christmas Champion', icon: '👑' }
  ];

  const wisdomMessages = [
    { title: "The Gift of Kindness", message: "Like the boy who shared his last bread with a stranger in the forest, remember: the smallest act of kindness can light up the darkest winter night. True magic lives in helping others." },
    { title: "The Power of Patience", message: "In the old tales, the greatest treasures were never found by those who rushed. The wise owl waits, the hasty hare stumbles. Good things come to those who work steadily toward their goals." },
    { title: "Courage in Small Steps", message: "Even the mightiest oak tree started as a tiny acorn. You don't need to be the strongest or fastest—you just need to keep trying, one small brave step at a time." },
    { title: "The Value of Honesty", message: "Remember the tale of the golden axe? The woodcutter who told the truth received riches, while the liar lost everything. Your word is your treasure—keep it pure and bright." },
    { title: "Strength in Unity", message: "The bundle of sticks cannot be broken, though each twig alone is weak. When we work together with our family and friends, we become unstoppable." },
    { title: "The Magic of Gratitude", message: "In every old story, those who said 'thank you' received blessings, while the ungrateful turned to stone. Count your blessings like stars in the sky—there are always more than you think." },
    { title: "Wisdom of Listening", message: "The fox who listened to the wise old badger survived the winter, while the proud rabbit who ignored advice was lost in the snow. Sometimes the best thing we can do is listen and learn." },
    { title: "Joy in Simple Things", message: "The poorest child in the village found happiness in a pinecone and some snow, while the rich merchant's son was never satisfied. True joy comes not from what we have, but from the wonder we find in small treasures." }
  ];

  const stories = {
    intro: "Long ago, when the world was younger and magic still danced on winter winds, there lived an ice witch in the deepest forest. Jealous of the joy that Christmas brought to children, she cast a terrible spell upon the North Pole.\n\nThe magical Christmas Star fell from the heavens, plunging Santa's village into eternal darkness. Without its light, the elves could not work, the reindeer could not fly, and the toy machines fell silent.\n\nBut prophecy speaks of brave young agents who would one day restore the light. These heroes must prove their worth through good deeds, survive the corrupted sorting machine, and defeat the Grinch's minions in battle.\n\nOnly then would the five sacred treasures be restored, and Christmas would shine bright once more.\n\nAre you ready to become the hero of this tale?",
    
    afterSetup: "The agents have passed the first trial! Like the brave children in tales of old who earned wisdom through honest deeds, you have proven your worth.\n\nBut the ice witch has corrupted Santa's Great Sorting Machine. For the next 15 seconds, it will judge you... but beware! The witch's curse makes it unpredictable. Sometimes good becomes bad, and bad becomes good.\n\nSteel your courage. The Great Sorting begins NOW!",
    
    afterGame: "You survived the Sorting! Despite the witch's interference, you have generated spirit coins—ancient currency of the North Pole.\n\nBut deep in his cave, the Grinch has awakened. This twisted creature guards the five sacred treasures with jealous rage.\n\nTo restore the Christmas Star, you must reclaim each treasure by defeating the Grinch in battle. Five items. Five battles. Each victory will weaken the witch's curse.\n\nGrab your snowballs! Your quest begins with the Golden Star...",
    
    afterBoss: "The Grinch stumbles backward, defeated! One sacred treasure has been reclaimed. The northern lights flicker above, the snow sparkles brighter.\n\nBut the witch's curse still holds. More treasures remain. More battles stand between you and Christmas.\n\nRest for now, young heroes. The next battle awaits...",
    
    victory: "The fifth treasure is restored! The Golden Star, the Magic Lights, the Guardian Snowman, the Polar Express, and the Toy Factory—all glow with ancient power!\n\nTogether, they summon the Christmas Star from the void! Light EXPLODES across the North Pole! The ice witch's tower crumbles, her curse shattered forever.\n\nThe elves dance, the reindeer fly in loops of joy, and the toy machines roar back to life. Even the Grinch smiles for the first time in years.\n\nChristmas is SAVED! And it was YOU who broke the curse and restored the magic.\n\nNever forget: the greatest magic lives not in stars or spells, but in the courage and kindness of those who refuse to give up."
  };

  const getCurrentRank = () => {
    for (let i = ranks.length - 1; i >= 0; i--) {
      if (stats.totalWins >= ranks[i].level) return ranks[i];
    }
    return ranks[0];
  };

  // Snowman movement
  useEffect(() => {
    if (page === 'boss') {
      const speed = 2 + (stats.currentRank * 0.3);
      const interval = setInterval(() => {
        setSnowmanPos(prev => {
          const newPos = prev + (snowmanDir * speed);
          if (newPos >= 85 || newPos <= 15) {
            setSnowmanDir(d => -d);
            return prev - (snowmanDir * speed);
          }
          return newPos;
        });
      }, 50);
      return () => clearInterval(interval);
    }
  }, [page, snowmanDir, stats.currentRank]);

  // Timer countdown
  useEffect(() => {
    let interval;
    if (active && timer > 0) {
      interval = setInterval(() => setTimer(p => p - 1), 1000);
    } else if (timer === 0 && active) {
      setActive(false);
      setPage('story-afterGame');
    }
    return () => clearInterval(interval);
  }, [active, timer]);

  // Save stats
  useEffect(() => {
    localStorage.setItem('xmas-game-stats', JSON.stringify(stats));
  }, [stats]);

  const playShootSound = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 800;
      osc.type = 'sine';
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.1);
    } catch (e) {
      console.log('Audio not supported');
    }
  };

  const createConfetti = () => {
    const newConfetti = Array.from({ length: 50 }, (_, i) => ({
      id: Date.now() + i,
      left: Math.random() * 100,
      delay: Math.random() * 0.5,
      duration: 2 + Math.random() * 2
    }));
    setConfetti(newConfetti);
    setTimeout(() => setConfetti([]), 4000);
  };

  const toggleTask = (kidId, taskId) => {
    setKids(kids.map(k => {
      if (k.id === kidId) {
        const tasks = k.tasks.map(t => t.id === taskId ? {...t, done: !t.done} : t);
        const done = tasks.filter(t => t.done).length;
        const notDone = tasks.filter(t => !t.done).length;
        return {...k, tasks, nice: done, naughty: notDone};
      }
      return k;
    }));
  };

  // Helper to update agent name
  const updateKidName = (e) => {
    const val = e.target.value;
    setKids(kids.map((k, i) => i === kidIdx ? { ...k, name: val } : k));
  };

  // Helper to update task text
  const updateTaskText = (taskId, e) => {
    const val = e.target.value;
    setKids(kids.map((k, i) => i === kidIdx ? {
      ...k,
      tasks: k.tasks.map(t => t.id === taskId ? { ...t, task: val } : t)
    } : k));
  };

  // Helper to add a new agent
  const addAgent = () => {
    const newId = Date.now();
    setKids([...kids, {
        id: newId,
        name: 'New Agent',
        nice: 0,
        naughty: 0,
        tasks: [
            { id: 1, task: 'New Task 1', done: false },
            { id: 2, task: 'New Task 2', done: false },
            { id: 3, task: 'New Task 3', done: false },
            { id: 4, task: 'New Task 4', done: false },
            { id: 5, task: 'New Task 5', done: false }
        ]
    }]);
    setKidIdx(kids.length); // Move to the new agent
  };

  // Helper to remove current agent
  const removeAgent = () => {
    if (kids.length <= 1) {
        alert("You need at least one agent!");
        return;
    }
    const newKids = kids.filter((_, i) => i !== kidIdx);
    setKids(newKids);
    if (kidIdx >= newKids.length) setKidIdx(newKids.length - 1);
  };

  const nextKid = () => {
    if (kidIdx < kids.length - 1) setKidIdx(kidIdx + 1);
    else setPage('story-afterSetup');
  };

  const vote = (id, type) => {
    const shouldMal = Math.random() < 0.3;
    const actual = shouldMal ? (type === 'nice' ? 'naughty' : 'nice') : type;
    
    if (shouldMal) {
      setMalfunction(true);
      setTimeout(() => setMalfunction(false), 1000);
    }

    const kid = kids.find(k => k.id === id);
    setKids(kids.map(k => k.id === id ? {...k, [actual]: k[actual] + 1} : k));
    
    if (actual === 'nice') createConfetti();
    
    try {
      const txt = `${actual === 'nice' ? 'Nice' : 'Naughty'} ${kid.name}!`;
      const u = new SpeechSynthesisUtterance(txt);
      u.lang = 'en-US';
      u.rate = 1.2;
      window.speechSynthesis.speak(u);
    } catch (e) {
      console.log('Speech not supported');
    }
    
    setAnim({show: true, type: actual, name: kid.name});
    setTimeout(() => setAnim({show: false, type: '', name: ''}), 1500);
  };

  const shootSnowball = (e) => {
    if (page !== 'boss') return;
    
    playShootSound();
    setTotalShots(s => s + 1);
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    const sb = { id: Date.now(), x, y, hit: false };
    
    const dist = Math.sqrt(Math.pow(x - snowmanPos, 2) + Math.pow(y - 30, 2));
    
    if (dist < 15) {
      sb.hit = true;
      setHits(h => h + 1);
      createConfetti();
    }
    
    setSnowballs(prev => [...prev, sb]);
    setTimeout(() => setSnowballs(prev => prev.filter(s => s.id !== sb.id)), 1000);
  };

  const completeLevel = () => {
    if (level < levels.length - 1) {
      setLevel(c => c + 1);
      setHits(0);
      setPage('story-afterBoss');
    } else {
      const sessionTime = Math.floor((Date.now() - sessionStart) / 1000);
      const score = kids.reduce((sum, k) => sum + k.nice - k.naughty, 0);
      const acc = totalShots > 0 ? Math.floor((hits / totalShots) * 100) : 0;
      
      const newStats = {
        gamesPlayed: stats.gamesPlayed + 1,
        bestScore: Math.max(stats.bestScore, score),
        bestTime: Math.min(stats.bestTime, sessionTime),
        bestAccuracy: Math.max(stats.bestAccuracy, acc),
        totalWins: stats.totalWins + 1,
        currentRank: stats.totalWins + 1
      };
      
      setStats(newStats);
      setMessageIndex(Math.floor(Math.random() * wisdomMessages.length));
      setPage('wisdom');
    }
  };

  const leaderboard = [...kids].map(k => ({...k, score: k.nice - k.naughty})).sort((a,b) => b.score - a.score);

  const reset = () => {
    setPage('intro');
    setKidIdx(0);
    setLevel(0);
    setHits(0);
    setTotalShots(0);
    setKids(kids.map(k => ({...k, nice: 0, naughty: 0, tasks: k.tasks.map(t => ({...t, done: false}))})));
  };

  const currentRank = getCurrentRank();
  const sessionTime = Math.floor((Date.now() - sessionStart) / 1000);
  const mins = Math.floor(sessionTime / 60);
  const secs = sessionTime % 60;

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-700 via-green-700 to-red-800 relative overflow-hidden">
      {/* Snowflakes */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <Snowflake key={i} className="absolute text-white opacity-30 animate-bounce"
            style={{left: `${Math.random()*100}%`, top: `${Math.random()*100}%`, animationDelay: `${Math.random()*5}s`}} size={20} />
        ))}
      </div>

      {/* Confetti */}
      {confetti.map(c => (
        <div key={c.id} className="absolute w-3 h-3 rounded-full animate-bounce pointer-events-none z-50"
          style={{left: `${c.left}%`, top: '-20px', backgroundColor: ['#f00','#0f0','#ff0','#00f'][Math.floor(Math.random()*4)], animationDelay: `${c.delay}s`, animationDuration: `${c.duration}s`}} />
      ))}

      {/* Animation Overlay */}
      {anim.show && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
          <div className="animate-bounce text-center">
            <div className="text-9xl mb-4">{anim.type === 'nice' ? '🎅' : '🟢'}</div>
            <div className="bg-white px-8 py-4 rounded-full shadow-2xl">
              <p className={`text-4xl font-bold ${anim.type === 'nice' ? 'text-green-600' : 'text-red-600'}`}>
                {anim.type === 'nice' ? 'Nice' : 'Naughty'} {anim.name}!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* INTRO PAGE */}
      {page === 'intro' && (
        <div className="min-h-screen flex items-center justify-center p-4 relative z-10">
          <div className="max-w-3xl w-full bg-gray-900 rounded-3xl shadow-2xl p-8 border-4 border-green-500">
            <div className="bg-red-600 font-black px-6 py-2 rounded text-white text-xl mb-6 inline-block animate-pulse">
              ⚠️ INCOMING TRANSMISSION
            </div>
            
            <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500 mb-6 text-center">
              The Curse of the Frozen North
            </h1>
            
            <div className="bg-gray-800 p-6 rounded-2xl border-2 border-green-500 mb-8">
              <p className="text-lg text-gray-200 leading-relaxed whitespace-pre-line">{stories.intro}</p>
            </div>

            {/* Stats Display */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-gray-800 p-4 rounded-xl border-2 border-yellow-500 text-center">
                <div className="text-3xl mb-2">{currentRank.icon}</div>
                <div className="text-yellow-400 font-bold text-sm">{currentRank.title}</div>
              </div>
              <div className="bg-gray-800 p-4 rounded-xl border-2 border-blue-500 text-center">
                <div className="text-3xl text-blue-400 font-black">{stats.totalWins}</div>
                <div className="text-blue-300 font-bold text-sm">Total Wins</div>
              </div>
              <div className="bg-gray-800 p-4 rounded-xl border-2 border-green-500 text-center">
                <div className="text-3xl text-green-400 font-black">{stats.bestScore}</div>
                <div className="text-green-300 font-bold text-sm">Best Score</div>
              </div>
            </div>

            <button onClick={() => setPage('setup')}
              className="w-full bg-green-600 hover:bg-green-500 text-white font-black py-6 rounded-2xl text-3xl shadow-lg transform hover:scale-105 transition-all">
              BEGIN THE QUEST
            </button>
          </div>
        </div>
      )}

      {/* STORY PAGES */}
      {page.startsWith('story-') && (
        <div className="min-h-screen flex items-center justify-center p-4 relative z-10">
          <div className="max-w-3xl w-full bg-gray-900 rounded-3xl shadow-2xl p-8 border-4 border-yellow-500">
            <h1 className="text-5xl font-black text-yellow-400 mb-6 text-center">
              {page === 'story-afterSetup' && 'Chapter I: The Proving Grounds'}
              {page === 'story-afterGame' && 'Chapter II: The Grinch Awakens'}
              {page === 'story-afterBoss' && 'Victory in Battle!'}
            </h1>
            <div className="bg-gray-800 p-6 rounded-2xl border-2 border-yellow-500 mb-8">
              <p className="text-lg text-gray-200 leading-relaxed whitespace-pre-line">
                {page === 'story-afterSetup' && stories.afterSetup}
                {page === 'story-afterGame' && stories.afterGame}
                {page === 'story-afterBoss' && stories.afterBoss}
              </p>
            </div>
            <button onClick={() => {
              if (page === 'story-afterSetup') { setPage('game'); setTimer(15); setActive(true); }
              else if (page === 'story-afterGame') setPage('boss');
              else if (page === 'story-afterBoss') setPage('boss');
            }}
              className="w-full bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-black py-6 rounded-2xl text-3xl shadow-lg transform hover:scale-105 transition-all">
              CONTINUE
            </button>
          </div>
        </div>
      )}

      {/* WISDOM PAGE */}
      {page === 'wisdom' && (
        <div className="min-h-screen flex items-center justify-center p-4 relative z-10">
          <div className="max-w-3xl w-full bg-gradient-to-br from-yellow-400 via-orange-400 to-red-500 rounded-3xl shadow-2xl p-8 border-4 border-yellow-200">
            <div className="text-8xl text-center mb-6 animate-bounce">🏆</div>
            
            <h1 className="text-5xl font-black text-white text-center mb-6 drop-shadow-lg">
              MISSION ACCOMPLISHED!
            </h1>
            
            <div className="bg-white/90 backdrop-blur p-6 rounded-2xl mb-8">
              <p className="text-lg text-gray-800 leading-relaxed whitespace-pre-line">{stories.victory}</p>
            </div>

            {/* Wisdom Message */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 rounded-2xl mb-6">
              <h2 className="text-3xl font-black text-yellow-300 mb-4 text-center">
                {wisdomMessages[messageIndex].title}
              </h2>
              <p className="text-lg text-white leading-relaxed">
                {wisdomMessages[messageIndex].message}
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white/20 backdrop-blur p-4 rounded-xl text-center">
                <div className="text-3xl font-black text-white">{stats.totalWins}</div>
                <div className="text-sm font-bold text-yellow-200">Total Wins</div>
              </div>
              <div className="bg-white/20 backdrop-blur p-4 rounded-xl text-center">
                <div className="text-3xl font-black text-white">{stats.bestScore}</div>
                <div className="text-sm font-bold text-yellow-200">Best Score</div>
              </div>
            </div>

            <button onClick={() => setPage('leaderboard')}
              className="w-full bg-white hover:bg-gray-100 text-red-800 font-black py-6 rounded-2xl text-3xl shadow-lg mb-4 transform hover:scale-105 transition-all">
              View Leaderboard
            </button>
          </div>
        </div>
      )}

      {/* SETUP PAGE */}
      {page === 'setup' && (
        <div className="min-h-screen flex items-center justify-center p-4 relative z-10">
          <div className="max-w-4xl w-full bg-white rounded-3xl shadow-2xl p-8">
            <input 
              type="text"
              value={kids[kidIdx].name}
              onChange={updateKidName}
              placeholder="Agent Name"
              className="w-full text-center text-8xl font-black text-red-600 bg-transparent border-b-2 border-transparent hover:border-red-200 focus:border-red-500 outline-none mb-4 placeholder-red-200"
            />
            
            <p className="text-2xl text-gray-600 text-center mb-8">
              Agent {kidIdx + 1} of {kids.length}
            </p>

            <div className="space-y-4 mb-8">
              {kids[kidIdx].tasks.map(task => (
                <div key={task.id} 
                  onClick={() => toggleTask(kids[kidIdx].id, task.id)}
                  className={`p-6 rounded-2xl shadow-lg cursor-pointer transition-all transform hover:scale-105 ${
                    task.done ? 'bg-green-100 border-4 border-green-500' : 'bg-gray-100 border-4 border-gray-300'
                  }`}>
                  <div className="flex items-center justify-between">
                    <input 
                      type="text"
                      value={task.task}
                      onChange={(e) => updateTaskText(task.id, e)}
                      onClick={(e) => e.stopPropagation()} // Prevent toggling when editing text
                      className="text-2xl font-semibold text-gray-800 bg-transparent border-b border-transparent hover:border-gray-400 focus:border-blue-500 outline-none w-full mr-4"
                    />
                    <span className={`text-3xl font-bold px-6 py-2 rounded-full text-white ${
                      task.done ? 'bg-green-500' : 'bg-red-500'
                    }`}>
                      {task.done ? '✓' : '✗'}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-4">
              {kids.length > 1 && (
                <button 
                  onClick={removeAgent}
                  className="bg-red-100 hover:bg-red-200 text-red-600 p-6 rounded-2xl shadow-lg transform hover:scale-105 transition-all flex items-center justify-center"
                  title="Remove Agent"
                >
                  <Trash2 size={32} />
                </button>
              )}

              <button onClick={nextKid}
                className="flex-1 bg-gradient-to-r from-red-500 to-green-500 hover:from-red-600 hover:to-green-600 text-white font-bold py-6 rounded-2xl text-3xl shadow-lg transform hover:scale-105 transition-all">
                {kidIdx < kids.length - 1 ? '➡️ Next Agent' : '🎮 Start Mission'}
              </button>

              {kidIdx === kids.length - 1 && (
                <button 
                  onClick={addAgent}
                  className="bg-green-100 hover:bg-green-200 text-green-600 p-6 rounded-2xl shadow-lg transform hover:scale-105 transition-all flex items-center justify-center"
                  title="Add New Agent"
                >
                  <Plus size={32} />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* GAME PAGE */}
      {page === 'game' && (
        <div className="min-h-screen flex items-center justify-center p-4 relative z-10">
          <div className="max-w-6xl w-full">
            <h1 className="text-6xl font-bold text-white text-center mb-4 animate-pulse drop-shadow-2xl">
              The Great Sorting!
            </h1>
            
            {malfunction && (
              <div className="text-center mb-4 animate-bounce">
                <p className="text-4xl font-bold text-yellow-300 bg-red-600 inline-block px-8 py-4 rounded-full">
                  ⚠️ MALFUNCTION! ⚠️
                </p>
              </div>
            )}

            <div className="bg-yellow-400 rounded-3xl p-6 mb-8 text-center shadow-2xl">
              <Clock className="inline-block mr-2" size={48} />
              <span className="text-5xl font-black text-red-800">{timer}</span>
              <span className="text-2xl ml-2 text-red-800">seconds</span>
            </div>

            <div className="space-y-6">
              {kids.map(k => (
                <div key={k.id} className="bg-white rounded-3xl shadow-2xl p-6">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <button onClick={() => vote(k.id, 'naughty')}
                      className="bg-green-600 hover:bg-green-700 text-white font-bold py-6 px-8 rounded-2xl text-2xl shadow-lg transform hover:scale-110 transition-all min-w-[140px]">
                      <div className="text-5xl mb-2">🟢</div>
                      <div>Naughty</div>
                      <div className="text-4xl font-black mt-2 bg-white text-green-700 rounded-full w-16 h-16 flex items-center justify-center mx-auto">
                        {k.naughty}
                      </div>
                    </button>

                    <div className="flex-1 text-center">
                      <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-green-600">
                        {k.name}
                      </div>
                    </div>

                    <button onClick={() => vote(k.id, 'nice')}
                      className="bg-red-600 hover:bg-red-700 text-white font-bold py-6 px-8 rounded-2xl text-2xl shadow-lg transform hover:scale-110 transition-all min-w-[140px]">
                      <div className="text-5xl mb-2">🎅</div>
                      <div>Nice</div>
                      <div className="text-4xl font-black mt-2 bg-white text-red-700 rounded-full w-16 h-16 flex items-center justify-center mx-auto">
                        {k.nice}
                      </div>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* BOSS BATTLE PAGE */}
      {page === 'boss' && (
        <div className="fixed inset-0 z-50 bg-gradient-to-b from-blue-900 to-blue-700 overflow-hidden"
             onClick={shootSnowball}>
          {/* Snow background */}
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(30)].map((_, i) => (
              <div key={i} className="absolute text-white opacity-50 animate-bounce"
                style={{left: `${Math.random()*100}%`, top: `${Math.random()*100}%`, fontSize: '24px'}}>❄️</div>
            ))}
          </div>

          {/* Level Info */}
          <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-center">
            <div className="bg-white/90 backdrop-blur px-6 py-3 rounded-full shadow-lg">
              <span className="text-2xl font-black text-blue-900">LEVEL {level + 1}/5</span>
            </div>
            <div className="bg-red-500 text-white px-6 py-3 rounded-full shadow-lg">
              <span className="text-2xl font-black">{levels[level].name}</span>
            </div>
          </div>

          {/* Target Display */}
          <div className="absolute top-20 left-1/2 -translate-x-1/2 z-10">
            <div className="bg-red-500 text-white px-8 py-4 rounded-2xl shadow-2xl text-center">
              <div className="text-6xl mb-2">{levels[level].icon}</div>
              <div className="text-lg">Hits: {hits}/{levels[level].hitsRequired}</div>
              <div className="w-64 h-4 bg-black rounded-full mt-2 overflow-hidden">
                <div className="h-full bg-green-400 transition-all duration-300" 
                     style={{width: `${(hits/levels[level].hitsRequired)*100}%`}} />
              </div>
            </div>
          </div>

          {/* Moving Grinch Snowman */}
          <div className="absolute z-20 transition-all duration-75"
               style={{left: `${snowmanPos}%`, top: '30%', transform: 'translate(-50%, -50%)'}}>
            <div className="text-9xl relative cursor-crosshair drop-shadow-2xl">
              ⛄
            </div>
          </div>

          {/* Flying snowballs */}
          {snowballs.map(sb => (
            <div key={sb.id} 
                 className="absolute w-16 h-16 text-5xl z-30 pointer-events-none"
                 style={{
                   left: `${sb.x}%`, 
                   top: `${sb.y}%`, 
                   transform: 'translate(-50%, -50%)',
                   animation: 'ping 0.5s ease-out'
                 }}>
              {sb.hit ? '💥' : '⚪'}
            </div>
          ))}

          {/* Instructions */}
          <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-10 text-center">
            <div className="bg-white/90 backdrop-blur px-8 py-4 rounded-2xl shadow-2xl">
              <Target className="inline-block mr-2 text-red-600" size={32} />
              <span className="text-2xl font-black text-gray-900">Click anywhere to shoot!</span>
            </div>
          </div>

          {/* Complete Level Button */}
          {hits >= levels[level].hitsRequired && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-40 animate-bounce">
              <button onClick={(e) => {
                e.stopPropagation();
                completeLevel();
              }}
                className="bg-green-500 hover:bg-green-600 text-white font-black py-6 px-12 rounded-2xl text-3xl shadow-2xl border-4 border-green-300 transform hover:scale-110 transition-all">
                {level < levels.length - 1 ? '✨ Next Battle' : '🏆 Victory Ceremony'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* LEADERBOARD PAGE */}
      {page === 'leaderboard' && (
        <div className="min-h-screen flex items-center justify-center p-4 relative z-10">
          <div className="max-w-4xl w-full">
            <div className="text-8xl text-center mb-6 animate-bounce">🏆</div>
            
            <h1 className="text-6xl font-black text-white text-center mb-8 drop-shadow-2xl">
              Victory Ceremony!
            </h1>

            <div className="space-y-6 mb-8">
              {leaderboard.map((k, i) => (
                <div key={k.id} className={`rounded-3xl shadow-2xl p-8 transition-all transform hover:scale-105 ${
                  i === 0 ? 'bg-gradient-to-br from-yellow-300 to-yellow-500 scale-110' : 
                  i === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-400 scale-105' : 
                  i === 2 ? 'bg-gradient-to-br from-orange-300 to-orange-500' : 'bg-white'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className="text-6xl">
                        {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i+1}.`}
                      </span>
                      <div>
                        <div className="text-5xl font-black text-gray-800">{k.name}</div>
                        {i === 0 && (
                          <div className="text-xl font-bold text-red-600 flex items-center gap-2 mt-2">
                            <Crown size={24} className="text-yellow-600" />
                            CHAMPION
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-6xl font-black ${
                        k.score > 0 ? 'text-green-600' : 
                        k.score < 0 ? 'text-red-600' : 'text-gray-600'
                      }`}>
                        {k.score > 0 ? '+' : ''}{k.score}
                      </div>
                      <div className="text-sm text-gray-700 mt-2">
                        {k.nice} 👼 / {k.naughty} 😈
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Session Stats */}
            <div className="bg-white/90 backdrop-blur rounded-2xl p-6 mb-6 grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-3xl font-black text-blue-600">{mins}:{secs.toString().padStart(2, '0')}</div>
                <div className="text-sm text-gray-600">Session Time</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-black text-purple-600">
                  {totalShots > 0 ? Math.floor((hits / totalShots) * 100) : 0}%
                </div>
                <div className="text-sm text-gray-600">Accuracy</div>
              </div>
            </div>

            <button onClick={reset}
              className="w-full bg-white hover:bg-gray-100 text-red-800 font-black py-6 rounded-2xl text-2xl shadow-lg flex items-center justify-center gap-2 transform hover:scale-105 transition-all">
              <RotateCcw size={32} />
              New Quest
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;