package com.physio.backend.service;

import com.physio.backend.model.Blog;
import com.physio.backend.repository.BlogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class BlogService {

    @Autowired
    private BlogRepository repo;

    public List<Blog> getAll() {
        return repo.findAll();
    }

    public Blog getById(Long id) {
        return repo.findById(id).orElseThrow();
    }

    public Blog create(Blog blog) {
        blog.setDate(LocalDateTime.now());
        return repo.save(blog);
    }

    public Blog update(Long id, Blog updated) {
        updated.setId(id);
        return repo.save(updated);
    }

    public void delete(Long id) {
        repo.deleteById(id);
    }
}
