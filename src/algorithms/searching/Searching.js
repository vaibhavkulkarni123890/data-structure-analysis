import React, { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import LinearSearch from './Linearsearch';
import BinarySearch from './binarysearch';
import InterpolationSearch from './interpolationsearch';

const Searching = () => {
  const navigate = useNavigate();
  const [selectedAlgorithm, setSelectedAlgorithm] = useState(null);

  // Mapping of searching algorithms with descriptions
  const algorithms = [
    {
      key: 'linear',
      label: 'Linear Search',
      description: 'A simple algorithm that checks each element in a list sequentially until the target is found.',
      component: <LinearSearch />,
    },
    {
      key: 'binary',
      label: 'Binary Search',
      description: 'An efficient algorithm that repeatedly divides the search interval in half, requiring a sorted array.',
      component: <BinarySearch />,
    },
    {
      key: 'interpolation',
      label: 'Interpolation Search',
      description: 'An improved variant of binary search that works well on uniformly distributed sorted arrays.',
      component: <InterpolationSearch />,
    },
  ];

  // Function to reset and show the main menu
  const goBack = () => {
    setSelectedAlgorithm(null);
    navigate('/');
  };

  return (
    <div
      style={{
        textAlign: 'center',
        padding: '60px 80px', // Increased padding for better spacing
        minHeight: '100vh',
        backgroundColor: '#f9f9f9',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      {/* Main Menu */}
      {selectedAlgorithm === null ? (
        <>
          <h2
            style={{
              fontSize: '3rem', // Larger font size for emphasis
              fontWeight: 'bold',
              marginBottom: '30px',
              color: '#333',
            }}
          >
            Searching Algorithms Visualizer
          </h2>
          <p
            style={{
              fontSize: '1.2rem',
              color: '#555',
              marginBottom: '40px',
              maxWidth: '600px',
              margin: '0 auto',
              lineHeight: '1.6',
            }}
          >
            Explore different searching algorithms by selecting one below. Each visualization includes animations, step-by-step explanations, and interactive controls.
          </p>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '20px', // Increased gap between buttons
              alignItems: 'center',
            }}
          >
            {algorithms.map(({ key, label, description }) => (
              <button
                key={key}
                onClick={() => setSelectedAlgorithm(key)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '15px 30px', // Larger padding for buttons
                  fontSize: '1.2rem',
                  fontWeight: 'bold',
                  backgroundColor: '#4a90e2', // Dimmed blue color
                  color: '#fff',
                  border: 'none',
                  borderRadius: '12px', // More rounded corners for a modern look
                  cursor: 'pointer',
                  transition: 'background-color 0.3s ease, transform 0.3s ease',
                  width: '100%', // Full-width buttons
                  maxWidth: '400px', // Limit maximum width
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', // Subtle shadow for depth
                }}
                onMouseOver={(e) => {
                  e.target.style.backgroundColor = '#3b7abf'; // Dimmed hover color
                  e.target.style.transform = 'scale(1.05)'; // Slight zoom effect
                }}
                onMouseOut={(e) => {
                  e.target.style.backgroundColor = '#4a90e2';
                  e.target.style.transform = 'scale(1)';
                }}
                aria-label={`Select ${label}`}
              >
                <span>{label}</span>
                <span
                  style={{
                    marginLeft: '10px',
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    color: '#fff',
                  }}
                >
                  →
                </span>
              </button>
            ))}
          </div>
        </>
      ) : (
        <div>
          {/* Back Button */}
          <button
            onClick={goBack}
            style={{
              padding: '10px 20px',
              fontSize: '1rem',
              fontWeight: 'bold',
              backgroundColor: '#8c8c8c', // Dimmed gray color
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              marginBottom: '30px',
              transition: 'background-color 0.3s ease',
            }}
            onMouseOver={(e) => (e.target.style.backgroundColor = '#6c6c6c')} // Dimmed hover color
            onMouseOut={(e) => (e.target.style.backgroundColor = '#8c8c8c')}
            aria-label="Go back to main menu"
          >
            ← Back to Main Menu
          </button>
          {/* Render Selected Algorithm */}
          {algorithms.find((algo) => algo.key === selectedAlgorithm)?.component}
        </div>
      )}
    </div>
  );
};

export default Searching;