package com.campusnest.dto.borrow;

import jakarta.validation.constraints.NotNull;

public class BorrowRequestCreateDto {

    @NotNull(message = "Book ID is required")
    private Long bookId;

    private String notes;

    public BorrowRequestCreateDto() {}

    public BorrowRequestCreateDto(Long bookId, String notes) {
        this.bookId = bookId;
        this.notes = notes;
    }

    public Long getBookId() { return bookId; }
    public void setBookId(Long bookId) { this.bookId = bookId; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
