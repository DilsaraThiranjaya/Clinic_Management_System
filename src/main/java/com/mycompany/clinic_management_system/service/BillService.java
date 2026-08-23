package com.mycompany.clinic_management_system.service;

import com.mycompany.clinic_management_system.dto.BillDTO;
import com.mycompany.clinic_management_system.dto.BillReceiptDTO;
import com.mycompany.clinic_management_system.dto.BillRequestDTO;
import com.mycompany.clinic_management_system.model.Bill;
import java.util.List;
import java.util.Map;

/**
 * Service interface for billing calculations, invoice generation, and receipt printing.
 */
public interface BillService {
    BillReceiptDTO calculateAndGenerateBill(Long appointmentNumber);
    BillReceiptDTO calculateAndGenerateBill(BillRequestDTO requestDTO);
    Bill generateBill(Long appointmentNumber);
    Bill generateBill(Long appointmentNumber, Double totalCost);
    Bill getBillById(Long id);
    BillDTO getBillDTO(Long id);
    BillReceiptDTO getBillReceipt(Long appointmentNumber);
    BillReceiptDTO getBillReceiptById(Long id);
    List<BillReceiptDTO> getAllBills();
    Map<String, Object> calculateCostBreakdown(String treatmentType);
    Double calculateCost(String treatmentType);
}
