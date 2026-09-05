package com.mycompany.clinic_management_system.service.impl;

import com.mycompany.clinic_management_system.dto.UserDTO;
import com.mycompany.clinic_management_system.exception.ResourceNotFoundException;
import com.mycompany.clinic_management_system.model.Patient;
import com.mycompany.clinic_management_system.model.Role;
import com.mycompany.clinic_management_system.model.User;
import com.mycompany.clinic_management_system.repository.PatientRepository;
import com.mycompany.clinic_management_system.repository.UserRepository;
import com.mycompany.clinic_management_system.service.EmailService;
import com.mycompany.clinic_management_system.service.UserService;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Autowired;
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
    private final PatientRepository patientRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    @Autowired
    public UserServiceImpl(UserRepository userRepository,
                           PatientRepository patientRepository,
                           PasswordEncoder passwordEncoder,
                           EmailService emailService) {
        this.userRepository = userRepository;
        this.patientRepository = patientRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
    }

    public UserServiceImpl(UserRepository userRepository,
                           PasswordEncoder passwordEncoder,
                           EmailService emailService) {
        this(userRepository, null, passwordEncoder, emailService);
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

        String fullName = (userDTO.getFullName() != null && !userDTO.getFullName().trim().isEmpty())
                ? userDTO.getFullName().trim()
                : (role == Role.DOCTOR ? "Dr. " + userDTO.getUsername() : userDTO.getUsername());

        User user = new User(
                userDTO.getUsername(),
                passwordEncoder.encode(userDTO.getPassword()),
                role,
                userDTO.getEmail(),
                fullName,
                userDTO.getContactNumber(),
                userDTO.getAddress()
        );

        User savedUser = userRepository.save(user);

        // If registered user is a PATIENT, automatically create or link clinical Patient record
        if (role == Role.PATIENT && patientRepository != null) {
            String contactNum = (userDTO.getContactNumber() != null && !userDTO.getContactNumber().trim().isEmpty())
                    ? userDTO.getContactNumber().trim()
                    : "0770000000";
            String patientAddress = (userDTO.getAddress() != null && !userDTO.getAddress().trim().isEmpty())
                    ? userDTO.getAddress().trim()
                    : "Sunrise Dental Clinic, Colombo";

            Patient p = findOrCreatePatient(fullName, patientAddress, contactNum);
            savedUser.setPatientId(p.getId());
            savedUser = userRepository.save(savedUser);
        }

        if (savedUser.getEmail() != null && !savedUser.getEmail().trim().isEmpty()) {
            emailService.sendRegistrationCredentialsEmail(savedUser.getEmail(), savedUser.getUsername(), userDTO.getPassword(), savedUser.getRole());
        }

        return savedUser;
    }

    private Patient findOrCreatePatient(String fullName, String patientAddress, String contactNum) {
        if (contactNum != null && !contactNum.isBlank()) {
            java.util.Optional<Patient> exact = patientRepository.findByContactNumber(contactNum.trim());
            if (exact.isPresent()) {
                return exact.get();
            }
            String norm = normalizePhone(contactNum);
            if (!norm.isEmpty()) {
                for (Patient p : patientRepository.findAll()) {
                    if (normalizePhone(p.getContactNumber()).equals(norm)) {
                        return p;
                    }
                }
            }
        }
        if (fullName != null && !fullName.isBlank()) {
            List<Patient> byName = patientRepository.findByNameContainingIgnoreCase(fullName.trim());
            for (Patient p : byName) {
                if (p.getName().trim().equalsIgnoreCase(fullName.trim())) {
                    return p;
                }
            }
        }
        return patientRepository.save(new Patient(fullName, patientAddress, contactNum));
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
