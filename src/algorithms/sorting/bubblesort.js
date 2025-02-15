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

const BubbleSort = () => {
  const [data, setData] = useState([8, 3, 1, 7, 0, 10, 2]);
  const [sortedData, setSortedData] = useState([]);
  const [tabIndex, setTabIndex] = useState(0);
  const [animationSpeed, setAnimationSpeed] = useState(500);
  const [isSorting, setIsSorting] = useState(false);
  const [visualizationType, setVisualizationType] = useState("barChart");
  const [sortingSteps, setSortingSteps] = useState([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const width = 600;
  const height = 300;
  const synth = window.speechSynthesis;

  const explainAlgorithm = () => {
    if (synth.speaking) {
      synth.cancel();
      setIsSpeaking(false);
      return;
    }

    const explanation = `
      Bubble Sort Algorithm Explanation:
      A simple comparison-based sorting algorithm.

      Key Steps:
      1. Compare adjacent elements and swap if needed.
      2. Repeat for each pass, pushing the largest value to the right.
      3. Continue until no swaps are needed.

      Time Complexity: O(n²) in worst case.
      Space Complexity: O(1) - It's an in-place sorting algorithm.
    `;

    const utterance = new SpeechSynthesisUtterance(explanation);
    utterance.rate = 1.1;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    synth.speak(utterance);
    setIsSpeaking(true);
  };

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

  const bubbleSortAnimation = async (arr) => {
    let steps = [];
    let n = arr.length;
    let swapped;
    
    for (let i = 0; i < n - 1; i++) {
      swapped = false;
      for (let j = 0; j < n - i - 1; j++) {
        steps.push({
          array: [...arr],
          action: `Comparing ${arr[j]} and ${arr[j + 1]}`,
          comparing: [j, j + 1],
        });

        if (arr[j] > arr[j + 1]) {
          [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
          swapped = true;
          steps.push({
            array: [...arr],
            action: `Swapping ${arr[j]} and ${arr[j + 1]}`,
            swapped: [j, j + 1],
          });
        }
      }
      if (!swapped) break;
    }
    return steps;
  };

  const startSorting = () => {
    if (isSorting) return;
    setIsSorting(true);
    setCurrentStepIndex(0);
    setSortingSteps([]);

    let arrCopy = [...data];
    bubbleSortAnimation(arrCopy).then((steps) => {
      setSortingSteps(steps);
      setSortedData([...arrCopy]);
      setIsSorting(false);
    });
  };

  useEffect(() => {
    if (isPlaying) {
      const timer = setInterval(() => {
        if (currentStepIndex < sortingSteps.length - 1) {
          setCurrentStepIndex((prevIndex) => prevIndex + 1);
        } else {
          setIsPlaying(false);
        }
      }, animationSpeed);
      return () => clearInterval(timer);
    }
  }, [isPlaying, currentStepIndex, sortingSteps, animationSpeed]);

  useEffect(() => {
    drawBarChart(currentStepIndex < sortingSteps.length ? sortingSteps[currentStepIndex].array : data);
  }, [currentStepIndex, sortingSteps, data, drawBarChart]);

  return (
    <Card sx={{ padding: 2 }}>
      <Typography variant="h5">Bubble Sort Visualization</Typography>
      <Box sx={{ display: "flex", gap: 2, marginBottom: 2 }}>
        <Button variant="contained" startIcon={<PlayArrowIcon />} onClick={startSorting} disabled={isSorting}>
          Start Sorting
        </Button>
        <Button variant="contained" startIcon={<VolumeUpIcon />} onClick={explainAlgorithm} disabled={isSpeaking}>
          Explain Algorithm
        </Button>
      </Box>
      <Box id="visualization" sx={{ height: height }}></Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, marginTop: 2 }}>
        <Typography>Speed:</Typography>
        <Slider
          value={animationSpeed}
          min={100}
          max={2000}
          step={100}
          onChange={(e, newValue) => setAnimationSpeed(newValue)}
          valueLabelDisplay="auto"
        />
      </Box>
    </Card>
  );
};

export default BubbleSort;
