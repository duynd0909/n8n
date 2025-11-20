package com.workflow.poc.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;
import java.util.List;
import java.util.Map;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class Node {
    private String id;
    private String name;
    private String type;
    private double typeVersion;
    private List<Double> position;
    private Map<String, Object> parameters;
    private Map<String, Object> credentials;
}
