package com.physio.backend.controller;

import com.physio.backend.model.Patient;
import com.physio.backend.service.PatientService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/patients")
@CrossOrigin(origins = "*")
public class PatientController {

    @Autowired
    private PatientService service;

    @GetMapping("/withReports")
    public List<Patient> getWithReports() {
        return service.getAllWithReports();
    }

    @PostMapping
    public Patient create(@RequestBody Patient p) {
        return service.create(p);
    }

    @GetMapping
    public List<Patient> getAll() {
        return service.getAll();
    }

    // ✅ NEW: Fetch patient by MRN
    @GetMapping(params = "mrn")
    public ResponseEntity<Patient> getByMrn(@RequestParam String mrn) {
        return service.getByMrn(mrn)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // ✅ NEW: Patch patient (assignments, charts)
    @PatchMapping("/{id}")
    public Patient patchPatient(@PathVariable Long id, @RequestBody Map<String, Object> updates) {
        return service.patch(id, updates);
    }
}
