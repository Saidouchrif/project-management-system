package com.projectmanagement.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @Column(unique = true, nullable = false)
    private String email;

    private String password;

    @Enumerated(EnumType.STRING)
    private Role role;

    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime deletedAt; // soft delete

    // 🔗 relations

    // Manager → projects
    @OneToMany(mappedBy = "manager")
    private List<Project> projects;

    // Employe → tasks
    @OneToMany(mappedBy = "assignedTo")
    private List<Task> tasks;
}