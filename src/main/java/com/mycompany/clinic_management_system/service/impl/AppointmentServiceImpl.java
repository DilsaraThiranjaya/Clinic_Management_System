package com.mycompany.clinic_management_system.service.impl;

import com.mycompany.clinic_management_system.dto.AppointmentDTO;
import com.mycompany.clinic_management_system.dto.AppointmentRequestDTO;
import com.mycompany.clinic_management_system.dto.AppointmentResponseDTO;
import com.mycompany.clinic_management_system.exception.ResourceNotFoundException;
import com.mycompany.clinic_management_system.model.Appointment;
import com.mycompany.clinic_management_system.model.Patient;
import com.mycompany.clinic_management_system.model.Role;
import com.mycompany.clinic_management_system.model.User;
import com.mycompany.clinic_management_system.repository.AppointmentRepository;
import com.mycompany.clinic_management_system.repository.PatientRepository;
import com.mycompany.clinic_management_system.repository.UserRepository;
import com.mycompany.clinic_management_system.service.AppointmentService;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Implementation of AppointmentService managing appointment booking and lookups.
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
        // Resolve patient: lookup by ID or contact number, or create new patient record
        Patient patient;
        if (requestDTO.getPatientId() != null) {
            patient = patientRepository.findById(requestDTO.getPatientId())
                    .orElseThrow(() -> new ResourceNotFoundException("Patient not found with id: " + requestDTO.getPatientId()));
        } else if (requestDTO.getContactNumber() != null && !requestDTO.getContactNumber().isBlank()) {
            patient = patientRepository.findByContactNumber(requestDTO.getContactNumber())
                    .orElseGet(() -> patientRepository.save(new Patient(
                            requestDTO.getPatientName(),
                            requestDTO.getAddress(),
                            requestDTO.getContactNumber()
                    )));
        } else {
            patient = patientRepository.save(new Patient(
                    requestDTO.getPatientName(),
                    requestDTO.getAddress(),
                    requestDTO.getContactNumber()
            ));
        }

        // Resolve staff/user who registers the appointment
        User user = resolveStaffUser(requestDTO.getUserId());

        Appointment appointment = new Appointment(
                patient,
                user,
                requestDTO.getDentistName(),
                requestDTO.getTreatmentType(),
                requestDTO.getAppointmentDate(),
                requestDTO.getAppointmentTime()
        );

        Appointment saved = appointmentRepository.save(appointment);
        return toResponseDTO(saved);
    }

    @Override
    public Appointment registerAppointment(AppointmentDTO dto) {
        Patient patient;
        if (dto.getPatientId() != null) {
            patient = patientRepository.findById(dto.getPatientId())
                    .orElseThrow(() -> new ResourceNotFoundException("Patient not found with id: " + dto.getPatientId()));
        } else {
            patient = patientRepository.save(new Patient(dto.getPatientName(), dto.getAddress(), dto.getContactNumber()));
        }

        User user = resolveStaffUser(dto.getUserId());

        Appointment appointment = new Appointment(
                patient,
                user,
                dto.getDentistName(),
                dto.getTreatmentType(),
                dto.getAppointmentDate(),
                dto.getAppointmentTime()
        );

        return appointmentRepository.save(appointment);
    }

    @Override
    public Appointment registerAppointment(Appointment appointment) {
        return appointmentRepository.save(appointment);
    }

    @Override
    @Transactional(readOnly = true)
    public Appointment getAppointment(Long appointmentNumber) {
        return appointmentRepository.findById(appointmentNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with number: " + appointmentNumber));
    }

    @Override
    @Transactional(readOnly = true)
    public AppointmentResponseDTO getAppointmentDetails(Long appointmentNumber) {
        Appointment apt = getAppointment(appointmentNumber);
        return toResponseDTO(apt);
    }

    @Override
    @Transactional(readOnly = true)
    public AppointmentDTO findAppointment(Long appointmentNumber) {
        Appointment apt = getAppointment(appointmentNumber);
        return new AppointmentDTO(
                apt.getAppointmentNumber(),
                apt.getPatient().getId(),
                apt.getUser().getId(),
                apt.getPatient().getName(),
                apt.getPatient().getAddress(),
                apt.getPatient().getContactNumber(),
                apt.getDentistName(),
                apt.getTreatmentType(),
                apt.getAppointmentDate(),
                apt.getAppointmentTime()
        );
    }

    @Override
    @Transactional(readOnly = true)
    public List<AppointmentResponseDTO> getAllAppointments() {
        return appointmentRepository.findAll().stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<AppointmentResponseDTO> getAppointmentsByPatientId(Long patientId) {
        return appointmentRepository.findByPatientId(patientId).stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<AppointmentResponseDTO> getAppointmentsByDentistName(String dentistName) {
        return appointmentRepository.findByDentistName(dentistName).stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

    private User resolveStaffUser(Long explicitUserId) {
        if (explicitUserId != null) {
            return userRepository.findById(explicitUserId)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + explicitUserId));
        }

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !auth.getName().equals("anonymousUser")) {
            User authUser = userRepository.findByUsername(auth.getName()).orElse(null);
            if (authUser != null) {
                return authUser;
            }
        }

        return userRepository.findAll().stream()
                .filter(u -> u.getRole() == Role.STAFF || u.getRole() == Role.ADMIN)
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("No authorized staff account available to record appointment"));
    }

    private AppointmentResponseDTO toResponseDTO(Appointment apt) {
        return new AppointmentResponseDTO(
                apt.getAppointmentNumber(),
                apt.getPatient().getId(),
                apt.getPatient().getName(),
                apt.getPatient().getAddress(),
                apt.getPatient().getContactNumber(),
                apt.getDentistName(),
                apt.getTreatmentType(),
                apt.getAppointmentDate(),
                apt.getAppointmentTime(),
                apt.getUser().getId(),
                apt.getUser().getUsername()
        );
    }
}
