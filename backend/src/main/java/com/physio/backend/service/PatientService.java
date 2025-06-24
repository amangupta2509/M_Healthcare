package com.physio.backend.service;

import com.physio.backend.model.Patient;
import com.physio.backend.repository.PatientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.time.LocalDate;
import java.time.LocalTime;

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

        if (updates.containsKey("lastVisitDate")) {
            patient.setLastVisitDate(LocalDate.parse(updates.get("lastVisitDate").toString()));
        }

        if (updates.containsKey("lastVisitTime")) {
            patient.setLastVisitTime(LocalTime.parse(updates.get("lastVisitTime").toString()));
        }

        if (updates.containsKey("summary")) {
            patient.setSummary(updates.get("summary").toString());
        }

        if (updates.containsKey("doctorNotes")) {
            patient.setDoctorNotes(updates.get("doctorNotes").toString());
        }

        if (updates.containsKey("recommendation")) {
            patient.setRecommendation(updates.get("recommendation").toString());
        }

        if (updates.containsKey("prescription")) {
            patient.setPrescription(updates.get("prescription").toString());
        }

        if (updates.containsKey("vitals")) {
            Map<String, String> vitalsMap = new HashMap<>();
            ((Map<?, ?>) updates.get("vitals")).forEach((k, v) ->
                    vitalsMap.put(String.valueOf(k), String.valueOf(v))
            );
            patient.setVitals(vitalsMap);
        }

        return repo.save(patient);
    }

}
