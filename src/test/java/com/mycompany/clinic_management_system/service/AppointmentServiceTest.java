package com.mycompany.clinic_management_system.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

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
import com.mycompany.clinic_management_system.service.impl.AppointmentServiceImpl;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

/**
 * TDD Unit Tests for Appointment Registration and Search Operations.
 */
@ExtendWith(MockitoExtension.class)
public class AppointmentServiceTest {

    @Mock
    private AppointmentRepository appointmentRepository;

    @Mock
    private PatientRepository patientRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private AppointmentServiceImpl appointmentService;

    private Patient mockPatient;
    private User mockStaff;
    private Appointment mockAppointment;

    @BeforeEach
    void setUp() {
        mockPatient = new Patient(1L, "Sunil De Silva", "No. 78 Duplication Road, Colombo 04", "0719876543");
        mockStaff = new User(1L, "staff", "encoded_pwd", Role.STAFF);
        mockAppointment = new Appointment(
                101L,
                mockPatient,
                mockStaff,
                "Dr. Samantha Fernando",
                "Teeth Whitening",
                LocalDate.of(2026, 8, 25),
                LocalTime.of(14, 30)
        );
    }

    @Test
    @DisplayName("TC-APPT-01: Register New Appointment with New Patient creates patient and appointment")
    void testRegisterAppointment_WithNewPatient_Success() {
        AppointmentRequestDTO request = new AppointmentRequestDTO(
                "Sunil De Silva",
                "No. 78 Duplication Road, Colombo 04",
                "0719876543",
                "Dr. Samantha Fernando",
                "Teeth Whitening",
                LocalDate.of(2026, 8, 25),
                LocalTime.of(14, 30)
        );

        when(patientRepository.findByContactNumber("0719876543")).thenReturn(Optional.empty());
        when(patientRepository.save(any(Patient.class))).thenReturn(mockPatient);
        when(userRepository.findAll()).thenReturn(List.of(mockStaff));
        when(appointmentRepository.save(any(Appointment.class))).thenReturn(mockAppointment);

        AppointmentResponseDTO response = appointmentService.registerAppointment(request);

        assertNotNull(response);
        assertEquals(101L, response.getAppointmentNumber());
        assertEquals("Sunil De Silva", response.getPatientName());
        assertEquals("0719876543", response.getContactNumber());
        assertEquals("Dr. Samantha Fernando", response.getDentistName());
        assertEquals("Teeth Whitening", response.getTreatmentType());
        verify(patientRepository).save(any(Patient.class));
        verify(appointmentRepository).save(any(Appointment.class));
    }

    @Test
    @DisplayName("TC-APPT-02: Register Appointment with Existing Contact Number reuses existing Patient record")
    void testRegisterAppointment_WithExistingContactNumber_ReusesPatient() {
        AppointmentRequestDTO request = new AppointmentRequestDTO(
                "Sunil De Silva",
                "No. 78 Duplication Road, Colombo 04",
                "0719876543",
                "Dr. Samantha Fernando",
                "Teeth Whitening",
                LocalDate.of(2026, 8, 25),
                LocalTime.of(14, 30)
        );

        when(patientRepository.findByContactNumber("0719876543")).thenReturn(Optional.of(mockPatient));
        when(userRepository.findAll()).thenReturn(List.of(mockStaff));
        when(appointmentRepository.save(any(Appointment.class))).thenReturn(mockAppointment);

        AppointmentResponseDTO response = appointmentService.registerAppointment(request);

        assertNotNull(response);
        assertEquals(1L, response.getPatientId());
        assertEquals(101L, response.getAppointmentNumber());
    }

    @Test
    @DisplayName("TC-APPT-03: Register Appointment with Non-Existent Patient ID throws ResourceNotFoundException")
    void testRegisterAppointment_WithNonExistentPatientId_ThrowsException() {
        AppointmentRequestDTO request = new AppointmentRequestDTO();
        request.setPatientId(999L);
        request.setDentistName("Dr. Samantha Fernando");
        request.setTreatmentType("Teeth Cleaning");
        request.setAppointmentDate(LocalDate.now());
        request.setAppointmentTime(LocalTime.of(10, 0));

        when(patientRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> appointmentService.registerAppointment(request));
    }

    @Test
    @DisplayName("TC-APPT-04: Search Appointment by valid number returns complete details")
    void testFindAppointmentByNumber_Success() {
        when(appointmentRepository.findById(101L)).thenReturn(Optional.of(mockAppointment));

        AppointmentResponseDTO response = appointmentService.getAppointmentDetails(101L);

        assertNotNull(response);
        assertEquals(101L, response.getAppointmentNumber());
        assertEquals("Sunil De Silva", response.getPatientName());
        assertEquals("Dr. Samantha Fernando", response.getDentistName());
        assertEquals("Teeth Whitening", response.getTreatmentType());
    }

    @Test
    @DisplayName("TC-APPT-05: Search Appointment with Non-Existent number throws ResourceNotFoundException")
    void testFindAppointmentByNumber_NotFound_ThrowsException() {
        when(appointmentRepository.findById(999L)).thenReturn(Optional.empty());

        ResourceNotFoundException ex = assertThrows(ResourceNotFoundException.class,
                () -> appointmentService.getAppointmentDetails(999L));
        assertEquals("Appointment not found with number: 999", ex.getMessage());
    }

    @Test
    @DisplayName("TC-APPT-06: Get All Appointments returns list of all scheduled bookings")
    void testGetAllAppointments_ReturnsList() {
        Appointment appt2 = new Appointment(
                102L,
                mockPatient,
                mockStaff,
                "Dr. Kasun Jayawardena",
                "Dental Filling",
                LocalDate.of(2026, 8, 26),
                LocalTime.of(11, 0)
        );

        when(appointmentRepository.findAll()).thenReturn(Arrays.asList(mockAppointment, appt2));

        List<AppointmentResponseDTO> result = appointmentService.getAllAppointments();

        assertNotNull(result);
        assertEquals(2, result.size());
        assertEquals(101L, result.get(0).getAppointmentNumber());
        assertEquals(102L, result.get(1).getAppointmentNumber());
    }

    @Test
    @DisplayName("TC-APPT-07: Get Appointments by Patient ID filters records correctly")
    void testGetAppointmentsByPatientId_ReturnsFilteredList() {
        when(appointmentRepository.findByPatientId(1L)).thenReturn(List.of(mockAppointment));

        List<AppointmentResponseDTO> result = appointmentService.getAppointmentsByPatientId(1L);

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("Sunil De Silva", result.get(0).getPatientName());
    }
}
