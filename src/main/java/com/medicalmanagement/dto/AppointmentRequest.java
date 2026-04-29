package com.medicalmanagement.dto;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.time.LocalTime;

public record AppointmentRequest(
        @NotNull(message = "Patient ID must not be null")
        Long patientId,
        @NotNull(message = "Doctor ID must not be null")
        Long doctorId,
        @NotNull(message = "Appointment date must not be null")
        LocalDate appointmentDate,
        @NotNull(message = "Appointment time must not be null")
        LocalTime appointmentTime
) {
}
