package com.projectmanagement.backend.service;

import com.projectmanagement.backend.entity.*;
import com.projectmanagement.backend.repository.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
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

    public Map<String, Object> create(Long projectId, Long userId, Task task) {

        Map<String, Object> res = new HashMap<>();

        try {
            User manager = getCurrentUser();

            if (manager.getRole() != Role.MANAGER) {
                throw new RuntimeException("Only manager can assign tasks");
            }

            Project project = projectRepository.findById(projectId)
                    .orElseThrow(() -> new RuntimeException("Project not found"));

            if (project.getDeletedAt() != null) {
                throw new RuntimeException("Project is deleted");
            }

            if (project.getManager() == null || !Objects.equals(project.getManager().getId(), manager.getId())) {
                throw new RuntimeException("You can only assign tasks in your own projects");
            }

            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            if (user.getDeletedAt() != null) {
                throw new RuntimeException("Assigned user is deleted");
            }

            if (user.getRole() != Role.EMPLOYE) {
                throw new RuntimeException("Tasks can only be assigned to EMPLOYE");
            }

            if (task.getTitle() == null || task.getTitle().isBlank()) {
                throw new RuntimeException("Task title is required");
            }

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
            if (task.getStatus() == null || task.getStatus().isBlank()) {
                task.setStatus("TODO");
            } else {
                task.setStatus(normalizeStatus(task.getStatus()));
            }

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
            User actor = getCurrentUser();

            if (actor.getRole() == Role.ADMIN) {
                res.put("data", taskRepository.findByDeletedAtIsNull());
            } else if (actor.getRole() == Role.MANAGER) {
                List<Task> managerTasks = new ArrayList<>();
                List<Project> managerProjects = projectRepository.findByManagerAndDeletedAtIsNull(actor);
                for (Project project : managerProjects) {
                    managerTasks.addAll(taskRepository.findByProjectAndDeletedAtIsNull(project));
                }
                res.put("data", managerTasks);
            } else if (actor.getRole() == Role.EMPLOYE) {
                res.put("data", taskRepository.findByAssignedToAndDeletedAtIsNull(actor));
            } else {
                throw new RuntimeException("Unauthorized role");
            }
        } catch (Exception e) {
            res.put("error", e.getMessage());
        }
        return res;
    }

    public Map<String, Object> getDeleted() {
        Map<String, Object> res = new HashMap<>();
        try {
            User actor = getCurrentUser();

            if (actor.getRole() == Role.ADMIN) {
                res.put("data", taskRepository.findByDeletedAtIsNotNull());
            } else if (actor.getRole() == Role.MANAGER) {
                List<Task> managerTasks = new ArrayList<>();
                List<Project> managerProjects = projectRepository.findByManagerAndDeletedAtIsNull(actor);
                for (Project project : managerProjects) {
                    managerTasks.addAll(taskRepository.findByProjectAndDeletedAtIsNotNull(project));
                }
                res.put("data", managerTasks);
            } else {
                throw new RuntimeException("Only ADMIN or MANAGER can view deleted tasks");
            }
        } catch (Exception e) {
            res.put("error", e.getMessage());
        }
        return res;
    }

    public Map<String, Object> getByUser(Long userId) {
        Map<String, Object> res = new HashMap<>();
        try {
            User actor = getCurrentUser();
            User u = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            if (actor.getRole() == Role.EMPLOYE && !Objects.equals(actor.getId(), userId)) {
                throw new RuntimeException("You can only see your own tasks");
            }

            if (actor.getRole() == Role.MANAGER) {
                List<Project> managerProjects = projectRepository.findByManagerAndDeletedAtIsNull(actor);
                Set<Long> managerProjectIds = new HashSet<>();
                for (Project project : managerProjects) {
                    managerProjectIds.add(project.getId());
                }

                List<Task> assignedTasks = taskRepository.findByAssignedToAndDeletedAtIsNull(u);
                List<Task> visibleTasks = new ArrayList<>();
                for (Task assignedTask : assignedTasks) {
                    if (assignedTask.getProject() != null
                            && managerProjectIds.contains(assignedTask.getProject().getId())) {
                        visibleTasks.add(assignedTask);
                    }
                }

                res.put("data", visibleTasks);
            } else {
                res.put("data", taskRepository.findByAssignedToAndDeletedAtIsNull(u));
            }
        } catch (Exception e) {
            res.put("error", e.getMessage());
        }
        return res;
    }

    public Map<String, Object> delete(Long id) {
        Map<String, Object> res = new HashMap<>();
        try {
            User actor = getCurrentUser();
            Task t = taskRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Task not found"));

            if (actor.getRole() == Role.MANAGER) {
                if (t.getProject() == null || t.getProject().getManager() == null
                        || !Objects.equals(t.getProject().getManager().getId(), actor.getId())) {
                    throw new RuntimeException("You can only delete tasks in your own projects");
                }
            } else if (actor.getRole() != Role.ADMIN) {
                throw new RuntimeException("Only ADMIN or MANAGER can delete tasks");
            }

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
            User actor = getCurrentUser();
            Task t = taskRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Task not found"));

            if (actor.getRole() == Role.MANAGER) {
                if (t.getProject() == null || t.getProject().getManager() == null
                        || !Objects.equals(t.getProject().getManager().getId(), actor.getId())) {
                    throw new RuntimeException("You can only restore tasks in your own projects");
                }
            } else if (actor.getRole() != Role.ADMIN) {
                throw new RuntimeException("Only ADMIN or MANAGER can restore tasks");
            }

            t.setDeletedAt(null);
            taskRepository.save(t);

            res.put("message", "Restored");
        } catch (Exception e) {
            res.put("error", e.getMessage());
        }
        return res;
    }

    public Map<String, Object> updateMyTaskStatus(Long taskId, String status) {
        Map<String, Object> res = new HashMap<>();

        try {
            User actor = getCurrentUser();
            if (actor.getRole() != Role.EMPLOYE) {
                throw new RuntimeException("Only EMPLOYE can update ticket status");
            }

            Task task = taskRepository.findById(taskId)
                    .orElseThrow(() -> new RuntimeException("Task not found"));

            if (task.getDeletedAt() != null) {
                throw new RuntimeException("Task is deleted");
            }

            if (task.getAssignedTo() == null || !Objects.equals(task.getAssignedTo().getId(), actor.getId())) {
                throw new RuntimeException("You can only update your own task");
            }

            task.setStatus(normalizeStatus(status));
            taskRepository.save(task);

            res.put("message", "Task status updated");
            res.put("data", task);

        } catch (Exception e) {
            res.put("error", e.getMessage());
        }

        return res;
    }

    private String normalizeStatus(String status) {
        if (status == null || status.isBlank()) {
            throw new RuntimeException("Status is required");
        }

        String normalized = status.trim().toUpperCase(Locale.ROOT);
        Set<String> allowed = Set.of("TODO", "IN_PROGRESS", "DONE");
        if (!allowed.contains(normalized)) {
            throw new RuntimeException("Status must be TODO, IN_PROGRESS or DONE");
        }

        return normalized;
    }

    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getName() == null) {
            throw new RuntimeException("Unauthenticated user");
        }

        return userRepository.findByEmailAndDeletedAtIsNull(auth.getName())
                .orElseThrow(() -> new RuntimeException("Authenticated user not found"));
    }
}
