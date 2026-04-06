package com.projectmanagement.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Task {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    private String description;

    private String status; // TODO, IN_PROGRESS, DONE

    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime deletedAt;

    // 🔗 Project
    @ManyToOne
    @JoinColumn(name = "project_id")
    private Project project;

    // 🔗 Employe li assigned
    @ManyToOne
    @JoinColumn(name = "assigned_to")
    private User assignedTo;
}