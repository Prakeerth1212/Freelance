package com.freelancehub.service;

import com.freelancehub.dao.TimeLogDAO;
import com.freelancehub.model.TimeLog;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class TimeLogService {

    private final TimeLogDAO timeLogDAO;

    public TimeLogService(TimeLogDAO timeLogDAO) {
        this.timeLogDAO = timeLogDAO;
    }

    public TimeLog create(TimeLog timeLog) {
        return timeLogDAO.insert(timeLog);
    }

    public Optional<TimeLog> getById(int id) {
        return timeLogDAO.getById(id);
    }

    public List<TimeLog> getAll() {
        return timeLogDAO.getAll();
    }

    public List<TimeLog> getByProjectId(int projectId) {
        return timeLogDAO.getByProjectId(projectId);
    }

    public boolean update(TimeLog timeLog) {
        return timeLogDAO.update(timeLog);
    }

    public boolean delete(int id) {
        return timeLogDAO.delete(id);
    }
}
