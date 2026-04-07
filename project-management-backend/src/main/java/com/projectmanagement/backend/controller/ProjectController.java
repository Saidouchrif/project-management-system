package com.projectmanagement.backend.controller;

import com.projectmanagement.backend.entity.Project;
import com.projectmanagement.backend.service.ProjectService;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/projects")
public class ProjectController {

    private final ProjectService projectService;

    public ProjectController(ProjectService projectService) {
        this.projectService = projectService;
    }

    @PostMapping
    public Map<String, Object> create(@RequestBody Project project) {
        return projectService.create(project);
    }

    @GetMapping
    public Map<String, Object> getAll() {
        return projectService.getAll();
    }

    @GetMapping("/deleted")
    public Map<String, Object> getDeleted() {
        return projectService.getDeleted();
    }

    @DeleteMapping("/{id}")
    public Map<String, Object> delete(@PathVariable Long id) {
        return projectService.delete(id);
    }

    @PutMapping("/restore/{id}")
    public Map<String, Object> restore(@PathVariable Long id) {
        return projectService.restore(id);
    }
}
