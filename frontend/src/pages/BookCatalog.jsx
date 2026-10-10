import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import {
  Search,
  Filter,
  Plus,
  BookOpen,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Info,
  Clock,
  BookmarkCheck,
  Check,
  X,
  AlertCircle,
  Send,
} from 'lucide-react';

export default function BookCatalog() {
  const { user } = useAuth();
  const isAdminOrLibrarian = user?.role === 'ROLE_ADMIN' || user?.role === 'ROLE_LIBRARIAN';
  const isPatron = user?.role === 'ROLE_STUDENT' || user?.role === 'ROLE_FACULTY';

  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('');
  const [availability, setAvailability] = useState('');

  // Modals & Feedback
  const [selectedBook, setSelectedBook] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [borrowLoadingId, setBorrowLoadingId] = useState(null);

  // User borrow states
  const [pendingBookIds, setPendingBookIds] = useState(new Set());
  const [borrowedBookIds, setBorrowedBookIds] = useState(new Set());

  const [newBook, setNewBook] = useState({
    isbn: '',
    title: '',
    author: '',
    categoryId: '',
    publisher: '',
    publicationYear: 2023,
    description: '',
    totalCopies: 5,
    coverImage: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=60',
  });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchCategories();
    if (isPatron) {
      fetchUserBorrowStates();
    }
  }, []);

  useEffect(() => {
    fetchBooks();
  }, [page, search, selectedCat, availability]);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      if (res.success && res.data) {
        setCategories(res.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchUserBorrowStates = async () => {
    try {
      // 1. Fetch user's pending requests
      const reqRes = await api.get('/borrow-requests/my');
      if (reqRes.success && reqRes.data) {
        const pending = new Set();
        (reqRes.data.content || []).forEach((r) => {
          if (r.status === 'PENDING') {
            pending.add(r.bookId);
          }
        });
        setPendingBookIds(pending);
      }

      // 2. Fetch user's currently borrowed books
      const activeRes = await api.get('/borrow/my-books');
      if (activeRes.success && activeRes.data) {
        const borrowed = new Set();
        (activeRes.data.content || []).forEach((t) => {
          if (t.status === 'ISSUED' && t.bookId) {
            borrowed.add(t.bookId);
          }
        });
        setBorrowedBookIds(borrowed);
      }
    } catch (err) {
      console.error('Failed to fetch user borrowing states:', err);
    }
  };

  const fetchBooks = async () => {
    setLoading(true);
    try {
      let url = `/books?page=${page}&size=12`;
      if (search) url += `&query=${encodeURIComponent(search)}`;
      if (selectedCat) url += `&categoryId=${selectedCat}`;
      if (availability === 'available') url += `&availableOnly=true`;
      if (availability === 'unavailable') url += `&availableOnly=false`;

      const res = await api.get(url);
      if (res.success && res.data) {
        setBooks(res.data.content || []);
        setTotalPages(res.data.totalPages || 0);
        setTotalElements(res.data.totalElements || 0);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(0);
    fetchBooks();
  };

  const handleRequestBorrow = async (book, e) => {
    if (e) e.stopPropagation();

    if (!user) {
      alert('Please sign in to request books.');
      return;
    }

    try {
      setBorrowLoadingId(book.id);
      const res = await api.post('/borrow-requests', { bookId: book.id });
      if (res.success) {
        setToastMessage(`Your request for "${book.title}" has been submitted successfully.`);
        setPendingBookIds((prev) => new Set([...prev, book.id]));
      }
    } catch (err) {
      alert(err.message || 'Failed to submit borrow request.');
    } finally {
      setBorrowLoadingId(null);
    }
  };

  const handleCreateBook = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);
    try {
      const res = await api.post('/books', newBook);
      if (res.success) {
        setIsAddModalOpen(false);
        setNewBook({
          isbn: '',
          title: '',
          author: '',
          categoryId: '',
          publisher: '',
          publicationYear: 2023,
          description: '',
          totalCopies: 5,
          coverImage: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=60',
        });
        setToastMessage(`Book "${newBook.title}" added to catalogue.`);
        fetchBooks();
      }
    } catch (err) {
      setFormError(err.message || 'Failed to add book');
    } finally {
      setSubmitting(false);
    }
  };

  // Helper to render book action button based on live state
  const renderBorrowButton = (b, isModal = false) => {
    if (isAdminOrLibrarian) {
      return (
        <span style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}>
          {b.availableCopies} in stock
        </span>
      );
    }

    const isBorrowed = borrowedBookIds.has(b.id);
    const isPending = pendingBookIds.has(b.id);
    const isAvailable = b.availableCopies > 0;
    const isLoading = borrowLoadingId === b.id;

    if (isBorrowed) {
      return (
        <span
          className="badge badge-info"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '6px 12px' }}
        >
          <BookmarkCheck size={14} /> Currently Borrowed
        </span>
      );
    }

    if (isPending) {
      return (
        <span
          className="badge badge-warning"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '6px 12px' }}
        >
          <Clock size={14} /> Request Pending
        </span>
      );
    }

    if (!isAvailable) {
      return (
        <button
          className="btn btn-secondary btn-sm"
          disabled
          style={{ cursor: 'not-allowed', opacity: 0.65 }}
          title="All physical copies are currently borrowed"
        >
          Currently Unavailable
        </button>
      );
    }

    return (
      <button
        onClick={(e) => handleRequestBorrow(b, e)}
        className="btn btn-primary btn-sm"
        disabled={isLoading}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          fontWeight: 600,
          backgroundColor: '#0F9D8A',
          borderColor: '#0F9D8A',
        }}
      >
        <Send size={14} />
        {isLoading ? 'Submitting...' : 'Request to Borrow'}
      </button>
    );
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Book Catalogue</h1>
          <p className="page-subtitle">
            Browse {totalElements} engineering, science, and academic books across campus departments
          </p>
        </div>
        {isAdminOrLibrarian && (
          <button onClick={() => setIsAddModalOpen(true)} className="btn btn-primary">
            <Plus size={18} /> Add New Book
          </button>
        )}
      </div>

      {toastMessage && (
        <div
          style={{
            backgroundColor: '#DCFCE7',
            border: '1px solid #86EFAC',
            color: '#15803D',
            padding: '12px 16px',
            borderRadius: '8px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}>
            <CheckCircle size={18} />
            <span>{toastMessage}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#15803D' }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div
        className="card"
        style={{
          padding: '16px 20px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '14px',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '8px', flex: '1', minWidth: '280px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '11px', color: '#94A3B8' }} />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '38px' }}
              placeholder="Search title, author, or ISBN..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-secondary">
            Search
          </button>
        </form>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <Filter size={18} color="#64748B" />
          <select
            className="form-select"
            style={{ width: '210px' }}
            value={selectedCat}
            onChange={(e) => {
              setSelectedCat(e.target.value);
              setPage(0);
            }}
          >
            <option value="">All Categories ({categories.length})</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            className="form-select"
            style={{ width: '150px' }}
            value={availability}
            onChange={(e) => {
              setAvailability(e.target.value);
              setPage(0);
            }}
          >
            <option value="">Availability</option>
            <option value="available">In Stock</option>
            <option value="unavailable">Out of Stock</option>
          </select>
        </div>
      </div>

      {/* Book Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#2563EB', fontWeight: 600 }}>
          Loading books catalog...
        </div>
      ) : books.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px 20px', color: '#64748B' }}>
          <BookOpen size={48} style={{ margin: '0 auto 12px', color: '#CBD5E1' }} />
          <h3 style={{ fontSize: '1.1rem', color: '#142D4E', fontWeight: 700 }}>No books match your criteria</h3>
          <p style={{ fontSize: '0.88rem', marginTop: '4px' }}>Try adjusting your search terms or filters.</p>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
            gap: '20px',
            marginBottom: '28px',
          }}
        >
          {books.map((b) => {
            const isAvail = b.availableCopies > 0;
            return (
              <div
                key={b.id}
                className="card"
                style={{
                  margin: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  borderRadius: '12px',
                  border: '1px solid #E2E8F0',
                  boxShadow: 'var(--shadow-sm)',
                  transition: 'transform 0.15s, box-shadow 0.15s',
                  padding: '20px',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#2563EB', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      {b.categoryName}
                    </span>
                    <span className={`badge ${isAvail ? 'badge-success' : 'badge-danger'}`}>
                      {isAvail ? `${b.availableCopies} available` : 'Issued Out'}
                    </span>
                  </div>

                  <h3
                    style={{
                      fontSize: '1.05rem',
                      fontWeight: 700,
                      color: '#142D4E',
                      lineHeight: 1.35,
                      marginBottom: '4px',
                    }}
                  >
                    {b.title}
                  </h3>

                  <div style={{ fontSize: '0.85rem', color: '#64748B', marginBottom: '12px', fontWeight: 500 }}>
                    by {b.author}
                  </div>

                  <p
                    style={{
                      fontSize: '0.82rem',
                      color: '#64748B',
                      lineHeight: 1.45,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      marginBottom: '16px',
                    }}
                  >
                    {b.description}
                  </p>
                </div>

                <div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      borderTop: '1px solid #F1F5F9',
                      paddingTop: '12px',
                      marginBottom: '14px',
                      fontSize: '0.78rem',
                      color: '#94A3B8',
                    }}
                  >
                    <span>ISBN: {b.isbn}</span>
                    <span style={{ fontWeight: 600, color: '#142D4E' }}>
                      {b.availableCopies} / {b.totalCopies} copies
                    </span>
                  </div>

                  {/* Actions Row */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                    <button
                      onClick={() => setSelectedBook(b)}
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: '0.82rem' }}
                    >
                      <Info size={14} /> View Details
                    </button>
                    {renderBorrowButton(b)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', margin: '20px 0' }}>
          <button
            className="btn btn-secondary btn-sm"
            disabled={page === 0}
            onClick={() => setPage(page - 1)}
          >
            <ChevronLeft size={16} /> Previous
          </button>
          <span style={{ fontSize: '0.88rem', color: '#64748B' }}>
            Page <strong>{page + 1}</strong> of <strong>{totalPages}</strong> ({totalElements} books)
          </span>
          <button
            className="btn btn-secondary btn-sm"
            disabled={page >= totalPages - 1}
            onClick={() => setPage(page + 1)}
          >
            Next <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* Book Detail Modal */}
      <Modal
        isOpen={!!selectedBook}
        onClose={() => setSelectedBook(null)}
        title={selectedBook?.title || 'Book Details'}
      >
        {selectedBook && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px' }}>
              <span className="badge badge-info">{selectedBook.categoryName}</span>
              <span className={`badge ${selectedBook.availableCopies > 0 ? 'badge-success' : 'badge-danger'}`}>
                {selectedBook.availableCopies > 0 ? `${selectedBook.availableCopies} Copies Available` : 'All Copies Issued Out'}
              </span>
            </div>

            <div style={{ marginBottom: '16px', fontSize: '0.9rem', color: '#142D4E', lineHeight: 1.6 }}>
              <div><strong>Author(s):</strong> {selectedBook.author}</div>
              <div><strong>Publisher:</strong> {selectedBook.publisher} ({selectedBook.publicationYear})</div>
              <div><strong>ISBN:</strong> {selectedBook.isbn}</div>
              <div><strong>Inventory Status:</strong> {selectedBook.availableCopies} available of {selectedBook.totalCopies} total copies</div>
            </div>

            <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '12px', marginBottom: '20px' }}>
              <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#142D4E', marginBottom: '6px' }}>Course Summary</h4>
              <p style={{ fontSize: '0.85rem', color: '#64748B', lineHeight: 1.5 }}>{selectedBook.description}</p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #E2E8F0', paddingTop: '16px' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setSelectedBook(null)}
              >
                Close
              </button>

              {renderBorrowButton(selectedBook, true)}
            </div>
          </div>
        )}
      </Modal>

      {/* Add New Book Modal (Admin / Librarian) */}
      {isAdminOrLibrarian && (
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title="Add New Book to Catalogue"
        >
          {formError && (
            <div style={{ background: '#FEE2E2', color: '#DC2626', padding: '10px', borderRadius: '6px', marginBottom: '14px', fontSize: '0.85rem' }}>
              {formError}
            </div>
          )}

          <form onSubmit={handleCreateBook}>
            <div className="form-group">
              <label className="form-label">ISBN (Unique)</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. 978-0-134685-9"
                value={newBook.isbn}
                onChange={(e) => setNewBook({ ...newBook, isbn: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Book Title</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Clean Architecture"
                value={newBook.title}
                onChange={(e) => setNewBook({ ...newBook, title: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Author(s)</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Robert C. Martin"
                value={newBook.author}
                onChange={(e) => setNewBook({ ...newBook, author: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Category</label>
              <select
                className="form-select"
                value={newBook.categoryId}
                onChange={(e) => setNewBook({ ...newBook, categoryId: e.target.value })}
                required
              >
                <option value="">Select Category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">Publisher</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Prentice Hall"
                  value={newBook.publisher}
                  onChange={(e) => setNewBook({ ...newBook, publisher: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Publication Year</label>
                <input
                  type="number"
                  className="form-input"
                  value={newBook.publicationYear}
                  onChange={(e) => setNewBook({ ...newBook, publicationYear: parseInt(e.target.value) })}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Total Physical Copies</label>
              <input
                type="number"
                min="1"
                className="form-input"
                value={newBook.totalCopies}
                onChange={(e) => setNewBook({ ...newBook, totalCopies: parseInt(e.target.value) })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                rows="3"
                className="form-textarea"
                placeholder="Brief summary and course relevance..."
                value={newBook.description}
                onChange={(e) => setNewBook({ ...newBook, description: e.target.value })}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setIsAddModalOpen(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting}
              >
                {submitting ? 'Adding...' : 'Add Book'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
