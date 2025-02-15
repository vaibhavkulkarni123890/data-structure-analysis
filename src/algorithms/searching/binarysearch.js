import React, { useState, useEffect, useCallback } from "react";
import * as d3 from "d3";
import {
  Button,
  Card,
  TextField,
  Slider,
  Typography,
  Select,
  MenuItem,
  Box,
} from "@mui/material";
import { saveAs } from "file-saver";

const BinarySearch = () => {
  const [data, setData] = useState([1, 3, 5, 7, 9, 11, 13]);
  const [target, setTarget] = useState(7);
  const [theme, setTheme] = useState("light");
  const [animationSpeed, setAnimationSpeed] = useState(500);
  const [isSearching, setIsSearching] = useState(false);
  const [visualizationType, setVisualizationType] = useState("barChart");
  const [currentArrayState, setCurrentArrayState] = useState([...data].sort((a, b) => a - b));
  const [searchSteps, setSearchSteps] = useState([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [foundIndex, setFoundIndex] = useState(-1);

  const width = 600;
  const height = 300;

  // Visualization drawing functions with search highlights
  const drawBarChart = useCallback((array, low = -1, high = -1, mid = -1) => {
    d3.select("#visualization").selectAll("*").remove();
    const svg = d3
      .select("#visualization")
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .style("background-color", theme === "light" ? "#f0f0f0" : "#222");

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
      .attr("fill", (d, i) => {
        if (i === mid) return "#4ecdc4";
        if (i >= low && i <= high) return "#ff6b6b";
        return theme === "light" ? "steelblue" : "#4f8eb3";
      });

    svg
      .selectAll("text")
      .data(array)
      .enter()
      .append("text")
      .text((d) => d)
      .attr("x", (d, i) => i * barWidth + barWidth / 2)
      .attr("y", (d) => height - yScale(d) + 15)
      .attr("fill", "#fff")
      .attr("font-size", "12px")
      .attr("text-anchor", "middle");
  }, [theme]);

  const binarySearchSteps = (arr, target) => {
    let steps = [];
    let left = 0;
    let right = arr.length - 1;
    
    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      steps.push({
        array: [...arr],
        left,
        right,
        mid,
        action: `Comparing ${arr[mid]} with target ${target}`
      });

      if (arr[mid] === target) {
        steps.push({
          array: [...arr],
          action: `Target found at index ${mid}`,
          found: true
        });
        return steps;
      }

      arr[mid] < target ? left = mid + 1 : right = mid - 1;
      steps.push({
        array: [...arr],
        action: `Target is ${arr[mid] < target ? 'higher' : 'lower'}, adjusting search range`
      });
    }

    steps.push({ array: [...arr], action: "Target not found" });
    return steps;
  };

  const startSearch = async () => {
    if (isSearching || !target || isNaN(target)) return;
    
    setIsSearching(true);
    setFoundIndex(-1);
    setCurrentStepIndex(0);
    
    const sortedArray = [...data].sort((a, b) => a - b);
    const steps = binarySearchSteps(sortedArray, Number(target));
    
    setSearchSteps(steps);
    setCurrentArrayState(sortedArray);
    setIsSearching(false);
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const updateVisualization = (index) => {
    const step = searchSteps[index];
    if (!step) return;
    
    setCurrentArrayState(step.array);
    if (visualizationType === "barChart") {
      drawBarChart(step.array, step.left, step.right, step.mid);
    }
  };

  useEffect(() => {
    if (searchSteps.length > 0) {
      updateVisualization(currentStepIndex);
    }
  }, [searchSteps, currentStepIndex, visualizationType, theme, updateVisualization]);

  const handleDataChange = (e) => {
    const inputValues = e.target.value.split(",").map(Number).filter(n => !isNaN(n));
    setData(inputValues);
    setCurrentArrayState([...inputValues].sort((a, b) => a - b));
  };

  const handleTargetChange = (e) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value)) setTarget(value);
  };

  const generateRandomData = () => {
    const newData = Array.from({ length: 7 }, () => Math.floor(Math.random() * 15) + 1);
    setData(newData);
    setCurrentArrayState([...newData].sort((a, b) => a - b));
  };

  const exportData = () => {
    const exportObj = {
      data,
      sortedData: currentArrayState,
      target,
      foundIndex,
      steps: searchSteps
    };
    const blob = new Blob([JSON.stringify(exportObj, null, 2)], { type: "application/json" });
    saveAs(blob, "binary_search_data.json");
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <Typography variant="h4" gutterBottom>
        Binary Search Visualization
      </Typography>

      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <TextField
          label="Enter numbers (comma-separated)"
          value={data.join(",")}
          onChange={handleDataChange}
          fullWidth
        />
        <TextField
          label="Search Target"
          type="number"
          value={target}
          onChange={handleTargetChange}
        />
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <Button variant="contained" onClick={generateRandomData}>
          Generate Random Data
        </Button>
        <Select
          value={visualizationType}
          onChange={(e) => setVisualizationType(e.target.value)}
          sx={{ minWidth: 120 }}
        >
          <MenuItem value="barChart">Bar Chart</MenuItem>
          <MenuItem value="lineChart">Line Chart</MenuItem>
          <MenuItem value="pieChart">Pie Chart</MenuItem>
        </Select>
        <Button variant="contained" onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
          Toggle Theme
        </Button>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <Button 
          variant="contained" 
          onClick={startSearch} 
          disabled={isSearching}
          color="primary"
        >
          {isSearching ? "Searching..." : "Start Search"}
        </Button>
        <Button variant="contained" onClick={exportData}>
          Export Data
        </Button>
      </Box>

      <div id="visualization" style={{ margin: '20px 0' }}></div>

      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <Button 
          variant="outlined" 
          onClick={() => setCurrentStepIndex(Math.max(0, currentStepIndex - 1))}
          disabled={currentStepIndex === 0}
        >
          Previous Step
        </Button>
        <Button
          variant="outlined"
          onClick={() => setCurrentStepIndex(Math.min(searchSteps.length - 1, currentStepIndex + 1))}
          disabled={currentStepIndex === searchSteps.length - 1}
        >
          Next Step
        </Button>
      </Box>

      <Card sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          {searchSteps[currentStepIndex]?.action || "Search not started"}
        </Typography>
        <Typography variant="body1" gutterBottom>
          Current Array: {currentArrayState.join(", ")}
        </Typography>
        <Typography variant="body1">
          Target: {target} | Found Index: {foundIndex !== -1 ? foundIndex : "Not Found"}
        </Typography>
      </Card>

      <Card sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>Binary Search Algorithm</Typography>
        <Typography variant="body1" paragraph>
          Binary Search is an efficient algorithm for finding an item in a sorted list. 
          It works by repeatedly dividing the search interval in half until the target is found.
        </Typography>
        <Typography variant="body1" paragraph>
          <strong>Time Complexity:</strong> O(log n)
        </Typography>
        <Typography variant="body1">
          <strong>Steps:</strong>
          <ol>
            <li>Compare target with middle element</li>
            <li>If matches, return index</li>
            <li>If target is larger, search right half</li>
            <li>If target is smaller, search left half</li>
            <li>Repeat until found or search space exhausted</li>
          </ol>
        </Typography>
      </Card>
    </div>
  );
};

export default BinarySearch;