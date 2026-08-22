package com.mycompany.clinic_management_system.service.impl;

import com.mycompany.clinic_management_system.dto.BillReceiptDTO;
import com.mycompany.clinic_management_system.dto.BillRequestDTO;
import com.mycompany.clinic_management_system.model.Appointment;
import com.mycompany.clinic_management_system.model.Bill;
import com.mycompany.clinic_management_system.repository.AppointmentRepository;
import com.mycompany.clinic_management_system.repository.BillRepository;
import com.mycompany.clinic_management_system.service.BillService;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Implementation of {@link BillService} handling invoice generation, pricing matrix calculations, and receipt fetching.
 */
@Service
@Transactional
public class BillServiceImpl implements BillService {

    public static final double BASE_CONSULTATION_FEE = 1500.00;

    private static final Map<String, Double> TREATMENT_PRICE_MAP = new HashMap<>();

    static {
        TREATMENT_PRICE_MAP.put("TEETH CLEANING", 3500.00);
        TREATMENT_PRICE_MAP.put("CLEANING", 3500.00);
        TREATMENT_PRICE_MAP.put("DENTAL FILLING", 4500.00);
        TREATMENT_PRICE_MAP.put("FILLING", 4500.00);
        TREATMENT_PRICE_MAP.put("ROOT CANAL", 15000.00);
        TREATMENT_PRICE_MAP.put("ROOT CANAL THERAPY", 15000.00);
        TREATMENT_PRICE_MAP.put("TEETH WHITENING", 12000.00);
        TREATMENT_PRICE_MAP.put("WHITENING", 12000.00);
        TREATMENT_PRICE_MAP.put("TOOTH EXTRACTION", 5000.00);
        TREATMENT_PRICE_MAP.put("EXTRACTION", 5000.00);
        TREATMENT_PRICE_MAP.put("DENTAL CROWN", 18000.00);
        TREATMENT_PRICE_MAP.put("CROWN", 18000.00);
        TREATMENT_PRICE_MAP.put("ORTHODONTIC CONSULTATION", 5000.00);
        TREATMENT_PRICE_MAP.put("BRACES / ORTHODONTICS", 45000.00);
        TREATMENT_PRICE_MAP.put("GENERAL CHECKUP", 1000.00);
        TREATMENT_PRICE_MAP.put("CHECKUP", 1000.00);
    }

    private final BillRepository billRepository;
    private final AppointmentRepository appointmentRepository;

    public BillServiceImpl(BillRepository billRepository, AppointmentRepository appointmentRepository) {
        this.billRepository = billRepository;
        this.appointmentRepository = appointmentRepository;
    }

    @Override
    public BillReceiptDTO calculateAndGenerateBill(Long appointmentNumber) {
        if (appointmentNumber == null) {
            throw new IllegalArgumentException("Appointment number must not be null");
        }

        Appointment appointment = appointmentRepository.findById(appointmentNumber)
                .orElseThrow(() -> new NoSuchElementException("Appointment not found with number: " + appointmentNumber));

        // Check if bill already exists for this appointment
        Bill bill = billRepository.findByAppointmentAppointmentNumber(appointmentNumber)
                .orElse(null);

        double treatmentCost = getTreatmentCost(appointment.getTreatmentType());
        double totalCost = BASE_CONSULTATION_FEE + treatmentCost;

        if (bill == null) {
            bill = new Bill();
            bill.setAppointment(appointment);
            bill.setTotalCost(totalCost);
            bill.setIssueDate(LocalDate.now());
            bill = billRepository.save(bill);
        }

        return mapToReceiptDTO(bill, BASE_CONSULTATION_FEE, treatmentCost);
    }

    @Override
    public BillReceiptDTO calculateAndGenerateBill(BillRequestDTO requestDTO) {
        if (requestDTO == null || requestDTO.getAppointmentNumber() == null) {
            throw new IllegalArgumentException("Appointment number is required in BillRequestDTO");
        }

        Appointment appointment = appointmentRepository.findById(requestDTO.getAppointmentNumber())
                .orElseThrow(() -> new NoSuchElementException("Appointment not found with number: " + requestDTO.getAppointmentNumber()));

        double standardTreatmentCost = getTreatmentCost(appointment.getTreatmentType());
        double computedTotalCost = (requestDTO.getCustomTotalCost() != null && requestDTO.getCustomTotalCost() > 0)
                ? requestDTO.getCustomTotalCost()
                : (BASE_CONSULTATION_FEE + standardTreatmentCost);

        double derivedTreatmentCost = Math.max(0.0, computedTotalCost - BASE_CONSULTATION_FEE);

        Bill bill = billRepository.findByAppointmentAppointmentNumber(requestDTO.getAppointmentNumber())
                .orElse(null);

        if (bill == null) {
            bill = new Bill();
            bill.setAppointment(appointment);
            bill.setTotalCost(computedTotalCost);
            bill.setIssueDate(LocalDate.now());
        } else {
            bill.setTotalCost(computedTotalCost);
            bill.setIssueDate(LocalDate.now());
        }

        bill = billRepository.save(bill);

        return mapToReceiptDTO(bill, BASE_CONSULTATION_FEE, derivedTreatmentCost);
    }

    @Override
    @Transactional(readOnly = true)
    public BillReceiptDTO getBillReceipt(Long appointmentNumber) {
        if (appointmentNumber == null) {
            throw new IllegalArgumentException("Appointment number must not be null");
        }

        Bill bill = billRepository.findByAppointmentAppointmentNumber(appointmentNumber)
                .orElseThrow(() -> new NoSuchElementException("No bill found for appointment number: " + appointmentNumber));

        double treatmentCost = Math.max(0.0, bill.getTotalCost() - BASE_CONSULTATION_FEE);
        return mapToReceiptDTO(bill, BASE_CONSULTATION_FEE, treatmentCost);
    }

    @Override
    @Transactional(readOnly = true)
    public BillReceiptDTO getBillReceiptById(Long billId) {
        if (billId == null) {
            throw new IllegalArgumentException("Bill ID must not be null");
        }

        Bill bill = billRepository.findById(billId)
                .orElseThrow(() -> new NoSuchElementException("Bill not found with ID: " + billId));

        double treatmentCost = Math.max(0.0, bill.getTotalCost() - BASE_CONSULTATION_FEE);
        return mapToReceiptDTO(bill, BASE_CONSULTATION_FEE, treatmentCost);
    }

    @Override
    @Transactional(readOnly = true)
    public List<BillReceiptDTO> getAllBills() {
        return billRepository.findAll().stream()
                .map(b -> {
                    double treatmentCost = Math.max(0.0, b.getTotalCost() - BASE_CONSULTATION_FEE);
                    return mapToReceiptDTO(b, BASE_CONSULTATION_FEE, treatmentCost);
                })
                .collect(Collectors.toList());
    }

    @Override
    public Map<String, Object> calculateCostBreakdown(String treatmentType) {
        Map<String, Object> result = new LinkedHashMap<>();
        double treatmentCost = getTreatmentCost(treatmentType);
        double total = BASE_CONSULTATION_FEE + treatmentCost;

        result.put("treatmentType", treatmentType != null ? treatmentType : "General Consultation");
        result.put("baseConsultationFee", BASE_CONSULTATION_FEE);
        result.put("treatmentCost", treatmentCost);
        result.put("totalCost", total);
        result.put("currency", "LKR");
        return result;
    }

    private double getTreatmentCost(String treatmentType) {
        if (treatmentType == null || treatmentType.trim().isEmpty()) {
            return 2500.00; // Default procedure fee
        }
        String key = treatmentType.trim().toUpperCase();
        return TREATMENT_PRICE_MAP.getOrDefault(key, 3000.00);
    }

    private BillReceiptDTO mapToReceiptDTO(Bill bill, double baseFee, double treatmentCost) {
        Appointment appt = bill.getAppointment();

        BillReceiptDTO dto = new BillReceiptDTO();
        dto.setBillId(bill.getId());
        dto.setTotalCost(bill.getTotalCost());
        dto.setIssueDate(bill.getIssueDate());
        dto.setBaseConsultationFee(baseFee);
        dto.setTreatmentCost(treatmentCost);
        dto.setStatus("PAID");

        if (appt != null) {
            dto.setAppointmentNumber(appt.getAppointmentNumber());
            dto.setDentistName(appt.getDentistName());
            dto.setTreatmentType(appt.getTreatmentType());
            dto.setAppointmentDate(appt.getAppointmentDate());

            if (appt.getPatient() != null) {
                dto.setPatientId(appt.getPatient().getId());
                dto.setPatientName(appt.getPatient().getName());
                dto.setPatientAddress(appt.getPatient().getAddress());
                dto.setContactNumber(appt.getPatient().getContactNumber());
            }
        }

        return dto;
    }
}
