package com.mycompany.clinic_management_system.controller;

import com.mycompany.clinic_management_system.dto.BillReceiptDTO;
import com.mycompany.clinic_management_system.dto.BillRequestDTO;
import com.mycompany.clinic_management_system.service.BillService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * REST Controller exposing billing, cost calculation, and printable invoice endpoints.
 */
@RestController
@RequestMapping("/api/bills")
@CrossOrigin(origins = "*")
public class BillController {

    private final BillService billService;

    public BillController(BillService billService) {
        this.billService = billService;
    }

    @PostMapping("/generate/{appointmentNumber}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<BillReceiptDTO> generateBillForAppointment(@PathVariable("appointmentNumber") Long appointmentNumber) {
        BillReceiptDTO receipt = billService.calculateAndGenerateBill(appointmentNumber);
        return new ResponseEntity<>(receipt, HttpStatus.CREATED);
    }

    @PostMapping("/generate")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<BillReceiptDTO> generateBillCustom(@Valid @RequestBody BillRequestDTO requestDTO) {
        BillReceiptDTO receipt = billService.calculateAndGenerateBill(requestDTO);
        return new ResponseEntity<>(receipt, HttpStatus.CREATED);
    }

    @GetMapping("/receipt/{appointmentNumber}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF', 'PATIENT')")
    public ResponseEntity<BillReceiptDTO> printBillReceipt(@PathVariable("appointmentNumber") Long appointmentNumber) {
        BillReceiptDTO receipt = billService.getBillReceipt(appointmentNumber);
        return ResponseEntity.ok(receipt);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF', 'PATIENT')")
    public ResponseEntity<BillReceiptDTO> getBillById(@PathVariable("id") Long id) {
        BillReceiptDTO receipt = billService.getBillReceiptById(id);
        return ResponseEntity.ok(receipt);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<List<BillReceiptDTO>> getAllBills() {
        List<BillReceiptDTO> list = billService.getAllBills();
        return ResponseEntity.ok(list);
    }

    @GetMapping("/calculate")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF', 'PATIENT')")
    public ResponseEntity<Map<String, Object>> calculateCost(@RequestParam(value = "treatmentType", required = false) String treatmentType) {
        Map<String, Object> breakdown = billService.calculateCostBreakdown(treatmentType);
        return ResponseEntity.ok(breakdown);
    }
}
