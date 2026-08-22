package com.mycompany.clinic_management_system.service;

import com.mycompany.clinic_management_system.dto.AppointmentRequestDTO;
import com.mycompany.clinic_management_system.dto.AppointmentResponseDTO;
import java.util.List;

/**
 * Service interface for Appointment management and booking operations.
 */
public interface AppointmentService {

    AppointmentResponseDTO registerAppointment(AppointmentRequestDTO requestDTO);

    AppointmentResponseDTO getAppointmentDetails(Long appointmentNumber);

    List<AppointmentResponseDTO> getAllAppointments();

    List<AppointmentResponseDTO> getAppointmentsByPatientId(Long patientId);
}
