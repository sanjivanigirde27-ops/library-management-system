package com.library.service;

import com.library.entity.SystemSetting;
import com.library.repository.SystemSettingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

/**
 * Module 8: Admin / Librarian Service
 * Manages librarian profile, library operational policies, loan durations, and fine rate configuration.
 */
@Service
public class AdminService {

    @Autowired
    private SystemSettingRepository systemSettingRepository;

    // 1. Get System Settings / Librarian Profile
    public SystemSetting getSettings() {
        Optional<SystemSetting> optional = systemSettingRepository.findById(1L);
        if (optional.isPresent()) {
            return optional.get();
        } else {
            SystemSetting defaultSetting = new SystemSetting();
            return systemSettingRepository.save(defaultSetting);
        }
    }

    // 2. Update System Settings & Librarian Details
    public SystemSetting updateSettings(SystemSetting newSettings) {
        SystemSetting settings = getSettings();

        if (newSettings.getLibraryName() != null && !newSettings.getLibraryName().trim().isEmpty()) {
            settings.setLibraryName(newSettings.getLibraryName().trim());
        }
        if (newSettings.getLibrarianName() != null && !newSettings.getLibrarianName().trim().isEmpty()) {
            settings.setLibrarianName(newSettings.getLibrarianName().trim());
        }
        if (newSettings.getLibrarianEmail() != null && !newSettings.getLibrarianEmail().trim().isEmpty()) {
            settings.setLibrarianEmail(newSettings.getLibrarianEmail().trim());
        }
        if (newSettings.getLibrarianPhone() != null) {
            settings.setLibrarianPhone(newSettings.getLibrarianPhone().trim());
        }
        if (newSettings.getMaxBooksPerUser() != null && newSettings.getMaxBooksPerUser() > 0) {
            settings.setMaxBooksPerUser(newSettings.getMaxBooksPerUser());
        }
        if (newSettings.getLoanPeriodDays() != null && newSettings.getLoanPeriodDays() > 0) {
            settings.setLoanPeriodDays(newSettings.getLoanPeriodDays());
        }
        if (newSettings.getFineRatePerDay() != null && newSettings.getFineRatePerDay() >= 0) {
            settings.setFineRatePerDay(newSettings.getFineRatePerDay());
        }
        if (newSettings.getSystemNotice() != null) {
            settings.setSystemNotice(newSettings.getSystemNotice().trim());
        }

        return systemSettingRepository.save(settings);
    }
}
