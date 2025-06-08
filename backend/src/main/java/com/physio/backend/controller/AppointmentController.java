package com.physio.backend.controller;

import com.physio.backend.model.Appointment;
import com.physio.backend.service.AppointmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/appointments")
@CrossOrigin(origins = "*")
public class AppointmentController {

    @Autowired
    private AppointmentService service;

    @GetMapping
    public List<Appointment> getAll() {
        return service.getAll();
    }

    @GetMapping("/role/{role}")
    public List<Appointment> getByRole(@PathVariable String role) {
        return service.getByRole(role.toLowerCase());
    }

    @PostMapping
    public Appointment create(@RequestBody Appointment appointment) {
        return service.create(appointment);
    }

    @PutMapping("/{id}")
    public Appointment update(@PathVariable Long id, @RequestBody Appointment appointment) {
        return service.update(id, appointment);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }

    @GetMapping("/role/{role}/completed")
    public List<Appointment> getCompletedAppointments(@PathVariable String role) {
        return service.getCompletedByRole(role.toLowerCase());
    }

}
