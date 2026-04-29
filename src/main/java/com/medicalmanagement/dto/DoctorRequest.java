package com.medicalmanagement.dto;

import jakarta.validation.constraints.NotBlank;

public record DoctorRequest(
        @NotBlank(message = "Name must not be blank")
        String name,
        @NotBlank(message = "Clinic must not be blank")
        String clinic
) {
}
