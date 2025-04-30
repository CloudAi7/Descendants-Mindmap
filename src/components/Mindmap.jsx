import React, { useCallback, useState, useMemo, useEffect } from 'react';
import ReactFlow, { MiniMap, Controls, Background, ReactFlowProvider, useReactFlow } from 'react-flow-renderer';
import descendantsData from '../data/descendants.json';
import NodeDetailsModal from './NodeDetailsModal';
import ColorLegend from './ColorLegend';

// Helper to build lineage string
const buildLineage = (node, idMap) => {
  let lineage = [];
  let current = node;
  while (current && current.parent) {
    lineage.unshift(idMap[current.parent].name);
    current = idMap[current.parent];
  }
  return lineage.join(' → ');
};

// Color coding for key lineages
const getNodeColor = (name, parentName) => {
  if (["Adam", "Noah", "Abraham", "Isaac", "Jacob (Israel)", "David", "Jesus"].includes(name)) return '#a78bfa'; // Patriarchs
  if (["Reuben","Simeon","Levi","Judah","Dan","Naphtali","Gad","Asher","Issachar","Zebulun","Joseph","Benjamin"].includes(name) && parentName === "Jacob (Israel)") return '#60a5fa'; // Tribes
  if (["David","Solomon","Rehoboam","Abijah","Asa","Jehoshaphat","Jehoram","Uzziah","Jotham","Ahaz","Hezekiah","Manasseh","Amon","Josiah","Jeconiah","Shealtiel","Zerubbabel","Abiud","Eliakim","Azor","Zadok","Achim","Eliud","Eleazar","Matthan","Jacob","Joseph (husband of Mary)","Jesus"].includes(name)) return '#fde047'; // Royal line
  if (["Levi","Kohath","Amram","Aaron","Eleazar","Phinehas"].includes(name)) return '#4ade80'; // Priestly line
  return '#fff';
};

// Debounce utility
function useDebouncedValue(value, delay) {
  const [debounced, setDebounced] = useState(value);
  React.useEffect(() => {
    const handler = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debounced;
}

// Deep clone and assign unique IDs to each node in the subtree
function cloneSubtreeWithIds(node, parent = null, path = 'root') {
  const id = path;
  const cloned = { ...node, id, parent };
  if (node.children) {
    cloned.children = node.children.map((child, idx) => cloneSubtreeWithIds(child, id, `${id}-${idx}`));
  }
  return cloned;
}

// Find node/subtree by name (case-insensitive, first match)
function findSubtreeByName(node, searchTerm) {
  if (!searchTerm) return node;
  if (node.name.toLowerCase().includes(searchTerm.toLowerCase())) return node;
  if (node.children) {
    for (const child of node.children) {
      const found = findSubtreeByName(child, searchTerm);
      if (found) return found;
    }
  }
  return null;
}

// Convert descendantsData to nodes and edges for React Flow
const generateNodesAndEdges = (data, searchTerm = '') => {
  // If searching, focus on the subtree from the first matching node
  let treeRoot = data;
  if (searchTerm) {
    const found = findSubtreeByName(data, searchTerm);
    if (found) treeRoot = cloneSubtreeWithIds(found);
    else treeRoot = null;
  } else {
    treeRoot = cloneSubtreeWithIds(data);
  }
  if (!treeRoot) {
    return { nodes: [], edges: [], idMap: {} };
  }

  const nodes = [];
  const edges = [];
  const idMap = {};
  const queue = [{ ...treeRoot, depth: 0 }];
  let i = 0;

  while (queue.length > 0) {
    const current = queue.shift();
    idMap[current.id] = current;
    const parentName = current.parent ? idMap[current.parent]?.name : null;
    nodes.push({
      id: current.id,
      data: {
        label: current.name,
        lineage: buildLineage(current, idMap)
      },
      position: { x: current.depth * 250, y: i * 80 },
      style: { minWidth: 120, background: getNodeColor(current.name, parentName), borderRadius: 10, border: '2px solid #a78bfa', boxShadow: '0 1px 4px #d1d5db' },
      type: 'default',
      parent: current.parent
    });
    if (current.parent) {
      edges.push({ id: `${current.parent}->${current.id}`, source: current.parent, target: current.id });
    }
    if (current.children) {
      current.children.forEach((child) => {
        queue.push({ ...child, depth: current.depth + 1 });
      });
    }
    i++;
  }
  return { nodes, edges, idMap };
};

function MindmapInner() {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 200);
  const [selectedNode, setSelectedNode] = useState(null);
  const { nodes, edges } = useMemo(() => generateNodesAndEdges(descendantsData, debouncedSearch), [debouncedSearch]);

  // --- Fit view on search change, but avoid iOS zoom bug ---
  const reactFlowInstance = useReactFlow();
  useEffect(() => {
    // Only auto-fit if search term changed (not every node/edge change)
    if (debouncedSearch && nodes.length > 0 && reactFlowInstance && reactFlowInstance.fitView) {
      // iOS keyboard/viewport bug workaround: slight delay
      setTimeout(() => {
        reactFlowInstance.fitView({ padding: 0.15 });
      }, 200);
    }
  }, [debouncedSearch, nodes.length, reactFlowInstance]);

  const onNodeClick = useCallback((event, node) => {
    setSelectedNode(node);
  }, []);

  return (
    <div className="w-full h-[80vh] bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl shadow-lg p-2 relative overflow-hidden flex flex-col" style={{ minHeight: '60vh', minHeight: 'calc(var(--vh, 1vh) * 80)' }}>
      {/* Responsive search bar */}
      <div className="w-full flex justify-center items-center z-20 px-2 pt-2 md:absolute md:top-2 md:left-2 md:w-64 md:max-w-full">
        <input
          className="w-full px-3 py-2 rounded-lg border border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-400 text-lg shadow bg-white"
          type="text"
          placeholder="Search descendant..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>
      {/* Responsive legend */}
      <div className="w-full flex justify-center items-center mt-2 md:absolute md:top-2 md:right-2 md:w-auto md:mt-0 z-20"><ColorLegend /></div>
      <div className="flex-1 min-h-0 min-w-0 relative mt-2 md:mt-0">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          fitView
          onNodeClick={onNodeClick}
          minZoom={0.1}
          maxZoom={2}
          panOnScroll
        >
          <MiniMap />
          <Controls />
          <Background gap={16} />
        </ReactFlow>
        <NodeDetailsModal node={selectedNode} onClose={() => setSelectedNode(null)} />
        {search && nodes.length === 0 && (
          <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-white/90 rounded px-4 py-2 shadow text-lg text-red-600">No descendant found.</div>
        )}
      </div>
    </div>
  );
}

export default function Mindmap() {
  return (
    <ReactFlowProvider>
      <MindmapInner />
    </ReactFlowProvider>
  );
}
