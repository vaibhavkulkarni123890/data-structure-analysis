import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Import your components based on your directory structure
import Linearsearch from './algorithms/searching/Linearsearch';
import Binarysearch from './algorithms/searching/binarysearch';
import Bubblesort from './algorithms/sorting/bubblesort';
import Bfs from './algorithms/graph/bfs';
import Searchingarray from './data-structures/arrays/searching';
import Traversal from './data-structures/trees/traversal';
import Stackoperation from './data-structures/stacks/stackoperation';

const RoutesComponent = () => {
  return (
    <Routes>
      {/* Algorithms */}
      <Route path="/algorithms/searching/linearsearch" element={<Linearsearch />} />
      <Route path="/algorithms/searching/binarysearch" element={<Binarysearch />} />
      <Route path="/algorithms/sorting/bubblesort" element={<Bubblesort />} />
      <Route path="/algorithms/graph/bfs" element={<Bfs />} />
      {/* Add more routes for other algorithm files */}

      {/* Data Structures */}
      <Route path="/data-structures/arrays/searching" element={<Searchingarray />} />
      <Route path="/data-structures/linkedLists/traversal" element={<Traversal />} />
      <Route path="/data-structures/stacks/stackoperations" element={<Stackoperation />} />
      {/* Add more routes for other data structures */}

      {/* Utilities */}
      {/* Add more routes for other utility files */}
    </Routes>
  );
};

export default RoutesComponent;
