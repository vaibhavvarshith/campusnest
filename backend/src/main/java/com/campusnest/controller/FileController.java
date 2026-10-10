package com.campusnest.controller;

import com.campusnest.dto.common.ApiResponse;
import com.campusnest.dto.file.UploadedFileResponse;
import com.campusnest.entity.UploadedFile;
import com.campusnest.security.UserPrincipal;
import com.campusnest.service.FileStorageService;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/files")
public class FileController {

    private final FileStorageService fileStorageService;

    public FileController(FileStorageService fileStorageService) {
        this.fileStorageService = fileStorageService;
    }

    @PostMapping("/upload")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<UploadedFileResponse>> uploadPdf(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "category", defaultValue = "PROJECT_INSTRUCTION") String category,
            @RequestParam(value = "entityId", required = false) Long entityId,
            @AuthenticationPrincipal UserPrincipal principal) {

        UploadedFileResponse response = fileStorageService.storePdf(file, category, entityId, principal);
        return ResponseEntity.ok(ApiResponse.ok("PDF file uploaded successfully", response));
    }

    @GetMapping("/download/{fileId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Resource> downloadFile(
            @PathVariable Long fileId,
            @AuthenticationPrincipal UserPrincipal principal) {

        Resource resource = fileStorageService.loadFileAsResource(fileId, principal);
        UploadedFile metadata = fileStorageService.getFileMetadata(fileId);

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + metadata.getOriginalFileName() + "\"")
                .body(resource);
    }

    @GetMapping("/view/{fileName}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Resource> viewFileByName(
            @PathVariable String fileName,
            @AuthenticationPrincipal UserPrincipal principal) {

        Resource resource = fileStorageService.loadFileByNameAsResource(fileName, principal);

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + fileName + "\"")
                .body(resource);
    }
}
