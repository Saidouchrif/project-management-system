package com.projectmanagement.backend.repository;

import com.projectmanagement.backend.entity.Task;
import com.projectmanagement.backend.entity.User;
import com.projectmanagement.backend.entity.Project;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TaskRepository extends JpaRepository<Task, Long> {

    List<Task> findByDeletedAtIsNull();

    List<Task> findByDeletedAtIsNotNull();

    List<Task> findByAssignedToAndDeletedAtIsNull(User user);

    List<Task> findByProjectAndDeletedAtIsNull(Project project);

    List<Task> findByProjectAndDeletedAtIsNotNull(Project project);

    Optional<Task> findByTitle(String title);
}
