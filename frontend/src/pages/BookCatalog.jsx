import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import Badge from '../components/Badge';
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
} from 'lucide-react';

export default function BookCatalog() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ROLE_ADMIN';

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

  // Modals
  const [selectedBook, setSelectedBook] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
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

  const handleCreateBook = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);
    try {
      const res = await api.post('/admin/books', newBook);
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
        fetchBooks();
      }
    } catch (err) {
      setFormError(err.message || 'Failed to add book');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Book Catalogue</h1>
          <p className="page-subtitle">
            Browse {totalElements} books across academic engineering & science departments
          </p>
        </div>
        {isAdmin && (
          <button onClick={() => setIsAddModalOpen(true)} className="btn btn-primary">
            <Plus size={18} /> Add New Book
          </button>
        )}
      </div>

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
              placeholder="Search by title, author, or ISBN..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-secondary">
            Search
          </button>
        </form>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <select
            className="form-select"
            style={{ width: 'auto', minWidth: '180px' }}
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
            style={{ width: 'auto', minWidth: '150px' }}
            value={availability}
            onChange={(e) => {
              setAvailability(e.target.value);
              setPage(0);
            }}
          >
            <option value="">All Availability</option>
            <option value="available">Available Copies</option>
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
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
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
                  cursor: 'pointer',
                  transition: 'transform 0.15s, box-shadow 0.15s',
                }}
                onClick={() => setSelectedBook(b)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#2563EB' }}>
                      {b.categoryName}
                    </span>
                    <span className={`badge ${isAvail ? 'badge-success' : 'badge-danger'}`}>
                      {isAvail ? `${b.availableCopies} available` : 'Issued Out'}
                    </span>
                  </div>

                  <h3
                    style={{
                      fontSize: '1rem',
                      fontWeight: 700,
                      color: '#142D4E',
                      lineHeight: 1.3,
                      marginBottom: '6px',
                    }}
                  >
                    {b.title}
                  </h3>

                  <div style={{ fontSize: '0.85rem', color: '#64748B', marginBottom: '12px' }}>
                    by {b.author}
                  </div>

                  <p
                    style={{
                      fontSize: '0.8rem',
                      color: '#64748B',
                      lineHeight: 1.4,
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

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderTop: '1px solid #F1F5F9',
                    paddingTop: '12px',
                    fontSize: '0.78rem',
                    color: '#94A3B8',
                  }}
                >
                  <span>ISBN: {b.isbn}</span>
                  <span style={{ fontWeight: 600, color: '#142D4E' }}>
                    {b.availableCopies} / {b.totalCopies} copies
                  </span>
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
            Page <strong>{page + 1}</strong> of <strong>{totalPages}</strong>
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
                {selectedBook.availableCopies > 0 ? `${selectedBook.availableCopies} Copies Available` : 'All Copies Borrowed'}
              </span>
            </div>

            <div style={{ marginBottom: '16px', fontSize: '0.9rem', color: '#142D4E' }}>
              <div><strong>Author:</strong> {selectedBook.author}</div>
              <div><strong>Publisher:</strong> {selectedBook.publisher} ({selectedBook.publicationYear})</div>
              <div><strong>ISBN:</strong> {selectedBook.isbn}</div>
              <div><strong>Copies Inventory:</strong> {selectedBook.availableCopies} available out of {selectedBook.totalCopies} physical copies</div>
            </div>

            <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '12px', marginBottom: '20px' }}>
              <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#142D4E', marginBottom: '6px' }}>Summary</h4>
              <p style={{ fontSize: '0.85rem', color: '#64748B', lineHeight: 1.5 }}>{selectedBook.description}</p>
            </div>

            {isAdmin && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  className="btn btn-secondary"
                  onClick={() => setSelectedBook(null)}
                >
                  Close
                </button>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Add New Book Modal (Admin Only) */}
      {isAdmin && (
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
