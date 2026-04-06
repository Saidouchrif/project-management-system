package com.projectmanagement.backend.repository;

import com.projectmanagement.backend.entity.User;
import com.projectmanagement.backend.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    Optional<User> findByEmailAndDeletedAtIsNull(String email);

    List<User> findByDeletedAtIsNull();

    List<User> findByRoleAndDeletedAtIsNull(Role role);
}