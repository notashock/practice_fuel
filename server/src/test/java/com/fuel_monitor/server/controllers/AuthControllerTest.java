package com.fuel_monitor.server.controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fuel_monitor.server.dtos.request.LoginRequest;
import com.fuel_monitor.server.dtos.request.RegisterRequest;
import com.fuel_monitor.server.exceptions.GlobalExceptionHandler;
import com.fuel_monitor.server.models.entities.User;
import com.fuel_monitor.server.models.enums.Role;
import com.fuel_monitor.server.repositories.UserRepository;
import com.fuel_monitor.server.security.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class AuthControllerTest {

    private MockMvc mockMvc;
    private ObjectMapper objectMapper = new ObjectMapper();

    @Mock private UserRepository userRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private JwtService jwtService;
    @Mock private AuthenticationManager authenticationManager;

    @InjectMocks
    private AuthController authController;

    private RegisterRequest validRegisterRequest;
    private LoginRequest validLoginRequest;
    private User testUser;

    @BeforeEach
    void setUp() {
        // Standalone Setup to isolate the controller
        mockMvc = MockMvcBuilders.standaloneSetup(authController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();

        validRegisterRequest = RegisterRequest.builder()
                .name("Test Driver")
                .email("driver@fleet.com")
                .password("securePassword123")
                .role(Role.DRIVER) // Assumes you have a Role.DRIVER enum
                .build();

        validLoginRequest = LoginRequest.builder()
                .email("driver@fleet.com")
                .password("securePassword123")
                .build();

        testUser = User.builder()
                .id(1L)
                .name("Test Driver")
                .email("driver@fleet.com")
                .password("encodedPassword") // Represents the hashed version
                .role(Role.DRIVER)
                .build();
    }

    @Test
    void register_Returns200_AndProvidesJwtToken() throws Exception {
        // Arrange
        Mockito.when(passwordEncoder.encode("securePassword123")).thenReturn("encodedPassword");
        Mockito.when(userRepository.save(any(User.class))).thenReturn(testUser);
        Mockito.when(jwtService.generateToken(any(User.class))).thenReturn("mock.jwt.token.123");

        // Act & Assert
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validRegisterRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("mock.jwt.token.123"))
                .andExpect(jsonPath("$.email").value("driver@fleet.com"))
                .andExpect(jsonPath("$.role").value("DRIVER"));

        // Verify that the password was actually encoded before saving
        Mockito.verify(passwordEncoder, Mockito.times(1)).encode("securePassword123");
    }

    @Test
    void login_Returns200_AndProvidesJwtToken_WhenCredentialsAreValid() throws Exception {
        // Arrange
        // We don't need to mock authenticationManager.authenticate() because Mockito
        // makes void/object-returning methods do nothing by default, which simulates a success!

        Mockito.when(userRepository.findByEmail("driver@fleet.com")).thenReturn(Optional.of(testUser));
        Mockito.when(jwtService.generateToken(testUser)).thenReturn("mock.jwt.token.456");

        // Act & Assert
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validLoginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("mock.jwt.token.456"))
                .andExpect(jsonPath("$.email").value("driver@fleet.com"));

        // Verify the AuthenticationManager was triggered
        Mockito.verify(authenticationManager, Mockito.times(1))
                .authenticate(any(UsernamePasswordAuthenticationToken.class));
    }

    @Test
    void login_Returns400_WhenUserNotFound() throws Exception { // <-- Rename test
        Mockito.when(userRepository.findByEmail("driver@fleet.com")).thenReturn(Optional.empty());

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validLoginRequest)))
                .andExpect(status().isBadRequest()) // <-- Change to isBadRequest()
                .andExpect(jsonPath("$.error").value("Bad Request"));
    }
}