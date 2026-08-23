package com.mycompany.clinic_management_system.repository;

import com.mycompany.clinic_management_system.model.Bill;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Data access repository for Bill entities.
 */
@Repository
public interface BillRepository extends JpaRepository<Bill, Long> {
    Optional<Bill> findByAppointmentAppointmentNumber(Long appointmentNumber);
}
