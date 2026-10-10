package com.campusnest.dto.project;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

public class GradeSubmissionRequest {

    private String grade;

    @Min(value = 0, message = "Score cannot be negative")
    @Max(value = 100, message = "Score cannot exceed maximum score of 100")
    private Double score;

    private String feedback;

    private String rubricMarks;

    private Boolean isDraft = false;

    public GradeSubmissionRequest() {}

    public GradeSubmissionRequest(String grade, Double score, String feedback, String rubricMarks, Boolean isDraft) {
        this.grade = grade;
        this.score = score;
        this.feedback = feedback;
        this.rubricMarks = rubricMarks;
        this.isDraft = isDraft != null && isDraft;
    }

    public String getGrade() { return grade; }
    public void setGrade(String grade) { this.grade = grade; }

    public Double getScore() { return score; }
    public void setScore(Double score) { this.score = score; }

    public String getFeedback() { return feedback; }
    public void setFeedback(String feedback) { this.feedback = feedback; }

    public String getRubricMarks() { return rubricMarks; }
    public void setRubricMarks(String rubricMarks) { this.rubricMarks = rubricMarks; }

    public Boolean getIsDraft() { return isDraft; }
    public void setIsDraft(Boolean draft) { isDraft = draft; }
}
