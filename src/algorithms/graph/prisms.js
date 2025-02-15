import React, { useState, useEffect, useCallback } from "react";
import * as d3 from "d3";
import {
  Button,
  Card,
  TextField,
  Typography,
  Select,
  MenuItem,
  Box,
} from "@mui/material";
import { saveAs } from "file-saver";

const PrimsVisualization = () => {
  const [graph, setGraph] = useState({
    nodes: [
      { id: 0, label: "A" },
      { id: 1, label: "B" },
      { id: 2, label: "C" },
      { id: 3, label: "D" },
      { id: 4, label: "E" },
    ],
    edges: [
      { source: 0, target: 1, weight: 4 },
      { source: 0, target: 2, weight: 2 },
      { source: 1, target: 3, weight: 5 },
      { source: 2, target: 4, weight: 3 },
      { source: 3, target: 4, weight: 1 },
    ],
  });
  const [startNode, setStartNode] = useState(0);
  const [theme, setTheme] = useState("light");
  const [isSearching, setIsSearching] = useState(false);
  const [visualizationType, setVisualizationType] = useState("graph");
  const [searchSteps, setSearchSteps] = useState([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [mstEdges, setMstEdges] = useState([]);

  const width = 600;
  const height = 400;

  // Visualization drawing functions
  const drawGraph = useCallback((graph, visitedNodes = [], mstEdges = []) => {
    d3.select("#visualization").selectAll("*").remove();
    const svg = d3
      .select("#visualization")
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .style("background-color", theme === "light" ? "#f0f0f0" : "#222");

    const simulation = d3
      .forceSimulation(graph.nodes)
      .force("link", d3.forceLink(graph.edges).id((d) => d.id).distance(100))
      .force("charge", d3.forceManyBody().strength(-200))
      .force("center", d3.forceCenter(width / 2, height / 2));

    const link = svg
      .append("g")
      .selectAll("line")
      .data(graph.edges)
      .enter()
      .append("line")
      .attr("stroke", (d) =>
        mstEdges.some(
          (edge) =>
            edge.source === d.source && edge.target === d.target
        )
          ? "#4ecdc4" // MST edges
          : "#999" // Regular edges
      )
      .attr("stroke-width", 2);

    const node = svg
      .append("g")
      .selectAll("circle")
      .data(graph.nodes)
      .enter()
      .append("circle")
      .attr("r", 20)
      .attr("fill", (d) => {
        if (visitedNodes.includes(d.id)) return "#ff6b6b"; // Visited nodes
        return theme === "light" ? "steelblue" : "#4f8eb3"; // Unvisited nodes
      })
      .attr("stroke", "#fff")
      .attr("stroke-width", 2);

    const label = svg
      .append("g")
      .selectAll("text")
      .data(graph.nodes)
      .enter()
      .append("text")
      .text((d) => d.label)
      .attr("fill", "#fff")
      .attr("font-size", "12px")
      .attr("text-anchor", "middle");

    const weight = svg
      .append("g")
      .selectAll("text")
      .data(graph.edges)
      .enter()
      .append("text")
      .text((d) => d.weight)
      .attr("fill", "#000")
      .attr("font-size", "10px")
      .attr("text-anchor", "middle");

    simulation.on("tick", () => {
      link
        .attr("x1", (d) => d.source.x)
        .attr("y1", (d) => d.source.y)
        .attr("x2", (d) => d.target.x)
        .attr("y2", (d) => d.target.y);

      node.attr("cx", (d) => d.x).attr("cy", (d) => d.y);
      label.attr("x", (d) => d.x).attr("y", (d) => d.y + 5);
      weight
        .attr("x", (d) => (d.source.x + d.target.x) / 2)
        .attr("y", (d) => (d.source.y + d.target.y) / 2);
    });
  }, [theme]);

  const primsSteps = (graph, startNode) => {
    let steps = [];
    let visited = new Set();
    let mstEdges = [];
    let edges = [];

    visited.add(startNode);
    steps.push({
      graph: { ...graph },
      visitedNodes: [...visited],
      mstEdges: [...mstEdges],
      action: `Starting at node ${graph.nodes[startNode].label}`,
    });

    while (visited.size < graph.nodes.length) {
      // Find all edges connected to visited nodes
      edges = graph.edges.filter(
        (edge) =>
          (visited.has(edge.source) && !visited.has(edge.target)) ||
          (visited.has(edge.target) && !visited.has(edge.source))
      );

      if (edges.length === 0) break;

      // Find the edge with the smallest weight
      const minEdge = edges.reduce((min, edge) =>
        edge.weight < min.weight ? edge : min
      );

      mstEdges.push(minEdge);
      visited.add(minEdge.source);
      visited.add(minEdge.target);

      steps.push({
        graph: { ...graph },
        visitedNodes: [...visited],
        mstEdges: [...mstEdges],
        action: `Adding edge ${graph.nodes[minEdge.source].label}-${graph.nodes[minEdge.target].label} to MST`,
      });
    }

    steps.push({
      graph: { ...graph },
      visitedNodes: [...visited],
      mstEdges: [...mstEdges],
      action: "Prim's algorithm completed",
    });
    return steps;
  };

  const startSearch = async () => {
    if (isSearching) return;

    setIsSearching(true);
    setMstEdges([]);
    setCurrentStepIndex(0);

    const steps = primsSteps(graph, startNode);
    setSearchSteps(steps);
    setIsSearching(false);
  };

  const updateVisualization = useCallback((index) => {
    const step = searchSteps[index];
    if (!step) return;

    if (visualizationType === "graph") {
      drawGraph(step.graph, step.visitedNodes, step.mstEdges);
    }
  }, [drawGraph, searchSteps, visualizationType]);

  useEffect(() => {
    if (searchSteps.length > 0) {
      updateVisualization(currentStepIndex);
    }
  }, [searchSteps, currentStepIndex, updateVisualization]);

  // Helper functions for edge handling
  const formatEdgesForDisplay = (edges) => {
    return edges
      .map((edge) => {
        const sourceNode = graph.nodes.find((node) => node.id === edge.source);
        const targetNode = graph.nodes.find((node) => node.id === edge.target);
        return sourceNode && targetNode
          ? `${sourceNode.label}-${targetNode.label}:${edge.weight}`
          : "";
      })
      .filter((edgeStr) => edgeStr !== "")
      .join(",");
  };

  const parseEdgesFromInput = (input) => {
    const edgeStrings = input.split(",");
    const edges = edgeStrings
      .map((edgeStr) => {
        const [sourceLabel, targetLabel, weight] = edgeStr.split(/[-:]/);
        const sourceNode = graph.nodes.find(
          (node) => node.label === sourceLabel?.trim()
        );
        const targetNode = graph.nodes.find(
          (node) => node.label === targetLabel?.trim()
        );
        return sourceNode && targetNode
          ? { source: sourceNode.id, target: targetNode.id, weight: parseInt(weight) }
          : null;
      })
      .filter((edge) => edge !== null);
    return edges;
  };

  const handleGraphChange = (e) => {
    const input = e.target.value;
    const edges = parseEdgesFromInput(input);
    setGraph((prevGraph) => ({ ...prevGraph, edges }));
  };

  const handleStartNodeChange = (e) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value)) setStartNode(value);
  };

  const generateRandomGraph = () => {
    const nodeCount = Math.floor(Math.random() * 4) + 5;
    const nodes = Array.from({ length: nodeCount }, (_, i) => ({
      id: i,
      label: String.fromCharCode(65 + i),
    }));

    const edges = [];
    const edgeSet = new Set();

    for (let i = 1; i < nodeCount; i++) {
      const randomExistingNode = Math.floor(Math.random() * i);
      const pair = `${Math.min(i, randomExistingNode)},${Math.max(i, randomExistingNode)}`;
      
      if (!edgeSet.has(pair)) {
        const weight = Math.floor(Math.random() * 10) + 1;
        edges.push(
          { source: i, target: randomExistingNode, weight },
          { source: randomExistingNode, target: i, weight }
        );
        edgeSet.add(pair);
      }
    }

    const extraEdges = Math.floor(Math.random() * 3) + 2;
    for (let i = 0; i < extraEdges; i++) {
      let a, b;
      do {
        a = Math.floor(Math.random() * nodeCount);
        b = Math.floor(Math.random() * nodeCount);
      } while (a === b);

      const pair = `${Math.min(a, b)},${Math.max(a, b)}`;
      if (!edgeSet.has(pair)) {
        const weight = Math.floor(Math.random() * 10) + 1;
        edges.push(
          { source: a, target: b, weight },
          { source: b, target: a, weight }
        );
        edgeSet.add(pair);
      }
    }

    setGraph({ nodes, edges });
    setStartNode(0);
  };

  const exportData = () => {
    const exportObj = {
      graph,
      startNode,
      mstEdges,
      steps: searchSteps,
    };
    const blob = new Blob([JSON.stringify(exportObj, null, 2)], {
      type: "application/json",
    });
    saveAs(blob, "prims_data.json");
  };

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <Typography variant="h4" gutterBottom>
        Prim's Algorithm Visualization
      </Typography>

      <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
        <TextField
          label="Enter graph edges (e.g., A-B:4,B-C:2,C-D:5)"
          value={formatEdgesForDisplay(graph.edges)}
          onChange={handleGraphChange}
          fullWidth
        />
        <TextField
          label="Start Node"
          type="number"
          value={startNode}
          onChange={handleStartNodeChange}
        />
      </Box>

      <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
        <Button variant="contained" onClick={generateRandomGraph}>
          Generate Random Graph
        </Button>
        <Select
          value={visualizationType}
          onChange={(e) => setVisualizationType(e.target.value)}
          sx={{ minWidth: 120 }}
        >
          <MenuItem value="graph">Graph</MenuItem>
        </Select>
        <Button
          variant="contained"
          onClick={() => setTheme(theme === "light" ? "dark" : "light")}
        >
          Toggle Theme
        </Button>
      </Box>

      <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
        <Button
          variant="contained"
          onClick={startSearch}
          disabled={isSearching}
          color="primary"
        >
          {isSearching ? "Searching..." : "Start Prim"}
        </Button>
        <Button variant="contained" onClick={exportData}>
          Export Data
        </Button>
      </Box>

      <div id="visualization" style={{ margin: "20px 0" }}></div>

      <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
        <Button
          variant="outlined"
          onClick={() => setCurrentStepIndex(Math.max(0, currentStepIndex - 1))}
          disabled={currentStepIndex === 0}
        >
          Previous Step
        </Button>
        <Button
          variant="outlined"
          onClick={() =>
            setCurrentStepIndex(Math.min(searchSteps.length - 1, currentStepIndex + 1))
          }
          disabled={currentStepIndex === searchSteps.length - 1}
        >
          Next Step
        </Button>
      </Box>

      <Card sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          {searchSteps[currentStepIndex]?.action || "Prim not started"}
        </Typography>
        <Typography variant="body1" gutterBottom>
          Visited Nodes: {searchSteps[currentStepIndex]?.visitedNodes?.join(", ") || "None"}
        </Typography>
        <Typography variant="body1">
          MST Edges:{" "}
          {searchSteps[currentStepIndex]?.mstEdges
            ?.map(
              (edge) => {
                const sourceNode = graph.nodes.find(node => node.id === edge.source);
                const targetNode = graph.nodes.find(node => node.id === edge.target);
                return sourceNode && targetNode
                  ? `${sourceNode.label}-${targetNode.label}`
                  : "";
              }
            )
            .filter(edgeStr => edgeStr !== "")
            .join(", ") || "None"}
        </Typography>
      </Card>

      <Card sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>Prim's Algorithm</Typography>
        <Typography variant="body1" paragraph>
          Prim's algorithm is a greedy algorithm that finds a minimum spanning tree for a weighted undirected graph.
        </Typography>
        <Typography variant="body1" paragraph>
          <strong>Time Complexity:</strong> O(E log V), where E is edges and V is vertices
        </Typography>
        <Typography variant="body1">
          <strong>Steps:</strong>
          <ol>
            <li>Start from a selected node</li>
            <li>Add the smallest edge connecting the MST to a new node</li>
            <li>Repeat until all nodes are included in the MST</li>
          </ol>
        </Typography>
      </Card>
    </div>
  );
};

export default PrimsVisualization;