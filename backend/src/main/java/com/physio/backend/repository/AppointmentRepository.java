package com.physio.backend.repository;

import com.physio.backend.model.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    List<Appointment> findByRoleAndStatusIgnoreCase(String role, String status);

    List<Appointment> findByRole(String role);
}
