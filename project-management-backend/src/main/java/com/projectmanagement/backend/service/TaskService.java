package com.projectmanagement.backend.service;

import com.projectmanagement.backend.entity.*;
import com.projectmanagement.backend.repository.*;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class TaskService {

    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;

    public TaskService(TaskRepository taskRepository,
                       ProjectRepository projectRepository,
                       UserRepository userRepository) {
        this.taskRepository = taskRepository;
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
    }

    public Map<String, Object> create(Long projectId, Long userId, Task task, Long managerId) {

        Map<String, Object> res = new HashMap<>();

        try {
            User manager = userRepository.findById(managerId)
                    .orElseThrow(() -> new RuntimeException("Manager not found"));

            if (manager.getRole() != Role.MANAGER) {
                throw new RuntimeException("Only manager can assign tasks");
            }

            Project project = projectRepository.findById(projectId)
                    .orElseThrow(() -> new RuntimeException("Project not found"));

            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            Optional<Task> existing = taskRepository.findByTitle(task.getTitle());

            if (existing.isPresent()) {
                if (existing.get().getDeletedAt() != null) {
                    res.put("message", "Task exists but deleted");
                    return res;
                }
                throw new RuntimeException("Task already exists");
            }

            task.setProject(project);
            task.setAssignedTo(user);

            taskRepository.save(task);

            res.put("message", "Task created");
            res.put("data", task);

        } catch (Exception e) {
            res.put("error", e.getMessage());
        }

        return res;
    }

    public Map<String, Object> getAll() {
        Map<String, Object> res = new HashMap<>();
        try {
            res.put("data", taskRepository.findByDeletedAtIsNull());
        } catch (Exception e) {
            res.put("error", e.getMessage());
        }
        return res;
    }

    public Map<String, Object> getByUser(Long userId) {
        Map<String, Object> res = new HashMap<>();
        try {
            User u = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            res.put("data", taskRepository.findByAssignedToAndDeletedAtIsNull(u));
        } catch (Exception e) {
            res.put("error", e.getMessage());
        }
        return res;
    }

    public Map<String, Object> delete(Long id) {
        Map<String, Object> res = new HashMap<>();
        try {
            Task t = taskRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Task not found"));

            t.setDeletedAt(LocalDateTime.now());
            taskRepository.save(t);

            res.put("message", "Deleted");
        } catch (Exception e) {
            res.put("error", e.getMessage());
        }
        return res;
    }

    public Map<String, Object> restore(Long id) {
        Map<String, Object> res = new HashMap<>();
        try {
            Task t = taskRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Task not found"));

            t.setDeletedAt(null);
            taskRepository.save(t);

            res.put("message", "Restored");
        } catch (Exception e) {
            res.put("error", e.getMessage());
        }
        return res;
    }
}