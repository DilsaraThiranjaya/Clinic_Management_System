package com.mycompany.clinic_management_system.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.mycompany.clinic_management_system.dto.TreatmentDTO;
import com.mycompany.clinic_management_system.exception.ResourceNotFoundException;
import com.mycompany.clinic_management_system.model.Treatment;
import com.mycompany.clinic_management_system.repository.TreatmentRepository;
import com.mycompany.clinic_management_system.service.impl.TreatmentServiceImpl;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

/**
 * Unit tests for TreatmentService implementation.
 */
@ExtendWith(MockitoExtension.class)
public class TreatmentServiceTest {

    @Mock
    private TreatmentRepository treatmentRepository;

    private TreatmentService treatmentService;

    @BeforeEach
    void setUp() {
        treatmentService = new TreatmentServiceImpl(treatmentRepository);
    }

    @Test
    @DisplayName("TC-SVC-TRT-01: getAllTreatments returns full treatment list")
    void testGetAllTreatments() {
        Treatment t1 = new Treatment(1L, "Teeth Cleaning", 2500.0, "Routine clean");
        Treatment t2 = new Treatment(2L, "Dental Filling", 3500.0, "Composite fill");
        when(treatmentRepository.findAll()).thenReturn(List.of(t1, t2));

        List<Treatment> list = treatmentService.getAllTreatments();
        assertEquals(2, list.size());
        assertEquals("Teeth Cleaning", list.get(0).getName());
    }

    @Test
    @DisplayName("TC-SVC-TRT-02: getTreatmentById returns entity when found")
    void testGetTreatmentById_Found() {
        Treatment t = new Treatment(1L, "Teeth Cleaning", 2500.0, "Routine clean");
        when(treatmentRepository.findById(1L)).thenReturn(Optional.of(t));

        Treatment result = treatmentService.getTreatmentById(1L);
        assertNotNull(result);
        assertEquals(2500.0, result.getPrice());
    }

    @Test
    @DisplayName("TC-SVC-TRT-03: getTreatmentById throws ResourceNotFoundException when not found")
    void testGetTreatmentById_NotFound() {
        when(treatmentRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> treatmentService.getTreatmentById(99L));
    }

    @Test
    @DisplayName("TC-SVC-TRT-04: createTreatment saves and returns new treatment")
    void testCreateTreatment_Success() {
        TreatmentDTO dto = new TreatmentDTO("Dental Implants", 60000.0, "Surgical implant");
        when(treatmentRepository.existsByNameIgnoreCase("Dental Implants")).thenReturn(false);
        when(treatmentRepository.save(any(Treatment.class))).thenAnswer(invocation -> {
            Treatment saved = invocation.getArgument(0);
            saved.setId(10L);
            return saved;
        });

        Treatment created = treatmentService.createTreatment(dto);
        assertNotNull(created);
        assertEquals(10L, created.getId());
        assertEquals("Dental Implants", created.getName());
        assertEquals(60000.0, created.getPrice());
    }

    @Test
    @DisplayName("TC-SVC-TRT-05: createTreatment throws IllegalArgumentException if name already exists")
    void testCreateTreatment_DuplicateName() {
        TreatmentDTO dto = new TreatmentDTO("Teeth Cleaning", 2500.0, "Duplicate");
        when(treatmentRepository.existsByNameIgnoreCase("Teeth Cleaning")).thenReturn(true);

        assertThrows(IllegalArgumentException.class, () -> treatmentService.createTreatment(dto));
    }

    @Test
    @DisplayName("TC-SVC-TRT-06: updateTreatment modifies existing price")
    void testUpdateTreatment_Success() {
        Treatment existing = new Treatment(1L, "Teeth Cleaning", 2500.0, "Old price");
        when(treatmentRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(treatmentRepository.save(any(Treatment.class))).thenReturn(existing);

        TreatmentDTO updateDto = new TreatmentDTO("Teeth Cleaning", 2800.0, "New price");
        Treatment result = treatmentService.updateTreatment(1L, updateDto);
        assertEquals(2800.0, result.getPrice());
    }

    @Test
    @DisplayName("TC-SVC-TRT-07: deleteTreatment removes treatment from repository")
    void testDeleteTreatment_Success() {
        Treatment existing = new Treatment(1L, "Teeth Cleaning", 2500.0, "To delete");
        when(treatmentRepository.findById(1L)).thenReturn(Optional.of(existing));

        treatmentService.deleteTreatment(1L);
        verify(treatmentRepository).delete(existing);
    }
}
