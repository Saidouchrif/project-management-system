package com.projectmanagement.backend.controller;

import com.projectmanagement.backend.entity.Task;
import com.projectmanagement.backend.service.TaskService;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    private final TaskService taskService;

    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    @PostMapping
    public Map<String, Object> create(
            @RequestParam Long projectId,
            @RequestParam Long userId,
            @RequestBody Task task) {

        return taskService.create(projectId, userId, task);
    }

    @GetMapping
    public Map<String, Object> getAll() {
        return taskService.getAll();
    }

    @GetMapping("/deleted")
    public Map<String, Object> getDeleted() {
        return taskService.getDeleted();
    }

    @GetMapping("/user/{userId}")
    public Map<String, Object> getByUser(@PathVariable Long userId) {
        return taskService.getByUser(userId);
    }

    @DeleteMapping("/{id}")
    public Map<String, Object> delete(@PathVariable Long id) {
        return taskService.delete(id);
    }

    @PutMapping("/restore/{id}")
    public Map<String, Object> restore(@PathVariable Long id) {
        return taskService.restore(id);
    }

    @PatchMapping("/{id}/status")
    public Map<String, Object> updateStatus(@PathVariable Long id, @RequestParam String status) {
        return taskService.updateMyTaskStatus(id, status);
    }
}
