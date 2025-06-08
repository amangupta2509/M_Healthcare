package com.physio.backend.controller;

import com.physio.backend.model.SecurityLog;
import com.physio.backend.service.SecurityLogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/securityLogs")
@CrossOrigin(origins = "*")
public class SecurityLogController {

    @Autowired
    private SecurityLogService service;

    @GetMapping
    public List<SecurityLog> getAll() {
        return service.getAll();
    }

    @PostMapping
    public SecurityLog create(@RequestBody SecurityLog log) {
        log.setTimestamp(LocalDateTime.now());
        return service.save(log);
    }
}
