package com.mycompany.clinic_management_system.service.impl;

import com.mycompany.clinic_management_system.dto.UserDTO;
import com.mycompany.clinic_management_system.exception.ResourceNotFoundException;
import com.mycompany.clinic_management_system.model.Role;
import com.mycompany.clinic_management_system.model.User;
import com.mycompany.clinic_management_system.repository.UserRepository;
import com.mycompany.clinic_management_system.service.EmailService;
import com.mycompany.clinic_management_system.service.UserService;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Implementation of UserService managing user accounts and authentication.
 */
@Service
@Transactional
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    public UserServiceImpl(UserRepository userRepository,
                           PasswordEncoder passwordEncoder,
                           EmailService emailService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
    }

    @Override
    public User registerUser(UserDTO userDTO) {
        Role role = userDTO.getRole() != null ? userDTO.getRole() : Role.STAFF;

        if (role == Role.ADMIN) {
            throw new IllegalArgumentException("Admin registration is not allowed. Only the system-seeded admin account is permitted.");
        }

        if (userRepository.existsByUsername(userDTO.getUsername())) {
            throw new IllegalArgumentException("Username already exists: " + userDTO.getUsername());
        }

        if (userDTO.getEmail() != null && !userDTO.getEmail().trim().isEmpty() && userRepository.existsByEmail(userDTO.getEmail())) {
            throw new IllegalArgumentException("Email is already in use: " + userDTO.getEmail());
        }

        User user = new User(
                userDTO.getUsername(),
                passwordEncoder.encode(userDTO.getPassword()),
                role,
                userDTO.getEmail()
        );

        User savedUser = userRepository.save(user);

        if (savedUser.getEmail() != null && !savedUser.getEmail().trim().isEmpty()) {
            emailService.sendRegistrationCredentialsEmail(savedUser.getEmail(), savedUser.getUsername(), userDTO.getPassword(), savedUser.getRole());
        }

        return savedUser;
    }

    @Override
    @Transactional(readOnly = true)
    public User authenticate(String username, String password) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Invalid username or password"));
        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new IllegalArgumentException("Invalid username or password");
        }
        return user;
    }

    @Override
    @Transactional(readOnly = true)
    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public List<User> getUsersByRole(Role role) {
        return userRepository.findAll().stream()
                .filter(u -> u.getRole() == role)
                .collect(Collectors.toList());
    }
}
