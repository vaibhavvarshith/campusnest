package com.campusnest;

import com.campusnest.dto.borrow.BorrowRequestCreateDto;
import com.campusnest.dto.borrow.BorrowRequestResponse;
import com.campusnest.entity.*;
import com.campusnest.exception.BadRequestException;
import com.campusnest.repository.*;
import com.campusnest.security.UserPrincipal;
import com.campusnest.service.BorrowRequestService;
import com.campusnest.service.NotificationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class BorrowRequestServiceTest {

    @Mock
    private BorrowRequestRepository borrowRequestRepository;

    @Mock
    private BookRepository bookRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private StudentRepository studentRepository;

    @Mock
    private FacultyRepository facultyRepository;

    @Mock
    private BorrowTransactionRepository transactionRepository;

    @Mock
    private LibrarySettingRepository settingRepository;

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private BorrowRequestService borrowRequestService;

    private User studentUser;
    private User librarianUser;
    private Book book;
    private UserPrincipal studentPrincipal;
    private UserPrincipal librarianPrincipal;

    @BeforeEach
    void setUp() {
        Role studentRole = new Role("ROLE_STUDENT", "Student");
        studentUser = new User();
        studentUser.setId(2L);
        studentUser.setUsername("STU2026001");
        studentUser.setFullName("Arjun Sharma");
        studentUser.setRole(studentRole);
        studentUser.setIsActive(true);

        Role librarianRole = new Role("ROLE_LIBRARIAN", "Librarian");
        librarianUser = new User();
        librarianUser.setId(12L);
        librarianUser.setUsername("LIB2026001");
        librarianUser.setFullName("Mrs. Savitha Deshmukh");
        librarianUser.setRole(librarianRole);
        librarianUser.setIsActive(true);

        Category category = new Category("Computer Science", "CSE");
        book = new Book();
        book.setId(10L);
        book.setTitle("Clean Code");
        book.setAuthor("Robert C. Martin");
        book.setIsbn("978-0132350884");
        book.setCategory(category);
        book.setTotalCopies(5);
        book.setAvailableCopies(3);

        studentPrincipal = new UserPrincipal(2L, "STU2026001", "pass", "Arjun Sharma", "arjun@test.com", "ROLE_STUDENT", true, false, Collections.emptyList());
        librarianPrincipal = new UserPrincipal(12L, "LIB2026001", "pass", "Mrs. Savitha", "lib@test.com", "ROLE_LIBRARIAN", true, false, Collections.emptyList());
    }

    @Test
    @DisplayName("Student creates a borrow request successfully")
    void testCreateBorrowRequest_Success() {
        BorrowRequestCreateDto dto = new BorrowRequestCreateDto(10L, "Course reference");

        when(userRepository.findById(2L)).thenReturn(Optional.of(studentUser));
        when(bookRepository.findById(10L)).thenReturn(Optional.of(book));
        when(borrowRequestRepository.existsByUserIdAndBookIdAndStatus(2L, 10L, "PENDING")).thenReturn(false);
        when(transactionRepository.existsByUserIdAndBookIdAndStatus(2L, 10L, "ISSUED")).thenReturn(false);
        when(transactionRepository.countActiveIssuedByUserId(2L)).thenReturn(1L);
        when(borrowRequestRepository.findByUserIdAndStatus(2L, "PENDING")).thenReturn(Collections.emptyList());

        BorrowRequest savedReq = new BorrowRequest();
        savedReq.setId(100L);
        savedReq.setBook(book);
        savedReq.setUser(studentUser);
        savedReq.setStatus("PENDING");

        when(borrowRequestRepository.save(any(BorrowRequest.class))).thenReturn(savedReq);

        BorrowRequestResponse response = borrowRequestService.createBorrowRequest(dto, studentPrincipal);

        assertNotNull(response);
        assertEquals(100L, response.getId());
        assertEquals("PENDING", response.getStatus());
        assertEquals("Clean Code", response.getBookTitle());
        verify(notificationService, times(1)).createNotification(eq(studentUser), anyString(), anyString(), eq("BORROW_REQUEST_SUBMITTED"), eq(100L), eq("BORROW_REQUEST"));
    }

    @Test
    @DisplayName("Prevent duplicate pending borrow request for the same user and book")
    void testCreateBorrowRequest_PreventsDuplicate() {
        BorrowRequestCreateDto dto = new BorrowRequestCreateDto(10L, "Duplicate");

        when(userRepository.findById(2L)).thenReturn(Optional.of(studentUser));
        when(bookRepository.findById(10L)).thenReturn(Optional.of(book));
        when(borrowRequestRepository.existsByUserIdAndBookIdAndStatus(2L, 10L, "PENDING")).thenReturn(true);

        BadRequestException ex = assertThrows(BadRequestException.class, () ->
                borrowRequestService.createBorrowRequest(dto, studentPrincipal)
        );

        assertTrue(ex.getMessage().contains("already have a pending borrow request"));
        verify(borrowRequestRepository, never()).save(any());
    }

    @Test
    @DisplayName("Librarian approves borrow request and decrements inventory")
    void testApproveAndIssueRequest_Success() {
        BorrowRequest request = new BorrowRequest();
        request.setId(100L);
        request.setBook(book);
        request.setUser(studentUser);
        request.setStatus("PENDING");

        when(borrowRequestRepository.findById(100L)).thenReturn(Optional.of(request));
        when(userRepository.findById(12L)).thenReturn(Optional.of(librarianUser));
        when(bookRepository.findByIdWithLock(10L)).thenReturn(Optional.of(book));
        when(borrowRequestRepository.save(any(BorrowRequest.class))).thenReturn(request);

        BorrowRequestResponse response = borrowRequestService.approveAndIssueRequest(100L, librarianPrincipal);

        assertNotNull(response);
        assertEquals("APPROVED", response.getStatus());
        assertEquals(2, book.getAvailableCopies()); // 3 decreased to 2
        verify(transactionRepository, times(1)).save(any(BorrowTransaction.class));
        verify(notificationService, times(1)).createNotification(eq(studentUser), anyString(), anyString(), eq("BOOK_ISSUED"), any(), eq("BORROW_TRANSACTION"));
    }

    @Test
    @DisplayName("Librarian rejects borrow request")
    void testRejectRequest_Success() {
        BorrowRequest request = new BorrowRequest();
        request.setId(100L);
        request.setBook(book);
        request.setUser(studentUser);
        request.setStatus("PENDING");

        when(borrowRequestRepository.findById(100L)).thenReturn(Optional.of(request));
        when(userRepository.findById(12L)).thenReturn(Optional.of(librarianUser));
        when(borrowRequestRepository.save(any(BorrowRequest.class))).thenReturn(request);

        BorrowRequestResponse response = borrowRequestService.rejectRequest(100L, "Reserved for semester exams", librarianPrincipal);

        assertNotNull(response);
        assertEquals("REJECTED", response.getStatus());
        assertEquals("Reserved for semester exams", response.getAdminNotes());
        verify(notificationService, times(1)).createNotification(eq(studentUser), anyString(), anyString(), eq("BORROW_REQUEST_REJECTED"), eq(100L), eq("BORROW_REQUEST"));
    }
}
