package com.example.planner.dto;

import com.example.planner.entity.Priority;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record TaskRequest(
        @NotBlank(message = "Название не может быть пустым")
        @Size(max = 255, message = "Название не длиннее 255 символов")
        String title,

        @Size(max = 1000, message = "Описание не длиннее 1000 символов")
        String description,

        @NotNull(message = "Укажите приоритет")
        Priority priority,

        LocalDate dueDate
) {
}