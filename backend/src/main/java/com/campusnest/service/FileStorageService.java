package com.campusnest.service;

import com.campusnest.dto.file.UploadedFileResponse;
import com.campusnest.entity.Project;
import com.campusnest.entity.ProjectSubmission;
import com.campusnest.entity.UploadedFile;
import com.campusnest.entity.User;
import com.campusnest.exception.BadRequestException;
import com.campusnest.exception.ResourceNotFoundException;
import com.campusnest.exception.UnauthorizedException;
import com.campusnest.repository.ProjectRepository;
import com.campusnest.repository.ProjectSubmissionRepository;
import com.campusnest.repository.UploadedFileRepository;
import com.campusnest.repository.UserRepository;
import com.campusnest.security.UserPrincipal;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Arrays;
import java.util.UUID;

@Service
public class FileStorageService {

    private static final Logger log = LoggerFactory.getLogger(FileStorageService.class);
    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB limit
    private static final byte[] PDF_MAGIC_BYTES = new byte[]{0x25, 0x50, 0x44, 0x46, 0x2D}; // "%PDF-"

    private final Path baseStorageLocation;
    private final UploadedFileRepository fileRepository;
    private final UserRepository userRepository;
    private final ProjectRepository projectRepository;
    private final ProjectSubmissionRepository submissionRepository;

    public FileStorageService(@Value("${app.upload.dir:uploads}") String uploadDir,
                              UploadedFileRepository fileRepository,
                              UserRepository userRepository,
                              ProjectRepository projectRepository,
                              ProjectSubmissionRepository submissionRepository) {
        this.baseStorageLocation = Paths.get(uploadDir).toAbsolutePath().normalize();
        this.fileRepository = fileRepository;
        this.userRepository = userRepository;
        this.projectRepository = projectRepository;
        this.submissionRepository = submissionRepository;

        try {
            Files.createDirectories(this.baseStorageLocation);
            Files.createDirectories(this.baseStorageLocation.resolve("projects"));
            Files.createDirectories(this.baseStorageLocation.resolve("submissions"));
            log.info("Initialized secure PDF storage directory at: {}", this.baseStorageLocation);
        } catch (IOException ex) {
            log.error("Could not initialize file storage directory", ex);
            throw new RuntimeException("Could not initialize PDF file storage location", ex);
        }
    }

    @Transactional
    public UploadedFileResponse storePdf(MultipartFile file, String category, Long entityId, UserPrincipal principal) {
        // 1. Basic checks
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Cannot upload an empty PDF file.");
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new BadRequestException("File exceeds maximum allowed size of 10 MB. Current size: " +
                    String.format("%.2f MB", file.getSize() / (1024.0 * 1024.0)));
        }

        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || !originalFilename.toLowerCase().endsWith(".pdf")) {
            throw new BadRequestException("Only PDF documents (.pdf extension) are accepted.");
        }

        // 2. Validate PDF magic bytes (%PDF-) to prevent malicious non-PDF uploads
        validatePdfMagicBytes(file);

        // 3. Prevent path traversal and sanitize filename
        String cleanOriginalName = sanitizeFilename(originalFilename);
        String subFolder = "PROJECT_INSTRUCTION".equalsIgnoreCase(category) ? "projects" : "submissions";
        String serverFileName = UUID.randomUUID().toString() + "_" + cleanOriginalName;

        try {
            Path targetLocation = this.baseStorageLocation.resolve(subFolder).resolve(serverFileName);
            try (InputStream is = file.getInputStream()) {
                Files.copy(is, targetLocation, StandardCopyOption.REPLACE_EXISTING);
            }

            User user = userRepository.findById(principal.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("User not found"));

            UploadedFile uploadedFile = new UploadedFile();
            uploadedFile.setFileName(serverFileName);
            uploadedFile.setOriginalFileName(cleanOriginalName);
            uploadedFile.setFilePath(targetLocation.toString());
            uploadedFile.setFileSize(file.getSize());
            uploadedFile.setContentType("application/pdf");
            uploadedFile.setUploadedBy(user);
            uploadedFile.setFileCategory(category);
            uploadedFile.setEntityId(entityId);

            UploadedFile saved = fileRepository.save(uploadedFile);

            String fileUrl = "/api/files/download/" + saved.getId();
            log.info("Saved PDF '{}' ({}) by user '{}' as '{}'", cleanOriginalName, file.getSize(), principal.getUsername(), serverFileName);

            return new UploadedFileResponse(
                    saved.getId(),
                    saved.getFileName(),
                    saved.getOriginalFileName(),
                    fileUrl,
                    saved.getFileSize(),
                    saved.getContentType(),
                    saved.getFileCategory(),
                    saved.getCreatedAt()
            );

        } catch (IOException ex) {
            log.error("Failed to store PDF file", ex);
            throw new RuntimeException("Failed to store PDF file: " + ex.getMessage(), ex);
        }
    }

    public Resource loadFileAsResource(Long fileId, UserPrincipal principal) {
        UploadedFile uploadedFile = fileRepository.findById(fileId)
                .orElseThrow(() -> new ResourceNotFoundException("File not found with id: " + fileId));

        validateDownloadPermissions(uploadedFile, principal);

        try {
            Path filePath = Paths.get(uploadedFile.getFilePath());
            Resource resource = new UrlResource(filePath.toUri());

            if (resource.exists() && resource.isReadable()) {
                return resource;
            } else {
                throw new ResourceNotFoundException("File not found or unreadable on disk: " + uploadedFile.getOriginalFileName());
            }
        } catch (MalformedURLException ex) {
            throw new ResourceNotFoundException("File path invalid: " + ex.getMessage());
        }
    }

    public Resource loadFileByNameAsResource(String fileName, UserPrincipal principal) {
        UploadedFile uploadedFile = fileRepository.findByFileName(fileName)
                .orElseThrow(() -> new ResourceNotFoundException("File not found with name: " + fileName));

        validateDownloadPermissions(uploadedFile, principal);

        try {
            Path filePath = Paths.get(uploadedFile.getFilePath());
            Resource resource = new UrlResource(filePath.toUri());

            if (resource.exists() && resource.isReadable()) {
                return resource;
            } else {
                throw new ResourceNotFoundException("File not found on disk");
            }
        } catch (MalformedURLException ex) {
            throw new ResourceNotFoundException("File path invalid: " + ex.getMessage());
        }
    }

    public UploadedFile getFileMetadata(Long fileId) {
        return fileRepository.findById(fileId)
                .orElseThrow(() -> new ResourceNotFoundException("File not found with id: " + fileId));
    }

    private void validatePdfMagicBytes(MultipartFile file) {
        try (InputStream is = file.getInputStream()) {
            byte[] header = new byte[5];
            int read = is.read(header);
            if (read < 5 || !Arrays.equals(header, PDF_MAGIC_BYTES)) {
                throw new BadRequestException("Corrupted or invalid PDF content: file header does not match PDF specification.");
            }
        } catch (IOException ex) {
            throw new BadRequestException("Unable to inspect uploaded file content.");
        }
    }

    private String sanitizeFilename(String filename) {
        // Strip out paths
        String name = Paths.get(filename).getFileName().toString();
        // Remove unsafe characters
        name = name.replaceAll("[^a-zA-Z0-9._-]", "_");
        if (name.length() > 100) {
            name = name.substring(name.length() - 100);
        }
        return name;
    }

    private void validateDownloadPermissions(UploadedFile file, UserPrincipal principal) {
        if (principal == null) {
            throw new UnauthorizedException("Authentication required to access file.");
        }

        String role = principal.getRole();
        if ("ROLE_ADMIN".equals(role)) {
            return; // Admin has full access
        }

        if ("STUDENT_SUBMISSION".equalsIgnoreCase(file.getFileCategory())) {
            // Student can only download their own submission
            if ("ROLE_STUDENT".equals(role)) {
                if (!file.getUploadedBy().getId().equals(principal.getId())) {
                    throw new UnauthorizedException("Access Denied: You cannot download submissions belonging to other students.");
                }
            }
            // Faculty can download submissions for projects they teach or subject head
            // Admins can download all
        }
    }
}
