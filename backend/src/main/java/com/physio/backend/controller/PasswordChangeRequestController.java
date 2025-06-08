
package com.physio.backend.controller;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.physio.backend.model.PasswordChangeRequest;
import com.physio.backend.service.PasswordChangeRequestService;

@RestController
@RequestMapping("/api/passwordChangeRequests")
@CrossOrigin("*")
public class PasswordChangeRequestController {

    @Autowired
    private PasswordChangeRequestService service;

    @GetMapping
    public List<PasswordChangeRequest> getAll() {
        return service.getAll();
    }

    @PostMapping
    public PasswordChangeRequest create(@RequestBody PasswordChangeRequest req) {
        req.setStatus("Pending");
        req.setRequestedAt(LocalDateTime.now());
        return service.save(req);
    }

    @PatchMapping("/{id}")
    public PasswordChangeRequest update(@PathVariable Long id, @RequestBody Map<String, String> body) {
        return service.updateStatus(id, body.get("status"));
    }
}
