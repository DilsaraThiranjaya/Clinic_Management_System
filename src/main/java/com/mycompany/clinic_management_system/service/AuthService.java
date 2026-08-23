package com.mycompany.clinic_management_system.service;

import com.mycompany.clinic_management_system.dto.AuthResponseDTO;
import com.mycompany.clinic_management_system.dto.LoginRequestDTO;
import com.mycompany.clinic_management_system.dto.RegisterRequestDTO;
import com.mycompany.clinic_management_system.dto.UserDTO;

/**
 * Service interface for JWT authentication and user registration.
 */
public interface AuthService {
    AuthResponseDTO login(LoginRequestDTO loginRequest);
    UserDTO register(RegisterRequestDTO registerRequest);
}
