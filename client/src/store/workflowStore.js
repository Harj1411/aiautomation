import { create } from 'zustand';

export const useWorkflowStore = create((set, get) => ({
  activeWorkflow: null,
  nodes: [],
  edges: [],
  selectedNode: null,
  isSaving: false,
  isGenerating: false,

  setActiveWorkflow: (workflow) => {
    set({
      activeWorkflow: workflow,
      nodes: workflow?.nodes || [],
      edges: workflow?.edges || [],
      selectedNode: null
    });
  },

  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),

  onNodesChange: (changes) => {
    // Basic node state handler
  },

  setSelectedNode: (node) => set({ selectedNode: node }),

  updateNodeConfig: (nodeId, newConfig) => {
    const nodes = get().nodes.map((node) => {
      if (node.id === nodeId) {
        return {
          ...node,
          data: {
            ...node.data,
            config: {
              ...(node.data?.config || {}),
              ...newConfig
            }
          }
        };
      }
      return node;
    });

    const selected = get().selectedNode;
    let updatedSelected = selected;
    if (selected && selected.id === nodeId) {
      updatedSelected = {
        ...selected,
        data: {
          ...selected.data,
          config: {
            ...(selected.data?.config || {}),
            ...newConfig
          }
        }
      };
    }

    set({ nodes, selectedNode: updatedSelected });
  },

  addNode: (newNode) => {
    set((state) => ({ nodes: [...state.nodes, newNode] }));
  }
}));
