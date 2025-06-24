package com.physio.backend.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Map;

@Entity
@Table(name = "patients")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Patient {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String mrn;

    @Column(name = "patient_condition")
    private String condition;

    private String reportPdfUrl;

    // ✅ Therapy/Diet/Nutrition chart mappings
    @ElementCollection
    @CollectionTable(name = "patient_charts", joinColumns = @JoinColumn(name = "patient_id"))
    @MapKeyColumn(name = "chart_index")
    @Column(name = "chart_data")
    private Map<String, String> charts;

    // ✅ Role assignments (physio/diet/nutrition)
    @ElementCollection
    @CollectionTable(name = "patient_assignments", joinColumns = @JoinColumn(name = "patient_id"))
    @MapKeyColumn(name = "role")
    @Column(name = "assigned")
    private Map<String, Boolean> assignedTo;

    // ✅ Doctor's last visit data
    private LocalDate lastVisitDate;
    private LocalTime lastVisitTime;
    private String summary;
    private String doctorNotes;
    private String recommendation;
    private String prescription; // PDF URL (prescription link)

    // ✅ Vitals stored as a key-value map
    @ElementCollection
    @CollectionTable(name = "patient_vitals", joinColumns = @JoinColumn(name = "patient_id"))
    @MapKeyColumn(name = "vital_name")
    @Column(name = "vital_value")
    private Map<String, String> vitals;
}