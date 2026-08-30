package com.mycompany.clinic_management_system.controller;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.mycompany.clinic_management_system.dto.BillReceiptDTO;
import com.mycompany.clinic_management_system.exception.GlobalExceptionHandler;
import com.mycompany.clinic_management_system.exception.ResourceNotFoundException;
import com.mycompany.clinic_management_system.security.JwtAuthenticationEntryPoint;
import com.mycompany.clinic_management_system.security.JwtUtils;
import com.mycompany.clinic_management_system.service.BillService;
import com.mycompany.clinic_management_system.service.impl.CustomUserDetailsService;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

/**
 * Controller tests for Billing and Invoice endpoints.
 */
@WebMvcTest(controllers = BillController.class)
@AutoConfigureMockMvc(addFilters = false)
@Import(GlobalExceptionHandler.class)
public class BillControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private BillService billService;

    @MockBean
    private JwtUtils jwtUtils;

    @MockBean
    private JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;

    @MockBean
    private CustomUserDetailsService customUserDetailsService;

    @Test
    @DisplayName("TC-CTRL-BILL-01: POST /api/bills/generate/{id} returns 201 Created and Receipt DTO")
    void testGenerateBill_ValidAppointment_ReturnsCreated() throws Exception {
        BillReceiptDTO receipt = new BillReceiptDTO(
                1L, 101L, 1L, "John Perera", "No. 45 Galle Road", "0771234567",
                "Dr. Samantha Fernando", "Teeth Cleaning", 1500.00, 2500.00, 4000.00,
                LocalDate.now(), LocalDate.now()
        );

        when(billService.calculateAndGenerateBill(101L)).thenReturn(receipt);

        mockMvc.perform(post("/api/bills/generate/101")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.billId").value(1))
                .andExpect(jsonPath("$.totalCost").value(4000.00))
                .andExpect(jsonPath("$.clinicName").value("Sunrise Dental Clinic"));
    }

    @Test
    @DisplayName("TC-CTRL-BILL-02: GET /api/bills/receipt/{id} returns printable receipt")
    void testGetBillReceipt_ValidAppointment_ReturnsReceipt() throws Exception {
        BillReceiptDTO receipt = new BillReceiptDTO(
                1L, 101L, 1L, "John Perera", "No. 45 Galle Road", "0771234567",
                "Dr. Samantha Fernando", "Teeth Cleaning", 1500.00, 2500.00, 4000.00,
                LocalDate.now(), LocalDate.now()
        );

        when(billService.getBillReceipt(101L)).thenReturn(receipt);

        mockMvc.perform(get("/api/bills/receipt/101"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalCost").value(4000.00))
                .andExpect(jsonPath("$.treatmentCost").value(2500.00));
    }

    @Test
    @DisplayName("TC-CTRL-BILL-03: GET /api/bills/receipt/{id} with missing bill returns 404 Not Found")
    void testGetBillReceipt_NotFound_ReturnsNotFound() throws Exception {
        when(billService.getBillReceipt(999L))
                .thenThrow(new ResourceNotFoundException("No bill found for appointment: 999"));

        mockMvc.perform(get("/api/bills/receipt/999"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("No bill found for appointment: 999"));
    }

    @Test
    @DisplayName("TC-CTRL-BILL-04: GET /api/bills/calculate returns treatment breakdown")
    void testCalculateCost_ReturnsBreakdown() throws Exception {
        Map<String, Object> breakdown = Map.of(
                "treatmentType", "Root Canal",
                "baseConsultationFee", 1500.00,
                "treatmentSpecificCost", 15000.00,
                "totalCalculatedCost", 16500.00,
                "currency", "LKR"
        );

        when(billService.calculateCostBreakdown("Root Canal")).thenReturn(breakdown);

        mockMvc.perform(get("/api/bills/calculate?treatmentType=Root Canal"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalCalculatedCost").value(16500.00))
                .andExpect(jsonPath("$.currency").value("LKR"));
    }

    @Test
    @DisplayName("TC-CTRL-BILL-05: GET /api/bills/{id} with valid id returns 200 OK")
    void testGetBillById_ReturnsOk() throws Exception {
        BillReceiptDTO receipt = new BillReceiptDTO(
                1L, 101L, 1L, "John Perera", "No. 45 Galle Road", "0771234567",
                "Dr. Samantha Fernando", "Teeth Cleaning", 1500.00, 2500.00, 4000.00,
                LocalDate.now(), LocalDate.now()
        );

        when(billService.getBillReceiptById(1L)).thenReturn(receipt);

        mockMvc.perform(get("/api/bills/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.billId").value(1));
    }

    @Test
    @DisplayName("TC-CTRL-BILL-06: GET /api/bills returns all generated invoices")
    void testGetAllBills_ReturnsList() throws Exception {
        BillReceiptDTO receipt = new BillReceiptDTO(
                1L, 101L, 1L, "John Perera", "No. 45 Galle Road", "0771234567",
                "Dr. Samantha Fernando", "Teeth Cleaning", 1500.00, 2500.00, 4000.00,
                LocalDate.now(), LocalDate.now()
        );

        when(billService.getAllBills()).thenReturn(List.of(receipt));

        mockMvc.perform(get("/api/bills"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));
    }
}
