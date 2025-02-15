import React, { useState } from 'react';
import BubbleSort from './bubblesort';
import QuickSort from './quicksort';
import MergeSort from './mergesort';
import HeapSort from './heapsort';
import Countingsort from './countingsort';

const Sorting = () => {
  const [selectedAlgorithm, setSelectedAlgorithm] = useState(null);

  // Mapping of sorting algorithms with descriptions
  const algorithms = [
    {
      key: 'bubble',
      label: 'Bubble Sort',
      description: 'A simple comparison-based algorithm that repeatedly swaps adjacent elements if they are in the wrong order.',
      component: <BubbleSort />,
    },
    {
      key: 'heap',
      label: 'Heap Sort',
      description: 'A comparison-based algorithm that uses a binary heap data structure to sort elements efficiently.',
      component: <HeapSort />,
    },
    {
      key: 'merge',
      label: 'Merge Sort',
      description: 'A divide-and-conquer algorithm that splits the array into halves, sorts them, and merges them back together.',
      component: <MergeSort />,
    },
    {
      key: 'quick',
      label: 'Quick Sort',
      description: 'A divide-and-conquer algorithm that selects a pivot element and partitions the array around it.',
      component: <QuickSort />,
    },
    {
      key: 'count',
      label: 'Counting Sort',
      description: 'A non-comparison-based algorithm that counts occurrences of elements and places them in sorted order.',
      component: <Countingsort />,
    },
  ];

  // Function to reset and show the main menu
  const goBack = () => setSelectedAlgorithm(null);

  return (
    <div
      style={{
        textAlign: 'center',
        padding: '40px 80px', // Increased padding for better spacing
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
            Sorting Algorithms Visualizer
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
            Explore different sorting algorithms by selecting one below. Each visualization includes animations, step-by-step explanations, and interactive controls.
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

export default Sorting;