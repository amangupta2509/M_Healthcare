package com.physio.backend.controller;

import com.physio.backend.model.ActivityLog;
import com.physio.backend.service.ActivityLogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/activityLogs")
@CrossOrigin(origins = "*")
public class ActivityLogController {

    @Autowired
    private ActivityLogService service;

    @GetMapping
    public List<ActivityLog> getAll() {
        return service.getAll();
    }

    @PostMapping
    public ActivityLog create(@RequestBody ActivityLog log) {
        log.setTimestamp(java.time.LocalDateTime.now());
        return service.create(log);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}