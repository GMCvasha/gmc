import { useEffect, useState } from 'react';
import axiosInstance from './axiosInstance';
import "./styles/imagedisplay.css";

const ImageGallery = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const imagesPerPage = 8;

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

  // Group images by tags
  const groupedImages = images.reduce((acc, image) => {
    (acc[image.tags] = acc[image.tags] || []).push(image);
    return acc;
  }, {});

  // Pagination Logic
  const totalPages = Math.ceil(images.length / imagesPerPage);
  const currentImages = images.slice((currentPage - 1) * imagesPerPage, currentPage * imagesPerPage);

  return (
    <div className="imgdisp-container">
      <h2 className="imgdisp-title">Image Gallery</h2>
      {loading && <p className="imgdisp-loading">Loading images...</p>}
      {error && <p className="imgdisp-error">{error}</p>}
      
      {!loading && !error && (
        <>
          <div className="imgdisp-groups">
            {Object.keys(groupedImages).map((tag) => (
              <div key={tag} className="imgdisp-group">
                <h3 className="imgdisp-group-title">{tag}</h3>
                <div className="imgdisp-grid">
                  {currentImages
                    .filter(image => image.tags === tag)
                    .map((image) => (
                      <div key={image._id} className="imgdisp-item">
                        <img 
                          src={image.url} 
                          alt={image.description} 
                          className="imgdisp-image"
                        />
                        <p className="imgdisp-desc">{image.description || 'No description'}</p>
                        <p className="imgdisp-tags">Tags: {image.tags}</p>
                      </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="imgdisp-pagination">
              <button 
                className="imgdisp-page-btn" 
                disabled={currentPage === 1} 
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                ◀ Prev
              </button>
              <span className="imgdisp-page-text">Page {currentPage} of {totalPages}</span>
              <button 
                className="imgdisp-page-btn" 
                disabled={currentPage === totalPages} 
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                Next ▶
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ImageGallery;
