package com.workflow.poc.controller;

import com.workflow.poc.model.Workflow;
import com.workflow.poc.service.WorkflowEngine;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/workflow")
@CrossOrigin(origins = "http://localhost:5173") // Allow Vue dev server
public class WorkflowController {

    @Autowired
    private WorkflowEngine workflowEngine;

    @PostMapping("/execute")
    public String execute(@RequestBody Workflow workflow) {
        return workflowEngine.executeWorkflow(workflow);
    }

    @GetMapping("/health")
    public String health() {
        return "Workflow Engine is running";
    }
}
