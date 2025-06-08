package com.physio.backend.service;

import com.physio.backend.model.Service;
import com.physio.backend.repository.ServiceRepository;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;
import java.util.Optional;

@org.springframework.stereotype.Service
public class ServiceService {

    @Autowired
    private ServiceRepository repo;

    public List<Service> getAll() {
        return repo.findAll();
    }

    public Optional<Service> getById(Long id) {
        return repo.findById(id);
    }

    public Service save(Service service) {
        return repo.save(service);
    }

    public Service update(Long id, Service updatedService) {
        Service existing = repo.findById(id).orElseThrow();
        updatedService.setId(id);
        return repo.save(updatedService);
    }

    public void delete(Long id) {
        repo.deleteById(id);
    }
}
