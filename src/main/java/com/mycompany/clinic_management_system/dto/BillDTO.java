package com.mycompany.clinic_management_system.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.time.LocalDate;

/**
 * Data Transfer Object for billing calculation and invoices.
 */
public class BillDTO {

    private Long id;

    @NotNull(message = "Appointment number is required")
    private Long appointmentNumber;

    private String patientName;

    private String dentistName;

    private String treatmentType;

    @NotNull(message = "Total cost is required")
    @Positive(message = "Total cost must be positive")
    private Double totalCost;

    @NotNull(message = "Issue date is required")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate issueDate;

    public BillDTO() {
    }

    public BillDTO(Long id, Long appointmentNumber, String patientName, String dentistName,
                   String treatmentType, Double totalCost, LocalDate issueDate) {
        this.id = id;
        this.appointmentNumber = appointmentNumber;
        this.patientName = patientName;
        this.dentistName = dentistName;
        this.treatmentType = treatmentType;
        this.totalCost = totalCost;
        this.issueDate = issueDate;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getAppointmentNumber() {
        return appointmentNumber;
    }

    public void setAppointmentNumber(Long appointmentNumber) {
        this.appointmentNumber = appointmentNumber;
    }

    public String getPatientName() {
        return patientName;
    }

    public void setPatientName(String patientName) {
        this.patientName = patientName;
    }

    public String getDentistName() {
        return dentistName;
    }

    public void setDentistName(String dentistName) {
        this.dentistName = dentistName;
    }

    public String getTreatmentType() {
        return treatmentType;
    }

    public void setTreatmentType(String treatmentType) {
        this.treatmentType = treatmentType;
    }

    public Double getTotalCost() {
        return totalCost;
    }

    public void setTotalCost(Double totalCost) {
        this.totalCost = totalCost;
    }

    public LocalDate getIssueDate() {
        return issueDate;
    }

    public void setIssueDate(LocalDate issueDate) {
        this.issueDate = issueDate;
    }
}
