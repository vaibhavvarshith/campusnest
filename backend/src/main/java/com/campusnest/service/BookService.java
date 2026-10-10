package com.campusnest.service;

import com.campusnest.dto.book.BookRequest;
import com.campusnest.dto.book.BookResponse;
import com.campusnest.dto.common.PagedResponse;
import com.campusnest.entity.Book;
import com.campusnest.entity.Category;
import com.campusnest.exception.BadRequestException;
import com.campusnest.exception.ResourceNotFoundException;
import com.campusnest.repository.BookRepository;
import com.campusnest.repository.CategoryRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class BookService {

    private final BookRepository bookRepository;
    private final CategoryRepository categoryRepository;

    public BookService(BookRepository bookRepository, CategoryRepository categoryRepository) {
        this.bookRepository = bookRepository;
        this.categoryRepository = categoryRepository;
    }

    @Transactional(readOnly = true)
    public PagedResponse<BookResponse> searchBooks(String query, Long categoryId, Boolean availableOnly, Pageable pageable) {
        Page<Book> bookPage = bookRepository.searchBooks(query, categoryId, availableOnly, pageable);
        List<BookResponse> responses = bookPage.getContent().stream()
                .map(this::mapToResponse)
                .toList();

        return PagedResponse.of(responses, bookPage);
    }

    @Transactional(readOnly = true)
    public BookResponse getBookById(Long id) {
        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Book not found with id: " + id));
        return mapToResponse(book);
    }

    @Transactional
    public BookResponse createBook(BookRequest request) {
        if (bookRepository.existsByIsbn(request.getIsbn())) {
            throw new BadRequestException("Book with ISBN " + request.getIsbn() + " already exists");
        }

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + request.getCategoryId()));

        Book book = new Book();
        book.setIsbn(request.getIsbn());
        book.setTitle(request.getTitle());
        book.setAuthor(request.getAuthor());
        book.setCategory(category);
        book.setPublisher(request.getPublisher());
        book.setPublicationYear(request.getPublicationYear());
        book.setDescription(request.getDescription());
        book.setTotalCopies(request.getTotalCopies());
        book.setAvailableCopies(request.getTotalCopies());
        book.setCoverImage(request.getCoverImage());

        Book saved = bookRepository.save(book);
        return mapToResponse(saved);
    }

    @Transactional
    public BookResponse updateBook(Long id, BookRequest request) {
        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Book not found with id: " + id));

        if (!book.getIsbn().equals(request.getIsbn()) && bookRepository.existsByIsbn(request.getIsbn())) {
            throw new BadRequestException("Book with ISBN " + request.getIsbn() + " already exists");
        }

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + request.getCategoryId()));

        int copiesDifference = request.getTotalCopies() - book.getTotalCopies();
        int newAvailable = book.getAvailableCopies() + copiesDifference;
        if (newAvailable < 0) {
            throw new BadRequestException("Cannot reduce total copies below currently issued copies count");
        }

        book.setIsbn(request.getIsbn());
        book.setTitle(request.getTitle());
        book.setAuthor(request.getAuthor());
        book.setCategory(category);
        book.setPublisher(request.getPublisher());
        book.setPublicationYear(request.getPublicationYear());
        book.setDescription(request.getDescription());
        book.setTotalCopies(request.getTotalCopies());
        book.setAvailableCopies(newAvailable);
        if (request.getCoverImage() != null) {
            book.setCoverImage(request.getCoverImage());
        }

        Book updated = bookRepository.save(book);
        return mapToResponse(updated);
    }

    @Transactional
    public void deleteBook(Long id) {
        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Book not found with id: " + id));

        if (book.getAvailableCopies() < book.getTotalCopies()) {
            throw new BadRequestException("Cannot delete book while copies are currently issued to patrons");
        }

        bookRepository.delete(book);
    }

    public BookResponse mapToResponse(Book book) {
        BookResponse response = new BookResponse();
        response.setId(book.getId());
        response.setIsbn(book.getIsbn());
        response.setTitle(book.getTitle());
        response.setAuthor(book.getAuthor());
        response.setCategoryId(book.getCategory().getId());
        response.setCategoryName(book.getCategory().getName());
        response.setPublisher(book.getPublisher());
        response.setPublicationYear(book.getPublicationYear());
        response.setDescription(book.getDescription());
        response.setTotalCopies(book.getTotalCopies());
        response.setAvailableCopies(book.getAvailableCopies());
        response.setCoverImage(book.getCoverImage());
        response.setCreatedAt(book.getCreatedAt());
        response.setUpdatedAt(book.getUpdatedAt());
        return response;
    }
}
