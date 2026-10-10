package com.campusnest.repository;

import com.campusnest.entity.UploadedFile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UploadedFileRepository extends JpaRepository<UploadedFile, Long> {

    Optional<UploadedFile> findByFileName(String fileName);

    List<UploadedFile> findByFileCategoryAndEntityId(String fileCategory, Long entityId);

    @org.springframework.data.jpa.repository.Query("SELECT u FROM UploadedFile u WHERE u.uploadedBy.id = :userId")
    List<UploadedFile> findByUploadedByUserId(@org.springframework.data.repository.query.Param("userId") Long userId);
}
