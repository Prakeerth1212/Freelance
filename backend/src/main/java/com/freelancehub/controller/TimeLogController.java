package com.freelancehub.controller;

import com.freelancehub.model.TimeLog;
import com.freelancehub.service.TimeLogService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/timelogs")
public class TimeLogController {

    private final TimeLogService timeLogService;

    public TimeLogController(TimeLogService timeLogService) {
        this.timeLogService = timeLogService;
    }

    @GetMapping
    public List<TimeLog> getAll() {
        return timeLogService.getAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<TimeLog> getById(@PathVariable int id) {
        return timeLogService.getById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/by-project/{projectId}")
    public List<TimeLog> getByProjectId(@PathVariable int projectId) {
        return timeLogService.getByProjectId(projectId);
    }

    @PostMapping
    public ResponseEntity<TimeLog> create(@RequestBody TimeLog timeLog) {
        TimeLog created = timeLogService.create(timeLog);
        return ResponseEntity.ok(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<TimeLog> update(@PathVariable int id, @RequestBody TimeLog timeLog) {
        return timeLogService.getById(id)
                .map(existing -> {
                    timeLog.setId(id);
                    timeLogService.update(timeLog);
                    return ResponseEntity.ok(timeLog);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable int id) {
        if (timeLogService.delete(id)) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}
