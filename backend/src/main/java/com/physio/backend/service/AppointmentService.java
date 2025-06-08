package com.physio.backend.service;

import com.physio.backend.model.Appointment;
import com.physio.backend.repository.AppointmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AppointmentService {

    @Autowired
    private AppointmentRepository repo;

    public List<Appointment> getAll() {
        return repo.findAll();
    }

    public List<Appointment> getByRole(String role) {
        return repo.findByRole(role);
    }

    public Appointment getById(Long id) {
        return repo.findById(id).orElseThrow();
    }

    public Appointment create(Appointment a) {
        return repo.save(a);
    }

    public Appointment update(Long id, Appointment updated) {
        updated.setId(id);
        return repo.save(updated);
    }

    public void delete(Long id) {
        repo.deleteById(id);
    }
    public List<Appointment> getCompletedByRole(String role) {
        return repo.findByRoleAndStatusIgnoreCase(role, "Completed");
    }

}
