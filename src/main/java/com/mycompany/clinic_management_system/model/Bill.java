package com.mycompany.clinic_management_system.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.time.LocalDate;

/**
 * Entity representing billing invoices and receipts for appointments.
 */
@Entity
@Table(name = "bills")
public class Bill {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "Associated appointment is required")
    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "appointment_number", nullable = false, unique = true)
    private Appointment appointment;

    @NotNull(message = "Total cost cannot be null")
    @Positive(message = "Total cost must be greater than zero")
    @Column(name = "total_cost", nullable = false)
    private Double totalCost;

    @NotNull(message = "Issue date is required")
    @Column(name = "issue_date", nullable = false)
    private LocalDate issueDate;

    public Bill() {
    }

    public Bill(Long id, Appointment appointment, Double totalCost, LocalDate issueDate) {
        this.id = id;
        this.appointment = appointment;
        this.totalCost = totalCost;
        this.issueDate = issueDate;
    }

    public Bill(Appointment appointment, Double totalCost, LocalDate issueDate) {
        this.appointment = appointment;
        this.totalCost = totalCost;
        this.issueDate = issueDate;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Appointment getAppointment() {
        return appointment;
    }

    public void setAppointment(Appointment appointment) {
        this.appointment = appointment;
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
