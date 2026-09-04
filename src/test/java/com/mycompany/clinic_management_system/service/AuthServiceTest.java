package com.mycompany.clinic_management_system.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.mycompany.clinic_management_system.dto.AuthResponseDTO;
import com.mycompany.clinic_management_system.dto.LoginRequestDTO;
import com.mycompany.clinic_management_system.dto.RegisterRequestDTO;
import com.mycompany.clinic_management_system.dto.UserDTO;
import com.mycompany.clinic_management_system.exception.ResourceNotFoundException;
import com.mycompany.clinic_management_system.model.Role;
import com.mycompany.clinic_management_system.model.User;
import com.mycompany.clinic_management_system.repository.UserRepository;
import com.mycompany.clinic_management_system.security.JwtUtils;
import com.mycompany.clinic_management_system.service.impl.AuthServiceImpl;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;

/**
 * TDD Unit Tests for Authentication & User Registration Service.
 */
@ExtendWith(MockitoExtension.class)
public class AuthServiceTest {

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtUtils jwtUtils;

    @Mock
    private EmailService emailService;

    @InjectMocks
    private AuthServiceImpl authService;

    private User mockStaffUser;
    private User mockAdminUser;

    @BeforeEach
    void setUp() {
        mockStaffUser = new User(1L, "staff", "encoded_staff123", Role.STAFF);
        mockAdminUser = new User(2L, "admin", "encoded_admin123", Role.ADMIN);
    }

    @Test
    @DisplayName("TC-AUTH-01: Successful Staff Login returns valid JWT and User Details")
    void testSuccessfulStaffLogin() {
        LoginRequestDTO request = new LoginRequestDTO("staff", "staff123");
        Authentication authMock = mock(Authentication.class);

        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(authMock);
        when(jwtUtils.generateJwtToken(authMock)).thenReturn("mocked-jwt-token");
        when(jwtUtils.getExpirationTimeMs()).thenReturn(86400000L);
        when(userRepository.findByUsername("staff")).thenReturn(Optional.of(mockStaffUser));

        AuthResponseDTO response = authService.login(request);

        assertNotNull(response);
        assertEquals("mocked-jwt-token", response.getToken());
        assertEquals("staff", response.getUsername());
        assertEquals(Role.STAFF, response.getRole());
        assertEquals("Bearer", response.getType());
    }

    @Test
    @DisplayName("TC-AUTH-02: Successful User Registration encodes password and saves user")
    void testSuccessfulUserRegistration() {
        RegisterRequestDTO request = new RegisterRequestDTO("receptionist1", "pass12345", Role.STAFF, "receptionist1@example.com");
        User savedUser = new User(3L, "receptionist1", "encoded_pass", Role.STAFF, "receptionist1@example.com");

        when(userRepository.existsByUsername("receptionist1")).thenReturn(false);
        when(passwordEncoder.encode("pass12345")).thenReturn("encoded_pass");
        when(userRepository.save(any(User.class))).thenReturn(savedUser);

        UserDTO response = authService.register(request);

        assertNotNull(response);
        assertEquals(3L, response.getId());
        assertEquals("receptionist1", response.getUsername());
        assertEquals(Role.STAFF, response.getRole());
        assertEquals("receptionist1@example.com", response.getEmail());
        verify(userRepository).save(any(User.class));
        verify(emailService).sendRegistrationCredentialsEmail("receptionist1@example.com", "receptionist1", "pass12345", Role.STAFF);
    }

    @Test
    @DisplayName("TC-AUTH-03: Login with Invalid Password throws BadCredentialsException")
    void testLoginWithInvalidPassword_ThrowsException() {
        LoginRequestDTO request = new LoginRequestDTO("staff", "wrongPassword");

        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenThrow(new BadCredentialsException("Bad credentials"));

        assertThrows(BadCredentialsException.class, () -> authService.login(request));
    }

    @Test
    @DisplayName("TC-AUTH-04: Login with Non-Existent User in DB throws ResourceNotFoundException")
    void testLoginWithNonExistentUser_ThrowsException() {
        LoginRequestDTO request = new LoginRequestDTO("unknown_user", "password123");
        Authentication authMock = mock(Authentication.class);

        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(authMock);
        when(jwtUtils.generateJwtToken(authMock)).thenReturn("mocked-jwt-token");
        when(userRepository.findByUsername("unknown_user")).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> authService.login(request));
    }

    @Test
    @DisplayName("TC-AUTH-05: Registration with Duplicate Username throws IllegalArgumentException")
    void testRegisterWithDuplicateUsername_ThrowsException() {
        RegisterRequestDTO request = new RegisterRequestDTO("staff", "pass123", Role.STAFF, "staff@example.com");

        when(userRepository.existsByUsername("staff")).thenReturn(true);

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> authService.register(request));
        assertEquals("Username is already taken: staff", ex.getMessage());
    }

    @Test
    @DisplayName("TC-AUTH-06: Registration with Null Role defaults safely to STAFF role")
    void testRegisterWithNullRole_DefaultsToStaffRole() {
        RegisterRequestDTO request = new RegisterRequestDTO("new_assistant", "pass12345", null, "assistant@example.com");
        User savedUser = new User(4L, "new_assistant", "encoded_pass", Role.STAFF, "assistant@example.com");

        when(userRepository.existsByUsername("new_assistant")).thenReturn(false);
        when(passwordEncoder.encode("pass12345")).thenReturn("encoded_pass");
        when(userRepository.save(any(User.class))).thenReturn(savedUser);

        UserDTO response = authService.register(request);

        assertNotNull(response);
        assertEquals(Role.STAFF, response.getRole());
        verify(emailService).sendRegistrationCredentialsEmail("assistant@example.com", "new_assistant", "pass12345", Role.STAFF);
    }

    @Test
    @DisplayName("TC-AUTH-07: Admin Login validates ADMIN role in response")
    void testAdminLogin_ReturnsAdminRole() {
        LoginRequestDTO request = new LoginRequestDTO("admin", "admin123");
        Authentication authMock = mock(Authentication.class);

        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(authMock);
        when(jwtUtils.generateJwtToken(authMock)).thenReturn("admin-jwt-token");
        when(userRepository.findByUsername("admin")).thenReturn(Optional.of(mockAdminUser));

        AuthResponseDTO response = authService.login(request);

        assertNotNull(response);
        assertEquals(Role.ADMIN, response.getRole());
    }

    @Test
    @DisplayName("TC-AUTH-08: Registration with ADMIN role throws IllegalArgumentException")
    void testRegisterWithAdminRole_ThrowsException() {
        RegisterRequestDTO request = new RegisterRequestDTO("new_admin", "admin123", Role.ADMIN, "admin@example.com");

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> authService.register(request));
        assertEquals("Admin registration is not allowed. Only the system-seeded admin account is permitted.", ex.getMessage());
    }

    @Test
    @DisplayName("TC-AUTH-09: Successful Patient Registration dispatches credentials email")
    void testSuccessfulPatientRegistration() {
        RegisterRequestDTO request = new RegisterRequestDTO("patient_kamal", "pass12345", Role.PATIENT, "kamal@example.com");
        User savedUser = new User(5L, "patient_kamal", "encoded_pass", Role.PATIENT, "kamal@example.com");

        when(userRepository.existsByUsername("patient_kamal")).thenReturn(false);
        when(passwordEncoder.encode("pass12345")).thenReturn("encoded_pass");
        when(userRepository.save(any(User.class))).thenReturn(savedUser);

        UserDTO response = authService.register(request);

        assertNotNull(response);
        assertEquals(5L, response.getId());
        assertEquals("patient_kamal", response.getUsername());
        assertEquals(Role.PATIENT, response.getRole());
        assertEquals("kamal@example.com", response.getEmail());
        verify(emailService).sendRegistrationCredentialsEmail("kamal@example.com", "patient_kamal", "pass12345", Role.PATIENT);
    }
}
