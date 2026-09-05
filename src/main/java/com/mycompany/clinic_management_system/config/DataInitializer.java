package com.mycompany.clinic_management_system.config;

import com.mycompany.clinic_management_system.model.Appointment;
import com.mycompany.clinic_management_system.model.Patient;
import com.mycompany.clinic_management_system.model.Role;
import com.mycompany.clinic_management_system.model.Treatment;
import com.mycompany.clinic_management_system.model.User;
import com.mycompany.clinic_management_system.repository.AppointmentRepository;
import com.mycompany.clinic_management_system.repository.PatientRepository;
import com.mycompany.clinic_management_system.repository.TreatmentRepository;
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
                                          TreatmentRepository treatmentRepository,
                                          PasswordEncoder passwordEncoder) {
        return args -> {
            // Seed Admin account
            User admin = userRepository.findByUsername("admin").orElseGet(() ->
                    userRepository.save(new User("admin", passwordEncoder.encode("admin123"), Role.ADMIN, "admin@sunrisedental.lk", "Clinic Administrator")));

            // Seed Staff account
            User staff = userRepository.findByUsername("staff").orElseGet(() ->
                    userRepository.save(new User("staff", passwordEncoder.encode("staff123"), Role.STAFF, "staff@sunrisedental.lk", "Front Desk Staff")));

            // Seed Doctor / Dentist account
            User doctor = userRepository.findByUsername("doctor").orElseGet(() ->
                    userRepository.save(new User("doctor", passwordEncoder.encode("doctor123"), Role.DOCTOR, "doctor@sunrisedental.lk", "Dr. Samantha Fernando")));

            // Ensure doctor has full name if previously seeded
            if (doctor.getFullName() == null || doctor.getFullName().isEmpty()) {
                doctor.setFullName("Dr. Samantha Fernando");
                userRepository.save(doctor);
            }

            // Seed Patient account
            User patientUser = userRepository.findByUsername("patient").orElseGet(() ->
                    userRepository.save(new User("patient", passwordEncoder.encode("patient123"), Role.PATIENT, "patient@example.com", "John Perera")));

            // Seed Clinical Treatment Types and Pricing
            if (treatmentRepository.count() == 0) {
                treatmentRepository.save(new Treatment("Teeth Cleaning", 2500.00, "Routine scaling, plaque removal and dental polishing"));
                treatmentRepository.save(new Treatment("Dental Filling", 3500.00, "Composite tooth-colored restoration for cavities"));
                treatmentRepository.save(new Treatment("Tooth Extraction", 4500.00, "Simple or surgical dental extraction under local anesthesia"));
                treatmentRepository.save(new Treatment("Teeth Whitening", 8000.00, "Professional chairside enamel bleaching and shade brightening"));
                treatmentRepository.save(new Treatment("Root Canal", 15000.00, "Endodontic pulp extirpation, canal disinfection and sealing"));
                treatmentRepository.save(new Treatment("Orthodontics (Braces)", 45000.00, "Dental malocclusion alignment and orthodontic bracket installation"));
                treatmentRepository.save(new Treatment("General Consultation", 2000.00, "Comprehensive oral examination and treatment diagnosis"));
            }

            // Seed Initial Patient Records & Appointments
            if (patientRepository.count() == 0) {
                Patient patient1 = patientRepository.save(new Patient(
                        "John Perera",
                        "No. 45 Galle Road, Colombo 03",
                        "0771234567"
                ));

                Patient patient2 = patientRepository.save(new Patient(
                        "Anoma Silva",
                        "No. 12 Kandy Road, Kiribathgoda",
                        "0719876543"
                ));

                Patient patient3 = patientRepository.save(new Patient(
                        "Kasun Jayawardena",
                        "No. 88 Havelock Road, Colombo 05",
                        "0755551234"
                ));

                // Seed Initial Appointments assigned to Dr. Samantha Fernando
                appointmentRepository.save(new Appointment(
                        patient1,
                        staff,
                        "Dr. Samantha Fernando",
                        "Teeth Cleaning",
                        LocalDate.now(),
                        LocalTime.of(10, 30)
                ));

                appointmentRepository.save(new Appointment(
                        patient2,
                        staff,
                        "Dr. Samantha Fernando",
                        "Root Canal",
                        LocalDate.now(),
                        LocalTime.of(14, 0)
                ));

                appointmentRepository.save(new Appointment(
                        patient3,
                        staff,
                        "Dr. Kasun Jayawardena",
                        "Orthodontics (Braces)",
                        LocalDate.now().plusDays(1),
                        LocalTime.of(11, 15)
                ));
            }
        };
    }
}
