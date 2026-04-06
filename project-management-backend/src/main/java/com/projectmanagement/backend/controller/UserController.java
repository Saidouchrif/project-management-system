package com.projectmanagement.backend.controller;

import com.projectmanagement.backend.entity.User;
import com.projectmanagement.backend.entity.Role;
import com.projectmanagement.backend.service.UserService;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping
    public Map<String, Object> create(
            @RequestBody User user,
            @RequestParam Role role) {

        return userService.create(user, role);
    }

    @PutMapping("/{id}/role")
    public Map<String, Object> updateRole(@PathVariable Long id, @RequestParam Role role) {
        return userService.updateRole(id, role);
    }

    @GetMapping
    public Map<String, Object> getAll() {
        return userService.getAll();
    }

    @DeleteMapping("/{id}")
    public Map<String, Object> delete(@PathVariable Long id) {
        return userService.delete(id);
    }

    @PutMapping("/restore/{id}")
    public Map<String, Object> restore(@PathVariable Long id) {
        return userService.restore(id);
    }
}
