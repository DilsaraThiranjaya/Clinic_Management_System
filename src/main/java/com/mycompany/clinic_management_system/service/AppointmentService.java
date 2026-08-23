package com.mycompany.clinic_management_system.service;

import com.mycompany.clinic_management_system.dto.AppointmentDTO;
import com.mycompany.clinic_management_system.dto.AppointmentRequestDTO;
import com.mycompany.clinic_management_system.dto.AppointmentResponseDTO;
import com.mycompany.clinic_management_system.model.Appointment;
import java.util.List;

/**
 * Service interface defining appointment registration and retrieval operations.
 */
public interface AppointmentService {
    AppointmentResponseDTO registerAppointment(AppointmentRequestDTO requestDTO);
    Appointment registerAppointment(AppointmentDTO dto);
    Appointment registerAppointment(Appointment appointment);
    Appointment getAppointment(Long appointmentNumber);
    AppointmentResponseDTO getAppointmentDetails(Long appointmentNumber);
    AppointmentDTO findAppointment(Long appointmentNumber);
    List<AppointmentResponseDTO> getAllAppointments();
    List<AppointmentResponseDTO> getAppointmentsByPatientId(Long patientId);
}
