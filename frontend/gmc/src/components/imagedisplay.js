import { useEffect, useState } from 'react';
import axiosInstance from './axiosInstance';

const ImageGallery = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await axiosInstance.get('images/images');
        setImages(response.data);
      } catch (err) {
        setError('Error fetching images.');
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-lg font-bold mb-4">Image Gallery</h2>
      {loading && <p>Loading images...</p>}
      {error && <p className="text-red-500">{error}</p>}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {images.map((image) => (
          <div key={image._id} className="border p-2 rounded-lg shadow">
            <img src={image.url} alt={image.description} className="w-full h-48 object-cover rounded" />
            <p className="mt-2 text-sm">{image.description || 'No description'}</p>
            <p className="text-xs text-gray-500">Tags: {image.tags}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImageGallery;
