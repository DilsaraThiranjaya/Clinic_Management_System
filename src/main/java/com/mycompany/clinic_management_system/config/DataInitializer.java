package com.mycompany.clinic_management_system.config;

import com.mycompany.clinic_management_system.model.Appointment;
import com.mycompany.clinic_management_system.model.Patient;
import com.mycompany.clinic_management_system.model.Role;
import com.mycompany.clinic_management_system.model.User;
import com.mycompany.clinic_management_system.repository.AppointmentRepository;
import com.mycompany.clinic_management_system.repository.PatientRepository;
import com.mycompany.clinic_management_system.repository.UserRepository;
import java.time.LocalDate;
import java.time.LocalTime;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

/**
 * Data initializer seeding default role accounts and initial clinic sample data.
 */
@Configuration
public class DataInitializer {

    @Bean
    public CommandLineRunner initDatabase(UserRepository userRepository,
                                          PatientRepository patientRepository,
                                          AppointmentRepository appointmentRepository,
                                          PasswordEncoder passwordEncoder) {
        return args -> {
            // Seed Admin account
            User admin = userRepository.findByUsername("admin").orElseGet(() ->
                    userRepository.save(new User("admin", passwordEncoder.encode("admin123"), Role.ADMIN)));

            // Seed Staff account
            User staff = userRepository.findByUsername("staff").orElseGet(() ->
                    userRepository.save(new User("staff", passwordEncoder.encode("staff123"), Role.STAFF)));

            // Seed Patient account
            User patientUser = userRepository.findByUsername("patient").orElseGet(() ->
                    userRepository.save(new User("patient", passwordEncoder.encode("patient123"), Role.PATIENT)));

            // Seed Initial Patient Record
            if (patientRepository.count() == 0) {
                Patient samplePatient = patientRepository.save(new Patient(
                        "John Perera",
                        "No. 45 Galle Road, Colombo 03",
                        "0771234567"
                ));

                // Seed Initial Appointment Record
                appointmentRepository.save(new Appointment(
                        samplePatient,
                        staff,
                        "Dr. Samantha Fernando",
                        "Teeth Cleaning",
                        LocalDate.now().plusDays(2),
                        LocalTime.of(10, 30)
                ));
            }
        };
    }
}
