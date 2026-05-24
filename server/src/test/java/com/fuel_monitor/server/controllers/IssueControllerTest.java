package com.fuel_monitor.server.controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fuel_monitor.server.dtos.request.IssueReportRequest;
import com.fuel_monitor.server.exceptions.GlobalExceptionHandler;
import com.fuel_monitor.server.models.entities.IssueReport;
import com.fuel_monitor.server.models.entities.User;
import com.fuel_monitor.server.models.entities.Vehicle;
import com.fuel_monitor.server.models.enums.IssueSeverity;
import com.fuel_monitor.server.models.enums.IssueType;
import com.fuel_monitor.server.models.enums.Role;
import com.fuel_monitor.server.repositories.IssueReportRepository;
import com.fuel_monitor.server.repositories.VehicleRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.core.MethodParameter;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.bind.support.WebDataBinderFactory;
import org.springframework.web.context.request.NativeWebRequest;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;
import org.springframework.web.method.support.ModelAndViewContainer;

import java.util.Arrays;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class IssueControllerTest {

    private MockMvc mockMvc;
    private ObjectMapper objectMapper = new ObjectMapper();

    @Mock
    private IssueReportRepository issueRepository;

    @Mock
    private VehicleRepository vehicleRepository;

    @InjectMocks
    private IssueController issueController;

    private User testUser;
    private Vehicle testVehicle;
    private IssueReportRequest validRequest;
    private IssueReport testIssue;

    @BeforeEach
    void setUp() {
        testUser = User.builder().id(1L).email("employee@fleet.com").role(Role.DRIVER).build();

        // Standalone Setup to bypass Security and inject our testUser
        mockMvc = MockMvcBuilders.standaloneSetup(issueController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .setCustomArgumentResolvers(new HandlerMethodArgumentResolver() {
                    @Override
                    public boolean supportsParameter(MethodParameter parameter) {
                        return parameter.getParameterType().isAssignableFrom(User.class);
                    }
                    @Override
                    public Object resolveArgument(MethodParameter parameter, ModelAndViewContainer mavContainer, NativeWebRequest webRequest, WebDataBinderFactory binderFactory) {
                        return testUser;
                    }
                })
                .build();

        testVehicle = Vehicle.builder().id(1L).build();

        // Assuming your enums are stored as generic Strings or specific Enums in your project.
        // Adjust "HIGH" and "ENGINE" if you used specific Enum classes.
        validRequest = IssueReportRequest.builder()
                .vehicleId(1L)
                 .issueType(IssueType.ENGINE) // Uncomment and use Enum if applicable
                 .severity(IssueSeverity.HIGH)     // Uncomment and use Enum if applicable
                .description("Engine making strange noise")
                .build();

        testIssue = IssueReport.builder()
                .id(1L)
                .vehicle(testVehicle)
                .reportedBy(testUser)
                .description("Engine making strange noise")
                .build();
    }

    @Test
    void reportIssue_Returns200_WhenValidRequest() throws Exception {
        Mockito.when(vehicleRepository.findById(1L)).thenReturn(Optional.of(testVehicle));
        Mockito.when(issueRepository.save(any(IssueReport.class))).thenAnswer(i -> i.getArguments()[0]);

        // Note: For this to pass perfectly, ensure your validRequest in setUp() has a severity attached!
        // We will assume your DTO handles it, but if it fails, make sure severity isn't null.

        mockMvc.perform(post("/api/issues")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.description").value("Engine making strange noise"));
    }

    @Test
    void reportIssue_Returns400_WhenSeverityIsNull() throws Exception {
        // Purposely omitting the severity to trigger your BusinessRuleException
        IssueReportRequest badRequest = IssueReportRequest.builder()
                .vehicleId(1L)
                .description("Flat tire")
                .build(); // No severity!

        mockMvc.perform(post("/api/issues")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(badRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Issue severity must be provided"));

        Mockito.verify(issueRepository, Mockito.never()).save(any());
    }

    @Test
    void reportIssue_Returns400_WhenVehicleNotFound() throws Exception {
        // Set severity so it passes the first check, but fails the vehicle check
        // validRequest.setSeverity(Severity.HIGH); <-- Assume this is set in your real code

        Mockito.when(vehicleRepository.findById(1L)).thenReturn(Optional.empty());

        mockMvc.perform(post("/api/issues")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Vehicle not found"));
    }

    @Test
    void getOpenIssues_ReturnsList() throws Exception {
        Mockito.when(issueRepository.findAllOpenIssuesWithDetails()).thenReturn(Arrays.asList(testIssue));

        mockMvc.perform(get("/api/issues/open"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.size()").value(1))
                .andExpect(jsonPath("$[0].description").value("Engine making strange noise"));
    }

    @Test
    void acknowledgeIssue_Returns200_WhenIssueExists() throws Exception {
        Mockito.when(issueRepository.findById(1L)).thenReturn(Optional.of(testIssue));

        mockMvc.perform(put("/api/issues/1/acknowledge"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L));
    }

    @Test
    void resolveIssue_Returns200_AndSetsResolvedDetails() throws Exception {
        Mockito.when(issueRepository.findById(1L)).thenReturn(Optional.of(testIssue));
        Mockito.when(issueRepository.save(any(IssueReport.class))).thenAnswer(i -> i.getArguments()[0]);

        mockMvc.perform(put("/api/issues/1/resolve"))
                .andExpect(status().isOk());

        // Verify that it was saved with the current testUser (mechanic) set as the resolver
        Mockito.verify(issueRepository, Mockito.times(1)).save(Mockito.argThat(issue ->
                issue.getResolvedBy() != null && issue.getResolvedBy().getId().equals(1L) && issue.getResolvedAt() != null
        ));
    }

    @Test
    void resolveIssue_Returns400_WhenNotFound() throws Exception {
        Mockito.when(issueRepository.findById(99L)).thenReturn(Optional.empty());

        mockMvc.perform(put("/api/issues/99/resolve"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Issue not found"));
    }
}