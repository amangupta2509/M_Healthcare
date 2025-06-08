package com.physio.backend.repository;

import com.physio.backend.model.PasswordChangeRequest;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PasswordChangeRequestRepository extends JpaRepository<PasswordChangeRequest, Long> {
}
