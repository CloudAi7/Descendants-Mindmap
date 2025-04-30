import React from 'react';
import Mindmap from './components/Mindmap';

// Set --vh CSS variable for mobile iOS viewport fix
React.useEffect(() => {
  function setVh() {
    document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
  }
  setVh();
  window.addEventListener('resize', setVh);
  return () => window.removeEventListener('resize', setVh);
}, []);

export default function App() {
  return (
    <div className="full-mobile-screen bg-gradient-to-br from-blue-100 to-purple-100 p-2">
      <header className="text-center py-4">
        <h1 className="text-3xl font-bold text-purple-700">Bible Descendants Mindmap</h1>
        <p className="text-gray-600 mt-2">Animated, interactive, and mobile-friendly genealogy from Genesis to Revelation</p>
      </header>
      <Mindmap />
    </div>
  );
}
