package com.projectmanagement.backend.service;

import com.projectmanagement.backend.entity.*;
import com.projectmanagement.backend.repository.*;
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

    public Map<String, Object> create(Project project, Long managerId) {

        Map<String, Object> response = new HashMap<>();

        try {
            User manager = userRepository.findById(managerId)
                    .orElseThrow(() -> new RuntimeException("Manager not found"));

            if (manager.getRole() != Role.MANAGER) {
                throw new RuntimeException("Only MANAGER can create project");
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
            res.put("data", projectRepository.findByDeletedAtIsNull());
        } catch (Exception e) {
            res.put("error", e.getMessage());
        }
        return res;
    }

    public Map<String, Object> delete(Long id) {
        Map<String, Object> res = new HashMap<>();
        try {
            Project p = projectRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Project not found"));

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
            Project p = projectRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Project not found"));

            p.setDeletedAt(null);
            projectRepository.save(p);

            res.put("message", "Restored");
        } catch (Exception e) {
            res.put("error", e.getMessage());
        }
        return res;
    }
}