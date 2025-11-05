package com.stockmanager.exception;


import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import jakarta.servlet.http.HttpServletRequest;

@RestControllerAdvice
public class RestExceptionHandler {

    @ExceptionHandler(NotFoundException.class)
    public ResponseEntity<ApiError> handleNotFound(NotFoundException ex, HttpServletRequest req){
        ApiError err = new ApiError();
        err.setStatus(HttpStatus.NOT_FOUND.value());
        err.setError("Not Found");
        err.setMessage(ex.getMessage());
        err.setPath(req.getRequestURI());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(err);
    }

    @ExceptionHandler(BusinessRuleException.class)
    public ResponseEntity<ApiError> handleBusiness(BusinessRuleException ex, HttpServletRequest req){
        ApiError err = new ApiError();
        err.setStatus(HttpStatus.BAD_REQUEST.value());
        err.setError("Business Rule Violation");
        err.setMessage(ex.getMessage());
        err.setPath(req.getRequestURI());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(err);
    }

    @ExceptionHandler(ObjectOptimisticLockingFailureException.class)
    public ResponseEntity<ApiError> handleOptimistic(ObjectOptimisticLockingFailureException ex, HttpServletRequest req){
        ApiError err = new ApiError();
        err.setStatus(HttpStatus.CONFLICT.value());
        err.setError("Conflict");
        err.setMessage("Resource was concurrently modified. Retry the operation.");
        err.setPath(req.getRequestURI());
        return ResponseEntity.status(HttpStatus.CONFLICT).body(err);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiError> handleValidation(MethodArgumentNotValidException ex, HttpServletRequest req){
        ApiError err = new ApiError();
        err.setStatus(HttpStatus.BAD_REQUEST.value());
        err.setError("Validation Error");
        err.setMessage(ex.getBindingResult().getFieldErrors().stream()
            .map(e -> e.getField() + ": " + e.getDefaultMessage())
            .reduce((a,b) -> a + "; " + b).orElse(ex.getMessage()));
        err.setPath(req.getRequestURI());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(err);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiError> handleAll(Exception ex, HttpServletRequest req){
        ApiError err = new ApiError();
        err.setStatus(HttpStatus.INTERNAL_SERVER_ERROR.value());
        err.setError("Internal Server Error");
        err.setMessage(ex.getMessage());
        err.setPath(req.getRequestURI());
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(err);
    }
}