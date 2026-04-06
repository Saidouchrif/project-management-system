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

    @GetMapping("/me")
    public Map<String, Object> getMyProfile() {
        return userService.getMyProfile();
    }

    @PutMapping("/me")
    public Map<String, Object> updateMyProfile(@RequestBody UpdateProfileRequest request) {
        return userService.updateMyProfile(request.getName(), request.getEmail());
    }

    @PutMapping("/me/password")
    public Map<String, Object> changeMyPassword(@RequestBody ChangePasswordRequest request) {
        return userService.changeMyPassword(request.getOldPassword(), request.getNewPassword());
    }

    @GetMapping
    public Map<String, Object> getAll() {
        return userService.getAll();
    }

    @GetMapping("/deleted")
    public Map<String, Object> getDeleted() {
        return userService.getDeleted();
    }

    @GetMapping("/options")
    public Map<String, Object> getUserOptions() {
        return userService.getUserOptions();
    }

    @DeleteMapping("/{id}")
    public Map<String, Object> delete(@PathVariable Long id) {
        return userService.delete(id);
    }

    @PutMapping("/restore/{id}")
    public Map<String, Object> restore(@PathVariable Long id) {
        return userService.restore(id);
    }

    public static class UpdateProfileRequest {
        private String name;
        private String email;

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }
    }

    public static class ChangePasswordRequest {
        private String oldPassword;
        private String newPassword;

        public String getOldPassword() {
            return oldPassword;
        }

        public void setOldPassword(String oldPassword) {
            this.oldPassword = oldPassword;
        }

        public String getNewPassword() {
            return newPassword;
        }

        public void setNewPassword(String newPassword) {
            this.newPassword = newPassword;
        }
    }
}
