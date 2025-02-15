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

const BFSVisualization = () => {
  const [data, setData] = useState([8, 3, 1, 7, 0, 10, 2]); // Represents a binary tree in level-order
  const [traversalSteps, setTraversalSteps] = useState([]);
  const [tabIndex, setTabIndex] = useState(0);
  const [animationSpeed, setAnimationSpeed] = useState(500);
  const [isAnimating, setIsAnimating] = useState(false);
  const [visualizationType, setVisualizationType] = useState("barChart");
  const [currentArrayState, setCurrentArrayState] = useState(data);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const width = 600;
  const height = 300;
  const synth = window.speechSynthesis;

  // Voice explanation function
  const explainAlgorithm = () => {
    if (synth.speaking) {
      synth.cancel();
      setIsSpeaking(false);
      return;
    }

    const explanation = `
      Breadth-First Search (BFS) Algorithm Explanation:
      A traversal algorithm that explores all nodes level by level in a tree or graph.
      
      Key Steps:
      1. Start at the root node.
      2. Visit all nodes at the current level.
      3. Move to the next level and repeat until all nodes are visited.
      
      Time Complexity: O(n) where n is the number of nodes.
      Space Complexity: O(n) for the queue.
    `;

    const utterance = new SpeechSynthesisUtterance(explanation);
    utterance.rate = 1.1;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    synth.speak(utterance);
    setIsSpeaking(true);
  };

  // BFS Algorithm
  const generateBFSSteps = useCallback(() => {
    const steps = [];
    const queue = [];
    const visited = new Array(data.length).fill(false);

    // Initial step
    queue.push(0);
    visited[0] = true;
    steps.push({
      array: [...data],
      current: 0,
      visited: [0],
      queue: [0],
      action: "Starting BFS at root node",
    });

    while (queue.length > 0) {
      const currentIndex = queue.shift();

      // Visit node step
      steps.push({
        array: [...data],
        current: currentIndex,
        visited: [...visited],
        queue: [...queue],
        action: `Visiting node ${data[currentIndex]}`,
      });

      // Process children
      const children = [
        { index: 2 * currentIndex + 1, side: "left" },
        { index: 2 * currentIndex + 2, side: "right" },
      ];

      children.forEach(({ index, side }) => {
        if (index < data.length && !visited[index]) {
          visited[index] = true;
          queue.push(index);
          steps.push({
            array: [...data],
            current: index,
            visited: [...visited],
            queue: [...queue],
            action: `Discovered ${side} child: ${data[index]}`,
          });
        }
      });
    }

    return steps;
  }, [data]);

  // Visualization drawing functions
  const drawBarChart = useCallback((array, step) => {
    d3.select("#visualization").selectAll("*").remove();
    const svg = d3
      .select("#visualization")
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .style("background-color", "#ffffff");

    const maxValue = d3.max(array) || 1;
    const yScale = d3.scaleLinear().domain([0, maxValue]).range([0, height]);
    const barWidth = width / array.length;

    svg
      .selectAll("rect")
      .data(array)
      .enter()
      .append("rect")
      .attr("x", (d, i) => i * barWidth)
      .attr("y", (d) => height - yScale(d))
      .attr("width", barWidth - 2)
      .attr("height", (d) => yScale(d))
      .attr("fill", (d, i) =>
        step?.current === i ? "#ff5722" : step?.visited.includes(i) ? "#4caf50" : "#1976d2"
      );

    svg
      .selectAll("text")
      .data(array)
      .enter()
      .append("text")
      .text((d) => d)
      .attr("x", (d, i) => i * barWidth + barWidth / 2)
      .attr("y", (d) => height - yScale(d) + 15)
      .attr("fill", "#ffffff")
      .attr("font-size", "12px")
      .attr("text-anchor", "middle");
  }, []);

  const drawLineChart = useCallback((array, step) => {
    d3.select("#visualization").selectAll("*").remove();
    const svg = d3
      .select("#visualization")
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .style("background-color", "#ffffff");

    const xScale = d3.scaleLinear().domain([0, array.length - 1]).range([0, width]);
    const yScale = d3.scaleLinear().domain([0, d3.max(array)]).range([height, 0]);
    const line = d3.line().x((d, i) => xScale(i)).y((d) => yScale(d));

    svg
      .append("path")
      .datum(array)
      .attr("fill", "none")
      .attr("stroke", "#1976d2")
      .attr("stroke-width", 2)
      .attr("d", line);

    svg
      .selectAll("circle")
      .data(array)
      .enter()
      .append("circle")
      .attr("cx", (d, i) => xScale(i))
      .attr("cy", (d) => yScale(d))
      .attr("r", 4)
      .attr("fill", (d, i) =>
        step?.current === i ? "#ff5722" : step?.visited.includes(i) ? "#4caf50" : "#1976d2"
      );
  }, []);

  const drawPieChart = useCallback((array, step) => {
    d3.select("#visualization").selectAll("*").remove();
    const svg = d3
      .select("#visualization")
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .style("background-color", "#ffffff");

    const radius = Math.min(width, height) / 2;
    const pie = d3.pie().value((d) => d);
    const arc = d3.arc().innerRadius(0).outerRadius(radius);
    const color = d3.scaleOrdinal(d3.schemeCategory10);

    const g = svg.append("g").attr("transform", `translate(${width / 2}, ${height / 2})`);

    g.selectAll("path")
      .data(pie(array))
      .enter()
      .append("path")
      .attr("d", arc)
      .attr("fill", (d, i) =>
        step?.current === i ? "#ff5722" : step?.visited.includes(i) ? "#4caf50" : color(i)
      );

    g.selectAll("text")
      .data(pie(array))
      .enter()
      .append("text")
      .attr("transform", (d) => `translate(${arc.centroid(d)})`)
      .attr("text-anchor", "middle")
      .text((d) => d.data);
  }, []);

  // Start BFS Traversal
  const startTraversal = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentStepIndex(0);
    setTraversalSteps([]);

    const steps = generateBFSSteps();
    setTraversalSteps(steps);
    setIsAnimating(false);
  };

  // Animation controls
  useEffect(() => {
    if (isPlaying && currentStepIndex < traversalSteps.length - 1) {
      const timer = setTimeout(() => {
        setCurrentStepIndex((prev) => prev + 1);
      }, animationSpeed);
      return () => clearTimeout(timer);
    } else {
      setIsPlaying(false);
    }
  }, [isPlaying, currentStepIndex, animationSpeed]);

  const togglePlay = () => {
    if (currentStepIndex >= traversalSteps.length - 1) setCurrentStepIndex(0);
    setIsPlaying(!isPlaying);
  };

  const goToNextStep = () => {
    if (currentStepIndex < traversalSteps.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    }
  };

  const goToPreviousStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  // Update visualization when step changes
  useEffect(() => {
    if (traversalSteps[currentStepIndex]) {
      setCurrentArrayState(traversalSteps[currentStepIndex].array);
      switch (visualizationType) {
        case "barChart":
          drawBarChart(traversalSteps[currentStepIndex].array, traversalSteps[currentStepIndex]);
          break;
        case "lineChart":
          drawLineChart(traversalSteps[currentStepIndex].array, traversalSteps[currentStepIndex]);
          break;
        case "pieChart":
          drawPieChart(traversalSteps[currentStepIndex].array, traversalSteps[currentStepIndex]);
          break;
        default:
          drawBarChart(traversalSteps[currentStepIndex].array, traversalSteps[currentStepIndex]);
      }
    }
  }, [currentStepIndex, traversalSteps, visualizationType]);

  return (
    <Box sx={{ maxWidth: 800, margin: "0 auto", padding: 3 }}>
      <Typography variant="h3" gutterBottom sx={{ textAlign: "center", color: "#1976d2" }}>
        BFS Visualization
      </Typography>

      {/* Input Data Section */}
      <Card sx={{ mb: 3, p: 2, boxShadow: 3 }}>
        <Tabs value={tabIndex} onChange={(e, newValue) => setTabIndex(newValue)}>
          <Tab label="Input Data" />
          <Tab label="Generate Random Data" />
        </Tabs>

        {tabIndex === 0 && (
          <TextField
            fullWidth
            label="Enter comma-separated numbers"
            variant="outlined"
            value={data.join(",")}
            onChange={(e) => setData(e.target.value.split(",").map(Number))}
            sx={{ mt: 2 }}
          />
        )}
        {tabIndex === 1 && (
          <Button
            variant="contained"
            onClick={() => setData(Array.from({ length: 7 }, () => Math.floor(Math.random() * 15) + 1))}
            sx={{ mt: 2 }}
          >
            Generate Random Data
          </Button>
        )}
      </Card>

      {/* Visualization Controls */}
      <Card sx={{ mb: 3, p: 2, boxShadow: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <Select
              fullWidth
              value={visualizationType}
              onChange={(e) => setVisualizationType(e.target.value)}
            >
              <MenuItem value="barChart">Bar Chart</MenuItem>
              <MenuItem value="lineChart">Line Chart</MenuItem>
              <MenuItem value="pieChart">Pie Chart</MenuItem>
            </Select>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography gutterBottom>Animation Speed</Typography>
            <Slider
              value={animationSpeed}
              onChange={(e, newValue) => setAnimationSpeed(newValue)}
              min={100}
              max={1000}
              valueLabelDisplay="auto"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Button
              variant="contained"
              color="secondary"
              onClick={startTraversal}
              disabled={isAnimating}
              fullWidth
            >
              {isAnimating ? "Traversing..." : "Start BFS"}
            </Button>
          </Grid>
        </Grid>
      </Card>

      {/* Playback Controls */}
      <Box sx={{ display: "flex", justifyContent: "center", gap: 2, mb: 3 }}>
        <Button
          variant="contained"
          onClick={togglePlay}
          startIcon={isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
        >
          {isPlaying ? "Pause" : "Play"}
        </Button>
        <Button
          variant="outlined"
          onClick={goToPreviousStep}
          disabled={currentStepIndex === 0 || isPlaying}
          startIcon={<SkipPreviousIcon />}
        >
          Previous
        </Button>
        <Button
          variant="outlined"
          onClick={goToNextStep}
          disabled={currentStepIndex === traversalSteps.length - 1 || isPlaying}
          startIcon={<SkipNextIcon />}
        >
          Next
        </Button>
      </Box>

      {/* Visualization Area */}
      <div id="visualization" style={{ margin: "20px 0", borderRadius: 8, overflow: "hidden" }}></div>

      {/* Step Explanation */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 2, boxShadow: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ color: "#1976d2" }}>
              Step Explanation
            </Typography>
            <Chip
              label={traversalSteps[currentStepIndex]?.action || "Not started"}
              color="primary"
              sx={{ p: 2, fontSize: "1rem", width: "100%" }}
            />
            <Typography variant="body1" sx={{ mt: 2, fontWeight: "bold" }}>
              Current Queue:{" "}
              {traversalSteps[currentStepIndex]?.queue.map((i) => data[i]).join(" → ")}
            </Typography>
          </Card>
        </Grid>

        {/* Algorithm Explanation */}
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 3, boxShadow: 3, bgcolor: "#f8f9fa", borderLeft: "4px solid #1976d2" }}>
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
                  bgcolor: isSpeaking ? "#ff4444" : "#1565c0",
                },
              }}
            >
              {isSpeaking ? "Stop" : "Explain"}
            </Button>

            <Typography variant="h5" gutterBottom sx={{ color: "#1976d2", mb: 2, pr: 8 }}>
              BFS Algorithm
            </Typography>

            <Box component="ol" sx={{ pl: 2, counterReset: "step-counter" }}>
              <li sx={{ mb: 3 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: "#2d3436" }}>
                  Start at Root
                </Typography>
                <Typography variant="body2" sx={{ color: "#636e72", mt: 0.5 }}>
                  Begin traversal from the root node.
                </Typography>
              </li>
              <li sx={{ mb: 3 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: "#2d3436" }}>
                  Visit Level by Level
                </Typography>
                <Typography variant="body2" sx={{ color: "#636e72", mt: 0.5 }}>
                  Explore all nodes at the current level before moving to the next.
                </Typography>
              </li>
              <li sx={{ mb: 3 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: "#2d3436" }}>
                  Use a Queue
                </Typography>
                <Typography variant="body2" sx={{ color: "#636e72", mt: 0.5 }}>
                  Maintain a queue to track nodes to visit next.
                </Typography>
              </li>
              <li>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: "#2d3436" }}>
                  Repeat Until Completion
                </Typography>
                <Typography variant="body2" sx={{ color: "#636e72", mt: 0.5 }}>
                  Continue until all nodes are visited.
                </Typography>
              </li>
            </Box>

            <Grid container spacing={1} sx={{ mt: 2 }}>
              <Grid item xs={6} md={4}>
                <Chip
                  label="Time: O(n)"
                  sx={{ bgcolor: "#e3f2fd", color: "#1976d2", width: "100%", fontWeight: 500 }}
                />
              </Grid>
              <Grid item xs={6} md={4}>
                <Chip
                  label="Space: O(n)"
                  sx={{ bgcolor: "#f0f4c3", color: "#827717", width: "100%", fontWeight: 500 }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <Chip
                  label="Level-Order Traversal"
                  sx={{ bgcolor: "#f8bbd0", color: "#880e4f", width: "100%", fontWeight: 500 }}
                />
              </Grid>
            </Grid>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default BFSVisualization;