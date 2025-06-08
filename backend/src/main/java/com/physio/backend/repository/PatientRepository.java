package com.physio.backend.repository;

import com.physio.backend.model.Patient;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PatientRepository extends JpaRepository<Patient, Long> {
    List<Patient> findByReportPdfUrlIsNotNull();
    Optional<Patient> findByMrn(String mrn);

}
