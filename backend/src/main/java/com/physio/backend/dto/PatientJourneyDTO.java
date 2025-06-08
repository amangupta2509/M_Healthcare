package com.physio.backend.dto;

import java.util.Map;

public class PatientJourneyDTO {
    private String mrn;
    private String name;
    private Map<String, Boolean> status; // e.g., registration, consultation, labReport, prescription
    private String labReportUrl;
    private String prescriptionUrl;

    // Getters and Setters
    public String getMrn() {
        return mrn;
    }
    public void setMrn(String mrn) {
        this.mrn = mrn;
    }

    public String getName() {
        return name;
    }
    public void setName(String name) {
        this.name = name;
    }

    public Map<String, Boolean> getStatus() {
        return status;
    }
    public void setStatus(Map<String, Boolean> status) {
        this.status = status;
    }

    public String getLabReportUrl() {
        return labReportUrl;
    }
    public void setLabReportUrl(String labReportUrl) {
        this.labReportUrl = labReportUrl;
    }

    public String getPrescriptionUrl() {
        return prescriptionUrl;
    }
    public void setPrescriptionUrl(String prescriptionUrl) {
        this.prescriptionUrl = prescriptionUrl;
    }
}
