package com.physio.backend.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "appointments")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Appointment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String patientName;
    private String mrn;
    private String appointmentType; // "Online" or "In-Person"
    private LocalDate date;
    private LocalTime time;
    private String notes;
    private String status; // "Pending", "Approved", "Completed"
    private String meetingLink; // only for online

    private String role; // e.g., "doctor", "counselor"
}
