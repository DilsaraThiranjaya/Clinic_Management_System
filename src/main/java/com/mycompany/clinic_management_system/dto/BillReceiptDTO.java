package com.mycompany.clinic_management_system.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import java.time.LocalDate;

/**
 * Data Transfer Object representing a printable patient bill and receipt.
 */
public class BillReceiptDTO {

    private String clinicName = "Sunrise Dental Clinic";
    private String clinicAddress = "No. 120 Galle Road, Colombo 03, Sri Lanka";
    private String clinicPhone = "+94 11 234 5678";

    private Long billId;
    private Long appointmentNumber;
    private Long patientId;
    private String patientName;
    private String patientAddress;
    private String contactNumber;
    private String dentistName;
    private String treatmentType;

    private Double baseConsultationFee;
    private Double treatmentCost;
    private Double totalCost;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate issueDate;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate appointmentDate;

    private String status = "PAID";

    public BillReceiptDTO() {
    }

    public BillReceiptDTO(Long billId, Long appointmentNumber, Long patientId, String patientName,
                          String patientAddress, String contactNumber, String dentistName,
                          String treatmentType, Double baseConsultationFee, Double treatmentCost,
                          Double totalCost, LocalDate issueDate, LocalDate appointmentDate) {
        this.billId = billId;
        this.appointmentNumber = appointmentNumber;
        this.patientId = patientId;
        this.patientName = patientName;
        this.patientAddress = patientAddress;
        this.contactNumber = contactNumber;
        this.dentistName = dentistName;
        this.treatmentType = treatmentType;
        this.baseConsultationFee = baseConsultationFee;
        this.treatmentCost = treatmentCost;
        this.totalCost = totalCost;
        this.issueDate = issueDate;
        this.appointmentDate = appointmentDate;
        this.status = "PAID";
    }

    public String getClinicName() {
        return clinicName;
    }

    public void setClinicName(String clinicName) {
        this.clinicName = clinicName;
    }

    public String getClinicAddress() {
        return clinicAddress;
    }

    public void setClinicAddress(String clinicAddress) {
        this.clinicAddress = clinicAddress;
    }

    public String getClinicPhone() {
        return clinicPhone;
    }

    public void setClinicPhone(String clinicPhone) {
        this.clinicPhone = clinicPhone;
    }

    public Long getBillId() {
        return billId;
    }

    public void setBillId(Long billId) {
        this.billId = billId;
    }

    public Long getAppointmentNumber() {
        return appointmentNumber;
    }

    public void setAppointmentNumber(Long appointmentNumber) {
        this.appointmentNumber = appointmentNumber;
    }

    public Long getPatientId() {
        return patientId;
    }

    public void setPatientId(Long patientId) {
        this.patientId = patientId;
    }

    public String getPatientName() {
        return patientName;
    }

    public void setPatientName(String patientName) {
        this.patientName = patientName;
    }

    public String getPatientAddress() {
        return patientAddress;
    }

    public void setPatientAddress(String patientAddress) {
        this.patientAddress = patientAddress;
    }

    public String getContactNumber() {
        return contactNumber;
    }

    public void setContactNumber(String contactNumber) {
        this.contactNumber = contactNumber;
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

    public Double getBaseConsultationFee() {
        return baseConsultationFee;
    }

    public void setBaseConsultationFee(Double baseConsultationFee) {
        this.baseConsultationFee = baseConsultationFee;
    }

    public Double getTreatmentCost() {
        return treatmentCost;
    }

    public void setTreatmentCost(Double treatmentCost) {
        this.treatmentCost = treatmentCost;
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

    public LocalDate getAppointmentDate() {
        return appointmentDate;
    }

    public void setAppointmentDate(LocalDate appointmentDate) {
        this.appointmentDate = appointmentDate;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
