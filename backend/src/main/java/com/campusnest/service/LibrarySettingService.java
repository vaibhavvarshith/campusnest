package com.campusnest.service;

import com.campusnest.entity.LibrarySetting;
import com.campusnest.exception.ResourceNotFoundException;
import com.campusnest.repository.LibrarySettingRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
public class LibrarySettingService {

    private final LibrarySettingRepository settingRepository;

    public LibrarySettingService(LibrarySettingRepository settingRepository) {
        this.settingRepository = settingRepository;
    }

    @Transactional(readOnly = true)
    public List<LibrarySetting> getAllSettings() {
        return settingRepository.findAll();
    }

    @Transactional(readOnly = true)
    public String getSettingValue(String key, String defaultValue) {
        return settingRepository.findBySettingKey(key)
                .map(LibrarySetting::getSettingValue)
                .orElse(defaultValue);
    }

    @Transactional(readOnly = true)
    public BigDecimal getDailyFineRate() {
        String val = getSettingValue("daily_fine_rate", "5.00");
        try {
            return new BigDecimal(val);
        } catch (Exception e) {
            return new BigDecimal("5.00");
        }
    }

    @Transactional(readOnly = true)
    public int getMaxBooksForRole(String roleName) {
        if ("ROLE_FACULTY".equals(roleName)) {
            return Integer.parseInt(getSettingValue("faculty_max_books", "6"));
        }
        return Integer.parseInt(getSettingValue("student_max_books", "3"));
    }

    @Transactional(readOnly = true)
    public int getBorrowDaysForRole(String roleName) {
        if ("ROLE_FACULTY".equals(roleName)) {
            return Integer.parseInt(getSettingValue("faculty_borrow_days", "30"));
        }
        return Integer.parseInt(getSettingValue("student_borrow_days", "14"));
    }

    @Transactional
    public LibrarySetting updateSetting(String key, String value) {
        LibrarySetting setting = settingRepository.findBySettingKey(key)
                .orElseThrow(() -> new ResourceNotFoundException("Setting not found with key: " + key));

        setting.setSettingValue(value);
        return settingRepository.save(setting);
    }
}
