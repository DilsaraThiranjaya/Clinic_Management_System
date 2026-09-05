package com.mycompany.clinic_management_system.service;

import com.mycompany.clinic_management_system.dto.TreatmentDTO;
import com.mycompany.clinic_management_system.model.Treatment;
import java.util.List;

/**
 * Service interface for clinical treatment procedures and dynamic pricing management.
 */
public interface TreatmentService {

    List<Treatment> getAllTreatments();

    Treatment getTreatmentById(Long id);

    Treatment getTreatmentByName(String name);

    Treatment createTreatment(TreatmentDTO dto);

    Treatment updateTreatment(Long id, TreatmentDTO dto);

    void deleteTreatment(Long id);
}
