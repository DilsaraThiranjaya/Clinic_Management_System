package com.mycompany.clinic_management_system.service.impl;

import com.mycompany.clinic_management_system.dto.AuthResponseDTO;
import com.mycompany.clinic_management_system.dto.LoginRequestDTO;
import com.mycompany.clinic_management_system.dto.RegisterRequestDTO;
import com.mycompany.clinic_management_system.dto.UserDTO;
import com.mycompany.clinic_management_system.exception.ResourceNotFoundException;
import com.mycompany.clinic_management_system.model.Role;
import com.mycompany.clinic_management_system.model.User;
import com.mycompany.clinic_management_system.model.Patient;
import com.mycompany.clinic_management_system.repository.PatientRepository;
import com.mycompany.clinic_management_system.repository.UserRepository;
import com.mycompany.clinic_management_system.security.JwtUtils;
import com.mycompany.clinic_management_system.service.AuthService;
import com.mycompany.clinic_management_system.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Implementation of AuthService for handling JWT-based user authentication.
 */
@Service
@Transactional
public class AuthServiceImpl implements AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;
    private final EmailService emailService;
    private final PatientRepository patientRepository;

    public AuthServiceImpl(AuthenticationManager authenticationManager,
                           UserRepository userRepository,
                           PasswordEncoder passwordEncoder,
                           JwtUtils jwtUtils,
                           EmailService emailService) {
        this(authenticationManager, userRepository, passwordEncoder, jwtUtils, emailService, null);
    }

    @Autowired
    public AuthServiceImpl(AuthenticationManager authenticationManager,
                           UserRepository userRepository,
                           PasswordEncoder passwordEncoder,
                           JwtUtils jwtUtils,
                           EmailService emailService,
                           @Autowired(required = false) PatientRepository patientRepository) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtils = jwtUtils;
        this.emailService = emailService;
        this.patientRepository = patientRepository;
    }

    @Override
    public AuthResponseDTO login(LoginRequestDTO loginRequest) {
        // Authenticate credentials against UserDetailsService
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getUsername(),
                        loginRequest.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);

        // Generate JWT token with user identity and role claim
        String jwt = jwtUtils.generateJwtToken(authentication);

        User user = userRepository.findByUsername(loginRequest.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + loginRequest.getUsername()));

        // Auto-heal: If patientId is missing for PATIENT accounts, resolve and link clinical Patient record
        if (user.getRole() == Role.PATIENT && user.getPatientId() == null && patientRepository != null) {
            resolveAndLinkPatient(user);
        }

        return new AuthResponseDTO(
                jwt,
                user.getId(),
                user.getUsername(),
                user.getRole(),
                jwtUtils.getExpirationTimeMs(),
                user.getPatientId(),
                user.getFullName()
        );
    }

    private void resolveAndLinkPatient(User user) {
        if (patientRepository == null) return;
        Patient found = null;
        String contact = user.getContactNumber();
        if (contact != null && !contact.isBlank()) {
            found = patientRepository.findByContactNumber(contact.trim()).orElse(null);
            if (found == null) {
                String norm = normalizePhone(contact);
                if (!norm.isEmpty()) {
                    for (Patient p : patientRepository.findAll()) {
                        if (normalizePhone(p.getContactNumber()).equals(norm)) {
                            found = p;
                            break;
                        }
                    }
                }
            }
        }
        if (found == null && user.getFullName() != null && !user.getFullName().isBlank()) {
            for (Patient p : patientRepository.findByNameContainingIgnoreCase(user.getFullName().trim())) {
                if (p.getName().trim().equalsIgnoreCase(user.getFullName().trim())) {
                    found = p;
                    break;
                }
            }
        }
        if (found == null && user.getUsername() != null && !user.getUsername().isBlank()) {
            for (Patient p : patientRepository.findByNameContainingIgnoreCase(user.getUsername().trim())) {
                if (p.getName().trim().equalsIgnoreCase(user.getUsername().trim())) {
                    found = p;
                    break;
                }
            }
        }
        if (found != null) {
            user.setPatientId(found.getId());
            userRepository.save(user);
        }
    }

    private String normalizePhone(String phone) {
        if (phone == null) return "";
        String digits = phone.replaceAll("[^0-9]", "");
        if (digits.startsWith("94") && digits.length() >= 11) {
            digits = digits.substring(2);
        }
        if (digits.startsWith("0") && digits.length() >= 10) {
            digits = digits.substring(1);
        }
        return digits;
    }

    @Override
    public UserDTO register(RegisterRequestDTO registerRequest) {
        Role role = registerRequest.getRole() != null ? registerRequest.getRole() : Role.STAFF;

        if (role == Role.ADMIN) {
            throw new IllegalArgumentException("Admin registration is not allowed. Only the system-seeded admin account is permitted.");
        }

        if (userRepository.existsByUsername(registerRequest.getUsername())) {
            throw new IllegalArgumentException("Username is already taken: " + registerRequest.getUsername());
        }

        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            throw new IllegalArgumentException("Email is already in use: " + registerRequest.getEmail());
        }

        User user = new User(
                registerRequest.getUsername(),
                passwordEncoder.encode(registerRequest.getPassword()),
                role,
                registerRequest.getEmail()
        );

        User savedUser = userRepository.save(user);

        // Send Login Credentials Email with role-tailored template asynchronously
        emailService.sendRegistrationCredentialsEmail(savedUser.getEmail(), savedUser.getUsername(), registerRequest.getPassword(), savedUser.getRole());

        return new UserDTO(savedUser.getId(), savedUser.getUsername(), savedUser.getRole(), savedUser.getEmail());
    }
}
