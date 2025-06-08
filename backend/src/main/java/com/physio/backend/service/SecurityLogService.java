package com.physio.backend.service;

import com.physio.backend.model.SecurityLog;
import com.physio.backend.repository.SecurityLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SecurityLogService {

    @Autowired
    private SecurityLogRepository repo;

    public List<SecurityLog> getAll() {
        return repo.findAll();
    }

    public SecurityLog save(SecurityLog log) {
        return repo.save(log);
    }
}
