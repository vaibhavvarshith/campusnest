package com.campusnest.controller;

import com.campusnest.dto.common.ApiResponse;
import com.campusnest.entity.LibrarySetting;
import com.campusnest.scheduler.AutomatedReminderScheduler;
import com.campusnest.service.LibrarySettingService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class SettingController {

    private final LibrarySettingService settingService;
    private final AutomatedReminderScheduler reminderScheduler;

    public SettingController(LibrarySettingService settingService,
                             AutomatedReminderScheduler reminderScheduler) {
        this.settingService = settingService;
        this.reminderScheduler = reminderScheduler;
    }

    @GetMapping("/settings")
    public ResponseEntity<ApiResponse<List<LibrarySetting>>> getAllSettings() {
        List<LibrarySetting> settings = settingService.getAllSettings();
        return ResponseEntity.ok(ApiResponse.ok(settings));
    }

    @PutMapping("/settings/{key}")
    public ResponseEntity<ApiResponse<LibrarySetting>> updateSetting(
            @PathVariable String key,
            @RequestBody Map<String, String> body) {
        String value = body.get("value");
        LibrarySetting updated = settingService.updateSetting(key, value);
        return ResponseEntity.ok(ApiResponse.ok("Setting updated successfully", updated));
    }

    @PostMapping("/reminders/trigger")
    public ResponseEntity<ApiResponse<Map<String, Object>>> triggerReminderScan() {
        LocalDate today = LocalDate.now();
        reminderScheduler.scanAndGenerateBookReminders(today);
        reminderScheduler.scanAndGenerateProjectReminders(today);
        return ResponseEntity.ok(ApiResponse.ok(
                "Automated reminder scan executed successfully for date: " + today,
                Map.of("executedDate", today, "status", "SUCCESS")
        ));
    }
}
