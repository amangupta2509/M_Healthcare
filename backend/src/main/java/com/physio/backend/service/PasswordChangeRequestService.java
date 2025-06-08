package com.physio.backend.service;

import com.physio.backend.model.PasswordChangeRequest;
import com.physio.backend.repository.PasswordChangeRequestRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PasswordChangeRequestService {

    @Autowired
    private PasswordChangeRequestRepository repo;

    public List<PasswordChangeRequest> getAll() {
        return repo.findAll();
    }

    public PasswordChangeRequest save(PasswordChangeRequest req) {
        return repo.save(req);
    }

    public PasswordChangeRequest updateStatus(Long id, String newStatus) {
        PasswordChangeRequest req = repo.findById(id).orElseThrow();
        req.setStatus(newStatus);
        return repo.save(req);
    }
}
