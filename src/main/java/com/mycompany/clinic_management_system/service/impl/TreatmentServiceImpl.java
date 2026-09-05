package com.mycompany.clinic_management_system.service.impl;

import com.mycompany.clinic_management_system.dto.TreatmentDTO;
import com.mycompany.clinic_management_system.exception.ResourceNotFoundException;
import com.mycompany.clinic_management_system.model.Treatment;
import com.mycompany.clinic_management_system.repository.TreatmentRepository;
import com.mycompany.clinic_management_system.service.TreatmentService;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service implementation managing clinical treatments and dynamic pricing.
 */
@Service
@Transactional
public class TreatmentServiceImpl implements TreatmentService {

    private final TreatmentRepository treatmentRepository;

    public TreatmentServiceImpl(TreatmentRepository treatmentRepository) {
        this.treatmentRepository = treatmentRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<Treatment> getAllTreatments() {
        return treatmentRepository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public Treatment getTreatmentById(Long id) {
        return treatmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Treatment not found with id: " + id));
    }

    @Override
    @Transactional(readOnly = true)
    public Treatment getTreatmentByName(String name) {
        return treatmentRepository.findByNameIgnoreCase(name)
                .orElseThrow(() -> new ResourceNotFoundException("Treatment not found with name: " + name));
    }

    @Override
    public Treatment createTreatment(TreatmentDTO dto) {
        if (treatmentRepository.existsByNameIgnoreCase(dto.getName().trim())) {
            throw new IllegalArgumentException("Treatment with name '" + dto.getName() + "' already exists");
        }

        Treatment treatment = new Treatment(
                dto.getName().trim(),
                dto.getPrice(),
                dto.getDescription() != null ? dto.getDescription().trim() : null
        );
        return treatmentRepository.save(treatment);
    }

    @Override
    public Treatment updateTreatment(Long id, TreatmentDTO dto) {
        Treatment existing = getTreatmentById(id);

        if (!existing.getName().equalsIgnoreCase(dto.getName().trim())
                && treatmentRepository.existsByNameIgnoreCase(dto.getName().trim())) {
            throw new IllegalArgumentException("Treatment with name '" + dto.getName() + "' already exists");
        }

        existing.setName(dto.getName().trim());
        existing.setPrice(dto.getPrice());
        if (dto.getDescription() != null) {
            existing.setDescription(dto.getDescription().trim());
        }

        return treatmentRepository.save(existing);
    }

    @Override
    public void deleteTreatment(Long id) {
        Treatment existing = getTreatmentById(id);
        treatmentRepository.delete(existing);
    }
}
