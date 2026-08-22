package com.mycompany.clinic_management_system.service;

import com.mycompany.clinic_management_system.dto.BillReceiptDTO;
import com.mycompany.clinic_management_system.dto.BillRequestDTO;
import java.util.List;
import java.util.Map;

/**
 * Service interface for Billing, cost calculation, and printable receipt generation.
 */
public interface BillService {

    BillReceiptDTO calculateAndGenerateBill(Long appointmentNumber);

    BillReceiptDTO calculateAndGenerateBill(BillRequestDTO requestDTO);

    BillReceiptDTO getBillReceipt(Long appointmentNumber);

    BillReceiptDTO getBillReceiptById(Long billId);

    List<BillReceiptDTO> getAllBills();

    Map<String, Object> calculateCostBreakdown(String treatmentType);
}
