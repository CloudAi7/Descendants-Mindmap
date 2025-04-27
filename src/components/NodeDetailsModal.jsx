import React from 'react';

export default function NodeDetailsModal({ node, onClose }) {
  if (!node) return null;
  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6 relative animate-fadeIn">
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-xl"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
        <h2 className="text-2xl font-bold mb-2 text-purple-700">{node.data.label}</h2>
        {node.data.lineage && (
          <div className="mb-2 text-sm text-gray-600">
            <span className="font-semibold">Lineage:</span> {node.data.lineage}
          </div>
        )}
        {/* Add more details here if available */}
      </div>
    </div>
  );
}
