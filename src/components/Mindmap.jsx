import React, { useCallback, useState, useMemo, useEffect, useRef } from 'react';
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
  useEffect(() => {
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
  const [foundNode, setFoundNode] = useState(null);
  const [searchPath, setSearchPath] = useState([]);
  const [isMobile, setIsMobile] = useState(false);
  const searchInputRef = useRef(null);
  const debouncedSearch = useDebouncedValue(search, 200);
  const [selectedNode, setSelectedNode] = useState(null);
  const { nodes, edges } = useMemo(() => generateNodesAndEdges(descendantsData, debouncedSearch), [debouncedSearch]);

  // Detect mobile device
  useEffect(() => {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    setIsMobile(/iPhone|iPad|iPod|Android/i.test(userAgent));
  }, []);

  // Handle keyboard visibility
  useEffect(() => {
    const handleResize = () => {
      if (isMobile) {
        // Force re-render to update layout
        setSearch(search);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [search, isMobile]);

  // Center and zoom on searched node
  const reactFlowInstance = useReactFlow();
  useEffect(() => {
    if (debouncedSearch && nodes.length > 0 && reactFlowInstance) {
      const found = findSubtreeByName(descendantsData, debouncedSearch);
      if (found) {
        setFoundNode(found);
        setSearchPath(buildSearchPath(found, descendantsData));
        
        // Close keyboard on iOS
        if (isMobile) {
          searchInputRef.current?.blur();
        }
        
        setTimeout(() => {
          const node = nodes.find(n => n.data.label === found.name);
          if (node) {
            // Get node element for accurate positioning
            const nodeEl = document.querySelector(`[data-id="${node.id}"]`);
            if (nodeEl) {
              const rect = nodeEl.getBoundingClientRect();
              const container = reactFlowInstance.getContainer();
              const containerRect = container.getBoundingClientRect();
              
              // Calculate center position
              const centerX = rect.left - containerRect.left - containerRect.width / 2;
              const centerY = rect.top - containerRect.top - containerRect.height / 2;
              
              // Center and zoom with padding
              const zoom = isMobile ? 1.8 : 1.5;
              const padding = isMobile ? 0.6 : 0.5;
              
              reactFlowInstance.setViewport({
                x: -centerX * zoom,
                y: -centerY * zoom,
                zoom,
                duration: 500
              });
            }
          }
        }, 300);
      } else {
        setSearchPath([]);
        setFoundNode(null);
        reactFlowInstance.fitView({
          padding: isMobile ? 0.6 : 0.5,
          duration: 500
        });
      }
    }
  }, [debouncedSearch, nodes, reactFlowInstance, isMobile]);

  // Build the search path from root to found node
  const buildSearchPath = (node, data) => {
    const path = [node.name];
    let current = node;
    while (current.parent) {
      const parent = findSubtreeByName(data, current.parent);
      if (parent) {
        path.unshift(parent.name);
        current = parent;
      } else {
        break;
      }
    }
    return path;
  };

  // Style for search path nodes
  const getSearchPathStyle = (nodeName) => {
    if (searchPath.includes(nodeName)) {
      return {
        border: '4px solid #fde047',
        boxShadow: '0 0 20px rgba(253, 224, 71, 0.7)',
        transform: 'scale(1.1)', // Slightly larger scale for prominence
        background: '#fff',
        zIndex: 10
      };
    }
    return {};
  };

  const onNodeClick = useCallback((event, node) => {
    setSelectedNode(node);
  }, []);

  return (
    <div className="w-full h-[90vh] bg-gradient-to-br from-purple-100 to-blue-100 rounded-2xl shadow-2xl p-4 relative overflow-hidden flex flex-col">
      {/* Mobile-specific styles */}
      <style jsx>{`
        @media (max-width: 768px) {
          .rf-container {
            height: calc(100vh - 200px) !important;
          }
          .rf-viewer {
            height: 100% !important;
          }
        }
      `}</style>
      {/* Search bar */}
      <div className="w-full max-w-md mx-auto mb-4 z-20">
        <input
          ref={searchInputRef}
          className="w-full px-4 py-3 rounded-lg border border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 text-lg shadow-md bg-white transition-all duration-300"
          type="text"
          placeholder="Search descendant..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          onBlur={() => {
            if (isMobile) {
              // Prevent keyboard from showing again
              document.activeElement.blur();
            }
          }}
        />
      </div>

      {/* Search result indicator */}
      {foundNode && (
        <div className="fixed inset-0 z-40 flex items-center justify-center pointer-events-none">
atibus
          <div className="bg-white/90 backdrop-blur-md rounded-2xl p-6 shadow-2xl max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-yellow-400 flex items-center justify-center">
                <svg className="w-6 h-6 text-yellow-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14v6m-3-3h6M6 10h2a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v2a2 2 0 002 2zm10 0h2a2 2 0 002-2V6a2 2 0 00-2-2h-2a2 2 0 00-2 2v2a2 2 0 002 2zM6 20h2a2 2 0 002-2v-2a2 2 0 00-2-2H6a2 2 0 00-2 2v2a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-yellow-800">Found: {foundNode.name}</h3>
                {searchPath.length > 1 && (
                  <p className="text-sm text-gray-600 mt-1">
                    Path: {searchPath.join(' → ')}
                  </p>
                )}
              </div>
            </div>
            <div className="flex justify-center">
              <div className="w-48 h-1 bg-yellow-400 rounded-full" />
            </div>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="w-full max-w-xs mx-auto mb-4 z-20"><ColorLegend /></div>

      {/* React Flow */}
      <div className="flex-1 min-h-0 min-w-0 relative">
        <ReactFlow
          nodes={nodes.map(node => ({
            ...node,
            style: {
              ...node.style,
              ...getSearchPathStyle(node.data.label),
            }
          }))}
          edges={edges}
          fitView
          onNodeClick={onNodeClick}
          minZoom={0.1}
          maxZoom={isMobile ? 3 : 2}
          panOnScroll
          style={{ transition: 'all 0.5s ease' }}
          preventScrolling={false}
          onInit={(instance) => {
            if (isMobile) {
              // Set initial zoom for mobile
              instance.setViewport({
                x: 0,
                y: 0,
                zoom: 1,
                duration: 0
              });
            }
          }}
        >
          <MiniMap />
          <Controls />
          <Background gap={16} />
        </ReactFlow>
        <NodeDetailsModal node={selectedNode} onClose={() => setSelectedNode(null)} />
        {search && nodes.length === 0 && (
          <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-white/90 rounded-lg px-4 py-2 shadow-lg text-lg text-red-600">
            No descendant found.
          </div>
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