import { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const Inventory = () => {
  const [artworks, setArtworks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingArtwork, setEditingArtwork] = useState(null);

  const [form, setForm] = useState({
    title: '',
    description: '',
    artistBio: '',
    categoryId: '',
    basePrice: '',
    isLimitedEdition: false,
    isFeatured: false,
    imageUrl: ''
  });

  useEffect(() => {
    fetchArtworks();
    fetchCategories();
  }, []);

  const fetchArtworks = async () => {
    try {
      const res = await api.get('/artworks?limit=50');
      setArtworks(res.data.artworks || []);
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get('/artworks/categories');
      setCategories(res.data.categories || []);
    } catch (error) {
      console.error('Categories error:', error);
    }
  };

  const handleChange = (e) => {
    const value =
      e.target.type === 'checkbox' ? e.target.checked : e.target.value;

    setForm({ ...form, [e.target.name]: value });
  };

  const resetForm = () => {
    setForm({
      title: '',
      description: '',
      artistBio: '',
      categoryId: '',
      basePrice: '',
      isLimitedEdition: false,
      isFeatured: false,
      imageUrl: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingArtwork) {
        await api.put(`/artworks/${editingArtwork.id}`, form);
        toast.success('Artwork updated!');
      } else {
        await api.post('/artworks', form);
        toast.success('Artwork created!');
      }

      setShowForm(false);
      setEditingArtwork(null);
      resetForm();
      fetchArtworks();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error saving artwork');
    }
  };

  const handleEdit = (artwork) => {
    setEditingArtwork(artwork);

    setForm({
      title: artwork.title,
      description: artwork.description || '',
      artistBio: artwork.artist_bio || '',
      categoryId: artwork.category_id || '',
      basePrice: artwork.base_price,
      isLimitedEdition: artwork.is_limited_edition,
      isFeatured: artwork.is_featured,
      imageUrl: artwork.image_url
    });

    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this artwork from store?')) return;

    try {
      await api.delete(`/artworks/${id}`);
      toast.success('Artwork removed!');
      fetchArtworks();
    } catch (error) {
      toast.error('Error removing artwork');
    }
  };

  return (
    <div className="inventory-page">
      <style>{pageStyle}</style>

      <div className="inventory-header">
        <div>
          <h1>Store Inventory</h1>
          <p>Manage your artwork collection, pricing, and featured pieces.</p>
        </div>

        <button
          onClick={() => {
            setShowForm(true);
            setEditingArtwork(null);
            resetForm();
          }}
          className="primary-btn"
        >
          + Add Artwork
        </button>
      </div>

      {showForm && (
        <div className="form-card">
          <h3>{editingArtwork ? 'Edit Artwork' : 'Add New Artwork'}</h3>

          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label>Artwork Title *</label>
                <input
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="Enter artwork title"
                  required
                />
              </div>

              <div className="form-group">
                <label>Base Price (NPR) *</label>
                <input
                  name="basePrice"
                  type="number"
                  value={form.basePrice}
                  onChange={handleChange}
                  placeholder="0.00"
                  required
                />
              </div>

              <div className="form-group">
                <label>Category</label>
                <select
                  name="categoryId"
                  value={form.categoryId}
                  onChange={handleChange}
                >
                  <option value="">Select a category</option>

                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Image URL *</label>
                <input
                  name="imageUrl"
                  value={form.imageUrl}
                  onChange={handleChange}
                  placeholder="https://..."
                  required
                />
              </div>

              <div className="form-group full">
                <label>Description</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Describe the artwork..."
                  rows={3}
                />
              </div>

              <div className="form-group full">
                <label>Artist Bio</label>
                <textarea
                  name="artistBio"
                  value={form.artistBio}
                  onChange={handleChange}
                  placeholder="About the artist..."
                  rows={2}
                />
              </div>
            </div>

            <div className="checkbox-row">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="isFeatured"
                  checked={form.isFeatured}
                  onChange={handleChange}
                />
                Featured on homepage
              </label>

              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="isLimitedEdition"
                  checked={form.isLimitedEdition}
                  onChange={handleChange}
                />
                Limited Edition
              </label>
            </div>

            <div className="form-actions">
              <button type="submit" className="primary-btn">
                {editingArtwork ? 'Save Changes' : 'Save and Publish'}
              </button>

              <button
                type="button"
                className="secondary-btn"
                onClick={() => {
                  setShowForm(false);
                  setEditingArtwork(null);
                  resetForm();
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="state-box">Loading inventory...</div>
      ) : (
        <div className="table-card">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  {['Artwork', 'Category', 'Price', 'Featured', 'Actions'].map(
                    (h) => (
                      <th key={h}>{h}</th>
                    )
                  )}
                </tr>
              </thead>

              <tbody>
                {artworks.map((artwork) => (
                  <tr key={artwork.id}>
                    <td>
                      <div className="artwork-cell">
                        <img src={artwork.image_url} alt={artwork.title} />

                        <div>
                          <div className="artwork-title">{artwork.title}</div>
                          <div className="sku">{artwork.sku}</div>
                        </div>
                      </div>
                    </td>

                    <td>{artwork.category_name || '—'}</td>

                    <td className="strong">
                      NPR {parseFloat(artwork.base_price).toLocaleString()}
                    </td>

                    <td>
                      <span
                        className={
                          artwork.is_featured
                            ? 'feature-pill active'
                            : 'feature-pill'
                        }
                      >
                        {artwork.is_featured ? 'Featured' : 'Standard'}
                      </span>
                    </td>

                    <td>
                      <div className="action-row">
                        <button
                          onClick={() => handleEdit(artwork)}
                          className="edit-btn"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => handleDelete(artwork.id)}
                          className="delete-btn"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {artworks.length === 0 && (
                  <tr>
                    <td colSpan="5" className="empty-row">
                      No artworks found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

const pageStyle = `
  @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600;700&family=Poppins:wght@300;400;500;600;700&display=swap');

  .inventory-page {
    min-height: 100vh;
    background:
      radial-gradient(circle at top left, rgba(156, 163, 142, 0.18), transparent 30%),
      linear-gradient(135deg, #fffaf3 0%, #f4ede3 55%, #fffdf8 100%);
    padding: 2rem;
    font-family: 'Poppins', sans-serif;
    color: #463f39;
  }

  .inventory-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    gap: 20px;
    margin-bottom: 2rem;
  }

  .inventory-header h1 {
    font-family: 'Fredoka', sans-serif;
    font-size: 42px;
    color: #332f2b;
    margin: 0 0 6px;
  }

  .inventory-header p {
    color: #8b7d73;
    font-size: 14px;
    margin: 0;
  }

  .primary-btn {
    border: none;
    background: #929b83;
    color: white;
    padding: 12px 22px;
    border-radius: 16px;
    font-size: 14px;
    font-weight: 900;
    cursor: pointer;
    box-shadow: 0 14px 30px rgba(146, 155, 131, 0.25);
    transition: 0.25s ease;
    white-space: nowrap;
  }

  .primary-btn:hover {
    transform: translateY(-2px);
  }

  .secondary-btn {
    background: rgba(255,255,255,0.7);
    color: #5d5148;
    border: 1px solid #d8c7b5;
    padding: 12px 22px;
    border-radius: 16px;
    font-size: 14px;
    font-weight: 900;
    cursor: pointer;
  }

  .form-card,
  .table-card {
    background: rgba(255, 252, 247, 0.9);
    border: 1px solid rgba(212, 197, 176, 0.65);
    border-radius: 30px;
    box-shadow: 0 22px 58px rgba(61, 54, 48, 0.09);
    backdrop-filter: blur(12px);
  }

  .form-card {
    padding: 26px;
    margin-bottom: 2rem;
  }

  .form-card h3 {
    font-family: 'Fredoka', sans-serif;
    color: #332f2b;
    font-size: 26px;
    margin: 0 0 22px;
  }

  .form-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    margin-bottom: 16px;
  }

  .form-group.full {
    grid-column: span 2;
  }

  label {
    display: block;
    color: #8b7d73;
    font-size: 12px;
    font-weight: 900;
    margin-bottom: 8px;
    text-transform: uppercase;
    letter-spacing: 0.7px;
  }

  input,
  select,
  textarea {
    width: 100%;
    box-sizing: border-box;
    padding: 13px 15px;
    border-radius: 16px;
    border: 1px solid #d8c7b5;
    background: rgba(255,255,255,0.78);
    color: #332f2b;
    outline: none;
    font-size: 13px;
    font-family: 'Poppins', sans-serif;
    transition: 0.25s ease;
  }

  textarea {
    resize: vertical;
  }

  input:focus,
  select:focus,
  textarea:focus {
    border-color: #929b83;
    box-shadow: 0 0 0 4px rgba(146, 155, 131, 0.14);
  }

  .checkbox-row {
    display: flex;
    gap: 24px;
    flex-wrap: wrap;
    margin-bottom: 20px;
  }

  .checkbox-label {
    display: flex;
    align-items: center;
    gap: 9px;
    text-transform: none;
    letter-spacing: 0;
    font-size: 13px;
    color: #675d55;
    cursor: pointer;
  }

  .checkbox-label input {
    width: auto;
  }

  .form-actions {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
  }

  .table-card {
    overflow: hidden;
  }

  .table-wrap {
    overflow-x: auto;
  }

  table {
    width: 100%;
    border-collapse: collapse;
  }

  thead {
    background: rgba(247, 241, 232, 0.9);
  }

  th {
    padding: 13px 18px;
    text-align: left;
    color: #8b7d73;
    font-size: 11px;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: 0.9px;
    white-space: nowrap;
  }

  td {
    padding: 15px 18px;
    border-bottom: 1px solid #eee3d5;
    color: #675d55;
    font-size: 13px;
    white-space: nowrap;
  }

  .artwork-cell {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .artwork-cell img {
    width: 48px;
    height: 48px;
    object-fit: cover;
    border-radius: 14px;
  }

  .artwork-title {
    color: #332f2b;
    font-weight: 900;
    margin-bottom: 3px;
  }

  .sku {
    color: #9a8b7f;
    font-size: 11px;
  }

  .strong {
    color: #332f2b;
    font-weight: 900;
  }

  .feature-pill {
    background: rgba(247, 241, 232, 0.9);
    color: #8b7d73;
    padding: 6px 13px;
    border-radius: 999px;
    font-size: 11px;
    font-weight: 900;
  }

  .feature-pill.active {
    background: rgba(146, 155, 131, 0.16);
    color: #5f6b51;
  }

  .action-row {
    display: flex;
    gap: 8px;
  }

  .edit-btn,
  .delete-btn {
    padding: 7px 13px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 900;
    cursor: pointer;
  }

  .edit-btn {
    background: rgba(255,255,255,0.7);
    border: 1px solid #d8c7b5;
    color: #5d5148;
  }

  .delete-btn {
    background: rgba(163, 45, 45, 0.08);
    border: 1px solid rgba(163, 45, 45, 0.18);
    color: #a32d2d;
  }

  .state-box,
  .empty-row {
    text-align: center;
    padding: 3rem;
    color: #8b7d73;
    font-weight: 800;
  }

  @media (max-width: 760px) {
    .inventory-page {
      padding: 1.3rem;
    }

    .inventory-header {
      flex-direction: column;
      align-items: flex-start;
    }

    .inventory-header h1 {
      font-size: 34px;
    }

    .form-grid {
      grid-template-columns: 1fr;
    }

    .form-group.full {
      grid-column: span 1;
    }
  }
`;

export default Inventory;