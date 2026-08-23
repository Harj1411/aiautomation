import { useCallback } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge
} from '@xyflow/react';
import { useWorkflowStore } from '../../store/workflowStore';

export default function WorkflowCanvas() {
  const { nodes, edges, setNodes, setEdges, setSelectedNode } = useWorkflowStore();

  const onNodesChange = useCallback(
    (changes) => setNodes(applyNodeChanges(changes, nodes)),
    [nodes, setNodes]
  );

  const onEdgesChange = useCallback(
    (changes) => setEdges(applyEdgeChanges(changes, edges)),
    [edges, setEdges]
  );

  const onConnect = useCallback(
    (connection) => setEdges(addEdge({ ...connection, animated: true }, edges)),
    [edges, setEdges]
  );

  const onNodeClick = (_, node) => {
    setSelectedNode(node);
  };

  const onDragOver = (event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  };

  const onDrop = (event) => {
    event.preventDefault();
    const rawData = event.dataTransfer.getData('application/reactflow');
    if (!rawData) return;

    const item = JSON.parse(rawData);
    const bounds = event.currentTarget.getBoundingClientRect();
    const position = {
      x: event.clientX - bounds.left - 80,
      y: event.clientY - bounds.top - 20
    };

    const newNode = {
      id: `node_${Date.now()}`,
      type: item.type || 'default',
      position,
      data: {
        label: item.label,
        type: item.type,
        config: { provider: item.provider, action: item.action }
      }
    };

    setNodes([...nodes, newNode]);
  };

  return (
    <div className="flex-1 h-full relative bg-dark-900" onDragOver={onDragOver} onDrop={onDrop}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        fitView
        className="bg-dark-900"
      >
        <Background color="#334155" gap={20} size={1} />
        <Controls className="bg-dark-800 border-slate-700 text-slate-200 fill-slate-200" />
      </ReactFlow>
    </div>
  );
}
