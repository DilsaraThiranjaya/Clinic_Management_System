package com.mycompany.clinic_management_system.repository;

import com.mycompany.clinic_management_system.model.Patient;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Data access repository for Patient entities.
 */
@Repository
public interface PatientRepository extends JpaRepository<Patient, Long> {
    Optional<Patient> findByContactNumber(String contactNumber);
    List<Patient> findByNameContainingIgnoreCase(String name);
}
