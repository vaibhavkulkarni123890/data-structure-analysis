import React from 'react';
import { Link } from 'react-router-dom';

const Navigation = () => {
  return (
    <nav>
      <h2>Algorithms</h2>
      <ul>
        <li><Link to="/algorithms/searching/linearsearch">Linear Search</Link></li>
        <li><Link to="/algorithms/searching/binarysearch">Binary Search</Link></li>
        <li><Link to="/algorithms/sorting/bubblesort">Bubble Sort</Link></li>
        <li><Link to="/algorithms/graph/bfs">BFS</Link></li>
        {/* Add more links for the other algorithm files */}
      </ul>

      <h2>Data Structures</h2>
      <ul>
        <li><Link to="/data-structures/arrays/Searching">Array Searching</Link></li>
        <li><Link to="/data-structures/linkedLists/Traversal">Linked List Traversal</Link></li>
        <li><Link to="/data-structures/stacks/StackOperations">Stack Operations</Link></li>
        {/* Add more links for the other data structures */}
      </ul>

      <h2>Utilities</h2>
      <ul>
        <li><Link to="/utils/algorithmUtils">Algorithm Utils</Link></li>
        {/* Add more links for the other utility files */}
      </ul>
    </nav>
  );
};

export default Navigation;
