const plannerAgent = {
  name: 'planner',
  async planExecution(workflow, inputs) {
    const nodes = workflow.nodes || [];
    const edges = workflow.edges || [];

    // Topological sort or order by edges
    const nodeMap = new Map();
    nodes.forEach((n) => nodeMap.set(n.id, n));

    const inDegree = new Map();
    nodes.forEach((n) => inDegree.set(n.id, 0));

    edges.forEach((e) => {
      if (inDegree.has(e.target)) {
        inDegree.set(e.target, inDegree.get(e.target) + 1);
      }
    });

    const queue = [];
    inDegree.forEach((degree, nodeId) => {
      if (degree === 0) queue.push(nodeId);
    });

    const executionPlan = [];
    while (queue.length > 0) {
      const currentId = queue.shift();
      const node = nodeMap.get(currentId);
      if (node) executionPlan.push(node);

      edges
        .filter((e) => e.source === currentId)
        .forEach((e) => {
          inDegree.set(e.target, inDegree.get(e.target) - 1);
          if (inDegree.get(e.target) === 0) {
            queue.push(e.target);
          }
        });
    }

    // Fall back to original order if graph has cycles or unvisited nodes
    const plannedNodes = executionPlan.length === nodes.length ? executionPlan : nodes;
    const confidenceScore = plannedNodes.length > 0 ? 0.95 : 0.5;

    return {
      plannedNodes,
      totalSteps: plannedNodes.length,
      confidenceScore,
      strategy: 'topological_agent_chain'
    };
  }
};

module.exports = plannerAgent;
