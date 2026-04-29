package com.medicalmanagement.dto;

import java.time.LocalDate;
import java.time.LocalTime;

public record AppointmentResponse(
        Long id,
        Long patientId,
        String patientName,
        Long doctorId,
        String doctorName,
        LocalDate appointmentDate,
        LocalTime appointmentTime
) {
}
