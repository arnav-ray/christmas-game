🎄 The Curse of the Frozen North 🎅

A Real-Time Multiplayer Christmas Adventure for Families

Welcome to The Curse of the Frozen North, a web-based party game designed to be played together in the same room (or remotely!). One device acts as the "Host" (TV/Laptop), and everyone else joins using their phones as controllers.

📖 The Story

The Ice Witch has frozen the North Pole, plunging Santa's village into darkness. A team of brave Agents (your family!) must assemble to:

Prove their worth to the corrupted Sorting Machine.

Defeat the Grinch Snowman in an epic snowball battle.

Restore the 5 Sacred Treasures to save Christmas!

🎮 How to Play

1. Start the Game (Host)

Open the game on a big screen (Laptop, iPad, or TV).

Click "Host Game".

You will see a 4-letter Room Code at the top left.

2. Join the Squad (Players)

Everyone else opens the game on their phones.

Enter the Room Code and click "JOIN".

Select your Identity: Choose which family member you are (e.g., "I am AG").

3. The Adventure Begins

Phase 1: Setup - The Host adds players and custom tasks (chores, good deeds).

Phase 2: The Sorting - A mad 10-second rush! Vote "Naughty" or "Nice" on the active player. Watch out for system malfunctions!

Phase 3: Boss Battle - The Grinch attacks! Tap your phone screen frantically to throw snowballs. The Host screen shows the battle in real-time.

✨ Features

Real-Time Multiplayer: Powered by Firebase Firestore. Actions on phones update the main screen instantly.

Dynamic "Who Am I?" System: Players claim specific character profiles from a roster.

Boss Battles: A physics-based boss fight where the enemy moves randomly in 3D space.

Voice Acting: The game uses browser Text-to-Speech to announce results ("Nice AG!", "System Failure!").

Customizable: Edit tasks and names directly in the lobby.

Persistent Stats: Tracks total wins and best scores on the host device.

🛠️ Tech Stack

Frontend: React (Vite)

Styling: Tailwind CSS + Lucide Icons

Backend: Firebase (Firestore for real-time state, Auth for anonymous login)

Hosting: Netlify

🚀 Developer Setup

Want to run this locally?

Clone the repo

git clone [https://github.com/your-username/christmas-game.git](https://github.com/your-username/christmas-game.git)
cd christmas-game


Install Dependencies

npm install


Configure Firebase

Create a project at console.firebase.google.com.

Enable Firestore Database and Anonymous Authentication.

Update src/App.jsx with your Firebase API keys.

Run Locally

npm run dev


🔒 Security & Privacy

Data: This game uses a public database structure for ease of connection. Avoid entering sensitive legal names; use nicknames or initials (e.g., "AG", "LG").

Cost: Runs entirely on the Firebase Spark (Free) tier.

Merry Christmas and Happy Coding! 🎁
