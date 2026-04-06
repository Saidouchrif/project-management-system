package com.projectmanagement.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Project {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    private String description;

    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime deletedAt;

    @ManyToOne
    @JoinColumn(name = "manager_id")
    @JsonIgnoreProperties({"password", "projects", "tasks", "deletedAt"})
    private User manager;

    @OneToMany(mappedBy = "project")
    @JsonIgnore
    private List<Task> tasks;
}
