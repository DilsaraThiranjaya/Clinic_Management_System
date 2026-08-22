package com.mycompany.clinic_management_system.service.impl;

import com.mycompany.clinic_management_system.dto.AuthResponseDTO;
import com.mycompany.clinic_management_system.dto.LoginRequestDTO;
import com.mycompany.clinic_management_system.dto.RegisterRequestDTO;
import com.mycompany.clinic_management_system.dto.UserDTO;
import com.mycompany.clinic_management_system.model.Role;
import com.mycompany.clinic_management_system.model.User;
import com.mycompany.clinic_management_system.repository.UserRepository;
import com.mycompany.clinic_management_system.security.JwtTokenProvider;
import com.mycompany.clinic_management_system.service.AuthService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Implementation of {@link AuthService} handling JWT authentication and registration.
 */
@Service
@Transactional
public class AuthServiceImpl implements AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;

    public AuthServiceImpl(AuthenticationManager authenticationManager,
                           UserRepository userRepository,
                           PasswordEncoder passwordEncoder,
                           JwtTokenProvider tokenProvider) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
    }

    @Override
    public AuthResponseDTO login(LoginRequestDTO loginRequest) {
        if (loginRequest == null) {
            throw new IllegalArgumentException("Login request must not be null");
        }

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getUsername(),
                        loginRequest.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);

        User user = userRepository.findByUsername(loginRequest.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("User not found with username: " + loginRequest.getUsername()));

        String token = tokenProvider.generateToken(user.getUsername(), user.getRole().name());

        return new AuthResponseDTO(token, user.getId(), user.getUsername(), user.getRole(), tokenProvider.getExpirationMs());
    }

    @Override
    public UserDTO register(RegisterRequestDTO registerRequest) {
        if (registerRequest == null) {
            throw new IllegalArgumentException("Register request must not be null");
        }
        if (userRepository.existsByUsername(registerRequest.getUsername())) {
            throw new IllegalArgumentException("Username is already taken: " + registerRequest.getUsername());
        }

        Role assignedRole = registerRequest.getRole() != null ? registerRequest.getRole() : Role.PATIENT;

        User user = new User(
                registerRequest.getUsername(),
                passwordEncoder.encode(registerRequest.getPassword()),
                assignedRole
        );

        User savedUser = userRepository.save(user);

        return new UserDTO(savedUser.getId(), savedUser.getUsername(), savedUser.getRole());
    }
}
