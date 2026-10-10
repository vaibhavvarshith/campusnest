package com.campusnest.dto.file;

import java.time.LocalDateTime;

public class UploadedFileResponse {

    private Long id;
    private String fileName;
    private String originalFileName;
    private String fileUrl;
    private Long fileSize;
    private String formattedSize;
    private String contentType;
    private String fileCategory;
    private LocalDateTime createdAt;

    public UploadedFileResponse() {}

    public UploadedFileResponse(Long id, String fileName, String originalFileName, String fileUrl,
                                Long fileSize, String contentType, String fileCategory, LocalDateTime createdAt) {
        this.id = id;
        this.fileName = fileName;
        this.originalFileName = originalFileName;
        this.fileUrl = fileUrl;
        this.fileSize = fileSize;
        this.formattedSize = formatBytes(fileSize);
        this.contentType = contentType;
        this.fileCategory = fileCategory;
        this.createdAt = createdAt;
    }

    private static String formatBytes(Long bytes) {
        if (bytes == null || bytes <= 0) return "0 KB";
        if (bytes < 1024 * 1024) {
            return String.format("%.1f KB", bytes / 1024.0);
        }
        return String.format("%.2f MB", bytes / (1024.0 * 1024.0));
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }

    public String getOriginalFileName() { return originalFileName; }
    public void setOriginalFileName(String originalFileName) { this.originalFileName = originalFileName; }

    public String getFileUrl() { return fileUrl; }
    public void setFileUrl(String fileUrl) { this.fileUrl = fileUrl; }

    public Long getFileSize() { return fileSize; }
    public void setFileSize(Long fileSize) {
        this.fileSize = fileSize;
        this.formattedSize = formatBytes(fileSize);
    }

    public String getFormattedSize() { return formattedSize; }
    public void setFormattedSize(String formattedSize) { this.formattedSize = formattedSize; }

    public String getContentType() { return contentType; }
    public void setContentType(String contentType) { this.contentType = contentType; }

    public String getFileCategory() { return fileCategory; }
    public void setFileCategory(String fileCategory) { this.fileCategory = fileCategory; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
