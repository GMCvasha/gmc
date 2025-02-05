import { useState } from 'react';
import axios from 'axios';
import axiosInstance from './axiosInstance';
const ImageUpload = ({ username }) => {
  const [image, setImage] = useState(null);
  const [description, setDescription] = useState('');
  const [dateTaken, setDateTaken] = useState('');
  const [tags, setTags] = useState('');
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!image) {
      setMessage('Please select an image.');
      return;
    }

    const formData = new FormData();
    formData.append('image', image);
    formData.append('description', description);
    formData.append('dateTaken', dateTaken);
    formData.append('tags', tags);

    try {
      setUploading(true);
      setMessage('');

      const response = await axiosInstance.put(
        `/images/image`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      setMessage(response.data.message);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Error uploading image.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg w-96 mx-auto">
      <h2 className="text-lg font-bold mb-2">Upload Profile Image</h2>
      <input type="file" accept="image/*" onChange={handleImageChange} className="mb-2" />
      <input
        type="text"
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="w-full p-2 border rounded mb-2"
      />
      <input
        type="date"
        value={dateTaken}
        onChange={(e) => setDateTaken(e.target.value)}
        className="w-full p-2 border rounded mb-2"
      />
      <input
        type="text"
        placeholder="Tags (optional)"
        value={tags}
        onChange={(e) => setTags(e.target.value)}
        className="w-full p-2 border rounded mb-2"
      />
      <button
        onClick={handleUpload}
        disabled={uploading}
        className="bg-blue-500 text-white p-2 rounded w-full"
      >
        {uploading ? 'Uploading...' : 'Upload Image'}
      </button>
      {message && <p className="mt-2 text-sm text-center">{message}</p>}
    </div>
  );
};

export default ImageUpload;
