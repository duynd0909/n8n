package com.workflow.poc.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class Workflow {
    private String id;
    private String name;
    private boolean active;
    private List<Node> nodes;

    // n8n connections structure:
    // Map<NodeName, Map<ConnectionType, List<List<Connection>>>>
    // Example: { "Start": { "main": [ [ { "node": "Postgres", "type": "main", "index": 0 } ] ] } }
    private Map<String, Map<String, List<List<Connection>>>> connections;
}
