package com.fuel_monitor.server.controllers;

import com.fuel_monitor.server.exceptions.GlobalExceptionHandler;
import com.fuel_monitor.server.models.entities.User;
import com.fuel_monitor.server.models.enums.Role;
import com.fuel_monitor.server.repositories.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.Arrays;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class) // Pure Mockito, skipping Spring context
class UserControllerTest {

    private MockMvc mockMvc;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private UserController userController;

    @BeforeEach
    void setUp() {
        // The cheat code: builds the controller completely isolated from Spring Security
        mockMvc = MockMvcBuilders.standaloneSetup(userController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    void getAllUsers_Returns200AndUserList() throws Exception {
        // Arrange
        User admin = User.builder()
                .id(1L)
                .email("admin@fleet.com") // Adjust based on your actual User fields
                .role(Role.ADMIN)
                .build();

        User driver = User.builder()
                .id(2L)
                .email("driver@fleet.com")
                .role(Role.DRIVER)
                .build();

        Mockito.when(userRepository.findAll()).thenReturn(Arrays.asList(admin, driver));

        // Act & Assert
        mockMvc.perform(get("/api/users"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.size()").value(2))
                .andExpect(jsonPath("$[0].role").value("ADMIN"))
                .andExpect(jsonPath("$[1].role").value("DRIVER"));
    }
}