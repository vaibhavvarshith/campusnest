package com.campusnest.dto.project;

import jakarta.validation.constraints.NotNull;

public class SubmissionRequest {

    @NotNull(message = "Project ID is required")
    private Long projectId;

    private String submissionText;
    private String fileName;
    private Long fileSize;
    private String fileUrl;

    public SubmissionRequest() {}

    public Long getProjectId() { return projectId; }
    public void setProjectId(Long projectId) { this.projectId = projectId; }

    public String getSubmissionText() { return submissionText; }
    public void setSubmissionText(String submissionText) { this.submissionText = submissionText; }

    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }

    public Long getFileSize() { return fileSize; }
    public void setFileSize(Long fileSize) { this.fileSize = fileSize; }

    public String getFileUrl() { return fileUrl; }
    public void setFileUrl(String fileUrl) { this.fileUrl = fileUrl; }
}
