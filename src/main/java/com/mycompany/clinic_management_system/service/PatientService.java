package com.mycompany.clinic_management_system.service;

import com.mycompany.clinic_management_system.dto.PatientDTO;
import com.mycompany.clinic_management_system.model.Patient;
import java.util.List;

/**
 * Service interface for Patient management operations.
 */
public interface PatientService {

    Patient registerPatient(PatientDTO patientDTO);

    Patient getPatientById(Long id);

    List<Patient> getAllPatients();

    Patient updatePatient(Long id, PatientDTO patientDTO);

    void deletePatient(Long id);
}
