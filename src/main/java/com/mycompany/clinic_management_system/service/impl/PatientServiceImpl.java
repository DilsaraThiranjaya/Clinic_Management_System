package com.mycompany.clinic_management_system.service.impl;

import com.mycompany.clinic_management_system.dto.PatientDTO;
import com.mycompany.clinic_management_system.model.Patient;
import com.mycompany.clinic_management_system.repository.PatientRepository;
import com.mycompany.clinic_management_system.service.PatientService;
import java.util.List;
import java.util.NoSuchElementException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Implementation of {@link PatientService} handling patient CRUD operations.
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
        if (patientDTO == null) {
            throw new IllegalArgumentException("Patient details must not be null");
        }

        Patient patient = new Patient();
        patient.setName(patientDTO.getName());
        patient.setAddress(patientDTO.getAddress());
        patient.setContactNumber(patientDTO.getContactNumber());

        return patientRepository.save(patient);
    }

    @Override
    @Transactional(readOnly = true)
    public Patient getPatientById(Long id) {
        if (id == null) {
            throw new IllegalArgumentException("Patient ID must not be null");
        }
        return patientRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Patient not found with ID: " + id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<Patient> getAllPatients() {
        return patientRepository.findAll();
    }

    @Override
    public Patient updatePatient(Long id, PatientDTO patientDTO) {
        if (id == null) {
            throw new IllegalArgumentException("Patient ID must not be null");
        }
        if (patientDTO == null) {
            throw new IllegalArgumentException("Patient details must not be null");
        }

        Patient existingPatient = patientRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Patient not found with ID: " + id));

        existingPatient.setName(patientDTO.getName());
        existingPatient.setAddress(patientDTO.getAddress());
        existingPatient.setContactNumber(patientDTO.getContactNumber());

        return patientRepository.save(existingPatient);
    }

    @Override
    public void deletePatient(Long id) {
        if (id == null) {
            throw new IllegalArgumentException("Patient ID must not be null");
        }
        if (!patientRepository.existsById(id)) {
            throw new NoSuchElementException("Patient not found with ID: " + id);
        }
        patientRepository.deleteById(id);
    }
}
