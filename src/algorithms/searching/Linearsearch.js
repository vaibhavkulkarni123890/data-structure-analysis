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

const LinearSearch = () => {
  const [data, setData] = useState([1, 3, 5, 7, 9, 11, 13]);
  const [target, setTarget] = useState(7);
  const [theme, setTheme] = useState("light");
  const [isSearching, setIsSearching] = useState(false);
  const [visualizationType, setVisualizationType] = useState("barChart");
  const [currentArrayState, setCurrentArrayState] = useState([...data]);
  const [searchSteps, setSearchSteps] = useState([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [foundIndex, setFoundIndex] = useState(-1);

  const width = 600;
  const height = 300;

  // Visualization drawing functions with search highlights
  const drawBarChart = useCallback((array, currentIndex = -1) => {
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
        if (i === currentIndex) return "#4ecdc4";
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

  const linearSearchSteps = (arr, target) => {
    let steps = [];
    for (let i = 0; i < arr.length; i++) {
      steps.push({
        array: [...arr],
        currentIndex: i,
        action: `Comparing ${arr[i]} with target ${target}`
      });

      if (arr[i] === target) {
        steps.push({
          array: [...arr],
          action: `Target found at index ${i}`,
          found: true
        });
        return steps;
      }
    }

    steps.push({ array: [...arr], action: "Target not found" });
    return steps;
  };

  const startSearch = async () => {
    if (isSearching || !target || isNaN(target)) return;
    
    setIsSearching(true);
    setFoundIndex(-1);
    setCurrentStepIndex(0);
    
    const steps = linearSearchSteps(data, Number(target));
    
    setSearchSteps(steps);
    setCurrentArrayState([...data]);
    setIsSearching(false);
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const updateVisualization = (index) => {
    const step = searchSteps[index];
    if (!step) return;
    
    setCurrentArrayState(step.array);
    if (visualizationType === "barChart") {
      drawBarChart(step.array, step.currentIndex);
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
    setCurrentArrayState([...inputValues]);
  };

  const handleTargetChange = (e) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value)) setTarget(value);
  };

  const generateRandomData = () => {
    const newData = Array.from({ length: 7 }, () => Math.floor(Math.random() * 15) + 1);
    setData(newData);
    setCurrentArrayState([...newData]);
  };

  const exportData = () => {
    const exportObj = {
      data,
      target,
      foundIndex,
      steps: searchSteps
    };
    const blob = new Blob([JSON.stringify(exportObj, null, 2)], { type: "application/json" });
    saveAs(blob, "linear_search_data.json");
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <Typography variant="h4" gutterBottom>
        Linear Search Visualization
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
        <Typography variant="h6" gutterBottom>Linear Search Algorithm</Typography>
        <Typography variant="body1" paragraph>
          Linear Search is a simple algorithm for finding an item in a list. 
          It works by checking each element in the list sequentially until the target is found.
        </Typography>
        <Typography variant="body1" paragraph>
          <strong>Time Complexity:</strong> O(n)
        </Typography>
        <Typography variant="body1">
          <strong>Steps:</strong>
          <ol>
            <li>Start from the first element</li>
            <li>Compare target with current element</li>
            <li>If matches, return index</li>
            <li>Move to the next element</li>
            <li>Repeat until found or end of list</li>
          </ol>
        </Typography>
      </Card>
    </div>
  );
};

export default LinearSearch;