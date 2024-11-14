import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { XCircle, Upload, Car } from 'lucide-react';

function CarForm({ token }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [images, setImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      fetchCar();
    }
  }, [id]);

  const fetchCar = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/cars/${id}`, {
        headers: { Authorization: token }
      });
      const { title, description, tags, images } = response.data;
      setTitle(title);
      setDescription(description);
      setTags(tags.join(', '));
      setImages(images);
    } catch (error) {
      console.error('Failed to fetch car:', error);
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setNewImages(prevImages => [...prevImages, ...files]);
  };

  const removeImage = (index, isNewImage) => {
    if (isNewImage) {
      setNewImages(prevImages => prevImages.filter((_, i) => i !== index));
    } else {
      setImages(prevImages => prevImages.filter((_, i) => i !== index));
    }
  };

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = {
      title,
      description,
      tags,
      images: images,
      newImages: []
    };

    try {
      if (newImages.length > 0) {
        const base64Images = await Promise.all(newImages.map(convertToBase64));
        formData.newImages = base64Images;
      }

      if (id) {
        await axios.put(`${import.meta.env.VITE_API_URL}/api/cars/${id}`, formData, {
          headers: { 
            Authorization: token,
            'Content-Type': 'application/json'
          }
        });
      } else {
        await axios.post(`${import.meta.env.VITE_API_URL}/api/cars`, formData, {
          headers: { 
            Authorization: token,
            'Content-Type': 'application/json'
          }
        });
      }
      navigate('/');
    } catch (error) {
      console.error('Failed to save car:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow-2xl rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:px-6 bg-gradient-to-r from-blue-500 to-blue-600">
            <h1 className="text-3xl font-extrabold text-white flex items-center">
              <Car className="mr-2" />
              {id ? 'Edit Car' : 'Add New Car'}
            </h1>
          </div>
          <form onSubmit={handleSubmit} className="px-4 py-5 sm:p-6">
            <div className="space-y-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                  Title
                </label>
                <input 
                  type="text" 
                  id="title"
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  required 
                />
              </div>
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea 
                  id="description"
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)} 
                  rows={4}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  required 
                />
              </div>
              <div>
                <label htmlFor="tags" className="block text-sm font-medium text-gray-700">
                  Tags (comma-separated)
                </label>
                <input 
                  type="text" 
                  id="tags"
                  value={tags} 
                  onChange={(e) => setTags(e.target.value)} 
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  required 
                />
              </div>
              <div>
                <label htmlFor="images" className="block text-sm font-medium text-gray-700">
                  Add Images
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                  <div className="space-y-1 text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                      <label htmlFor="images" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                        <span>Upload images</span>
                        <input 
                          id="images" 
                          type="file" 
                          multiple 
                          onChange={handleImageChange}
                          className="sr-only"
                          accept="image/*"
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB each</p>
                  </div>
                </div>
              </div>
              {(images.length > 0 || newImages.length > 0) && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Images:</h3>
                  <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                    {images.map((image, index) => (
                      <div key={index} className="relative group">
                        <img src={image} alt={`Car ${index + 1}`} className="h-24 w-full object-cover rounded-lg" />
                        <button
                          type="button"
                          onClick={() => removeImage(index, false)}
                          className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <XCircle size={20} />
                        </button>
                      </div>
                    ))}
                    {newImages.map((image, index) => (
                      <div key={`new-${index}`} className="relative group">
                        <img src={URL.createObjectURL(image)} alt={`New ${index + 1}`} className="h-24 w-full object-cover rounded-lg" />
                        <button
                          type="button"
                          onClick={() => removeImage(index, true)}
                          className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <XCircle size={20} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="mt-6">
              <button 
                type="submit"
                disabled={isSubmitting}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isSubmitting ? 'Saving...' : (id ? 'Update Car' : 'Create Car')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CarForm;