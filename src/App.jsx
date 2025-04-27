import React from 'react';
import Mindmap from './components/Mindmap';

export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-100 p-2">
      <header className="text-center py-4">
        <h1 className="text-3xl font-bold text-purple-700">Bible Descendants Mindmap</h1>
        <p className="text-gray-600 mt-2">Animated, interactive, and mobile-friendly genealogy from Genesis to Revelation</p>
      </header>
      <Mindmap />
    </div>
  );
}
