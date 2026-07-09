import { useState, useEffect } from 'react';
import api from '../api';

export default function Settings() {
  const [isPublic, setIsPublic] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const username = localStorage.getItem('user'); // this is the user's `name`, per your Login.jsx

  // Fetch current privacy setting from the server on load.
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await api.get(`/users/${username}`);
        setIsPublic(data.user.isPublic);
      } catch (err) {
        setError('Could not load current settings');
      } finally {
        setLoading(false);
      }
    };
    if (username) fetchProfile();
  }, [username]);

  const handleTogglePrivacy = async () => {
    setSaving(true);
    setError('');
    try {
      const { data } = await api.put('/users/me/privacy');
      setIsPublic(data.isPublic);
    } catch (err) {
      setError('Something went wrong. Try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-6 text-gray-500">Loading settings...</div>;

  return (
    <div className="max-w-lg mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-6">Settings</h1>

      <div className="border rounded-lg p-4 flex items-center justify-between">
        <div>
          <h2 className="font-medium">Profile Visibility</h2>
          <p className="text-sm text-gray-500 mt-1">
            {isPublic
              ? 'Your profile and public trips are visible to everyone.'
              : 'Your profile is private. Only you can see your trips.'}
          </p>
        </div>

        <button
          onClick={handleTogglePrivacy}
          disabled={saving}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            isPublic ? 'bg-green-500' : 'bg-gray-300'
          } ${saving ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              isPublic ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {error && <p className="text-red-500 text-sm mt-3">{error}</p>}
    </div>
  );
}