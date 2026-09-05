package com.mycompany.clinic_management_system.controller;

import com.mycompany.clinic_management_system.dto.UserDTO;
import com.mycompany.clinic_management_system.model.Role;
import com.mycompany.clinic_management_system.model.User;
import com.mycompany.clinic_management_system.service.UserService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * REST Controller exposing user management and authentication endpoints with RBAC.
 */
@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/register")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<UserDTO> registerUser(@Valid @RequestBody UserDTO userDTO) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        boolean isAdmin = auth != null && auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        if (!isAdmin && userDTO.getRole() != Role.PATIENT) {
            throw new AccessDeniedException("Staff members are authorized to register Patient accounts only.");
        }
        User created = userService.registerUser(userDTO);
        UserDTO responseDTO = new UserDTO(created.getId(), created.getUsername(), created.getRole(), created.getEmail(), created.getFullName(), created.getContactNumber(), created.getAddress(), created.getPatientId());
        return new ResponseEntity<>(responseDTO, HttpStatus.CREATED);
    }

    @PostMapping("/login")
    public ResponseEntity<UserDTO> login(@RequestBody Map<String, String> credentials) {
        String username = credentials.get("username");
        String password = credentials.get("password");
        if (username == null || password == null) {
            throw new IllegalArgumentException("Username and password are required");
        }
        User user = userService.authenticate(username, password);
        UserDTO responseDTO = new UserDTO(user.getId(), user.getUsername(), user.getRole(), user.getEmail(), user.getFullName());
        return ResponseEntity.ok(responseDTO);
    }

    @GetMapping("/doctors")
    public ResponseEntity<List<UserDTO>> getDoctors() {
        List<User> doctors = userService.getUsersByRole(Role.DOCTOR);
        List<UserDTO> dtoList = doctors.stream()
                .map(d -> new UserDTO(d.getId(), d.getUsername(), d.getRole(), d.getEmail(), d.getFullName()))
                .toList();
        return ResponseEntity.ok(dtoList);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserDTO> getUserById(@PathVariable("id") Long id) {
        User user = userService.getUserById(id);
        UserDTO responseDTO = new UserDTO(user.getId(), user.getUsername(), user.getRole(), user.getEmail(), user.getFullName());
        return ResponseEntity.ok(responseDTO);
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<User>> getAllUsers(@RequestParam(value = "role", required = false) Role role) {
        List<User> list = (role != null) ? userService.getUsersByRole(role) : userService.getAllUsers();
        return ResponseEntity.ok(list);
    }
}
