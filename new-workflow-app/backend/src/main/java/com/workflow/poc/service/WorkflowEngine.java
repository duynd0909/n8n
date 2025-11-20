package com.workflow.poc.service;

import com.workflow.poc.model.Connection;
import com.workflow.poc.model.Node;
import com.workflow.poc.model.Workflow;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class WorkflowEngine {

    public String executeWorkflow(Workflow workflow) {
        StringBuilder executionLog = new StringBuilder();
        executionLog.append("Starting execution for workflow: ").append(workflow.getName()).append("\n");

        // 1. Identify Start Nodes (Simplified: For PoC, we just look for the first node in list or specific type)
        // In a real implementation, we'd look for Trigger nodes or nodes with no incoming connections.
        if (workflow.getNodes() == null || workflow.getNodes().isEmpty()) {
            return "No nodes to execute.";
        }

        // Basic Traversal (Queue-based BFS)
        Queue<Node> executionQueue = new LinkedList<>();
        // For PoC, just start with the first node defined
        executionQueue.add(workflow.getNodes().get(0));

        Set<String> visited = new HashSet<>();

        while (!executionQueue.isEmpty()) {
            Node currentNode = executionQueue.poll();

            if (visited.contains(currentNode.getName())) {
                continue;
            }
            visited.add(currentNode.getName());

            // Execute Node Logic
            executeNode(currentNode, executionLog);

            // Find next nodes
            List<Node> nextNodes = getNextNodes(workflow, currentNode);
            executionQueue.addAll(nextNodes);
        }

        executionLog.append("Execution finished.");
        return executionLog.toString();
    }

    private void executeNode(Node node, StringBuilder log) {
        log.append("Executing Node: [").append(node.getName()).append("] Type: ").append(node.getType()).append("\n");
        if (node.getParameters() != null) {
            log.append("  - Params: ").append(node.getParameters()).append("\n");
        }
        // Here we would delegate to specific Node Implementations (PostgresNode, etc.)
    }

    private List<Node> getNextNodes(Workflow workflow, Node currentNode) {
        List<Node> nextNodes = new ArrayList<>();
        Map<String, Map<String, List<List<Connection>>>> connections = workflow.getConnections();

        if (connections == null || !connections.containsKey(currentNode.getName())) {
            return nextNodes;
        }

        Map<String, List<List<Connection>>> nodeConnections = connections.get(currentNode.getName());
        if (nodeConnections.containsKey("main")) {
            List<List<Connection>> outputs = nodeConnections.get("main");
            for (List<Connection> outputChannel : outputs) {
                for (Connection conn : outputChannel) {
                    findNodeByName(workflow, conn.getNode()).ifPresent(nextNodes::add);
                }
            }
        }
        return nextNodes;
    }

    private Optional<Node> findNodeByName(Workflow workflow, String name) {
        return workflow.getNodes().stream()
                .filter(n -> n.getName().equals(name))
                .findFirst();
    }
}
