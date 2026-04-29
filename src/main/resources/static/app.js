const state = {
    patients: [],
    doctors: [],
    appointments: []
};

const elements = {
    feedback: document.getElementById("feedback"),
    patientCount: document.getElementById("patientCount"),
    doctorCount: document.getElementById("doctorCount"),
    appointmentCount: document.getElementById("appointmentCount"),
    patientsTableBody: document.getElementById("patientsTableBody"),
    doctorsTableBody: document.getElementById("doctorsTableBody"),
    appointmentsTableBody: document.getElementById("appointmentsTableBody"),
    patientSelect: document.getElementById("patientSelect"),
    doctorSelect: document.getElementById("doctorSelect"),
    patientForm: document.getElementById("patientForm"),
    doctorForm: document.getElementById("doctorForm"),
    appointmentForm: document.getElementById("appointmentForm"),
    refreshAllButton: document.getElementById("refreshAllButton")
};

document.addEventListener("DOMContentLoaded", () => {
    bindEvents();
    refreshAll();
});

function bindEvents() {
    elements.patientForm.addEventListener("submit", handlePatientSubmit);
    elements.doctorForm.addEventListener("submit", handleDoctorSubmit);
    elements.appointmentForm.addEventListener("submit", handleAppointmentSubmit);
    elements.refreshAllButton.addEventListener("click", refreshAll);
}

async function refreshAll() {
    try {
        setFeedback("Veriler yukleniyor...");
        const [patients, doctors, appointments] = await Promise.all([
            request("/api/patients"),
            request("/api/doctors"),
            request("/api/appointments")
        ]);

        state.patients = patients;
        state.doctors = doctors;
        state.appointments = appointments;

        renderPatients();
        renderDoctors();
        renderAppointments();
        renderSelectOptions();
        renderStats();
        setFeedback("Veriler guncellendi.", "success");
    } catch (error) {
        setFeedback(error.message, "error");
    }
}

async function handlePatientSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const payload = {
        name: formData.get("name")?.toString().trim(),
        address: formData.get("address")?.toString().trim(),
        telephone: formData.get("telephone")?.toString().trim()
    };

    await submitForm(event.currentTarget, "/api/patients", payload, "Hasta kaydi olusturuldu.");
}

async function handleDoctorSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const payload = {
        name: formData.get("name")?.toString().trim(),
        clinic: formData.get("clinic")?.toString().trim()
    };

    await submitForm(event.currentTarget, "/api/doctors", payload, "Doktor kaydi olusturuldu.");
}

async function handleAppointmentSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const payload = {
        patientId: Number(formData.get("patientId")),
        doctorId: Number(formData.get("doctorId")),
        appointmentDate: formData.get("appointmentDate"),
        appointmentTime: normalizeTime(formData.get("appointmentTime"))
    };

    await submitForm(event.currentTarget, "/api/appointments", payload, "Randevu olusturuldu.");
}

async function submitForm(form, url, payload, successMessage) {
    try {
        setFeedback("Kayit isleniyor...");
        await request(url, {
            method: "POST",
            body: JSON.stringify(payload)
        });
        form.reset();
        await refreshAll();
        setFeedback(successMessage, "success");
    } catch (error) {
        setFeedback(error.message, "error");
    }
}

async function deleteItem(type, id) {
    const endpointMap = {
        patient: "/api/patients/",
        doctor: "/api/doctors/",
        appointment: "/api/appointments/"
    };

    try {
        setFeedback("Kayit siliniyor...");
        await request(`${endpointMap[type]}${id}`, { method: "DELETE" });
        await refreshAll();
        setFeedback("Kayit silindi.", "success");
    } catch (error) {
        setFeedback(error.message, "error");
    }
}

function renderPatients() {
    renderTable(
        elements.patientsTableBody,
        state.patients,
        (patient) => `
            <tr>
                <td>${patient.id}</td>
                <td>${escapeHtml(patient.name)}</td>
                <td>${escapeHtml(patient.address || "-")}</td>
                <td>${escapeHtml(patient.telephone)}</td>
                <td><button class="danger-button" type="button" data-type="patient" data-id="${patient.id}">Sil</button></td>
            </tr>
        `,
        5
    );
}

function renderDoctors() {
    renderTable(
        elements.doctorsTableBody,
        state.doctors,
        (doctor) => `
            <tr>
                <td>${doctor.id}</td>
                <td>${escapeHtml(doctor.name)}</td>
                <td>${escapeHtml(doctor.clinic)}</td>
                <td><button class="danger-button" type="button" data-type="doctor" data-id="${doctor.id}">Sil</button></td>
            </tr>
        `,
        4
    );
}

function renderAppointments() {
    renderTable(
        elements.appointmentsTableBody,
        state.appointments,
        (appointment) => `
            <tr>
                <td>${appointment.id}</td>
                <td>${escapeHtml(appointment.patientName)}</td>
                <td>${escapeHtml(appointment.doctorName)}</td>
                <td>${escapeHtml(formatDate(appointment.appointmentDate))}</td>
                <td>${escapeHtml(formatTime(appointment.appointmentTime))}</td>
                <td><button class="danger-button" type="button" data-type="appointment" data-id="${appointment.id}">Sil</button></td>
            </tr>
        `,
        6
    );
}

function renderTable(tableBody, items, rowTemplate, columnCount) {
    if (!items.length) {
        tableBody.innerHTML = `<tr class="empty-row"><td colspan="${columnCount}">Kayit bulunamadi.</td></tr>`;
    } else {
        tableBody.innerHTML = items.map(rowTemplate).join("");
    }

    tableBody.querySelectorAll("button[data-id]").forEach((button) => {
        button.addEventListener("click", () => deleteItem(button.dataset.type, button.dataset.id));
    });
}

function renderSelectOptions() {
    elements.patientSelect.innerHTML = '<option value="">Hasta secin</option>' + state.patients
        .map((patient) => `<option value="${patient.id}">${escapeHtml(patient.name)} (#${patient.id})</option>`)
        .join("");

    elements.doctorSelect.innerHTML = '<option value="">Doktor secin</option>' + state.doctors
        .map((doctor) => `<option value="${doctor.id}">${escapeHtml(doctor.name)} - ${escapeHtml(doctor.clinic)}</option>`)
        .join("");
}

function renderStats() {
    elements.patientCount.textContent = state.patients.length;
    elements.doctorCount.textContent = state.doctors.length;
    elements.appointmentCount.textContent = state.appointments.length;
}

async function request(url, options = {}) {
    const response = await fetch(url, {
        headers: {
            "Content-Type": "application/json",
            ...(options.headers || {})
        },
        ...options
    });

    if (!response.ok) {
        const errorMessage = await extractError(response);
        throw new Error(errorMessage);
    }

    if (response.status === 204) {
        return null;
    }

    return response.json();
}

async function extractError(response) {
    try {
        const data = await response.json();
        if (typeof data === "string") {
            return data;
        }
        if (data.message) {
            return data.message;
        }
        return JSON.stringify(data);
    } catch {
        return `Istek basarisiz oldu (${response.status}).`;
    }
}

function setFeedback(message, type = "") {
    elements.feedback.textContent = message;
    elements.feedback.className = "feedback";
    if (type) {
        elements.feedback.classList.add(`is-${type}`);
    }
}

function formatDate(dateString) {
    if (!dateString) {
        return "-";
    }
    return new Intl.DateTimeFormat("tr-TR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
    }).format(new Date(`${dateString}T00:00:00`));
}

function formatTime(timeString) {
    if (!timeString) {
        return "-";
    }
    return timeString.slice(0, 5);
}

function normalizeTime(value) {
    return value && value.length === 5 ? `${value}:00` : value;
}

function escapeHtml(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}
