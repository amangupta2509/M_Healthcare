package com.physio.backend.service;

import com.physio.backend.model.Patient;
import com.physio.backend.repository.PatientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class PatientService {

    @Autowired
    private PatientRepository repo;

    public List<Patient> getAllWithReports() {
        return repo.findByReportPdfUrlIsNotNull();
    }

    public Patient create(Patient p) {
        return repo.save(p);
    }

    public List<Patient> getAll() {
        return repo.findAll();
    }

    // ✅ NEW: Get patient by MRN
    public Optional<Patient> getByMrn(String mrn) {
        return repo.findByMrn(mrn);
    }

    // ✅ NEW: Patch patient for assignment and charts
    public Patient patch(Long id, Map<String, Object> updates) {
        Patient patient = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Patient not found"));

        if (updates.containsKey("assignedTo")) {
            Map<String, Boolean> assignment = new HashMap<>();
            ((Map<?, ?>) updates.get("assignedTo")).forEach((k, v) ->
                    assignment.put(String.valueOf(k), Boolean.parseBoolean(v.toString()))
            );
            patient.setAssignedTo(assignment);
        }

        if (updates.containsKey("charts")) {
            Map<String, String> chartMap = new HashMap<>();
            ((Map<?, ?>) updates.get("charts")).forEach((k, v) ->
                    chartMap.put(String.valueOf(k), String.valueOf(v))
            );
            patient.setCharts(chartMap);
        }

        return repo.save(patient);
    }
}
