package com.physio.backend.controller;

import com.physio.backend.dto.PatientJourneyDTO;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/patient-journey")
@CrossOrigin(origins = "*")
public class PatientJourneyController {

    @GetMapping("/{mrn}")
    public ResponseEntity<?> getPatientJourney(@PathVariable String mrn) {
        // Mock DB logic — Replace this with real DB queries later
        if (!mrn.equalsIgnoreCase("MRN123456")) {
            return ResponseEntity.notFound().build();
        }

        PatientJourneyDTO dto = new PatientJourneyDTO();
        dto.setMrn("MRN123456");
        dto.setName("John Doe");

        Map<String, Boolean> statusMap = new HashMap<>();
        statusMap.put("registration", true);
        statusMap.put("consultation", true);
        statusMap.put("labReport", true);
        statusMap.put("prescription", false);
        dto.setStatus(statusMap);

        dto.setLabReportUrl("/pdfs/MRN123456_labreport.pdf");
        dto.setPrescriptionUrl("/prescriptions/MRN123456_prescription.pdf");

        return ResponseEntity.ok(dto);
    }
}
