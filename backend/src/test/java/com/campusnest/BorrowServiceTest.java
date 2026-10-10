package com.campusnest;

import com.campusnest.dto.transaction.IssueRequest;
import com.campusnest.dto.transaction.ReturnRequest;
import com.campusnest.dto.transaction.TransactionResponse;
import com.campusnest.entity.*;
import com.campusnest.exception.BadRequestException;
import com.campusnest.repository.*;
import com.campusnest.security.UserPrincipal;
import com.campusnest.service.BorrowService;
import com.campusnest.service.LibrarySettingService;
import com.campusnest.service.NotificationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class BorrowServiceTest {

    @Mock
    private BorrowTransactionRepository transactionRepository;

    @Mock
    private BookRepository bookRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private StudentRepository studentRepository;

    @Mock
    private FacultyRepository facultyRepository;

    @Mock
    private FineRepository fineRepository;

    @Mock
    private LibrarySettingService settingService;

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private BorrowService borrowService;

    private User studentUser;
    private Book book;
    private UserPrincipal adminPrincipal;

    @BeforeEach
    void setUp() {
        Role studentRole = new Role("ROLE_STUDENT", "Student");
        studentUser = new User();
        studentUser.setId(2L);
        studentUser.setUsername("STU2026001");
        studentUser.setFullName("Arjun Sharma");
        studentUser.setRole(studentRole);
        studentUser.setIsActive(true);

        Category cat = new Category("Java Programming", "Java Books");
        cat.setId(1L);

        book = new Book();
        book.setId(10L);
        book.setIsbn("978-0-123456-0");
        book.setTitle("Effective Java");
        book.setCategory(cat);
        book.setTotalCopies(5);
        book.setAvailableCopies(3);

        adminPrincipal = new UserPrincipal(1L, "admin", "pass", "Admin Vance", "admin@campusnest.edu", "ROLE_ADMIN", true, false, java.util.List.of());
    }

    @Test
    @DisplayName("Should successfully issue book when copies available and decrement copy count")
    void testSuccessfulBookIssuance() {
        IssueRequest request = new IssueRequest();
        request.setBookId(10L);
        request.setUserId(2L);

        when(userRepository.findById(2L)).thenReturn(Optional.of(studentUser));
        when(settingService.getMaxBooksForRole("ROLE_STUDENT")).thenReturn(3);
        when(transactionRepository.countByUserIdAndStatus(2L, "ISSUED")).thenReturn(1L);
        when(bookRepository.findByIdWithLock(10L)).thenReturn(Optional.of(book));
        when(settingService.getBorrowDaysForRole("ROLE_STUDENT")).thenReturn(14);
        when(transactionRepository.save(any(BorrowTransaction.class))).thenAnswer(invocation -> {
            BorrowTransaction t = invocation.getArgument(0);
            t.setId(101L);
            return t;
        });

        TransactionResponse response = borrowService.issueBook(request, adminPrincipal);

        assertNotNull(response);
        assertEquals("ISSUED", response.getStatus());
        assertEquals(2, book.getAvailableCopies()); // Decremented from 3 to 2
        verify(bookRepository, times(1)).save(book);
        verify(transactionRepository, times(1)).save(any(BorrowTransaction.class));
    }

    @Test
    @DisplayName("Should reject issuance when book has zero available copies")
    void testIssuanceFailsWhenNoCopiesAvailable() {
        book.setAvailableCopies(0);

        IssueRequest request = new IssueRequest();
        request.setBookId(10L);
        request.setUserId(2L);

        when(userRepository.findById(2L)).thenReturn(Optional.of(studentUser));
        when(settingService.getMaxBooksForRole("ROLE_STUDENT")).thenReturn(3);
        when(transactionRepository.countByUserIdAndStatus(2L, "ISSUED")).thenReturn(0L);
        when(bookRepository.findByIdWithLock(10L)).thenReturn(Optional.of(book));

        BadRequestException ex = assertThrows(BadRequestException.class, () ->
                borrowService.issueBook(request, adminPrincipal)
        );

        assertTrue(ex.getMessage().contains("No available copies"));
        verify(bookRepository, never()).save(any(Book.class));
    }

    @Test
    @DisplayName("Should reject issuance when patron account is inactive")
    void testIssuanceFailsWhenPatronInactive() {
        studentUser.setIsActive(false);

        IssueRequest request = new IssueRequest();
        request.setBookId(10L);
        request.setUserId(2L);

        when(userRepository.findById(2L)).thenReturn(Optional.of(studentUser));

        BadRequestException ex = assertThrows(BadRequestException.class, () ->
                borrowService.issueBook(request, adminPrincipal)
        );

        assertTrue(ex.getMessage().contains("inactive"));
    }

    @Test
    @DisplayName("Should calculate zero fine when book is returned on or before due date")
    void testReturnBookOnTimeZeroFine() {
        BorrowTransaction transaction = new BorrowTransaction();
        transaction.setId(50L);
        transaction.setBook(book);
        transaction.setUser(studentUser);
        transaction.setIssueDate(LocalDate.now().minusDays(10));
        transaction.setDueDate(LocalDate.now().plusDays(4));
        transaction.setStatus("ISSUED");

        when(transactionRepository.findById(50L)).thenReturn(Optional.of(transaction));
        when(bookRepository.findByIdWithLock(10L)).thenReturn(Optional.of(book));
        when(transactionRepository.save(any(BorrowTransaction.class))).thenReturn(transaction);

        ReturnRequest returnRequest = new ReturnRequest(LocalDate.now(), "On time return");
        TransactionResponse response = borrowService.returnBook(50L, returnRequest, adminPrincipal);

        assertEquals("RETURNED", response.getStatus());
        assertEquals(0, response.getOverdueDays());
        assertEquals(BigDecimal.ZERO, response.getFineAmount());
        assertEquals(4, book.getAvailableCopies()); // Restored copy (3 + 1 = 4)
        verify(fineRepository, never()).save(any(Fine.class));
    }

    @Test
    @DisplayName("Should calculate correct late fine and create Fine entity when returned late")
    void testReturnBookLateCalculatesCorrectFine() {
        BorrowTransaction transaction = new BorrowTransaction();
        transaction.setId(51L);
        transaction.setBook(book);
        transaction.setUser(studentUser);
        transaction.setIssueDate(LocalDate.now().minusDays(20));
        transaction.setDueDate(LocalDate.now().minusDays(5)); // 5 days late
        transaction.setStatus("ISSUED");

        when(transactionRepository.findById(51L)).thenReturn(Optional.of(transaction));
        when(bookRepository.findByIdWithLock(10L)).thenReturn(Optional.of(book));
        when(settingService.getDailyFineRate()).thenReturn(new BigDecimal("5.00"));
        when(transactionRepository.save(any(BorrowTransaction.class))).thenReturn(transaction);

        ReturnRequest returnRequest = new ReturnRequest(LocalDate.now(), "5 days late");
        TransactionResponse response = borrowService.returnBook(51L, returnRequest, adminPrincipal);

        assertEquals("RETURNED", response.getStatus());
        assertEquals(5, response.getOverdueDays());
        assertEquals(new BigDecimal("25.00"), response.getFineAmount()); // 5 * 5.00 = 25.00
        verify(fineRepository, times(1)).save(any(Fine.class));
    }

    @Test
    @DisplayName("Should reject returning an already returned book")
    void testPreventDuplicateReturn() {
        BorrowTransaction transaction = new BorrowTransaction();
        transaction.setId(52L);
        transaction.setStatus("RETURNED");

        when(transactionRepository.findById(52L)).thenReturn(Optional.of(transaction));

        assertThrows(BadRequestException.class, () ->
                borrowService.returnBook(52L, new ReturnRequest(), adminPrincipal)
        );
    }
}
