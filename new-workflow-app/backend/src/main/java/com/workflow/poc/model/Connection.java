package com.workflow.poc.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class Connection {
    private String node; // Destination node name
    private String type; // e.g., "main"
    private int index;   // Input index on destination
}
