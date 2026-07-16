import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import './Profile.css';

const API_URL = 'http://localhost:5000';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({});
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [photoLoading, setPhotoLoading] = useState(false);

  const loadProfile = async () => {
    const res = await api.get('/profile/me');
    setProfile(res.data);
    setForm(res.data);
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const getImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return `${API_URL}${url}`;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const data = new FormData();
    data.append('avatar', file);

    try {
      setPhotoLoading(true);
      const res = await api.put('/profile/photo', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setProfile(res.data);
      setForm(res.data);
      toast.success('Profile photo updated');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to upload photo');
    } finally {
      setPhotoLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);

      const res = await api.put('/profile/me', {
        fullName: form.fullName,
        phone: form.phone,
        address: form.address,
        city: form.city
      });

      setProfile(res.data);
      setForm(res.data);
      setEditing(false);
      toast.success('Profile updated');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (!profile) {
    return <div className="profile-page">Loading profile...</div>;
  }

  return (
    <div className="profile-page">
      <div className="profile-card">
        <div className="profile-top">
          <div className="profile-avatar">
            {profile.avatarUrl ? (
              <img src={getImageUrl(profile.avatarUrl)} alt="Profile" />
            ) : (
              profile.fullName?.charAt(0).toUpperCase()
            )}
          </div>

          <label className="photo-btn">
            {photoLoading ? 'Uploading...' : 'Change Photo'}
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              hidden
            />
          </label>

          <h1>{profile.fullName}</h1>
          <p>{profile.role}</p>
        </div>

        <div className="profile-grid">
          <div className="field">
            <label>Full Name</label>
            {editing ? (
              <input name="fullName" value={form.fullName || ''} onChange={handleChange} />
            ) : (
              <strong>{profile.fullName}</strong>
            )}
          </div>

          <div className="field">
            <label>Email</label>
            <strong>{profile.email}</strong>
          </div>

          <div className="field">
            <label>Phone</label>
            {editing ? (
              <input name="phone" value={form.phone || ''} onChange={handleChange} />
            ) : (
              <strong>{profile.phone || 'Not added'}</strong>
            )}
          </div>

          <div className="field">
            <label>City</label>
            {editing ? (
              <input name="city" value={form.city || ''} onChange={handleChange} />
            ) : (
              <strong>{profile.city || 'Not added'}</strong>
            )}
          </div>

          <div className="field full">
            <label>Address</label>
            {editing ? (
              <textarea name="address" value={form.address || ''} onChange={handleChange} />
            ) : (
              <strong>{profile.address || 'Not added'}</strong>
            )}
          </div>
        </div>

        <div className="profile-actions">
          {editing ? (
            <>
              <button className="save-btn" onClick={handleSave} disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
              </button>

              <button
                className="cancel-btn"
                onClick={() => {
                  setEditing(false);
                  setForm(profile);
                }}
              >
                Cancel
              </button>
            </>
          ) : (
            <button className="edit-btn" onClick={() => setEditing(true)}>
              Edit Profile
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;