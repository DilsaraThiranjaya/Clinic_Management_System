package com.mycompany.clinic_management_system.controller;

import com.mycompany.clinic_management_system.dto.AppointmentRequestDTO;
import com.mycompany.clinic_management_system.dto.AppointmentResponseDTO;
import com.mycompany.clinic_management_system.service.AppointmentService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
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

    public AppointmentController(AppointmentService appointmentService) {
        this.appointmentService = appointmentService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<AppointmentResponseDTO> registerAppointment(@Valid @RequestBody AppointmentRequestDTO requestDTO) {
        AppointmentResponseDTO response = appointmentService.registerAppointment(requestDTO);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/{appointmentNumber}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF', 'PATIENT', 'DOCTOR')")
    public ResponseEntity<AppointmentResponseDTO> displayAppointment(@PathVariable("appointmentNumber") Long appointmentNumber) {
        AppointmentResponseDTO response = appointmentService.getAppointmentDetails(appointmentNumber);
        return ResponseEntity.ok(response);
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
