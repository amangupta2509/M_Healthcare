package com.physio.backend.model;

import jakarta.persistence.*;
import lombok.*;

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

    @ElementCollection
    @CollectionTable(name = "patient_charts", joinColumns = @JoinColumn(name = "patient_id"))
    @MapKeyColumn(name = "chart_index")
    @Column(name = "chart_data")
    private Map<String, String> charts;

    @ElementCollection
    @CollectionTable(name = "patient_assignments", joinColumns = @JoinColumn(name = "patient_id"))
    @MapKeyColumn(name = "role")
    @Column(name = "assigned")
    private Map<String, Boolean> assignedTo;
}

