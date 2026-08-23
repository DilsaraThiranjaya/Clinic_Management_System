package com.mycompany.clinic_management_system.repository;

import com.mycompany.clinic_management_system.model.Appointment;
import java.time.LocalDate;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Data access repository for Appointment entities.
 */
@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    List<Appointment> findByPatientId(Long patientId);
    List<Appointment> findByAppointmentDate(LocalDate appointmentDate);
    List<Appointment> findByDentistName(String dentistName);
}
