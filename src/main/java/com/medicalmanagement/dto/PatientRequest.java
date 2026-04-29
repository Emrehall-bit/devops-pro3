package com.medicalmanagement.dto;

import jakarta.validation.constraints.NotBlank;

public record PatientRequest(
        @NotBlank(message = "Name must not be blank")
        String name,
        String address,
        @NotBlank(message = "Telephone must not be blank")
        String telephone
) {
}
