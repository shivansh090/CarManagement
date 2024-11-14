import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Edit, Trash2, ArrowLeft, Car } from 'lucide-react';

function CarDetail({ token }) {
  const [car, setCar] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    fetchCar();
  }, []);

  const fetchCar = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/cars/${id}`, {
        headers: { Authorization: token }
      });
      setCar(response.data);
    } catch (error) {
      console.error('Failed to fetch car:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this car?')) {
      try {
        await axios.delete(`${import.meta.env.VITE_API_URL}/api/cars/${id}`, {
          headers: { Authorization: token }
        });
        navigate('/');
      } catch (error) {
        console.error('Failed to delete car:', error);
      }
    }
  };

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );

  if (!car) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-2xl font-bold text-gray-800">Car not found</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Link to="/" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6 transition duration-300 ease-in-out">
          <ArrowLeft className="mr-2" size={20} />
          Back to Cars
        </Link>
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="p-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-4 flex items-center">
              <Car className="mr-2" size={32} />
              {car.title}
            </h1>
            <p className="text-gray-600 mb-6">{car.description}</p>
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Tags</h2>
              <div className="flex flex-wrap">
                {car.tags.map((tag, index) => (
                  <span key={index} className="bg-blue-100 text-blue-800 text-sm font-medium mr-2 mb-2 px-2.5 py-0.5 rounded">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {car.images.map((image, index) => (
                <img key={index} src={image} alt={`Car ${index + 1}`} className="w-full h-40 object-cover rounded-lg shadow-md" />
              ))}
            </div>
          </div>
          <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-4">
            <button 
              onClick={() => navigate(`/edit/${id}`)}
              className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded-full inline-flex items-center transition duration-300 ease-in-out"
            >
              <Edit className="mr-2" size={20} />
              Edit
            </button>
            <button 
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-full inline-flex items-center transition duration-300 ease-in-out"
            >
              <Trash2 className="mr-2" size={20} />
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CarDetail;