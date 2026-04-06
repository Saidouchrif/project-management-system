package com.projectmanagement.backend.entity;

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

    // 🔗 Manager dyal project
    @ManyToOne
    @JoinColumn(name = "manager_id")
    private User manager;

    // 🔗 Tasks
    @OneToMany(mappedBy = "project")
    private List<Task> tasks;
}