import React from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Button, Card, Typography, Box, Container } from '@mui/material';
// Import your subcategory components
import Sorting from './algorithms/sorting/Sorting';
import Searching from './algorithms/searching/Searching';
import Graph from './algorithms/graph/Graph';

const App = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Check if the current route is in a subcategory
  const shouldHideNavbar =
    location.pathname.startsWith('/algorithms/sorting') ||
    location.pathname.startsWith('/algorithms/searching') ||
    location.pathname.startsWith('/algorithms/graph');

  return (
    <Container maxWidth="lg" sx={{ textAlign: 'center', padding: '40px', minHeight: '100vh' }}>
      {/* Page Headline */}
      <Typography
        variant="h3"
        gutterBottom
        sx={{
          fontWeight: 'bold',
          color: '#3f51b5',
          marginBottom: '30px',
          textTransform: 'uppercase',
          letterSpacing: '2px',
        }}
      >
        Data Structures & Algorithm Visualizer
      </Typography>

      {/* Conditionally render the navigation card */}
      {!shouldHideNavbar && (
        <Card
          sx={{
            padding: '30px',
            marginBottom: '40px',
            backgroundColor: '#fafafa',
            borderRadius: '15px',
            boxShadow: '0px 8px 16px rgba(0, 0, 0, 0.1)',
            transition: 'box-shadow 0.3s ease',
            '&:hover': {
              boxShadow: '0px 12px 24px rgba(0, 0, 0, 0.2)',
            },
          }}
        >
          <Typography
            variant="h5"
            gutterBottom
            sx={{
              fontWeight: 'bold',
              color: '#212121',
              marginBottom: '20px',
            }}
          >
            Choose a Category to Start Learning:
          </Typography>

          {/* Navigation Buttons with descriptions */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
            {/* Sorting Algorithms */}
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate('/algorithms/sorting')}
              sx={{
                width: '250px',
                height: '50px',
                fontSize: '1rem',
                fontWeight: 'bold',
                borderRadius: '10px',
                transition: 'transform 0.3s ease',
                '&:hover': {
                  transform: 'scale(1.05)',
                },
              }}
            >
              Sorting Algorithms
            </Button>
            <Typography variant="body1" sx={{ maxWidth: '400px', margin: '0 auto', color: '#424242' }}>
              Learn how sorting algorithms like Merge Sort, Quick Sort, and Heap Sort work with step-by-step visualizations.
            </Typography>

            {/* Searching Algorithms */}
            <Button
              variant="contained"
              color="secondary"
              onClick={() => navigate('/algorithms/searching')}
              sx={{
                width: '250px',
                height: '50px',
                fontSize: '1rem',
                fontWeight: 'bold',
                borderRadius: '10px',
                transition: 'transform 0.3s ease',
                '&:hover': {
                  transform: 'scale(1.05)',
                },
              }}
            >
              Searching Algorithms
            </Button>
            <Typography variant="body1" sx={{ maxWidth: '400px', margin: '0 auto', color: '#424242' }}>
              Understand how searching techniques like Binary Search and Linear Search operate with interactive examples.
            </Typography>

            {/* Graph Algorithms */}
            <Button
              variant="contained"
              color="success"
              onClick={() => navigate('/algorithms/graph')}
              sx={{
                width: '250px',
                height: '50px',
                fontSize: '1rem',
                fontWeight: 'bold',
                borderRadius: '10px',
                transition: 'transform 0.3s ease',
                '&:hover': {
                  transform: 'scale(1.05)',
                },
              }}
            >
              Graph Algorithms
            </Button>
            <Typography variant="body1" sx={{ maxWidth: '400px', margin: '0 auto', color: '#424242' }}>
              Explore graph traversal techniques like BFS and DFS, as well as pathfinding algorithms like Dijkstra's.
            </Typography>
          </Box>
        </Card>
      )}

      {/* Routes for different algorithm categories */}
      <Routes>
        <Route path="/algorithms/sorting/*" element={<Sorting />} />
        <Route path="/algorithms/searching/*" element={<Searching />} />
        <Route path="/algorithms/graph/*" element={<Graph />} />
      </Routes>
    </Container>
  );
};

export default App;