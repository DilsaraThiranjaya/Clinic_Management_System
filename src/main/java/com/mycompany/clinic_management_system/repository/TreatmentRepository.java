package com.mycompany.clinic_management_system.repository;

import com.mycompany.clinic_management_system.model.Treatment;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Data access repository for Treatment entities.
 */
@Repository
public interface TreatmentRepository extends JpaRepository<Treatment, Long> {

    Optional<Treatment> findByNameIgnoreCase(String name);

    boolean existsByNameIgnoreCase(String name);
}
