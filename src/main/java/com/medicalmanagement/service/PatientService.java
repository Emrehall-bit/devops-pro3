package com.medicalmanagement.service;

import com.medicalmanagement.dto.PatientRequest;
import com.medicalmanagement.dto.PatientResponse;
import com.medicalmanagement.entity.Patient;
import com.medicalmanagement.exception.ResourceNotFoundException;
import com.medicalmanagement.repository.PatientRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class PatientService {

    private final PatientRepository patientRepository;

    @Transactional
    public PatientResponse createPatient(PatientRequest request) {
        Patient patient = Patient.builder()
                .name(request.name())
                .address(request.address())
                .telephone(request.telephone())
                .build();

        return mapToResponse(patientRepository.save(patient));
    }

    @Transactional(readOnly = true)
    public List<PatientResponse> getAllPatients() {
        return patientRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public PatientResponse getPatientById(Long id) {
        return mapToResponse(findPatientById(id));
    }

    @Transactional
    public void deletePatient(Long id) {
        Patient patient = findPatientById(id);
        patientRepository.delete(patient);
    }

    public Patient findPatientById(Long id) {
        return patientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with id: " + id));
    }

    private PatientResponse mapToResponse(Patient patient) {
        return new PatientResponse(
                patient.getId(),
                patient.getName(),
                patient.getAddress(),
                patient.getTelephone()
        );
    }
}
