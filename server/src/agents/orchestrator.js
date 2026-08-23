const plannerAgent = require('./plannerAgent');
const executionAgent = require('./executionAgent');
const validationAgent = require('./validationAgent');
const recoveryAgent = require('./recoveryAgent');
const monitoringAgent = require('./monitoringAgent');

let isLangGraphAvailable = false;
try {
  require('@langchain/langgraph');
  isLangGraphAvailable = true;
} catch (e) {
  isLangGraphAvailable = false;
}

const runWorkflowOrchestration = async ({ workflow, execution, userId, executionService, notificationService }) => {
  const executionId = execution._id || execution.id;
  const workflowId = workflow._id || workflow.id;

  const langGraphStatus = isLangGraphAvailable ? 'available' : 'not-installed';

  await monitoringAgent.logEvent({
    executionId,
    workflowId,
    agent: 'monitoring',
    level: 'info',
    message: `Orchestration started. LangGraph substrate status: ${langGraphStatus}`,
    metadata: { langGraph: langGraphStatus, nodesCount: workflow.nodes?.length || 0 }
  });

  // Step 1: Planner Agent
  await monitoringAgent.logEvent({
    executionId,
    workflowId,
    agent: 'planner',
    level: 'info',
    message: 'Planner Agent calculating topological execution graph and node order...'
  });

  const plan = await plannerAgent.planExecution(workflow, execution.inputs || {});

  await monitoringAgent.logEvent({
    executionId,
    workflowId,
    agent: 'planner',
    level: 'success',
    message: `Plan generated with ${plan.totalSteps} steps (Confidence score: ${plan.confidenceScore})`,
    metadata: { confidenceScore: plan.confidenceScore, stepsCount: plan.totalSteps }
  });

  const accumOutputs = {};

  for (let i = 0; i < plan.plannedNodes.length; i++) {
    const node = plan.plannedNodes[i];
    const nodeId = node.id;
    const nodeLabel = node.data?.label || node.id;

    // Check if execution was paused or cancelled mid-flight
    if (executionService) {
      const currentExec = await executionService.getExecutionById(executionId);
      if (currentExec && (currentExec.status === 'PAUSED' || currentExec.status === 'CANCELLED')) {
        await monitoringAgent.logEvent({
          executionId,
          workflowId,
          nodeId,
          agent: 'monitoring',
          level: 'warning',
          message: `Execution halted. Current status: ${currentExec.status}`
        });
        return { status: currentExec.status, langGraph: langGraphStatus };
      }
    }

    await monitoringAgent.logEvent({
      executionId,
      workflowId,
      nodeId,
      agent: 'execution',
      level: 'info',
      message: `Executing node [${nodeLabel}] (${i + 1}/${plan.plannedNodes.length})...`
    });

    let execResult = null;
    let nodeAttempt = 0;
    let success = false;

    while (!success && nodeAttempt < 3) {
      nodeAttempt++;
      try {
        execResult = await executionAgent.executeNode(node, userId, accumOutputs);

        if (execResult.status === 'SUCCESS') {
          // Step 3: Validation Agent
          await monitoringAgent.logEvent({
            executionId,
            workflowId,
            nodeId,
            agent: 'validation',
            level: 'info',
            message: `Validation Agent verifying outputs for node [${nodeLabel}]...`
          });

          const valResult = await validationAgent.validateOutput(node, execResult);

          if (valResult.isValid) {
            success = true;
            accumOutputs[nodeId] = execResult.result;
            await monitoringAgent.logEvent({
              executionId,
              workflowId,
              nodeId,
              agent: 'validation',
              level: 'success',
              message: `Validation passed for node [${nodeLabel}]`,
              metadata: { output: execResult.result }
            });
          } else {
            throw new Error(valResult.reason);
          }
        } else {
          throw new Error(execResult.error || 'Execution agent returned failure');
        }
      } catch (err) {
        // Step 4: Recovery Agent
        await monitoringAgent.logEvent({
          executionId,
          workflowId,
          nodeId,
          agent: 'recovery',
          level: 'warning',
          message: `Failure detected on node [${nodeLabel}]: ${err.message}. Recovery Agent classifying...`
        });

        const recResult = await recoveryAgent.handleFailure(err, {
          retryCount: nodeAttempt,
          errorCode: err.code
        });

        await monitoringAgent.logEvent({
          executionId,
          workflowId,
          nodeId,
          agent: 'recovery',
          level: recResult.decision === 'escalate' ? 'error' : 'warning',
          message: `Recovery classification: ${recResult.category}. Action: ${recResult.decision}`,
          metadata: recResult
        });

        if (recResult.decision === 'retry_with_backoff' && nodeAttempt < 3) {
          await new Promise((res) => setTimeout(res, Math.min(recResult.backoffMs, 1000)));
        } else {
          // Escalate failure
          await monitoringAgent.logEvent({
            executionId,
            workflowId,
            nodeId,
            agent: 'monitoring',
            level: 'error',
            message: `Workflow execution failed at node [${nodeLabel}]. Reason: ${err.message}`
          });

          if (notificationService) {
            await notificationService.createNotification({
              owner: userId,
              workflowId,
              executionId,
              type: 'failure',
              title: `Execution Failed: ${workflow.name || 'Workflow'}`,
              message: `Failed at step ${nodeLabel}: ${err.message}`
            });
          }

          return {
            status: 'FAILED',
            error: err.message,
            langGraph: langGraphStatus,
            nodeId
          };
        }
      }
    }
  }

  await monitoringAgent.logEvent({
    executionId,
    workflowId,
    agent: 'monitoring',
    level: 'success',
    message: 'Workflow execution completed successfully across all agent stages!',
    metadata: { langGraph: langGraphStatus, outputs: accumOutputs }
  });

  if (notificationService) {
    await notificationService.createNotification({
      owner: userId,
      workflowId,
      executionId,
      type: 'success',
      title: `Execution Succeeded: ${workflow.name || 'Workflow'}`,
      message: `Completed all ${plan.totalSteps} steps successfully.`
    });
  }

  return {
    status: 'COMPLETED',
    outputs: accumOutputs,
    langGraph: langGraphStatus
  };
};

module.exports = {
  runWorkflowOrchestration,
  isLangGraphAvailable
};
