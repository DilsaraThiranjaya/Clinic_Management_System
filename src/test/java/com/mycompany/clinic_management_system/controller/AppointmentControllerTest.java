package com.mycompany.clinic_management_system.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mycompany.clinic_management_system.dto.AppointmentRequestDTO;
import com.mycompany.clinic_management_system.dto.AppointmentResponseDTO;
import com.mycompany.clinic_management_system.exception.GlobalExceptionHandler;
import com.mycompany.clinic_management_system.exception.ResourceNotFoundException;
import com.mycompany.clinic_management_system.security.JwtAuthenticationEntryPoint;
import com.mycompany.clinic_management_system.security.JwtUtils;
import com.mycompany.clinic_management_system.service.AppointmentService;
import com.mycompany.clinic_management_system.service.impl.CustomUserDetailsService;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

/**
 * Controller tests for Appointment endpoints.
 */
@WebMvcTest(controllers = AppointmentController.class)
@AutoConfigureMockMvc(addFilters = false)
@Import(GlobalExceptionHandler.class)
public class AppointmentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private AppointmentService appointmentService;

    @MockBean
    private JwtUtils jwtUtils;

    @MockBean
    private JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;

    @MockBean
    private CustomUserDetailsService customUserDetailsService;

    @Test
    @DisplayName("TC-CTRL-APPT-01: POST /api/appointments with valid body returns 201 Created")
    void testRegisterAppointment_ValidRequest_ReturnsCreated() throws Exception {
        AppointmentRequestDTO request = new AppointmentRequestDTO(
                "Sunil De Silva",
                "No. 78 Duplication Road, Colombo 04",
                "0719876543",
                "Dr. Samantha Fernando",
                "Teeth Cleaning",
                LocalDate.of(2026, 8, 25),
                LocalTime.of(10, 0)
        );

        AppointmentResponseDTO response = new AppointmentResponseDTO(
                1L, 1L, "Sunil De Silva", "No. 78 Duplication Road, Colombo 04",
                "0719876543", "Dr. Samantha Fernando", "Teeth Cleaning",
                LocalDate.of(2026, 8, 25), LocalTime.of(10, 0), 1L, "staff"
        );

        when(appointmentService.registerAppointment(any(AppointmentRequestDTO.class))).thenReturn(response);

        mockMvc.perform(post("/api/appointments")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.appointmentNumber").value(1))
                .andExpect(jsonPath("$.patientName").value("Sunil De Silva"))
                .andExpect(jsonPath("$.treatmentType").value("Teeth Cleaning"));
    }

    @Test
    @DisplayName("TC-CTRL-APPT-02: POST /api/appointments with invalid phone number returns 400 Bad Request")
    void testRegisterAppointment_InvalidPhone_ReturnsBadRequest() throws Exception {
        AppointmentRequestDTO request = new AppointmentRequestDTO(
                "Sunil De Silva",
                "No. 78 Duplication Road, Colombo 04",
                "invalid",
                "Dr. Samantha Fernando",
                "Teeth Cleaning",
                LocalDate.of(2026, 8, 25),
                LocalTime.of(10, 0)
        );

        mockMvc.perform(post("/api/appointments")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("TC-CTRL-APPT-03: GET /api/appointments/{id} with valid id returns 200 OK")
    void testGetAppointmentDetails_ValidId_ReturnsOk() throws Exception {
        AppointmentResponseDTO response = new AppointmentResponseDTO(
                101L, 1L, "Sunil De Silva", "No. 78 Duplication Road, Colombo 04",
                "0719876543", "Dr. Samantha Fernando", "Teeth Cleaning",
                LocalDate.of(2026, 8, 25), LocalTime.of(10, 0), 1L, "staff"
        );

        when(appointmentService.getAppointmentDetails(101L)).thenReturn(response);

        mockMvc.perform(get("/api/appointments/101"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.appointmentNumber").value(101))
                .andExpect(jsonPath("$.patientName").value("Sunil De Silva"));
    }

    @Test
    @DisplayName("TC-CTRL-APPT-04: GET /api/appointments/{id} with non-existent id returns 404 Not Found")
    void testGetAppointmentDetails_NotFound_ReturnsNotFound() throws Exception {
        when(appointmentService.getAppointmentDetails(999L))
                .thenThrow(new ResourceNotFoundException("Appointment not found with number: 999"));

        mockMvc.perform(get("/api/appointments/999"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Appointment not found with number: 999"));
    }

    @Test
    @DisplayName("TC-CTRL-APPT-05: GET /api/appointments returns list of scheduled appointments")
    void testGetAllAppointments_ReturnsList() throws Exception {
        AppointmentResponseDTO response = new AppointmentResponseDTO(
                101L, 1L, "Sunil De Silva", "No. 78 Duplication Road, Colombo 04",
                "0719876543", "Dr. Samantha Fernando", "Teeth Cleaning",
                LocalDate.of(2026, 8, 25), LocalTime.of(10, 0), 1L, "staff"
        );

        when(appointmentService.getAllAppointments()).thenReturn(List.of(response));

        mockMvc.perform(get("/api/appointments"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));
    }

    @Test
    @DisplayName("TC-CTRL-APPT-06: GET /api/appointments/patient/{patientId} returns patient appointments")
    void testGetAppointmentsByPatient_ReturnsList() throws Exception {
        AppointmentResponseDTO response = new AppointmentResponseDTO(
                101L, 1L, "Sunil De Silva", "No. 78 Duplication Road, Colombo 04",
                "0719876543", "Dr. Samantha Fernando", "Teeth Cleaning",
                LocalDate.of(2026, 8, 25), LocalTime.of(10, 0), 1L, "staff"
        );

        when(appointmentService.getAppointmentsByPatientId(1L)).thenReturn(List.of(response));

        mockMvc.perform(get("/api/appointments/patient/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));
    }

    @Test
    @DisplayName("TC-CTRL-APPT-07: GET /api/appointments/dentist/{dentistName} returns dentist's assigned appointments")
    void testGetAppointmentsByDentist_ReturnsList() throws Exception {
        AppointmentResponseDTO response = new AppointmentResponseDTO(
                101L, 1L, "Sunil De Silva", "No. 78 Duplication Road, Colombo 04",
                "0719876543", "Dr. Samantha Fernando", "Teeth Cleaning",
                LocalDate.of(2026, 8, 25), LocalTime.of(10, 0), 1L, "staff"
        );

        when(appointmentService.getAppointmentsByDentistName("Dr. Samantha Fernando")).thenReturn(List.of(response));

        mockMvc.perform(get("/api/appointments/dentist/Dr. Samantha Fernando"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].dentistName").value("Dr. Samantha Fernando"));
    }
}
