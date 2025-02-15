import React, { useState, useEffect, useCallback } from "react";
import * as d3 from "d3";
import {
  Button,
  Card,
  Tabs,
  Tab,
  TextField,
  Slider,
  Typography,
  Select,
  MenuItem,
  Box,
  Grid,
  Chip,
} from "@mui/material";
import { saveAs } from "file-saver";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import SkipNextIcon from "@mui/icons-material/SkipNext";
import SkipPreviousIcon from "@mui/icons-material/SkipPrevious";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";

const DFSVisualization = () => {
  const [graph, setGraph] = useState({
    nodes: [
      { id: 0, x: 100, y: 100 },
      { id: 1, x: 200, y: 200 },
      { id: 2, x: 300, y: 100 },
      { id: 3, x: 400, y: 200 },
    ],
    edges: [
      { source: 0, target: 1 },
      { source: 1, target: 2 },
      { source: 2, target: 3 },
      { source: 3, target: 0 },
    ],
  });
  const [traversalSteps, setTraversalSteps] = useState([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState(500);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const width = 600;
  const height = 400;
  const synth = window.speechSynthesis;

  // Voice explanation function
  const explainAlgorithm = () => {
    if (synth.speaking) {
      synth.cancel();
      setIsSpeaking(false);
      return;
    }

    const explanation = `
      Depth-First Search (DFS) Algorithm Explanation:
      A graph traversal algorithm that explores as far as possible along each branch before backtracking.
      
      Key Steps:
      1. Start from a selected node (root).
      2. Visit an adjacent unvisited node, mark it as visited, and push it onto the stack.
      3. Repeat step 2 until no unvisited adjacent nodes are found.
      4. Backtrack to the previous node and repeat step 2.
      5. Continue until all nodes are visited.
      
      Time Complexity: O(V + E), where V is the number of vertices and E is the number of edges.
      Space Complexity: O(V) due to the stack.
    `;

    const utterance = new SpeechSynthesisUtterance(explanation);
    utterance.rate = 1.1;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    synth.speak(utterance);
    setIsSpeaking(true);
  };

  // Visualization drawing functions
  const drawGraph = useCallback((graph, visitedNodes = [], currentStep = null) => {
    d3.select("#visualization").selectAll("*").remove();
    const svg = d3
      .select("#visualization")
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .style("background-color", "#ffffff");

    // Draw edges
    svg
      .selectAll("line")
      .data(graph.edges)
      .enter()
      .append("line")
      .attr("x1", (d) => graph.nodes[d.source].x)
      .attr("y1", (d) => graph.nodes[d.source].y)
      .attr("x2", (d) => graph.nodes[d.target].x)
      .attr("y2", (d) => graph.nodes[d.target].y)
      .attr("stroke", "#999")
      .attr("stroke-width", 2);

    // Draw nodes
    svg
      .selectAll("circle")
      .data(graph.nodes)
      .enter()
      .append("circle")
      .attr("cx", (d) => d.x)
      .attr("cy", (d) => d.y)
      .attr("r", 20)
      .attr("fill", (d) =>
        visitedNodes.includes(d.id) ? "#1976d2" : "#ccc"
      )
      .attr("stroke", "#000")
      .attr("stroke-width", 2);

    // Draw node labels
    svg
      .selectAll("text")
      .data(graph.nodes)
      .enter()
      .append("text")
      .text((d) => d.id)
      .attr("x", (d) => d.x)
      .attr("y", (d) => d.y + 5)
      .attr("text-anchor", "middle")
      .attr("fill", "#fff")
      .attr("font-size", "12px");

    // Highlight current step
    if (currentStep !== null) {
      svg
        .append("circle")
        .attr("cx", graph.nodes[currentStep].x)
        .attr("cy", graph.nodes[currentStep].y)
        .attr("r", 25)
        .attr("fill", "none")
        .attr("stroke", "#ff6b6b")
        .attr("stroke-width", 3);
    }
  }, []);

  // DFS algorithm
  const dfs = (graph, startNode) => {
    const visited = new Set();
    const steps = [];
    const stack = [startNode];

    while (stack.length > 0) {
      const currentNode = stack.pop();
      if (!visited.has(currentNode)) {
        visited.add(currentNode);
        steps.push({
          node: currentNode,
          visited: [...visited],
          action: `Visited node ${currentNode}`,
        });

        graph.edges
          .filter((edge) => edge.source === currentNode)
          .forEach((edge) => {
            if (!visited.has(edge.target)) {
              stack.push(edge.target);
            }
          });
      }
    }
    return steps;
  };

  const startTraversal = () => {
    const steps = dfs(graph, 0);
    setTraversalSteps(steps);
    setCurrentStepIndex(0);
    setIsPlaying(true);
  };

  useEffect(() => {
    if (isPlaying) {
      const timer = setInterval(() => {
        if (currentStepIndex < traversalSteps.length - 1) {
          goToNextStep();
        } else {
          setIsPlaying(false);
        }
      }, animationSpeed);
      return () => clearInterval(timer);
    }
  }, [isPlaying, currentStepIndex, animationSpeed]);

  const togglePlay = () => {
    if (currentStepIndex >= traversalSteps.length - 1) setCurrentStepIndex(0);
    setIsPlaying(!isPlaying);
    if (!isPlaying && traversalSteps[currentStepIndex]?.action) {
      speak(traversalSteps[currentStepIndex].action);
    }
  };

  const goToNextStep = () => {
    if (currentStepIndex < traversalSteps.length - 1) {
      const newIndex = currentStepIndex + 1;
      setCurrentStepIndex(newIndex);
      drawGraph(graph, traversalSteps[newIndex].visited, traversalSteps[newIndex].node);
      speak(traversalSteps[newIndex].action);
    }
  };

  const goToPreviousStep = () => {
    if (currentStepIndex > 0) {
      const newIndex = currentStepIndex - 1;
      setCurrentStepIndex(newIndex);
      drawGraph(graph, traversalSteps[newIndex].visited, traversalSteps[newIndex].node);
      speak(traversalSteps[newIndex].action);
    }
  };

  const speak = (text) => {
    if (!synth || synth.speaking) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.2;
    synth.speak(utterance);
  };

  useEffect(() => {
    drawGraph(graph);
  }, [graph, drawGraph]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 4, mt: 4 }}>
  {/* Step-by-Step Explanation */}
  <Card sx={{ 
    p: 3, 
    boxShadow: 3, 
    borderRadius: 2, 
    bgcolor: "#f8f9fa", 
    borderLeft: "4px solid #1976d2",
    position: "relative"
  }}>
    {/* Hear Explanation Button */}
    <Button
      variant="contained"
      color="primary"
      onClick={explainAlgorithm}
      startIcon={<VolumeUpIcon />}
      sx={{
        position: "absolute",
        top: 16,
        right: 16,
        borderRadius: "20px",
        textTransform: "none",
        bgcolor: isSpeaking ? "#ff6b6b" : "#1976d2",
        "&:hover": {
          bgcolor: isSpeaking ? "#ff4444" : "#1565c0"
        },
        transition: "background-color 0.3s ease-in-out"
      }}
    >
      {isSpeaking ? "Stop Explanation" : "Hear Explanation"}
    </Button>

    {/* Title */}
    <Typography 
      variant="h5" 
      gutterBottom 
      sx={{ 
        color: "#1976d2", 
        fontWeight: 700, 
        mb: 2,
        pr: 8
      }}
    >
      DFS Algorithm Explained
    </Typography>

    {/* Steps List */}
    <Box component="ol" sx={{ 
      pl: 2, 
      counterReset: "step-counter",
      "& li": { 
        mb: 2, 
        pl: 3, 
        position: "relative",
        "&:before": {
          counterIncrement: "step-counter",
          content: "counter(step-counter)",
          position: "absolute",
          left: 0,
          top: 0,
          backgroundColor: "#1976d2",
          color: "white",
          width: "24px",
          height: "24px",
          borderRadius: "50%",
          textAlign: "center",
          lineHeight: "24px",
          fontSize: "0.9rem",
          fontWeight: 600
        }
      }
    }}>
      <li>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, color: "#2d3436" }}>
          Start at Root
        </Typography>
        <Typography variant="body2" sx={{ color: "#636e72", mt: 0.5 }}>
          Begin traversal from the selected root node.
        </Typography>
      </li>
      <li>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, color: "#2d3436" }}>
          Visit Adjacent Nodes
        </Typography>
        <Typography variant="body2" sx={{ color: "#636e72", mt: 0.5 }}>
          Visit unvisited adjacent nodes and mark them as visited.
        </Typography>
      </li>
      <li>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, color: "#2d3436" }}>
          Backtrack
        </Typography>
        <Typography variant="body2" sx={{ color: "#636e72", mt: 0.5 }}>
          Backtrack to the previous node when no unvisited nodes are found.
        </Typography>
      </li>
      <li>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, color: "#2d3436" }}>
          Repeat
        </Typography>
        <Typography variant="body2" sx={{ color: "#636e72", mt: 0.5 }}>
          Continue until all nodes are visited.
        </Typography>
      </li>
    </Box>

    {/* Complexity Indicators */}
    <Grid container spacing={2} sx={{ mt: 2 }}>
      <Grid item xs={6} md={4}>
        <Chip 
          label="Time: O(V + E)" 
          sx={{ 
            bgcolor: "#e3f2fd", 
            color: "#1976d2",
            width: "100%",
            fontWeight: 500,
            borderRadius: "20px",
            "&:hover": { transform: "scale(1.05)", transition: "transform 0.2s ease-in-out" }
          }} 
        />
      </Grid>
      <Grid item xs={6} md={4}>
        <Chip 
          label="Space: O(V)" 
          sx={{ 
            bgcolor: "#f0f4c3", 
            color: "#827717",
            width: "100%",
            fontWeight: 500,
            borderRadius: "20px",
            "&:hover": { transform: "scale(1.05)", transition: "transform 0.2s ease-in-out" }
          }} 
        />
      </Grid>
      <Grid item xs={12} md={4}>
        <Chip 
          label="Graph Traversal" 
          sx={{ 
            bgcolor: "#f8bbd0", 
            color: "#880e4f",
            width: "100%",
            fontWeight: 500,
            borderRadius: "20px",
            "&:hover": { transform: "scale(1.05)", transition: "transform 0.2s ease-in-out" }
          }} 
        />
      </Grid>
    </Grid>
  </Card>

  {/* Additional Notes */}
  <Card sx={{ p: 3, boxShadow: 3, borderRadius: 2, bgcolor: "#fff" }}>
    <Typography 
      variant="h6" 
      gutterBottom 
      sx={{ 
        color: "#1976d2", 
        fontWeight: 700, 
        mb: 2 
      }}
    >
      Key Takeaways
    </Typography>
    <Typography variant="body1" sx={{ color: "#333", lineHeight: 1.6 }}>
      Depth-First Search (DFS) is a fundamental graph traversal algorithm that explores as far as possible along each branch before backtracking. It is particularly useful for tasks like finding connected components, detecting cycles, and solving puzzles.
    </Typography>
  </Card>
</Box>
  );
};

export default DFSVisualization;