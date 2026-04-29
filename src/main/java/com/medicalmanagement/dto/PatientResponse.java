package com.medicalmanagement.dto;

public record PatientResponse(
        Long id,
        String name,
        String address,
        String telephone
) {
}
