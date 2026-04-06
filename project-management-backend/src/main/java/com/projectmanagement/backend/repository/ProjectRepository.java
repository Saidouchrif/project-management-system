package com.projectmanagement.backend.repository;

import com.projectmanagement.backend.entity.Project;
import com.projectmanagement.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProjectRepository extends JpaRepository<Project, Long> {

    List<Project> findByDeletedAtIsNull();

    List<Project> findByDeletedAtIsNotNull();

    List<Project> findByManagerAndDeletedAtIsNull(User manager);

    List<Project> findByManagerAndDeletedAtIsNotNull(User manager);

    Optional<Project> findByName(String name);
}
