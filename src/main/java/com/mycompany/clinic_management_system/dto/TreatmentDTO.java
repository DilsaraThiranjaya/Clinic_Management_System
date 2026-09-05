package com.mycompany.clinic_management_system.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

/**
 * Data Transfer Object for Treatment operations and pricing.
 */
public class TreatmentDTO {

    private Long id;

    @NotBlank(message = "Treatment name is required")
    @Size(min = 2, max = 100, message = "Treatment name must be between 2 and 100 characters")
    private String name;

    @NotNull(message = "Treatment price is required")
    @Positive(message = "Treatment price must be positive")
    private Double price;

    private String description;

    public TreatmentDTO() {
    }

    public TreatmentDTO(Long id, String name, Double price, String description) {
        this.id = id;
        this.name = name;
        this.price = price;
        this.description = description;
    }

    public TreatmentDTO(String name, Double price, String description) {
        this.name = name;
        this.price = price;
        this.description = description;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Double getPrice() {
        return price;
    }

    public void setPrice(Double price) {
        this.price = price;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}
