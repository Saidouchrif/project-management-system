package com.projectmanagement.backend;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.projectmanagement.backend.entity.Project;
import com.projectmanagement.backend.entity.Role;
import com.projectmanagement.backend.entity.Task;
import com.projectmanagement.backend.entity.User;
import com.projectmanagement.backend.repository.ProjectRepository;
import com.projectmanagement.backend.repository.TaskRepository;
import com.projectmanagement.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.FilterChainProxy;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@ActiveProfiles("test")
class ApiRoutesIntegrationTest {

    private MockMvc mockMvc;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Autowired
    private WebApplicationContext webApplicationContext;

    @Autowired
    private FilterChainProxy springSecurityFilterChain;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @BeforeEach
    void cleanDatabase() {
        mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext)
                .addFilters(springSecurityFilterChain)
                .build();
        taskRepository.deleteAll();
        projectRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    void authRoutesShouldWorkEndToEnd() throws Exception {
        readJson(mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {
                          "name": "Employe Demo",
                          "email": "employe.demo@pms.local",
                          "password": "demo123"
                        }
                        """))
                .andExpect(status().isOk()));

        User registered = userRepository.findByEmail("employe.demo@pms.local").orElseThrow();
        assertThat(registered.getRole()).isEqualTo(Role.EMPLOYE);

        JsonNode loginJson = login("employe.demo@pms.local", "demo123");
        String accessToken = loginJson.path("accessToken").asText();
        String refreshToken = loginJson.path("refreshToken").asText();

        assertThat(accessToken).isNotBlank();
        assertThat(refreshToken).isNotBlank();

        JsonNode refreshJson = readJson(mockMvc.perform(post("/api/auth/refresh")
                .queryParam("refreshToken", refreshToken))
                .andExpect(status().isOk()));

        assertThat(refreshJson.path("accessToken").asText()).isNotBlank();

        JsonNode meJson = readJson(mockMvc.perform(get("/api/auth/me")
                .header("Authorization", bearer(accessToken)))
                .andExpect(status().isOk()));

        assertThat(meJson.path("data").path("email").asText()).isEqualTo("employe.demo@pms.local");
    }

    @Test
    void userRoutesShouldWorkForAdminAndAuthenticatedUser() throws Exception {
        persistUser("Admin", "admin@pms.local", "admin123", Role.ADMIN);
        persistUser("Manager One", "manager.one@pms.local", "manager123", Role.MANAGER);

        String adminToken = accessToken("admin@pms.local", "admin123");

        readJson(mockMvc.perform(post("/api/users")
                .queryParam("role", "MANAGER")
                .header("Authorization", bearer(adminToken))
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {
                          "name": "Manager Two",
                          "email": "manager.two@pms.local",
                          "password": "manager123"
                        }
                        """))
                .andExpect(status().isOk()));

        User createdUser = userRepository.findByEmail("manager.two@pms.local").orElseThrow();
        Long createdUserId = createdUser.getId();
        assertThat(createdUserId).isPositive();

        JsonNode listJson = readJson(mockMvc.perform(get("/api/users")
                .header("Authorization", bearer(adminToken)))
                .andExpect(status().isOk()));
        assertThat(listJson.path("data").isArray()).isTrue();

        JsonNode optionsJson = readJson(mockMvc.perform(get("/api/users/options")
                .header("Authorization", bearer(adminToken)))
                .andExpect(status().isOk()));
        assertThat(optionsJson.path("data").isArray()).isTrue();

        readJson(mockMvc.perform(put("/api/users/{id}/role", createdUserId)
                .queryParam("role", "EMPLOYE")
                .header("Authorization", bearer(adminToken)))
                .andExpect(status().isOk()));
        assertThat(userRepository.findById(createdUserId).orElseThrow().getRole()).isEqualTo(Role.EMPLOYE);

        readJson(mockMvc.perform(delete("/api/users/{id}", createdUserId)
                .header("Authorization", bearer(adminToken)))
                .andExpect(status().isOk()));

        JsonNode deletedJson = readJson(mockMvc.perform(get("/api/users/deleted")
                .header("Authorization", bearer(adminToken)))
                .andExpect(status().isOk()));
        assertThat(deletedJson.path("data").isArray()).isTrue();

        readJson(mockMvc.perform(put("/api/users/restore/{id}", createdUserId)
                .header("Authorization", bearer(adminToken)))
                .andExpect(status().isOk()));

        String managerToken = accessToken("manager.one@pms.local", "manager123");

        JsonNode myProfileJson = readJson(mockMvc.perform(get("/api/users/me")
                .header("Authorization", bearer(managerToken)))
                .andExpect(status().isOk()));
        assertThat(myProfileJson.path("data").path("email").asText()).isEqualTo("manager.one@pms.local");

        readJson(mockMvc.perform(put("/api/users/me")
                .header("Authorization", bearer(managerToken))
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {
                          "name": "Manager Prime",
                          "email": "manager.prime@pms.local"
                        }
                        """))
                .andExpect(status().isOk()));
        assertThat(userRepository.findByEmail("manager.prime@pms.local")).isPresent();

        // After email change, issue a fresh token with the new identity.
        String managerTokenAfterEmailUpdate = accessToken("manager.prime@pms.local", "manager123");

        JsonNode passwordJson = readJson(mockMvc.perform(put("/api/users/me/password")
                .header("Authorization", bearer(managerTokenAfterEmailUpdate))
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {
                          "oldPassword": "manager123",
                          "newPassword": "manager456"
                        }
                        """))
                .andExpect(status().isOk()));

        assertThat(passwordJson.path("message").asText()).contains("Password changed");

        JsonNode reloginJson = login("manager.prime@pms.local", "manager456");
        assertThat(reloginJson.path("accessToken").asText()).isNotBlank();
    }

    @Test
    void projectRoutesShouldWorkForManagerAndAdmin() throws Exception {
        persistUser("Admin", "admin@pms.local", "admin123", Role.ADMIN);
        persistUser("Manager", "manager@pms.local", "manager123", Role.MANAGER);

        String managerToken = accessToken("manager@pms.local", "manager123");
        String adminToken = accessToken("admin@pms.local", "admin123");

        readJson(mockMvc.perform(post("/api/projects")
                .header("Authorization", bearer(managerToken))
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {
                          "name": "Project Alpha",
                          "description": "Delivery planning"
                        }
                        """))
                .andExpect(status().isOk()));

        Project createdProject = projectRepository.findByName("Project Alpha").orElseThrow();
        Long projectId = createdProject.getId();
        assertThat(projectId).isPositive();

        JsonNode managerListJson = readJson(mockMvc.perform(get("/api/projects")
                .header("Authorization", bearer(managerToken)))
                .andExpect(status().isOk()));
        assertThat(managerListJson.path("data").isArray()).isTrue();

        JsonNode adminListJson = readJson(mockMvc.perform(get("/api/projects")
                .header("Authorization", bearer(adminToken)))
                .andExpect(status().isOk()));
        assertThat(adminListJson.path("data").isArray()).isTrue();

        readJson(mockMvc.perform(delete("/api/projects/{id}", projectId)
                .header("Authorization", bearer(managerToken)))
                .andExpect(status().isOk()));

        JsonNode deletedJson = readJson(mockMvc.perform(get("/api/projects/deleted")
                .header("Authorization", bearer(managerToken)))
                .andExpect(status().isOk()));
        assertThat(deletedJson.path("data").isArray()).isTrue();

        readJson(mockMvc.perform(put("/api/projects/restore/{id}", projectId)
                .header("Authorization", bearer(adminToken)))
                .andExpect(status().isOk()));
    }

    @Test
    void taskRoutesShouldWorkForManagerAndEmployee() throws Exception {
        persistUser("Manager", "manager@pms.local", "manager123", Role.MANAGER);
        User employee = persistUser("Employee", "employee@pms.local", "employee123", Role.EMPLOYE);

        String managerToken = accessToken("manager@pms.local", "manager123");

        readJson(mockMvc.perform(post("/api/projects")
                .header("Authorization", bearer(managerToken))
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {
                          "name": "Project Beta",
                          "description": "Task flow testing"
                        }
                        """))
                .andExpect(status().isOk()));

        Project createdProject = projectRepository.findByName("Project Beta").orElseThrow();
        Long projectId = createdProject.getId();

        readJson(mockMvc.perform(post("/api/tasks")
                .queryParam("projectId", String.valueOf(projectId))
                .queryParam("userId", String.valueOf(employee.getId()))
                .header("Authorization", bearer(managerToken))
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {
                          "title": "Build API tests",
                          "description": "Cover backend endpoints",
                          "status": "TODO"
                        }
                        """))
                .andExpect(status().isOk()));

        Task createdTask = taskRepository.findByTitle("Build API tests").orElseThrow();
        Long taskId = createdTask.getId();
        assertThat(taskId).isPositive();

        JsonNode managerTasksJson = readJson(mockMvc.perform(get("/api/tasks")
                .header("Authorization", bearer(managerToken)))
                .andExpect(status().isOk()));
        assertThat(managerTasksJson.path("data").isArray()).isTrue();

        JsonNode byUserJson = readJson(mockMvc.perform(get("/api/tasks/user/{userId}", employee.getId())
                .header("Authorization", bearer(managerToken)))
                .andExpect(status().isOk()));
        assertThat(byUserJson.path("data").isArray()).isTrue();

        String employeeToken = accessToken("employee@pms.local", "employee123");

        readJson(mockMvc.perform(patch("/api/tasks/{id}/status", taskId)
                .queryParam("status", "IN_PROGRESS")
                .header("Authorization", bearer(employeeToken)))
                .andExpect(status().isOk()));
        assertThat(taskRepository.findById(taskId).orElseThrow().getStatus()).isEqualTo("IN_PROGRESS");

        readJson(mockMvc.perform(delete("/api/tasks/{id}", taskId)
                .header("Authorization", bearer(managerToken)))
                .andExpect(status().isOk()));

        JsonNode deletedTasksJson = readJson(mockMvc.perform(get("/api/tasks/deleted")
                .header("Authorization", bearer(managerToken)))
                .andExpect(status().isOk()));
        assertThat(deletedTasksJson.path("data").isArray()).isTrue();

        readJson(mockMvc.perform(put("/api/tasks/restore/{id}", taskId)
                .header("Authorization", bearer(managerToken)))
                .andExpect(status().isOk()));
    }

    private User persistUser(String name, String email, String rawPassword, Role role) {
        User user = new User();
        user.setName(name);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(rawPassword));
        user.setRole(role);
        user.setCreatedAt(LocalDateTime.now());
        user.setDeletedAt(null);
        return userRepository.save(user);
    }

    private JsonNode login(String email, String password) throws Exception {
        return readJson(mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(String.format("""
                        {
                          "email": "%s",
                          "password": "%s"
                        }
                        """, email, password)))
                .andExpect(status().isOk()));
    }

    private String accessToken(String email, String password) throws Exception {
        JsonNode loginJson = login(email, password);
        String token = loginJson.path("accessToken").asText();
        assertThat(token).isNotBlank();
        return token;
    }

    private String bearer(String token) {
        return "Bearer " + token;
    }

    private JsonNode readJson(ResultActions action) throws Exception {
        MvcResult result = action.andReturn();
        return objectMapper.readTree(result.getResponse().getContentAsString());
    }
}
