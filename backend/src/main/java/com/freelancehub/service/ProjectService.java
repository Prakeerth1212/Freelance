package com.freelancehub.service;

import com.freelancehub.dao.ProjectDAO;
import com.freelancehub.model.Project;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ProjectService {

    private final ProjectDAO projectDAO;

    public ProjectService(ProjectDAO projectDAO) {
        this.projectDAO = projectDAO;
    }

    public Project create(Project project) {
        return projectDAO.insert(project);
    }

    public Optional<Project> getById(int id) {
        return projectDAO.getById(id);
    }

    public List<Project> getAll() {
        return projectDAO.getAll();
    }

    public List<Project> getByClientId(int clientId) {
        return projectDAO.getByClientId(clientId);
    }

    public boolean update(Project project) {
        return projectDAO.update(project);
    }

    public boolean delete(int id) {
        return projectDAO.delete(id);
    }
}
