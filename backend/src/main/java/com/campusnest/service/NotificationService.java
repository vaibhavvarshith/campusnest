package com.campusnest.service;

import com.campusnest.dto.common.PagedResponse;
import com.campusnest.entity.Notification;
import com.campusnest.entity.User;
import com.campusnest.exception.ResourceNotFoundException;
import com.campusnest.repository.NotificationRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    @Transactional
    public Notification createNotification(User user, String title, String message, String type,
                                           Long referenceId, String referenceType) {
        // Idempotency: prevent duplicate reminders for the same reference and type
        if (referenceId != null && referenceType != null) {
            boolean exists = notificationRepository.existsByUserIdAndReferenceTypeAndReferenceIdAndType(
                    user.getId(), referenceType, referenceId, type
            );
            if (exists) {
                return null;
            }
        }

        Notification notification = new Notification(user, title, message, type, referenceId, referenceType);
        return notificationRepository.save(notification);
    }

    @Transactional(readOnly = true)
    public PagedResponse<Notification> getUserNotifications(Long userId, Pageable pageable) {
        Page<Notification> page = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);
        return PagedResponse.of(page);
    }

    @Transactional(readOnly = true)
    public List<Notification> getRecentNotifications(Long userId) {
        return notificationRepository.findTop10ByUserIdOrderByCreatedAtDesc(userId);
    }

    @Transactional(readOnly = true)
    public long getUnreadCount(Long userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    @Transactional
    public void markAsRead(Long notificationId, Long userId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found with id: " + notificationId));

        if (!notification.getUser().getId().equals(userId)) {
            throw new ResourceNotFoundException("Notification not found");
        }

        notification.setIsRead(true);
        notification.setReadAt(LocalDateTime.now());
        notificationRepository.save(notification);
    }

    @Transactional
    public void markAllAsRead(Long userId) {
        List<Notification> unread = notificationRepository.findTop10ByUserIdOrderByCreatedAtDesc(userId)
                .stream().filter(n -> !n.getIsRead()).toList();

        for (Notification n : unread) {
            n.setIsRead(true);
            n.setReadAt(LocalDateTime.now());
        }
        notificationRepository.saveAll(unread);
    }
}
