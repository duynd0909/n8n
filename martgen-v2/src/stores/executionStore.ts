import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { IExecutionResult, ITaskData, INodeExecutionData } from '@/types/workflow';

export interface IExecutionLog {
  nodeId: string;
  nodeName: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error';
  message: string;
}

export const useExecutionStore = defineStore('execution', () => {
  // State
  const executions = ref<Map<string, IExecutionResult[]>>(new Map()); // workflowId -> executions
  const currentExecutionId = ref<string | null>(null);
  const executionLogs = ref<IExecutionLog[]>([]);
  const nodeStatuses = ref<Map<string, 'pending' | 'running' | 'success' | 'error'>>(new Map());

  // Getters
  const currentExecution = computed(() => {
    if (!currentExecutionId.value) return null;

    for (const execs of executions.value.values()) {
      const exec = execs.find(e => e.id === currentExecutionId.value);
      if (exec) return exec;
    }
    return null;
  });

  const getExecutionsForWorkflow = (workflowId: string) => {
    return executions.value.get(workflowId) || [];
  };

  const getNodeStatus = (nodeId: string) => {
    return nodeStatuses.value.get(nodeId) || 'pending';
  };

  const getNodeLogs = (nodeId: string) => {
    return executionLogs.value.filter(log => log.nodeId === nodeId);
  };

  // Actions
  function startExecution(workflowId: string, executionId: string) {
    const execution: IExecutionResult = {
      id: executionId,
      status: 'running',
      runData: {},
      startedAt: new Date().toISOString()
    };

    const workflowExecutions = executions.value.get(workflowId) || [];
    workflowExecutions.unshift(execution);
    executions.value.set(workflowId, workflowExecutions);

    currentExecutionId.value = executionId;
    executionLogs.value = [];
    nodeStatuses.value.clear();
  }

  function updateNodeStatus(
    nodeId: string,
    status: 'pending' | 'running' | 'success' | 'error'
  ) {
    nodeStatuses.value.set(nodeId, status);
  }

  function addNodeData(
    executionId: string,
    nodeName: string,
    taskData: ITaskData
  ) {
    for (const [workflowId, execs] of executions.value.entries()) {
      const execution = execs.find(e => e.id === executionId);
      if (execution) {
        execution.runData[nodeName] = taskData;
        return;
      }
    }
  }

  function addLog(log: IExecutionLog) {
    executionLogs.value.push(log);
  }

  function finishExecution(
    executionId: string,
    status: 'success' | 'error' | 'canceled'
  ) {
    for (const execs of executions.value.values()) {
      const execution = execs.find(e => e.id === executionId);
      if (execution) {
        execution.status = status;
        execution.finishedAt = new Date().toISOString();
        return;
      }
    }
  }

  function setCurrentExecution(executionId: string | null) {
    currentExecutionId.value = executionId;
  }

  function clearCurrentExecution() {
    currentExecutionId.value = null;
    executionLogs.value = [];
    nodeStatuses.value.clear();
  }

  // Mock execution function (to be replaced with actual execution logic)
  async function executeWorkflow(workflowId: string, nodes: any[], connections: any) {
    const executionId = `exec-${Date.now()}`;
    startExecution(workflowId, executionId);

    addLog({
      nodeId: 'system',
      nodeName: 'System',
      timestamp: new Date().toISOString(),
      level: 'info',
      message: 'Workflow execution started'
    });

    // Execute nodes in order
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];

      updateNodeStatus(node.id, 'running');
      addLog({
        nodeId: node.id,
        nodeName: node.name,
        timestamp: new Date().toISOString(),
        level: 'info',
        message: `Executing node: ${node.name}`
      });

      // Simulate execution delay
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));

      // Simulate random success/error
      const isSuccess = Math.random() > 0.2; // 80% success rate

      if (isSuccess) {
        updateNodeStatus(node.id, 'success');

        const taskData: ITaskData = {
          startTime: Date.now() - 1000,
          executionTime: 1000,
          executionStatus: 'success',
          data: {
            main: [[{
              json: { result: `Output from ${node.name}`, timestamp: new Date().toISOString() }
            }]]
          }
        };

        addNodeData(executionId, node.name, taskData);

        addLog({
          nodeId: node.id,
          nodeName: node.name,
          timestamp: new Date().toISOString(),
          level: 'info',
          message: `Node completed successfully`
        });
      } else {
        updateNodeStatus(node.id, 'error');

        const taskData: ITaskData = {
          startTime: Date.now() - 1000,
          executionTime: 1000,
          executionStatus: 'error',
          error: {
            message: `Error executing node ${node.name}`,
            stack: 'Error: Simulated error\n    at Node.execute (node.ts:42)'
          }
        };

        addNodeData(executionId, node.name, taskData);

        addLog({
          nodeId: node.id,
          nodeName: node.name,
          timestamp: new Date().toISOString(),
          level: 'error',
          message: `Node execution failed: ${taskData.error?.message}`
        });

        finishExecution(executionId, 'error');
        return;
      }
    }

    finishExecution(executionId, 'success');
    addLog({
      nodeId: 'system',
      nodeName: 'System',
      timestamp: new Date().toISOString(),
      level: 'info',
      message: 'Workflow execution completed successfully'
    });
  }

  return {
    // State
    executions,
    currentExecutionId,
    executionLogs,
    nodeStatuses,

    // Getters
    currentExecution,
    getExecutionsForWorkflow,
    getNodeStatus,
    getNodeLogs,

    // Actions
    startExecution,
    updateNodeStatus,
    addNodeData,
    addLog,
    finishExecution,
    setCurrentExecution,
    clearCurrentExecution,
    executeWorkflow
  };
});
