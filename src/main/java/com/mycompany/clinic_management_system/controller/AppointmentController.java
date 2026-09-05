package com.mycompany.clinic_management_system.controller;

import com.mycompany.clinic_management_system.dto.AppointmentRequestDTO;
import com.mycompany.clinic_management_system.dto.AppointmentResponseDTO;
import com.mycompany.clinic_management_system.exception.ResourceNotFoundException;
import com.mycompany.clinic_management_system.model.User;
import com.mycompany.clinic_management_system.repository.UserRepository;
import com.mycompany.clinic_management_system.service.AppointmentService;
import jakarta.validation.Valid;
import java.util.Collections;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * REST Controller exposing appointment endpoints with DTOs and JWT authorization.
 */
@RestController
@RequestMapping("/api/appointments")
@CrossOrigin(origins = "*")
public class AppointmentController {

    private final AppointmentService appointmentService;
    private final UserRepository userRepository;
    private final com.mycompany.clinic_management_system.repository.PatientRepository patientRepository;

    public AppointmentController(AppointmentService appointmentService, UserRepository userRepository) {
        this(appointmentService, userRepository, null);
    }

    @org.springframework.beans.factory.annotation.Autowired
    public AppointmentController(AppointmentService appointmentService,
                                 UserRepository userRepository,
                                 @org.springframework.beans.factory.annotation.Autowired(required = false)
                                 com.mycompany.clinic_management_system.repository.PatientRepository patientRepository) {
        this.appointmentService = appointmentService;
        this.userRepository = userRepository;
        this.patientRepository = patientRepository;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<AppointmentResponseDTO> registerAppointment(@Valid @RequestBody AppointmentRequestDTO requestDTO) {
        AppointmentResponseDTO response = appointmentService.registerAppointment(requestDTO);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<List<AppointmentResponseDTO>> getMyAppointments() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return ResponseEntity.ok(Collections.emptyList());
        }
        User user = userRepository.findByUsername(auth.getName())
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + auth.getName()));

        // Auto-heal: If patientId is missing on user, automatically match and link clinical patient record
        if (user.getPatientId() == null && patientRepository != null) {
            resolveAndLinkPatient(user);
        }

        if (user.getPatientId() == null) {
            return ResponseEntity.ok(Collections.emptyList());
        }
        List<AppointmentResponseDTO> list = appointmentService.getAppointmentsByPatientId(user.getPatientId());
        return ResponseEntity.ok(list);
    }

    @GetMapping("/{appointmentNumber}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF', 'PATIENT', 'DOCTOR')")
    public ResponseEntity<AppointmentResponseDTO> displayAppointment(@PathVariable("appointmentNumber") Long appointmentNumber) {
        AppointmentResponseDTO response = appointmentService.getAppointmentDetails(appointmentNumber);

        // If the caller is a PATIENT, ensure they are only viewing their own appointment
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_PATIENT"))) {
            User currentUser = userRepository.findByUsername(auth.getName()).orElse(null);
            if (currentUser != null) {
                if (currentUser.getPatientId() == null && patientRepository != null) {
                    resolveAndLinkPatient(currentUser);
                }
                if (currentUser.getPatientId() != null && !currentUser.getPatientId().equals(response.getPatientId())) {
                    throw new AccessDeniedException("Access denied: You are only authorized to view your own appointments.");
                }
            }
        }

        // If the caller is a DOCTOR, ensure they are only viewing appointments assigned to their schedule
        if (auth != null && auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_DOCTOR"))) {
            User currentDoc = userRepository.findByUsername(auth.getName()).orElse(null);
            if (currentDoc != null) {
                String docNorm = normalizeDoctorString(response.getDentistName());
                String userNorm = normalizeDoctorString(currentDoc.getFullName() != null && !currentDoc.getFullName().isBlank() ? currentDoc.getFullName() : currentDoc.getUsername());
                if (!docNorm.isEmpty() && !userNorm.isEmpty() && !docNorm.contains(userNorm) && !userNorm.contains(docNorm)) {
                    throw new AccessDeniedException("Access denied: You are only authorized to view clinical consultations assigned to your schedule.");
                }
            }
        }
        return ResponseEntity.ok(response);
    }

    private String normalizeDoctorString(String str) {
        if (str == null) return "";
        return str.toLowerCase()
                .replaceAll("(?i)^dr\\.?\\s*", "")
                .replaceAll("[^a-z0-9]", " ")
                .trim();
    }

    private void resolveAndLinkPatient(User user) {
        if (patientRepository == null) return;
        com.mycompany.clinic_management_system.model.Patient found = null;
        String contact = user.getContactNumber();
        if (contact != null && !contact.isBlank()) {
            found = patientRepository.findByContactNumber(contact.trim()).orElse(null);
            if (found == null) {
                String norm = normalizePhone(contact);
                if (!norm.isEmpty()) {
                    for (com.mycompany.clinic_management_system.model.Patient p : patientRepository.findAll()) {
                        if (normalizePhone(p.getContactNumber()).equals(norm)) {
                            found = p;
                            break;
                        }
                    }
                }
            }
        }
        if (found == null && user.getFullName() != null && !user.getFullName().isBlank()) {
            for (com.mycompany.clinic_management_system.model.Patient p : patientRepository.findByNameContainingIgnoreCase(user.getFullName().trim())) {
                if (p.getName().trim().equalsIgnoreCase(user.getFullName().trim())) {
                    found = p;
                    break;
                }
            }
        }
        if (found == null && user.getUsername() != null && !user.getUsername().isBlank()) {
            for (com.mycompany.clinic_management_system.model.Patient p : patientRepository.findByNameContainingIgnoreCase(user.getUsername().trim())) {
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

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF', 'DOCTOR')")
    public ResponseEntity<List<AppointmentResponseDTO>> getAllAppointments() {
        List<AppointmentResponseDTO> list = appointmentService.getAllAppointments();
        return ResponseEntity.ok(list);
    }

    @GetMapping("/patient/{patientId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF', 'PATIENT', 'DOCTOR')")
    public ResponseEntity<List<AppointmentResponseDTO>> getAppointmentsByPatient(@PathVariable("patientId") Long patientId) {
        List<AppointmentResponseDTO> list = appointmentService.getAppointmentsByPatientId(patientId);
        return ResponseEntity.ok(list);
    }

    @GetMapping("/dentist/{dentistName}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF', 'DOCTOR')")
    public ResponseEntity<List<AppointmentResponseDTO>> getAppointmentsByDentist(@PathVariable("dentistName") String dentistName) {
        List<AppointmentResponseDTO> list = appointmentService.getAppointmentsByDentistName(dentistName);
        return ResponseEntity.ok(list);
    }
}
