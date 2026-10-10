package com.campusnest;

import com.campusnest.dto.fine.FineResponse;
import com.campusnest.dto.fine.PaymentRequest;
import com.campusnest.entity.*;
import com.campusnest.exception.BadRequestException;
import com.campusnest.repository.FinePaymentRepository;
import com.campusnest.repository.FineRepository;
import com.campusnest.repository.UserRepository;
import com.campusnest.security.UserPrincipal;
import com.campusnest.service.FineService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class FineCalculationTest {

    @Mock
    private FineRepository fineRepository;

    @Mock
    private FinePaymentRepository finePaymentRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private com.campusnest.repository.StudentRepository studentRepository;

    @Mock
    private com.campusnest.repository.FacultyRepository facultyRepository;

    @InjectMocks
    private FineService fineService;

    private Fine fine;
    private User studentUser;
    private UserPrincipal adminPrincipal;

    @BeforeEach
    void setUp() {
        Role role = new Role("ROLE_STUDENT", "Student");
        studentUser = new User();
        studentUser.setId(2L);
        studentUser.setUsername("STU2026001");
        studentUser.setFullName("Arjun Sharma");
        studentUser.setRole(role);

        Book book = new Book();
        book.setId(1L);
        book.setTitle("Database Systems");
        book.setIsbn("978-0-111111-1");

        BorrowTransaction transaction = new BorrowTransaction();
        transaction.setId(10L);
        transaction.setBook(book);
        transaction.setUser(studentUser);
        transaction.setIssueDate(LocalDate.now().minusDays(20));
        transaction.setDueDate(LocalDate.now().minusDays(10));
        transaction.setReturnDate(LocalDate.now());

        fine = new Fine();
        fine.setId(5L);
        fine.setTransaction(transaction);
        fine.setUser(studentUser);
        fine.setOverdueDays(10);
        fine.setDailyRate(new BigDecimal("5.00"));
        fine.setFineAmount(new BigDecimal("50.00"));
        fine.setPaidAmount(BigDecimal.ZERO);
        fine.setBalanceAmount(new BigDecimal("50.00"));
        fine.setStatus("UNPAID");

        adminPrincipal = new UserPrincipal(1L, "admin", "pass", "Dr. Vance", "admin@campusnest.edu", "ROLE_ADMIN", true, false, List.of());
    }

    @Test
    @DisplayName("Should process partial payment, decrease balance, and set status to PARTIALLY_PAID")
    void testPartialPaymentProcessing() {
        PaymentRequest request = new PaymentRequest();
        request.setFineId(5L);
        request.setAmountPaid(new BigDecimal("20.00"));
        request.setPaymentMethod("UPI");
        request.setNotes("Partial payment");

        when(fineRepository.findById(5L)).thenReturn(Optional.of(fine));
        when(userRepository.findById(1L)).thenReturn(Optional.of(new User()));
        when(finePaymentRepository.save(any(FinePayment.class))).thenAnswer(i -> i.getArgument(0));
        when(fineRepository.save(any(Fine.class))).thenAnswer(i -> i.getArgument(0));

        FineResponse response = fineService.recordPayment(request, adminPrincipal);

        assertEquals("PARTIALLY_PAID", response.getStatus());
        assertEquals(new BigDecimal("20.00"), response.getPaidAmount());
        assertEquals(new BigDecimal("30.00"), response.getBalanceAmount());
        verify(finePaymentRepository, times(1)).save(any(FinePayment.class));
    }

    @Test
    @DisplayName("Should process full payment, decrease balance to 0, and set status to PAID")
    void testFullPaymentProcessing() {
        PaymentRequest request = new PaymentRequest();
        request.setFineId(5L);
        request.setAmountPaid(new BigDecimal("50.00"));
        request.setPaymentMethod("CASH");

        when(fineRepository.findById(5L)).thenReturn(Optional.of(fine));
        when(userRepository.findById(1L)).thenReturn(Optional.of(new User()));
        when(finePaymentRepository.save(any(FinePayment.class))).thenAnswer(i -> i.getArgument(0));
        when(fineRepository.save(any(Fine.class))).thenAnswer(i -> i.getArgument(0));

        FineResponse response = fineService.recordPayment(request, adminPrincipal);

        assertEquals("PAID", response.getStatus());
        assertEquals(new BigDecimal("50.00"), response.getPaidAmount());
        assertEquals(0, BigDecimal.ZERO.compareTo(response.getBalanceAmount()));
    }

    @Test
    @DisplayName("Should reject payment exceeding the outstanding balance")
    void testPaymentExceedingBalanceRejected() {
        PaymentRequest request = new PaymentRequest();
        request.setFineId(5L);
        request.setAmountPaid(new BigDecimal("60.00")); // Balance is 50.00

        when(fineRepository.findById(5L)).thenReturn(Optional.of(fine));

        BadRequestException ex = assertThrows(BadRequestException.class, () ->
                fineService.recordPayment(request, adminPrincipal)
        );

        assertTrue(ex.getMessage().contains("exceeds outstanding balance"));
        verify(finePaymentRepository, never()).save(any(FinePayment.class));
    }
}
