package com.mycompany.clinic_management_system.service.impl;

import com.mycompany.clinic_management_system.dto.PatientDTO;
import com.mycompany.clinic_management_system.exception.ResourceNotFoundException;
import com.mycompany.clinic_management_system.model.Patient;
import com.mycompany.clinic_management_system.repository.PatientRepository;
import com.mycompany.clinic_management_system.service.PatientService;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Implementation of PatientService managing patient registration and profiles.
 */
@Service
@Transactional
public class PatientServiceImpl implements PatientService {

    private final PatientRepository patientRepository;

    public PatientServiceImpl(PatientRepository patientRepository) {
        this.patientRepository = patientRepository;
    }

    @Override
    public Patient registerPatient(PatientDTO patientDTO) {
        Patient patient = new Patient(
                patientDTO.getName(),
                patientDTO.getAddress(),
                patientDTO.getContactNumber()
        );
        return patientRepository.save(patient);
    }

    @Override
    public Patient registerPatient(Patient patient) {
        return patientRepository.save(patient);
    }

    @Override
    @Transactional(readOnly = true)
    public Patient getPatientById(Long id) {
        return patientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with id: " + id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<Patient> getAllPatients() {
        return patientRepository.findAll();
    }

    @Override
    public Patient updatePatient(Long id, PatientDTO patientDTO) {
        Patient existing = getPatientById(id);
        existing.setName(patientDTO.getName());
        existing.setAddress(patientDTO.getAddress());
        existing.setContactNumber(patientDTO.getContactNumber());
        return patientRepository.save(existing);
    }

    @Override
    public void deletePatient(Long id) {
        if (!patientRepository.existsById(id)) {
            throw new ResourceNotFoundException("Patient not found with id: " + id);
        }
        patientRepository.deleteById(id);
    }
}
