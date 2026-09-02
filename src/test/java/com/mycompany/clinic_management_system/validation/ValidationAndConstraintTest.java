package com.mycompany.clinic_management_system.validation;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.mycompany.clinic_management_system.dto.AppointmentRequestDTO;
import com.mycompany.clinic_management_system.dto.BillRequestDTO;
import com.mycompany.clinic_management_system.dto.LoginRequestDTO;
import com.mycompany.clinic_management_system.dto.RegisterRequestDTO;
import com.mycompany.clinic_management_system.model.Bill;
import com.mycompany.clinic_management_system.model.Patient;
import com.mycompany.clinic_management_system.model.Role;
import com.mycompany.clinic_management_system.model.User;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Set;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

/**
 * TDD Validation Test Suite verifying Bean Validation annotations across Entities and DTOs.
 */
public class ValidationAndConstraintTest {

    private static Validator validator;

    @BeforeAll
    static void setUpValidator() {
        ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();
    }

    @Nested
    @DisplayName("1. Authentication & User Registration Validation Tests (>= 6 Test Cases)")
    class AuthValidationTests {

        @Test
        @DisplayName("TC-VAL-AUTH-01: Valid Login Request passes validation")
        void testLogin_ValidData_PassesValidation() {
            LoginRequestDTO dto = new LoginRequestDTO("staff", "staff123");
            Set<ConstraintViolation<LoginRequestDTO>> violations = validator.validate(dto);
            assertTrue(violations.isEmpty());
        }

        @Test
        @DisplayName("TC-VAL-AUTH-02: Blank username in Login Request fails validation")
        void testLogin_BlankUsername_FailsValidation() {
            LoginRequestDTO dto = new LoginRequestDTO("", "staff123");
            Set<ConstraintViolation<LoginRequestDTO>> violations = validator.validate(dto);
            assertFalse(violations.isEmpty());
        }

        @Test
        @DisplayName("TC-VAL-AUTH-03: Blank password in Login Request fails validation")
        void testLogin_BlankPassword_FailsValidation() {
            LoginRequestDTO dto = new LoginRequestDTO("staff", "");
            Set<ConstraintViolation<LoginRequestDTO>> violations = validator.validate(dto);
            assertFalse(violations.isEmpty());
        }

        @Test
        @DisplayName("TC-VAL-AUTH-04: Password shorter than 6 characters in Register Request fails validation")
        void testRegister_ShortPassword_FailsValidation() {
            RegisterRequestDTO dto = new RegisterRequestDTO("staff_user", "123", Role.STAFF, "staff@example.com");
            Set<ConstraintViolation<RegisterRequestDTO>> violations = validator.validate(dto);
            assertFalse(violations.isEmpty());
        }

        @Test
        @DisplayName("TC-VAL-AUTH-05: Blank username in Register Request fails validation")
        void testRegister_BlankUsername_FailsValidation() {
            RegisterRequestDTO dto = new RegisterRequestDTO("   ", "securePassword123", Role.STAFF, "staff@example.com");
            Set<ConstraintViolation<RegisterRequestDTO>> violations = validator.validate(dto);
            assertFalse(violations.isEmpty());
        }

        @Test
        @DisplayName("TC-VAL-AUTH-06: Null role in Register Request fails validation")
        void testRegister_NullRole_FailsValidation() {
            RegisterRequestDTO dto = new RegisterRequestDTO("staff_user", "securePassword123", null, "staff@example.com");
            Set<ConstraintViolation<RegisterRequestDTO>> violations = validator.validate(dto);
            assertFalse(violations.isEmpty());
        }

        @Test
        @DisplayName("TC-VAL-AUTH-07: User entity with username under 3 characters fails validation")
        void testUserEntity_ShortUsername_FailsValidation() {
            User user = new User("ab", "password123", Role.STAFF);
            Set<ConstraintViolation<User>> violations = validator.validate(user);
            assertFalse(violations.isEmpty());
        }
    }

    @Nested
    @DisplayName("2. Appointment Registration Validation Tests (>= 6 Test Cases)")
    class AppointmentValidationTests {

        @Test
        @DisplayName("TC-VAL-APPT-01: Valid Appointment Request passes validation")
        void testAppointmentRequest_ValidData_PassesValidation() {
            AppointmentRequestDTO dto = new AppointmentRequestDTO(
                    "Sunil De Silva",
                    "No. 45 Galle Road, Colombo 03",
                    "0771234567",
                    "Dr. Samantha Fernando",
                    "Teeth Cleaning",
                    LocalDate.now().plusDays(1),
                    LocalTime.of(10, 0)
            );
            Set<ConstraintViolation<AppointmentRequestDTO>> violations = validator.validate(dto);
            assertTrue(violations.isEmpty());
        }

        @Test
        @DisplayName("TC-VAL-APPT-02: Blank patient name fails validation")
        void testAppointmentRequest_BlankPatientName_FailsValidation() {
            AppointmentRequestDTO dto = new AppointmentRequestDTO(
                    "",
                    "No. 45 Galle Road, Colombo 03",
                    "0771234567",
                    "Dr. Samantha Fernando",
                    "Teeth Cleaning",
                    LocalDate.now().plusDays(1),
                    LocalTime.of(10, 0)
            );
            Set<ConstraintViolation<AppointmentRequestDTO>> violations = validator.validate(dto);
            assertFalse(violations.isEmpty());
        }

        @Test
        @DisplayName("TC-VAL-APPT-03: Address shorter than 5 characters fails validation")
        void testAppointmentRequest_ShortAddress_FailsValidation() {
            AppointmentRequestDTO dto = new AppointmentRequestDTO(
                    "Sunil De Silva",
                    "Col",
                    "0771234567",
                    "Dr. Samantha Fernando",
                    "Teeth Cleaning",
                    LocalDate.now().plusDays(1),
                    LocalTime.of(10, 0)
            );
            Set<ConstraintViolation<AppointmentRequestDTO>> violations = validator.validate(dto);
            assertFalse(violations.isEmpty());
        }

        @Test
        @DisplayName("TC-VAL-APPT-04: Invalid contact number format (letters/short) fails validation")
        void testAppointmentRequest_InvalidContactNumber_FailsValidation() {
            AppointmentRequestDTO dto = new AppointmentRequestDTO(
                    "Sunil De Silva",
                    "No. 45 Galle Road, Colombo 03",
                    "invalid-phone",
                    "Dr. Samantha Fernando",
                    "Teeth Cleaning",
                    LocalDate.now().plusDays(1),
                    LocalTime.of(10, 0)
            );
            Set<ConstraintViolation<AppointmentRequestDTO>> violations = validator.validate(dto);
            assertFalse(violations.isEmpty());
        }

        @Test
        @DisplayName("TC-VAL-APPT-05: Blank dentist name fails validation")
        void testAppointmentRequest_BlankDentistName_FailsValidation() {
            AppointmentRequestDTO dto = new AppointmentRequestDTO(
                    "Sunil De Silva",
                    "No. 45 Galle Road, Colombo 03",
                    "0771234567",
                    "",
                    "Teeth Cleaning",
                    LocalDate.now().plusDays(1),
                    LocalTime.of(10, 0)
            );
            Set<ConstraintViolation<AppointmentRequestDTO>> violations = validator.validate(dto);
            assertFalse(violations.isEmpty());
        }

        @Test
        @DisplayName("TC-VAL-APPT-06: Null appointment date fails validation")
        void testAppointmentRequest_NullDate_FailsValidation() {
            AppointmentRequestDTO dto = new AppointmentRequestDTO(
                    "Sunil De Silva",
                    "No. 45 Galle Road, Colombo 03",
                    "0771234567",
                    "Dr. Samantha Fernando",
                    "Teeth Cleaning",
                    null,
                    LocalTime.of(10, 0)
            );
            Set<ConstraintViolation<AppointmentRequestDTO>> violations = validator.validate(dto);
            assertFalse(violations.isEmpty());
        }

        @Test
        @DisplayName("TC-VAL-APPT-07: Null appointment time fails validation")
        void testAppointmentRequest_NullTime_FailsValidation() {
            AppointmentRequestDTO dto = new AppointmentRequestDTO(
                    "Sunil De Silva",
                    "No. 45 Galle Road, Colombo 03",
                    "0771234567",
                    "Dr. Samantha Fernando",
                    "Teeth Cleaning",
                    LocalDate.now().plusDays(1),
                    null
            );
            Set<ConstraintViolation<AppointmentRequestDTO>> violations = validator.validate(dto);
            assertFalse(violations.isEmpty());
        }
    }

    @Nested
    @DisplayName("3. Billing & Invoicing Validation Tests (>= 6 Test Cases)")
    class BillingValidationTests {

        @Test
        @DisplayName("TC-VAL-BILL-01: Valid Bill Request passes validation")
        void testBillRequest_ValidData_PassesValidation() {
            BillRequestDTO dto = new BillRequestDTO(101L, 4000.00);
            Set<ConstraintViolation<BillRequestDTO>> violations = validator.validate(dto);
            assertTrue(violations.isEmpty());
        }

        @Test
        @DisplayName("TC-VAL-BILL-02: Null appointment number in Bill Request fails validation")
        void testBillRequest_NullAppointmentNumber_FailsValidation() {
            BillRequestDTO dto = new BillRequestDTO(null, 4000.00);
            Set<ConstraintViolation<BillRequestDTO>> violations = validator.validate(dto);
            assertFalse(violations.isEmpty());
        }

        @Test
        @DisplayName("TC-VAL-BILL-03: Negative custom total cost in Bill Request fails validation")
        void testBillRequest_NegativeCustomTotalCost_FailsValidation() {
            BillRequestDTO dto = new BillRequestDTO(101L, -500.00);
            Set<ConstraintViolation<BillRequestDTO>> violations = validator.validate(dto);
            assertFalse(violations.isEmpty());
        }

        @Test
        @DisplayName("TC-VAL-BILL-04: Negative total cost on Bill entity fails validation")
        void testBillEntity_NegativeTotalCost_FailsValidation() {
            Bill bill = new Bill();
            bill.setTotalCost(-1000.00);
            bill.setIssueDate(LocalDate.now());
            Set<ConstraintViolation<Bill>> violations = validator.validate(bill);
            assertFalse(violations.isEmpty());
        }

        @Test
        @DisplayName("TC-VAL-BILL-05: Zero total cost on Bill entity fails validation (@Positive)")
        void testBillEntity_ZeroTotalCost_FailsValidation() {
            Bill bill = new Bill();
            bill.setTotalCost(0.00);
            bill.setIssueDate(LocalDate.now());
            Set<ConstraintViolation<Bill>> violations = validator.validate(bill);
            assertFalse(violations.isEmpty());
        }

        @Test
        @DisplayName("TC-VAL-BILL-06: Null issue date on Bill entity fails validation")
        void testBillEntity_NullIssueDate_FailsValidation() {
            Bill bill = new Bill();
            bill.setTotalCost(4000.00);
            bill.setIssueDate(null);
            Set<ConstraintViolation<Bill>> violations = validator.validate(bill);
            assertFalse(violations.isEmpty());
        }

        @Test
        @DisplayName("TC-VAL-BILL-07: Null appointment reference on Bill entity fails validation")
        void testBillEntity_NullAppointment_FailsValidation() {
            Bill bill = new Bill();
            bill.setAppointment(null);
            bill.setTotalCost(4000.00);
            bill.setIssueDate(LocalDate.now());
            Set<ConstraintViolation<Bill>> violations = validator.validate(bill);
            assertFalse(violations.isEmpty());
        }
    }
}
