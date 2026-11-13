package com.example.planner.service;

import com.example.planner.dto.TaskRequest;
import com.example.planner.dto.TaskResponse;
import com.example.planner.entity.Task;
import com.example.planner.exception.TaskNotFoundException;
import com.example.planner.repository.TaskRepository;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class TaskService {

    private static final Sort NEWEST_FIRST = Sort.by(Sort.Direction.DESC, "createdAt");

    private final TaskRepository repository;

    public TaskService(TaskRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public List<TaskResponse> getAll(String status) {
        List<Task> tasks = switch (status == null ? "all" : status.toLowerCase()) {
            case "active" -> repository.findByCompleted(false, NEWEST_FIRST);
            case "done" -> repository.findByCompleted(true, NEWEST_FIRST);
            default -> repository.findAll(NEWEST_FIRST);
        };
        return tasks.stream().map(TaskResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public TaskResponse getById(Long id) {
        return TaskResponse.from(find(id));
    }

    public TaskResponse create(TaskRequest request) {
        Task task = new Task();
        apply(task, request);
        return TaskResponse.from(repository.save(task));
    }

    public TaskResponse update(Long id, TaskRequest request) {
        Task task = find(id);
        apply(task, request);
        return TaskResponse.from(task); // сохранится автоматически в конце транзакции
    }

    public TaskResponse toggle(Long id) {
        Task task = find(id);
        task.setCompleted(!task.isCompleted());
        return TaskResponse.from(task);
    }

    public void delete(Long id) {
        repository.delete(find(id));
    }

    private Task find(Long id) {
        return repository.findById(id).orElseThrow(() -> new TaskNotFoundException(id));
    }

    private void apply(Task task, TaskRequest r) {
        task.setTitle(r.title().trim());
        task.setDescription(r.description());
        task.setPriority(r.priority());
        task.setDueDate(r.dueDate());
    }
}