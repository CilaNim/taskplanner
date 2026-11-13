package com.example.planner.dto;

import com.example.planner.entity.Priority;
import com.example.planner.entity.Task;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record TaskResponse(
        Long id,
        String title,
        String description,
        Priority priority,
        LocalDate dueDate,
        boolean completed,
        LocalDateTime createdAt
) {
    public static TaskResponse from(Task t) {
        return new TaskResponse(t.getId(), t.getTitle(), t.getDescription(),
                t.getPriority(), t.getDueDate(), t.isCompleted(), t.getCreatedAt());
    }
}