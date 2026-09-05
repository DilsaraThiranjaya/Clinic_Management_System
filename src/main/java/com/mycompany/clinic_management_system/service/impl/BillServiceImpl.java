package com.mycompany.clinic_management_system.service.impl;

import com.mycompany.clinic_management_system.dto.BillDTO;
import com.mycompany.clinic_management_system.dto.BillReceiptDTO;
import com.mycompany.clinic_management_system.dto.BillRequestDTO;
import com.mycompany.clinic_management_system.exception.ResourceNotFoundException;
import com.mycompany.clinic_management_system.model.Appointment;
import com.mycompany.clinic_management_system.model.Bill;
import com.mycompany.clinic_management_system.repository.AppointmentRepository;
import com.mycompany.clinic_management_system.repository.BillRepository;
import com.mycompany.clinic_management_system.repository.TreatmentRepository;
import com.mycompany.clinic_management_system.service.BillService;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Implementation of BillService managing billing calculations, invoices, and receipt printing.
 */
@Service
@Transactional
public class BillServiceImpl implements BillService {

    public static final double BASE_CONSULTATION_FEE = 1500.00;

    private final BillRepository billRepository;
    private final AppointmentRepository appointmentRepository;
    private TreatmentRepository treatmentRepository;

    public BillServiceImpl(BillRepository billRepository, AppointmentRepository appointmentRepository) {
        this.billRepository = billRepository;
        this.appointmentRepository = appointmentRepository;
    }

    @Autowired
    public BillServiceImpl(BillRepository billRepository,
                           AppointmentRepository appointmentRepository,
                           TreatmentRepository treatmentRepository) {
        this.billRepository = billRepository;
        this.appointmentRepository = appointmentRepository;
        this.treatmentRepository = treatmentRepository;
    }

    @Override
    public BillReceiptDTO calculateAndGenerateBill(Long appointmentNumber) {
        Appointment appointment = appointmentRepository.findById(appointmentNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with number: " + appointmentNumber));

        double treatmentCost = getTreatmentSpecificCost(appointment.getTreatmentType());
        double totalCost = BASE_CONSULTATION_FEE + treatmentCost;

        Bill bill = billRepository.findByAppointmentAppointmentNumber(appointmentNumber)
                .map(existing -> {
                    existing.setTotalCost(totalCost);
                    existing.setIssueDate(LocalDate.now());
                    return billRepository.save(existing);
                })
                .orElseGet(() -> billRepository.save(new Bill(appointment, totalCost, LocalDate.now())));

        return toReceiptDTO(bill, BASE_CONSULTATION_FEE, treatmentCost);
    }

    @Override
    public BillReceiptDTO calculateAndGenerateBill(BillRequestDTO requestDTO) {
        Appointment appointment = appointmentRepository.findById(requestDTO.getAppointmentNumber())
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with number: " + requestDTO.getAppointmentNumber()));

        double treatmentCost = getTreatmentSpecificCost(appointment.getTreatmentType());
        double totalCost = (requestDTO.getCustomTotalCost() != null && requestDTO.getCustomTotalCost() > 0)
                ? requestDTO.getCustomTotalCost()
                : (BASE_CONSULTATION_FEE + treatmentCost);

        Bill bill = billRepository.findByAppointmentAppointmentNumber(requestDTO.getAppointmentNumber())
                .map(existing -> {
                    existing.setTotalCost(totalCost);
                    existing.setIssueDate(LocalDate.now());
                    return billRepository.save(existing);
                })
                .orElseGet(() -> billRepository.save(new Bill(appointment, totalCost, LocalDate.now())));

        return toReceiptDTO(bill, BASE_CONSULTATION_FEE, treatmentCost);
    }

    @Override
    public Bill generateBill(Long appointmentNumber) {
        Appointment appointment = appointmentRepository.findById(appointmentNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with number: " + appointmentNumber));

        return billRepository.findByAppointmentAppointmentNumber(appointmentNumber)
                .orElseGet(() -> {
                    Double totalCost = calculateCost(appointment.getTreatmentType());
                    Bill bill = new Bill(appointment, totalCost, LocalDate.now());
                    return billRepository.save(bill);
                });
    }

    @Override
    public Bill generateBill(Long appointmentNumber, Double totalCost) {
        Appointment appointment = appointmentRepository.findById(appointmentNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with number: " + appointmentNumber));

        return billRepository.findByAppointmentAppointmentNumber(appointmentNumber)
                .map(existing -> {
                    existing.setTotalCost(totalCost);
                    existing.setIssueDate(LocalDate.now());
                    return billRepository.save(existing);
                })
                .orElseGet(() -> {
                    Bill bill = new Bill(appointment, totalCost, LocalDate.now());
                    return billRepository.save(bill);
                });
    }

    @Override
    @Transactional(readOnly = true)
    public Bill getBillById(Long id) {
        return billRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Bill not found with id: " + id));
    }

    @Override
    @Transactional(readOnly = true)
    public BillDTO getBillDTO(Long id) {
        Bill bill = getBillById(id);
        return new BillDTO(
                bill.getId(),
                bill.getAppointment().getAppointmentNumber(),
                bill.getAppointment().getPatient().getName(),
                bill.getAppointment().getDentistName(),
                bill.getAppointment().getTreatmentType(),
                bill.getTotalCost(),
                bill.getIssueDate()
        );
    }

    @Override
    @Transactional(readOnly = true)
    public BillReceiptDTO getBillReceipt(Long appointmentNumber) {
        Bill bill = billRepository.findByAppointmentAppointmentNumber(appointmentNumber)
                .orElseThrow(() -> new ResourceNotFoundException("No bill found for appointment: " + appointmentNumber));

        double treatmentCost = getTreatmentSpecificCost(bill.getAppointment().getTreatmentType());
        return toReceiptDTO(bill, BASE_CONSULTATION_FEE, treatmentCost);
    }

    @Override
    @Transactional(readOnly = true)
    public BillReceiptDTO getBillReceiptById(Long id) {
        Bill bill = getBillById(id);
        double treatmentCost = getTreatmentSpecificCost(bill.getAppointment().getTreatmentType());
        return toReceiptDTO(bill, BASE_CONSULTATION_FEE, treatmentCost);
    }

    @Override
    @Transactional(readOnly = true)
    public List<BillReceiptDTO> getAllBills() {
        return billRepository.findAll().stream()
                .map(bill -> {
                    double treatmentCost = getTreatmentSpecificCost(bill.getAppointment().getTreatmentType());
                    return toReceiptDTO(bill, BASE_CONSULTATION_FEE, treatmentCost);
                })
                .collect(Collectors.toList());
    }

    @Override
    public Map<String, Object> calculateCostBreakdown(String treatmentType) {
        double treatmentCost = getTreatmentSpecificCost(treatmentType);
        double totalCost = BASE_CONSULTATION_FEE + treatmentCost;

        List<Map<String, Object>> itemizedTreatments = new java.util.ArrayList<>();
        if (treatmentType != null && !treatmentType.isBlank()) {
            for (String single : treatmentType.split(",")) {
                String trimmed = single.trim();
                if (!trimmed.isEmpty()) {
                    itemizedTreatments.add(Map.of(
                            "name", trimmed,
                            "cost", getSingleTreatmentCost(trimmed)
                    ));
                }
            }
        }

        return Map.of(
                "treatmentType", treatmentType != null ? treatmentType : "General Consultation",
                "baseConsultationFee", BASE_CONSULTATION_FEE,
                "treatmentSpecificCost", treatmentCost,
                "totalCalculatedCost", totalCost,
                "currency", "LKR",
                "itemizedTreatments", itemizedTreatments
        );
    }

    @Override
    public Double calculateCost(String treatmentType) {
        return BASE_CONSULTATION_FEE + getTreatmentSpecificCost(treatmentType);
    }

    private double getTreatmentSpecificCost(String treatmentType) {
        if (treatmentType == null || treatmentType.isBlank()) {
            return 0.0;
        }

        if (treatmentType.contains(",")) {
            return java.util.Arrays.stream(treatmentType.split(","))
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .mapToDouble(this::getSingleTreatmentCost)
                    .sum();
        }

        return getSingleTreatmentCost(treatmentType.trim());
    }

    private double getSingleTreatmentCost(String singleTreatment) {
        if (singleTreatment == null || singleTreatment.isBlank()) {
            return 0.0;
        }

        if (treatmentRepository != null) {
            var opt = treatmentRepository.findByNameIgnoreCase(singleTreatment.trim());
            if (opt.isPresent()) {
                return opt.get().getPrice();
            }
        }

        return switch (singleTreatment.trim().toLowerCase()) {
            case "cleaning", "teeth cleaning" -> 2500.00;
            case "filling", "dental filling" -> 3500.00;
            case "extraction", "tooth extraction" -> 4500.00;
            case "whitening", "teeth whitening" -> 8000.00;
            case "root canal", "root canal treatment" -> 15000.00;
            case "braces", "orthodontics", "orthodontics (braces)" -> 45000.00;
            default -> 2000.00;
        };
    }

    private BillReceiptDTO toReceiptDTO(Bill bill, double baseFee, double treatmentCost) {
        return new BillReceiptDTO(
                bill.getId(),
                bill.getAppointment().getAppointmentNumber(),
                bill.getAppointment().getPatient().getId(),
                bill.getAppointment().getPatient().getName(),
                bill.getAppointment().getPatient().getAddress(),
                bill.getAppointment().getPatient().getContactNumber(),
                bill.getAppointment().getDentistName(),
                bill.getAppointment().getTreatmentType(),
                baseFee,
                treatmentCost,
                bill.getTotalCost(),
                bill.getIssueDate(),
                bill.getAppointment().getAppointmentDate()
        );
    }
}
