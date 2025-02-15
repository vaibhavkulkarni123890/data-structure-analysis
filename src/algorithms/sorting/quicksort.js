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

const QuickSort = () => {
  const [data, setData] = useState([8, 3, 1, 7, 0, 10, 2]);
  const [sortedData, setSortedData] = useState([]);
  const [tabIndex, setTabIndex] = useState(0);
  const [animationSpeed, setAnimationSpeed] = useState(500);
  const [isSorting, setIsSorting] = useState(false);
  const [visualizationType, setVisualizationType] = useState("barChart");
  const [currentArrayState, setCurrentArrayState] = useState(data);
  const [sortingSteps, setSortingSteps] = useState([]);
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
      Quick Sort Algorithm Explanation:
      A divide-and-conquer algorithm that selects a 'pivot' element and partitions the array into two halves.
      
      Key Steps:
      1. Choose Pivot: Select a pivot element from the array.
      2. Partition: Rearrange the array so that elements less than the pivot are on the left, and elements greater are on the right.
      3. Recursively Apply: Apply the same process to the sub-arrays on either side of the pivot.
      4. Combine: No need to combine as the array is sorted in place.
      
      Time Complexity: O(n log n) on average, O(n^2) in the worst case.
      Space Complexity: O(log n) due to recursion.
    `;

    const utterance = new SpeechSynthesisUtterance(explanation);
    utterance.rate = 1.1;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    synth.speak(utterance);
    setIsSpeaking(true);
  };

  // Visualization drawing functions
  const drawBarChart = useCallback((array) => {
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
      .attr("fill", "#1976d2");

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

  const drawLineChart = useCallback((array) => {
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
      .attr("fill", "#1976d2");
  }, []);

  const drawPieChart = useCallback((array) => {
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
      .attr("fill", (d, i) => color(i));

    g.selectAll("text")
      .data(pie(array))
      .enter()
      .append("text")
      .attr("transform", (d) => `translate(${arc.centroid(d)})`)
      .attr("text-anchor", "middle")
      .text((d) => d.data);
  }, []);

  // Quick Sort algorithm
  const quickSortAnimation = async (arr, low, high, steps) => {
    if (low < high) {
      const pivotIndex = await partition(arr, low, high, steps);
      await quickSortAnimation(arr, low, pivotIndex - 1, steps);
      await quickSortAnimation(arr, pivotIndex + 1, high, steps);
    }
    return steps;
  };

  const partition = async (arr, low, high, steps) => {
    const pivot = arr[high];
    let i = low - 1;

    for (let j = low; j < high; j++) {
      steps.push({
        array: [...arr],
        action: `Comparing ${arr[j]} and pivot ${pivot}`,
        comparing: [j, high],
      });

      if (arr[j] < pivot) {
        i++;
        [arr[i], arr[j]] = [arr[j], arr[i]];
        steps.push({
          array: [...arr],
          action: `Swapping ${arr[i]} and ${arr[j]}`,
          swapped: [i, j],
        });
      }
    }

    [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
    steps.push({
      array: [...arr],
      action: `Placing pivot ${pivot} in correct position`,
      swapped: [i + 1, high],
    });

    return i + 1;
  };

  const startSorting = () => {
    if (isSorting) return;
    setIsSorting(true);
    setCurrentStepIndex(0);
    setSortingSteps([]);

    let arrCopy = [...data];
    quickSortAnimation(arrCopy, 0, arrCopy.length - 1, []).then((steps) => {
      setSortingSteps(steps);
      setSortedData([...arrCopy]);
      setIsSorting(false);
    });
  };

  useEffect(() => {
    if (isPlaying) {
      const timer = setInterval(() => {
        if (currentStepIndex < sortingSteps.length - 1) {
          goToNextStep();
        } else {
          setIsPlaying(false);
        }
      }, animationSpeed);
      return () => clearInterval(timer);
    }
  }, [isPlaying, currentStepIndex, animationSpeed]);

  const togglePlay = () => {
    if (currentStepIndex >= sortingSteps.length - 1) setCurrentStepIndex(0);
    setIsPlaying(!isPlaying);
    if (!isPlaying && sortingSteps[currentStepIndex]?.action) {
      speak(sortingSteps[currentStepIndex].action);
    }
  };

  const goToNextStep = () => {
    if (currentStepIndex < sortingSteps.length - 1) {
      const newIndex = currentStepIndex + 1;
      setCurrentStepIndex(newIndex);
      setCurrentArrayState(sortingSteps[newIndex].array);
      updateVisualization(sortingSteps[newIndex].array);
      speak(sortingSteps[newIndex].action);
    }
  };

  const goToPreviousStep = () => {
    if (currentStepIndex > 0) {
      const newIndex = currentStepIndex - 1;
      setCurrentStepIndex(newIndex);
      setCurrentArrayState(sortingSteps[newIndex].array);
      updateVisualization(sortingSteps[newIndex].array);
      speak(sortingSteps[newIndex].action);
    }
  };

  const updateVisualization = (array) => {
    switch (visualizationType) {
      case "barChart":
        drawBarChart(array);
        break;
      case "lineChart":
        drawLineChart(array);
        break;
      case "pieChart":
        drawPieChart(array);
        break;
      default:
        drawBarChart(array);
    }
  };

  useEffect(() => {
    if (sortingSteps.length > 0) {
      setCurrentArrayState(sortingSteps[currentStepIndex].array);
    }
    updateVisualization(currentArrayState);
  }, [sortingSteps, currentStepIndex, visualizationType, currentArrayState]);

  const handleDataChange = (e) => {
    const inputValues = e.target.value.split(",");
    const newData = [];
    for (const val of inputValues) {
      const num = Number(val.trim());
      if (isNaN(num)) {
        alert("Invalid input: " + val + " is not a number");
        return;
      }
      newData.push(num);
    }
    setData(newData);
    setSortedData([]);
  };

  const generateRandomData = () => {
    const newData = Array.from({ length: 7 }, () => Math.floor(Math.random() * 15) + 1);
    setData(newData);
    setSortedData([]);
  };

  const exportData = () => {
    if (!sortedData.length) {
      alert("Sort the data first before exporting!");
      return;
    }
    const exportObj = {
      unsorted: data,
      sorted: sortedData,
    };
    const blob = new Blob([JSON.stringify(exportObj, null, 2)], { type: "application/json" });
    saveAs(blob, "quick_sort_data.json");
  };

  const speak = (text) => {
    if (synth.speaking) synth.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.2;
    synth.speak(utterance);
  };

  return (
    <Box sx={{ maxWidth: 800, margin: "0 auto", padding: 3 }}>
      <Typography variant="h3" gutterBottom sx={{ textAlign: "center", color: "#1976d2" }}>
        Quick Sort Visualization
      </Typography>

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
            onChange={handleDataChange}
            sx={{ mt: 2 }}
          />
        )}
        {tabIndex === 1 && (
          <Button
            variant="contained"
            onClick={generateRandomData}
            sx={{ mt: 2 }}
          >
            Generate Random Data
          </Button>
        )}
      </Card>

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
              onClick={startSorting}
              disabled={isSorting}
              fullWidth
            >
              {isSorting ? "Sorting..." : "Start Sorting"}
            </Button>
          </Grid>
        </Grid>
      </Card>

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
          disabled={currentStepIndex === sortingSteps.length - 1 || isPlaying}
          startIcon={<SkipNextIcon />}
        >
          Next
        </Button>
      </Box>

      <div id="visualization" style={{ margin: "20px 0", borderRadius: 8, overflow: "hidden" }}></div>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 2, boxShadow: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ color: "#1976d2" }}>
              Sorting Step Explanation
            </Typography>
            <Chip
              label={sortingSteps[currentStepIndex]?.action || "Not started"}
              color="primary"
              sx={{ p: 2, fontSize: "1rem", width: "100%" }}
            />
            <Typography variant="body1" sx={{ mt: 2, fontWeight: "bold" }}>
              Current Array State:
            </Typography>
            <Typography variant="body2" sx={{ p: 1, bgcolor: "#f5f5f5", borderRadius: 1 }}>
              {currentArrayState.join(", ")}
            </Typography>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ 
            p: 3, 
            boxShadow: 3, 
            bgcolor: "#f8f9fa", 
            borderLeft: "4px solid #1976d2",
            position: "relative"
          }}>
            <Button style={{marginLeft:'10px'}}
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
                }
              }}
            >
              
            </Button>

            <Typography variant="h5" gutterBottom sx={{ 
              color: "#1976d2", 
              mb: 2,
              pr: 8
            }}>
              Quick Sort Algorithm
            </Typography>

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
                  fontSize: "0.9rem"
                }
              }
            }}>
                  <li sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, color: "#2d3436" }}>
                      Choose Pivot
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#636e72", mt: 0.5 }}>
                      Select a pivot element (here we use last element) to partition the array
                    </Typography>
                  </li>
                  
                  <li sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, color: "#2d3436" }}>
                      Partitioning
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#636e72", mt: 0.5 }}>
                      Rearrange elements so values smaller than pivot come before it, larger values after
                    </Typography>
                  </li>
                  
                  <li sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, color: "#2d3436" }}>
                      Recursive Sort
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#636e72", mt: 0.5 }}>
                      Apply the same process recursively to the sub-arrays before and after the pivot
                    </Typography>
                  </li>
                  
                  <li>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, color: "#2d3436" }}>
                      Base Case
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#636e72", mt: 0.5 }}>
                      When sub-arrays have 0 or 1 element, they are already sorted
                    </Typography>
                  </li>
                </Box>
    
                <Grid container spacing={1} sx={{ mt: 2 }}>
                  <Grid item xs={6} md={4}>
                    <Chip 
                      label="Time: O(n logn)" 
                      sx={{ 
                        bgcolor: "#e3f2fd", 
                        color: "#1976d2",
                        width: "100%",
                        fontWeight: 500
                      }} 
                    />
                  </Grid>
                  <Grid item xs={6} md={4}>
                    <Chip 
                      label="Space: O(logn)" 
                      sx={{ 
                        bgcolor: "#f0f4c3", 
                        color: "#827717",
                        width: "100%",
                        fontWeight: 500
                      }} 
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Chip 
                      label="Unstable Sort" 
                      sx={{ 
                        bgcolor: "#f8bbd0", 
                        color: "#880e4f",
                        width: "100%",
                        fontWeight: 500
                      }} 
                    />
                  </Grid>
                </Grid>
              </Card>
            </Grid>
          </Grid>
    
          <Box sx={{ mt: 3, textAlign: "right" }}>
            <Button
              variant="contained"
              color="success"
              onClick={exportData}
              sx={{ width: 200 }}
            >
              Export Data
            </Button>
          </Box>
        </Box>
      );
    };
    
    export default QuickSort;