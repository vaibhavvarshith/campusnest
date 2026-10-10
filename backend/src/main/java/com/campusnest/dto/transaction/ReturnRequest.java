package com.campusnest.dto.transaction;

import java.time.LocalDate;

public class ReturnRequest {
    private LocalDate returnDate;
    private String notes;

    public ReturnRequest() {}

    public ReturnRequest(LocalDate returnDate, String notes) {
        this.returnDate = returnDate;
        this.notes = notes;
    }

    public LocalDate getReturnDate() { return returnDate; }
    public void setReturnDate(LocalDate returnDate) { this.returnDate = returnDate; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
