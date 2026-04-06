package com.projectmanagement.backend.service;

import com.projectmanagement.backend.entity.*;
import com.projectmanagement.backend.repository.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;

    public ProjectService(ProjectRepository projectRepository,
                          UserRepository userRepository) {
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
    }

    public Map<String, Object> create(Project project) {

        Map<String, Object> response = new HashMap<>();

        try {
            User manager = getCurrentUser();

            if (manager.getRole() != Role.MANAGER) {
                throw new RuntimeException("Only MANAGER can create project");
            }

            if (project.getName() == null || project.getName().isBlank()) {
                throw new RuntimeException("Project name is required");
            }

            Optional<Project> existing = projectRepository.findByName(project.getName());

            if (existing.isPresent()) {
                if (existing.get().getDeletedAt() != null) {
                    response.put("message", "Project exists but deleted");
                    return response;
                }
                throw new RuntimeException("Project already exists");
            }

            project.setManager(manager);
            projectRepository.save(project);

            response.put("message", "Project created");
            response.put("data", project);

        } catch (Exception e) {
            response.put("error", e.getMessage());
        }

        return response;
    }

    public Map<String, Object> getAll() {
        Map<String, Object> res = new HashMap<>();
        try {
            User actor = getCurrentUser();

            if (actor.getRole() == Role.ADMIN) {
                res.put("data", projectRepository.findByDeletedAtIsNull());
            } else if (actor.getRole() == Role.MANAGER) {
                res.put("data", projectRepository.findByManagerAndDeletedAtIsNull(actor));
            } else {
                throw new RuntimeException("Only ADMIN or MANAGER can view projects");
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
            Project p = projectRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Project not found"));

            if (actor.getRole() == Role.MANAGER && !Objects.equals(p.getManager().getId(), actor.getId())) {
                throw new RuntimeException("You can only delete your own projects");
            }
            if (actor.getRole() != Role.ADMIN && actor.getRole() != Role.MANAGER) {
                throw new RuntimeException("Only ADMIN or MANAGER can delete projects");
            }

            p.setDeletedAt(LocalDateTime.now());
            projectRepository.save(p);

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
            Project p = projectRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Project not found"));

            if (actor.getRole() == Role.MANAGER && !Objects.equals(p.getManager().getId(), actor.getId())) {
                throw new RuntimeException("You can only restore your own projects");
            }
            if (actor.getRole() != Role.ADMIN && actor.getRole() != Role.MANAGER) {
                throw new RuntimeException("Only ADMIN or MANAGER can restore projects");
            }

            p.setDeletedAt(null);
            projectRepository.save(p);

            res.put("message", "Restored");
        } catch (Exception e) {
            res.put("error", e.getMessage());
        }
        return res;
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
