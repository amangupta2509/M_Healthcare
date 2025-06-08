package com.physio.backend.service;

import com.physio.backend.model.ActivityLog;
import com.physio.backend.repository.ActivityLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ActivityLogService {

    @Autowired
    private ActivityLogRepository repo;

    public List<ActivityLog> getAll() {
        return repo.findAll();
    }

    public ActivityLog create(ActivityLog log) {
        return repo.save(log);
    }

    public void delete(Long id) {
        repo.deleteById(id);
    }
}
