package com.mycompany.clinic_management_system.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mycompany.clinic_management_system.dto.TreatmentDTO;
import com.mycompany.clinic_management_system.exception.GlobalExceptionHandler;
import com.mycompany.clinic_management_system.model.Treatment;
import com.mycompany.clinic_management_system.security.JwtAuthenticationEntryPoint;
import com.mycompany.clinic_management_system.security.JwtUtils;
import com.mycompany.clinic_management_system.service.TreatmentService;
import com.mycompany.clinic_management_system.service.impl.CustomUserDetailsService;
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
 * Controller tests for Treatment and custom pricing endpoints.
 */
@WebMvcTest(controllers = TreatmentController.class)
@AutoConfigureMockMvc(addFilters = false)
@Import(GlobalExceptionHandler.class)
public class TreatmentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private TreatmentService treatmentService;

    @MockBean
    private JwtUtils jwtUtils;

    @MockBean
    private JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;

    @MockBean
    private CustomUserDetailsService customUserDetailsService;

    @Test
    @DisplayName("TC-CTRL-TRT-01: GET /api/treatments returns 200 OK and list of treatments")
    void testGetAllTreatments_ReturnsList() throws Exception {
        Treatment t1 = new Treatment(1L, "Teeth Cleaning", 2500.00, "Routine cleaning");
        Treatment t2 = new Treatment(2L, "Dental Implants", 60000.00, "Titanium fixture implant");
        when(treatmentService.getAllTreatments()).thenReturn(List.of(t1, t2));

        mockMvc.perform(get("/api/treatments"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].name").value("Teeth Cleaning"))
                .andExpect(jsonPath("$[0].price").value(2500.00))
                .andExpect(jsonPath("$[1].name").value("Dental Implants"))
                .andExpect(jsonPath("$[1].price").value(60000.00));
    }

    @Test
    @DisplayName("TC-CTRL-TRT-02: GET /api/treatments/{id} returns 200 OK and treatment details")
    void testGetTreatmentById_ReturnsTreatment() throws Exception {
        Treatment t = new Treatment(1L, "Teeth Cleaning", 2500.00, "Routine cleaning");
        when(treatmentService.getTreatmentById(1L)).thenReturn(t);

        mockMvc.perform(get("/api/treatments/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.name").value("Teeth Cleaning"))
                .andExpect(jsonPath("$.price").value(2500.00));
    }

    @Test
    @DisplayName("TC-CTRL-TRT-03: POST /api/treatments creates new treatment and returns 201 Created")
    void testCreateTreatment_ValidDTO_ReturnsCreated() throws Exception {
        TreatmentDTO dto = new TreatmentDTO("Dental Implants", 60000.00, "Titanium fixture implant");
        Treatment saved = new Treatment(3L, "Dental Implants", 60000.00, "Titanium fixture implant");
        when(treatmentService.createTreatment(any(TreatmentDTO.class))).thenReturn(saved);

        mockMvc.perform(post("/api/treatments")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(3))
                .andExpect(jsonPath("$.name").value("Dental Implants"))
                .andExpect(jsonPath("$.price").value(60000.00));
    }

    @Test
    @DisplayName("TC-CTRL-TRT-04: PUT /api/treatments/{id} updates price and returns 200 OK")
    void testUpdateTreatment_ValidDTO_ReturnsOk() throws Exception {
        TreatmentDTO dto = new TreatmentDTO("Teeth Cleaning", 3000.00, "Updated price");
        Treatment updated = new Treatment(1L, "Teeth Cleaning", 3000.00, "Updated price");
        when(treatmentService.updateTreatment(eq(1L), any(TreatmentDTO.class))).thenReturn(updated);

        mockMvc.perform(put("/api/treatments/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.price").value(3000.00));
    }

    @Test
    @DisplayName("TC-CTRL-TRT-05: DELETE /api/treatments/{id} returns 204 No Content")
    void testDeleteTreatment_ValidId_ReturnsNoContent() throws Exception {
        doNothing().when(treatmentService).deleteTreatment(1L);

        mockMvc.perform(delete("/api/treatments/1"))
                .andExpect(status().isNoContent());
    }
}
