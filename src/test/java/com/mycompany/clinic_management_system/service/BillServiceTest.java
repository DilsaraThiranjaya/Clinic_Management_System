package com.mycompany.clinic_management_system.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.mycompany.clinic_management_system.dto.BillReceiptDTO;
import com.mycompany.clinic_management_system.dto.BillRequestDTO;
import com.mycompany.clinic_management_system.exception.ResourceNotFoundException;
import com.mycompany.clinic_management_system.model.Appointment;
import com.mycompany.clinic_management_system.model.Bill;
import com.mycompany.clinic_management_system.model.Patient;
import com.mycompany.clinic_management_system.model.Role;
import com.mycompany.clinic_management_system.model.User;
import com.mycompany.clinic_management_system.repository.AppointmentRepository;
import com.mycompany.clinic_management_system.repository.BillRepository;
import com.mycompany.clinic_management_system.service.impl.BillServiceImpl;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Map;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

/**
 * TDD Unit Tests for Bill Calculation and Receipt Invoicing Operations.
 */
@ExtendWith(MockitoExtension.class)
public class BillServiceTest {

    @Mock
    private BillRepository billRepository;

    @Mock
    private AppointmentRepository appointmentRepository;

    @InjectMocks
    private BillServiceImpl billService;

    private Patient mockPatient;
    private User mockStaff;
    private Appointment mockAppointmentCleaning;
    private Appointment mockAppointmentRootCanal;
    private Bill mockBillCleaning;

    @BeforeEach
    void setUp() {
        mockPatient = new Patient(1L, "John Perera", "No. 45 Galle Road, Colombo 03", "0771234567");
        mockStaff = new User(1L, "staff", "encoded_pwd", Role.STAFF);

        mockAppointmentCleaning = new Appointment(
                101L,
                mockPatient,
                mockStaff,
                "Dr. Samantha Fernando",
                "Teeth Cleaning",
                LocalDate.of(2026, 8, 18),
                LocalTime.of(10, 30)
        );

        mockAppointmentRootCanal = new Appointment(
                102L,
                mockPatient,
                mockStaff,
                "Dr. Niluka Perera",
                "Root Canal",
                LocalDate.of(2026, 8, 19),
                LocalTime.of(15, 0)
        );

        mockBillCleaning = new Bill(1L, mockAppointmentCleaning, 4000.00, LocalDate.of(2026, 8, 18));
    }

    @Test
    @DisplayName("TC-BILL-01: Calculate & Generate Bill for Teeth Cleaning: 1500 (Base) + 2500 (Cleaning) = 4000 LKR")
    void testCalculateAndGenerateBill_TeethCleaning_CorrectCost() {
        when(appointmentRepository.findById(101L)).thenReturn(Optional.of(mockAppointmentCleaning));
        when(billRepository.findByAppointmentAppointmentNumber(101L)).thenReturn(Optional.empty());
        when(billRepository.save(any(Bill.class))).thenReturn(mockBillCleaning);

        BillReceiptDTO receipt = billService.calculateAndGenerateBill(101L);

        assertNotNull(receipt);
        assertEquals(101L, receipt.getAppointmentNumber());
        assertEquals("Teeth Cleaning", receipt.getTreatmentType());
        assertEquals(1500.00, receipt.getBaseConsultationFee());
        assertEquals(2500.00, receipt.getTreatmentCost());
        assertEquals(4000.00, receipt.getTotalCost());
        assertEquals("Sunrise Dental Clinic", receipt.getClinicName());
        verify(billRepository).save(any(Bill.class));
    }

    @Test
    @DisplayName("TC-BILL-02: Calculate & Generate Bill for Root Canal: 1500 (Base) + 15000 (Root Canal) = 16500 LKR")
    void testCalculateAndGenerateBill_RootCanal_CorrectCost() {
        Bill billRootCanal = new Bill(2L, mockAppointmentRootCanal, 16500.00, LocalDate.now());

        when(appointmentRepository.findById(102L)).thenReturn(Optional.of(mockAppointmentRootCanal));
        when(billRepository.findByAppointmentAppointmentNumber(102L)).thenReturn(Optional.empty());
        when(billRepository.save(any(Bill.class))).thenReturn(billRootCanal);

        BillReceiptDTO receipt = billService.calculateAndGenerateBill(102L);

        assertNotNull(receipt);
        assertEquals(1500.00, receipt.getBaseConsultationFee());
        assertEquals(15000.00, receipt.getTreatmentCost());
        assertEquals(16500.00, receipt.getTotalCost());
    }

    @Test
    @DisplayName("TC-BILL-03: Generate Bill with Custom Total Cost overrides formula")
    void testCalculateAndGenerateBill_WithCustomCost_Success() {
        BillRequestDTO request = new BillRequestDTO(101L, 5500.00);
        Bill customBill = new Bill(3L, mockAppointmentCleaning, 5500.00, LocalDate.now());

        when(appointmentRepository.findById(101L)).thenReturn(Optional.of(mockAppointmentCleaning));
        when(billRepository.findByAppointmentAppointmentNumber(101L)).thenReturn(Optional.empty());
        when(billRepository.save(any(Bill.class))).thenReturn(customBill);

        BillReceiptDTO receipt = billService.calculateAndGenerateBill(request);

        assertNotNull(receipt);
        assertEquals(5500.00, receipt.getTotalCost());
    }

    @Test
    @DisplayName("TC-BILL-04: Generate Bill for Non-Existent Appointment throws ResourceNotFoundException")
    void testCalculateAndGenerateBill_AppointmentNotFound_ThrowsException() {
        when(appointmentRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> billService.calculateAndGenerateBill(999L));
    }

    @Test
    @DisplayName("TC-BILL-05: Get Bill Receipt returns printable breakdown with patient and clinic details")
    void testGetBillReceipt_ReturnsFullPrintableBreakdown() {
        when(billRepository.findByAppointmentAppointmentNumber(101L)).thenReturn(Optional.of(mockBillCleaning));

        BillReceiptDTO receipt = billService.getBillReceipt(101L);

        assertNotNull(receipt);
        assertEquals(1L, receipt.getBillId());
        assertEquals("John Perera", receipt.getPatientName());
        assertEquals("Dr. Samantha Fernando", receipt.getDentistName());
        assertEquals(4000.00, receipt.getTotalCost());
        assertEquals("PAID", receipt.getStatus());
    }

    @Test
    @DisplayName("TC-BILL-06: Calculate Cost Breakdown for unknown treatment applies default fallback")
    void testCalculateCostBreakdown_DefaultTreatment_AppliesFallback() {
        Map<String, Object> breakdown = billService.calculateCostBreakdown("General Checkup");

        assertNotNull(breakdown);
        assertEquals(1500.00, breakdown.get("baseConsultationFee"));
        assertEquals(2000.00, breakdown.get("treatmentSpecificCost"));
        assertEquals(3500.00, breakdown.get("totalCalculatedCost"));
        assertEquals("LKR", breakdown.get("currency"));
    }

    @Test
    @DisplayName("TC-BILL-07: Generating bill for already billed appointment updates existing record idempotently")
    void testGenerateBill_ExistingBill_UpdatesExistingRecord() {
        Bill existingBill = new Bill(1L, mockAppointmentCleaning, 4000.00, LocalDate.of(2026, 8, 1));

        when(appointmentRepository.findById(101L)).thenReturn(Optional.of(mockAppointmentCleaning));
        when(billRepository.findByAppointmentAppointmentNumber(101L)).thenReturn(Optional.of(existingBill));
        when(billRepository.save(existingBill)).thenReturn(existingBill);

        BillReceiptDTO receipt = billService.calculateAndGenerateBill(101L);

        assertNotNull(receipt);
        assertEquals(1L, receipt.getBillId());
        assertEquals(LocalDate.now(), existingBill.getIssueDate());
    }

    @Test
    @DisplayName("TC-BILL-08: Multi-treatment appointment calculates sum of all selected procedures correctly")
    void testCalculateAndGenerateBill_MultipleTreatments_CalculatesSumCorrectly() {
        Appointment multiTreatmentAppt = new Appointment(
                103L,
                mockPatient,
                mockStaff,
                "Dr. Samantha Fernando",
                "Teeth Cleaning, Dental Filling",
                LocalDate.of(2026, 8, 20),
                LocalTime.of(11, 0)
        );
        Bill multiBill = new Bill(3L, multiTreatmentAppt, 7500.00, LocalDate.now());

        when(appointmentRepository.findById(103L)).thenReturn(Optional.of(multiTreatmentAppt));
        when(billRepository.findByAppointmentAppointmentNumber(103L)).thenReturn(Optional.empty());
        when(billRepository.save(any(Bill.class))).thenReturn(multiBill);

        BillReceiptDTO receipt = billService.calculateAndGenerateBill(103L);

        assertNotNull(receipt);
        assertEquals(3L, receipt.getBillId());
        assertEquals(1500.00, receipt.getBaseConsultationFee());
        assertEquals(6000.00, receipt.getTreatmentCost()); // 2500 (cleaning) + 3500 (filling)
        assertEquals(7500.00, receipt.getTotalCost()); // 1500 + 6000
        assertEquals("Teeth Cleaning, Dental Filling", receipt.getTreatmentType());

        Map<String, Object> breakdown = billService.calculateCostBreakdown("Teeth Cleaning, Dental Filling");
        assertEquals(1500.00, breakdown.get("baseConsultationFee"));
        assertEquals(6000.00, breakdown.get("treatmentSpecificCost"));
        assertEquals(7500.00, breakdown.get("totalCalculatedCost"));
    }
}
