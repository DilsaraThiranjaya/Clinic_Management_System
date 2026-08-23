package com.mycompany.clinic_management_system.service;

import com.mycompany.clinic_management_system.dto.UserDTO;
import com.mycompany.clinic_management_system.model.Role;
import com.mycompany.clinic_management_system.model.User;
import java.util.List;

/**
 * Service interface for User management and authentication.
 */
public interface UserService {
    User registerUser(UserDTO userDTO);
    User authenticate(String username, String password);
    User getUserById(Long id);
    List<User> getAllUsers();
    List<User> getUsersByRole(Role role);
}
