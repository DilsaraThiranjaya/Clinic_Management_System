package com.mycompany.clinic_management_system.service.impl;

import com.mycompany.clinic_management_system.dto.AppointmentRequestDTO;
import com.mycompany.clinic_management_system.dto.AppointmentResponseDTO;
import com.mycompany.clinic_management_system.model.Appointment;
import com.mycompany.clinic_management_system.model.Patient;
import com.mycompany.clinic_management_system.model.Role;
import com.mycompany.clinic_management_system.model.User;
import com.mycompany.clinic_management_system.repository.AppointmentRepository;
import com.mycompany.clinic_management_system.repository.PatientRepository;
import com.mycompany.clinic_management_system.repository.UserRepository;
import com.mycompany.clinic_management_system.service.AppointmentService;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.stream.Collectors;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Implementation of {@link AppointmentService} handling scheduling, booking, and retrieval.
 */
@Service
@Transactional
public class AppointmentServiceImpl implements AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final PatientRepository patientRepository;
    private final UserRepository userRepository;

    public AppointmentServiceImpl(AppointmentRepository appointmentRepository,
                                  PatientRepository patientRepository,
                                  UserRepository userRepository) {
        this.appointmentRepository = appointmentRepository;
        this.patientRepository = patientRepository;
        this.userRepository = userRepository;
    }

    @Override
    public AppointmentResponseDTO registerAppointment(AppointmentRequestDTO requestDTO) {
        if (requestDTO == null) {
            throw new IllegalArgumentException("Appointment request data must not be null");
        }

        // 1. Resolve Patient (create new or retrieve existing by patientId)
        Patient patient;
        if (requestDTO.getPatientId() != null) {
            patient = patientRepository.findById(requestDTO.getPatientId())
                    .orElseThrow(() -> new NoSuchElementException("Patient not found with ID: " + requestDTO.getPatientId()));
        } else {
            patient = new Patient();
            patient.setName(requestDTO.getPatientName());
            patient.setAddress(requestDTO.getAddress());
            patient.setContactNumber(requestDTO.getContactNumber());
            patient = patientRepository.save(patient);
        }

        // 2. Resolve User / Staff who registered the appointment
        User staff = null;
        if (requestDTO.getUserId() != null) {
            staff = userRepository.findById(requestDTO.getUserId()).orElse(null);
        }

        if (staff == null) {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.isAuthenticated() && !auth.getName().equals("anonymousUser")) {
                staff = userRepository.findByUsername(auth.getName()).orElse(null);
            }
        }

        if (staff == null) {
            // Fallback to existing first staff/admin user or create fallback user
            staff = userRepository.findByRole(Role.STAFF).stream().findFirst()
                    .orElseGet(() -> userRepository.findAll().stream().findFirst()
                            .orElseThrow(() -> new IllegalStateException("No staff or user exists to assign appointment")));
        }

        // 3. Create and persist Appointment
        Appointment appointment = new Appointment();
        appointment.setPatient(patient);
        appointment.setUser(staff);
        appointment.setDentistName(requestDTO.getDentistName());
        appointment.setTreatmentType(requestDTO.getTreatmentType());
        appointment.setAppointmentDate(requestDTO.getAppointmentDate());
        appointment.setAppointmentTime(requestDTO.getAppointmentTime());

        Appointment savedAppointment = appointmentRepository.save(appointment);

        return mapToResponseDTO(savedAppointment);
    }

    @Override
    @Transactional(readOnly = true)
    public AppointmentResponseDTO getAppointmentDetails(Long appointmentNumber) {
        if (appointmentNumber == null) {
            throw new IllegalArgumentException("Appointment number must not be null");
        }

        Appointment appointment = appointmentRepository.findById(appointmentNumber)
                .orElseThrow(() -> new NoSuchElementException("Appointment not found with number: " + appointmentNumber));

        return mapToResponseDTO(appointment);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AppointmentResponseDTO> getAllAppointments() {
        return appointmentRepository.findAll().stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<AppointmentResponseDTO> getAppointmentsByPatientId(Long patientId) {
        if (patientId == null) {
            throw new IllegalArgumentException("Patient ID must not be null");
        }
        return appointmentRepository.findByPatientId(patientId).stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    private AppointmentResponseDTO mapToResponseDTO(Appointment appointment) {
        AppointmentResponseDTO dto = new AppointmentResponseDTO();
        dto.setAppointmentNumber(appointment.getAppointmentNumber());

        if (appointment.getPatient() != null) {
            dto.setPatientId(appointment.getPatient().getId());
            dto.setPatientName(appointment.getPatient().getName());
            dto.setPatientAddress(appointment.getPatient().getAddress());
            dto.setContactNumber(appointment.getPatient().getContactNumber());
        }

        dto.setDentistName(appointment.getDentistName());
        dto.setTreatmentType(appointment.getTreatmentType());
        dto.setAppointmentDate(appointment.getAppointmentDate());
        dto.setAppointmentTime(appointment.getAppointmentTime());

        if (appointment.getUser() != null) {
            dto.setStaffId(appointment.getUser().getId());
            dto.setStaffUsername(appointment.getUser().getUsername());
        }

        return dto;
    }
}
