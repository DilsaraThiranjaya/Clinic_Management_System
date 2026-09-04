package com.mycompany.clinic_management_system.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mycompany.clinic_management_system.dto.AuthResponseDTO;
import com.mycompany.clinic_management_system.dto.LoginRequestDTO;
import com.mycompany.clinic_management_system.dto.RegisterRequestDTO;
import com.mycompany.clinic_management_system.dto.UserDTO;
import com.mycompany.clinic_management_system.exception.GlobalExceptionHandler;
import com.mycompany.clinic_management_system.model.Role;
import com.mycompany.clinic_management_system.security.JwtAuthenticationEntryPoint;
import com.mycompany.clinic_management_system.security.JwtUtils;
import com.mycompany.clinic_management_system.service.AuthService;
import com.mycompany.clinic_management_system.service.impl.CustomUserDetailsService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.test.web.servlet.MockMvc;

/**
 * Controller tests for Authentication endpoints.
 */
@WebMvcTest(controllers = AuthController.class)
@AutoConfigureMockMvc(addFilters = false)
@Import(GlobalExceptionHandler.class)
public class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private AuthService authService;

    @MockBean
    private JwtUtils jwtUtils;

    @MockBean
    private JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;

    @MockBean
    private CustomUserDetailsService customUserDetailsService;

    @Test
    @DisplayName("TC-CTRL-AUTH-01: POST /api/auth/login with valid credentials returns 200 and JWT")
    void testLogin_ValidCredentials_ReturnsToken() throws Exception {
        LoginRequestDTO request = new LoginRequestDTO("staff", "staff123");
        AuthResponseDTO response = new AuthResponseDTO("mock-jwt-token", 1L, "staff", Role.STAFF, 86400000L);

        when(authService.login(any(LoginRequestDTO.class))).thenReturn(response);

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("mock-jwt-token"))
                .andExpect(jsonPath("$.username").value("staff"))
                .andExpect(jsonPath("$.role").value("STAFF"));
    }

    @Test
    @DisplayName("TC-CTRL-AUTH-02: POST /api/auth/login with invalid credentials returns 401 Unauthorized")
    void testLogin_InvalidCredentials_ReturnsUnauthorized() throws Exception {
        LoginRequestDTO request = new LoginRequestDTO("staff", "wrong_password");

        when(authService.login(any(LoginRequestDTO.class)))
                .thenThrow(new BadCredentialsException("Invalid username or password"));

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("TC-CTRL-AUTH-03: POST /api/auth/login with empty username returns 400 Bad Request")
    void testLogin_BlankUsername_ReturnsBadRequest() throws Exception {
        LoginRequestDTO request = new LoginRequestDTO("", "staff123");

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("TC-CTRL-AUTH-04: POST /api/auth/register with valid payload returns 201 Created")
    void testRegister_ValidPayload_ReturnsCreated() throws Exception {
        RegisterRequestDTO request = new RegisterRequestDTO("new_receptionist", "securePass123", Role.STAFF, "receptionist@example.com");
        UserDTO response = new UserDTO(5L, "new_receptionist", Role.STAFF, "receptionist@example.com");

        when(authService.register(any(RegisterRequestDTO.class))).thenReturn(response);

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.username").value("new_receptionist"))
                .andExpect(jsonPath("$.role").value("STAFF"))
                .andExpect(jsonPath("$.email").value("receptionist@example.com"));
    }

    @Test
    @DisplayName("TC-CTRL-AUTH-05: POST /api/auth/register with duplicate username returns 400 Bad Request")
    void testRegister_DuplicateUsername_ReturnsBadRequest() throws Exception {
        RegisterRequestDTO request = new RegisterRequestDTO("staff", "securePass123", Role.STAFF, "staff@example.com");

        when(authService.register(any(RegisterRequestDTO.class)))
                .thenThrow(new IllegalArgumentException("Username is already taken: staff"));

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Username is already taken: staff"));
    }

    @Test
    @DisplayName("TC-CTRL-AUTH-06: POST /api/auth/register with short password returns 400 Bad Request")
    void testRegister_ShortPassword_ReturnsBadRequest() throws Exception {
        RegisterRequestDTO request = new RegisterRequestDTO("staff_user", "123", Role.STAFF, "staff@example.com");

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("TC-CTRL-AUTH-07: POST /api/auth/register with ADMIN role returns 400 Bad Request")
    void testRegister_AdminRole_ReturnsBadRequest() throws Exception {
        RegisterRequestDTO request = new RegisterRequestDTO("new_admin", "adminPass123", Role.ADMIN, "newadmin@example.com");

        when(authService.register(any(RegisterRequestDTO.class)))
                .thenThrow(new IllegalArgumentException("Admin registration is not allowed. Only the system-seeded admin account is permitted."));

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Admin registration is not allowed. Only the system-seeded admin account is permitted."));
    }

    @Test
    @DisplayName("TC-CTRL-AUTH-08: POST /api/auth/register with PATIENT role returns 201 Created")
    void testRegister_PatientRole_ReturnsCreated() throws Exception {
        RegisterRequestDTO request = new RegisterRequestDTO("patient_kamal", "patientPass123", Role.PATIENT, "kamal@example.com");
        UserDTO response = new UserDTO(6L, "patient_kamal", Role.PATIENT, "kamal@example.com");

        when(authService.register(any(RegisterRequestDTO.class))).thenReturn(response);

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.username").value("patient_kamal"))
                .andExpect(jsonPath("$.role").value("PATIENT"))
                .andExpect(jsonPath("$.email").value("kamal@example.com"));
    }

    @Test
    @DisplayName("TC-CTRL-AUTH-09: POST /api/auth/login for DOCTOR role returns 200 and Doctor AuthResponse")
    void testLogin_DoctorRole_ReturnsToken() throws Exception {
        LoginRequestDTO request = new LoginRequestDTO("doctor", "doctor123");
        AuthResponseDTO response = new AuthResponseDTO("mock-doctor-jwt", 4L, "doctor", Role.DOCTOR, 86400000L);

        when(authService.login(any(LoginRequestDTO.class))).thenReturn(response);

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("mock-doctor-jwt"))
                .andExpect(jsonPath("$.username").value("doctor"))
                .andExpect(jsonPath("$.role").value("DOCTOR"));
    }

    @Test
    @DisplayName("TC-CTRL-AUTH-10: POST /api/auth/register with DOCTOR role returns 201 Created")
    void testRegister_DoctorRole_ReturnsCreated() throws Exception {
        RegisterRequestDTO request = new RegisterRequestDTO("dr_fernando", "docPass123", Role.DOCTOR, "drfernando@sunrisedental.lk");
        UserDTO response = new UserDTO(7L, "dr_fernando", Role.DOCTOR, "drfernando@sunrisedental.lk");

        when(authService.register(any(RegisterRequestDTO.class))).thenReturn(response);

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.username").value("dr_fernando"))
                .andExpect(jsonPath("$.role").value("DOCTOR"))
                .andExpect(jsonPath("$.email").value("drfernando@sunrisedental.lk"));
    }
}
