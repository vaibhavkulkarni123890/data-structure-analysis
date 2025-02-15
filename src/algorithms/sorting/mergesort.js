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
} from "@mui/material";
import { saveAs } from "file-saver";

const MergeSort = () => {
  const [data, setData] = useState([8, 3, 1, 7, 0, 10, 2]);
  const [sortedData, setSortedData] = useState([]);
  const [tabIndex, setTabIndex] = useState(0);
  const [theme, setTheme] = useState("light");
  const [animationSpeed, setAnimationSpeed] = useState(500);
  const [isSorting, setIsSorting] = useState(false);
  const [visualizationType, setVisualizationType] = useState("barChart");
  const [currentArrayState, setCurrentArrayState] = useState(data);
  const [sortingSteps, setSortingSteps] = useState([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const width = 600;
  const height = 300;

  // Function to draw the bar chart
  const drawBarChart = useCallback((array) => {
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

    // Create bars
    svg
      .selectAll("rect")
      .data(array)
      .enter()
      .append("rect")
      .attr("x", (d, i) => i * barWidth)
      .attr("y", (d) => height - yScale(d))
      .attr("width", barWidth - 2)
      .attr("height", (d) => yScale(d))
      .attr("fill", theme === "light" ? "steelblue" : "#4f8eb3");

    // Add text labels
    svg
      .selectAll("text")
      .data(array)
      .enter()
      .append("text")
      .text((d) => d)
      .attr("x", (d, i) => i * barWidth + barWidth / 2)
      .attr("y", (d) => {
        const barHeight = yScale(d);
        return barHeight < 20 ? height - barHeight - 5 : height - barHeight + 15;
      })
      .attr("fill", (d) => {
        const barHeight = yScale(d);
        return barHeight < 20 ? (theme === "light" ? "#000" : "#fff") : "#fff";
      })
      .attr("font-size", "12px")
      .attr("text-anchor", "middle");
  }, [theme]);

  // Function to draw a line chart
  const drawLineChart = useCallback((array) => {
    d3.select("#visualization").selectAll("*").remove();
    const svg = d3
      .select("#visualization")
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .style("background-color", theme === "light" ? "#f0f0f0" : "#222");

    const xScale = d3.scaleLinear().domain([0, array.length - 1]).range([0, width]);
    const yScale = d3.scaleLinear().domain([0, d3.max(array)]).range([height, 0]);
    const line = d3.line().x((d, i) => xScale(i)).y((d) => yScale(d));

    svg
      .append("path")
      .datum(array)
      .attr("fill", "none")
      .attr("stroke", theme === "light" ? "steelblue" : "#4f8eb3")
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
      .attr("fill", theme === "light" ? "steelblue" : "#4f8eb3");
  }, [theme]);

  // Function to draw a pie chart
  const drawPieChart = useCallback((array) => {
    d3.select("#visualization").selectAll("*").remove();
    const svg = d3
      .select("#visualization")
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .style("background-color", theme === "light" ? "#f0f0f0" : "#222");

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
  }, [theme]);

  // Function to draw a scatter plot
  const drawScatterPlot = useCallback((array) => {
    d3.select("#visualization").selectAll("*").remove();
    const svg = d3
      .select("#visualization")
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .style("background-color", theme === "light" ? "#f0f0f0" : "#222");

    const xScale = d3.scaleLinear().domain([0, array.length - 1]).range([0, width]);
    const yScale = d3.scaleLinear().domain([0, d3.max(array)]).range([height, 0]);

    svg
      .selectAll("circle")
      .data(array)
      .enter()
      .append("circle")
      .attr("cx", (d, i) => xScale(i))
      .attr("cy", (d) => yScale(d))
      .attr("r", 5)
      .attr("fill", theme === "light" ? "steelblue" : "#4f8eb3");
  }, [theme]);

  // Function to draw a heatmap
  const drawHeatmap = useCallback((array) => {
    d3.select("#visualization").selectAll("*").remove();
    const svg = d3
      .select("#visualization")
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .style("background-color", theme === "light" ? "#f0f0f0" : "#222");

    const colorScale = d3.scaleSequential(d3.interpolatePlasma).domain([0, d3.max(array)]);
    const cellSize = width / array.length;

    svg
      .selectAll("rect")
      .data(array)
      .enter()
      .append("rect")
      .attr("x", (d, i) => i * cellSize)
      .attr("y", 0)
      .attr("width", cellSize)
      .attr("height", height)
      .attr("fill", (d) => colorScale(d));
  }, [theme]);

  // Function to draw a box plot
  const drawBoxPlot = useCallback((array) => {
    d3.select("#visualization").selectAll("*").remove();
    const svg = d3
      .select("#visualization")
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .style("background-color", theme === "light" ? "#f0f0f0" : "#222");

    const yScale = d3.scaleLinear().domain([0, d3.max(array)]).range([height, 0]);
    const boxWidth = 100;
    const boxX = width / 2 - boxWidth / 2;

    svg
      .append("rect")
      .attr("x", boxX)
      .attr("y", yScale(d3.quantile(array, 0.75)))
      .attr("width", boxWidth)
      .attr("height", yScale(d3.quantile(array, 0.25)) - yScale(d3.quantile(array, 0.75)))
      .attr("fill", theme === "light" ? "steelblue" : "#4f8eb3");

    svg
      .append("line")
      .attr("x1", boxX)
      .attr("x2", boxX + boxWidth)
      .attr("y1", yScale(d3.median(array)))
      .attr("y2", yScale(d3.median(array)))
      .attr("stroke", "#000")
      .attr("stroke-width", 2);
  }, [theme]);

  // Sorting Animation
  const mergeSortAnimation = async (arr, left, right, steps = []) => {
    if (left >= right) return steps;

    const mid = Math.floor((left + right) / 2);

    const leftSteps = await mergeSortAnimation(arr, left, mid, steps);
    const rightSteps = await mergeSortAnimation(arr, mid + 1, right, leftSteps);

    let temp = [];
    let i = left,
      j = mid + 1;

    const mergeSteps = [];

    while (i <= mid && j <= right) {
      mergeSteps.push({
        array: [...arr],
        left: i,
        right: j,
        action: `Comparing ${arr[i]} and ${arr[j]}`,
      });

      if (arr[i] < arr[j]) {
        temp.push(arr[i++]);
      } else {
        temp.push(arr[j++]);
      }
    }

    while (i <= mid) temp.push(arr[i++]);
    while (j <= right) temp.push(arr[j++]);

    for (let k = left, t = 0; k <= right; k++, t++) {
      arr[k] = temp[t];
      mergeSteps.push({
        array: [...arr],
        action: `Merging sorted subarrays`,
      });
    }

    return rightSteps.concat(mergeSteps);
  };

  const startSorting = () => {
    if (isSorting) return;
    setIsSorting(true);
    setCurrentStepIndex(0);
    setSortingSteps([]); // Clear previous steps

    let arrCopy = [...data];
    mergeSortAnimation(arrCopy, 0, arrCopy.length - 1).then((steps) => {
      setSortingSteps(steps);
      setSortedData([...arrCopy]);
      setIsSorting(false);
    });
  };

  const goToNextStep = () => {
    if (currentStepIndex < sortingSteps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
      setCurrentArrayState(sortingSteps[currentStepIndex + 1].array);

      // eslint-disable-next-line default-case
      switch (visualizationType) {
        case "barChart":
          drawBarChart(sortingSteps[currentStepIndex + 1].array);
          break;
        case "lineChart":
          drawLineChart(sortingSteps[currentStepIndex + 1].array);
          break;
        case "pieChart":
          drawPieChart(sortingSteps[currentStepIndex + 1].array);
          break;
        case "scatterPlot":
          drawScatterPlot(sortingSteps[currentStepIndex + 1].array);
          break;
        case "heatmap":
          drawHeatmap(sortingSteps[currentStepIndex + 1].array);
          break;
        case "boxPlot":
          drawBoxPlot(sortingSteps[currentStepIndex + 1].array);
          break;
      }
    }
  };

  const goToPreviousStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
      setCurrentArrayState(sortingSteps[currentStepIndex - 1].array);

      // eslint-disable-next-line default-case
      switch (visualizationType) {
        case "barChart":
          drawBarChart(sortingSteps[currentStepIndex - 1].array);
          break;
        case "lineChart":
          drawLineChart(sortingSteps[currentStepIndex - 1].array);
          break;
        case "pieChart":
          drawPieChart(sortingSteps[currentStepIndex - 1].array);
          break;
        case "scatterPlot":
          drawScatterPlot(sortingSteps[currentStepIndex - 1].array);
          break;
        case "heatmap":
          drawHeatmap(sortingSteps[currentStepIndex - 1].array);
          break;
        case "boxPlot":
          drawBoxPlot(sortingSteps[currentStepIndex - 1].array);
          break;
      }
    }
  };




    useEffect(() => {
      if (sortingSteps.length > 0) {
        setCurrentArrayState(sortingSteps[currentStepIndex].array);
      }
    
      switch (visualizationType) {
        case "barChart":
          drawBarChart(currentArrayState);
          break;
        case "lineChart":
          drawLineChart(currentArrayState);
          break;
        case "pieChart":
          drawPieChart(currentArrayState);
          break;
        case "scatterPlot":
          drawScatterPlot(currentArrayState);
          break;
        case "heatmap":
          drawHeatmap(currentArrayState);
          break;
        case "boxPlot":
          drawBoxPlot(currentArrayState);
          break;
        default:  // Add the default case
          console.warn("Unknown visualization type:", visualizationType); // Or some other default action
          drawBarChart(currentArrayState); // Example: Default to bar chart
          break;
      }
    }, [
      sortingSteps,
      currentStepIndex,
      visualizationType,
      currentArrayState,
      drawBarChart,
      drawLineChart,
      drawPieChart,
      drawScatterPlot,
      drawHeatmap,
      drawBoxPlot,
      theme,
    ]);

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
    saveAs(blob, "merge_sort_data.json");
  };

  return (
    <div>
      <h1>Merge Sort Visualization</h1>
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
          sx={{ marginBottom: "10px" }}
        />
      )}
      {tabIndex === 1 && (
        <Button onClick={generateRandomData}>Generate Random Data</Button>
      )}
  
      <Select
        value={visualizationType}
        onChange={(e) => setVisualizationType(e.target.value)}
        sx={{ marginBottom: "10px" }}
      >
        <MenuItem value="barChart">Bar Chart</MenuItem>
        <MenuItem value="lineChart">Line Chart</MenuItem>
        <MenuItem value="pieChart">Pie Chart</MenuItem>
        <MenuItem value="scatterPlot">Scatter Plot</MenuItem>
        <MenuItem value="heatmap">Heatmap</MenuItem>
        <MenuItem value="boxPlot">Box Plot</MenuItem>
      </Select>
  
      <Typography>Animation Speed</Typography>
      <Slider
        value={animationSpeed}
        onChange={(e, newValue) => setAnimationSpeed(newValue)}
        min={100}
        max={1000}
        valueLabelDisplay="auto"
        sx={{ maxWidth: 300, margin: "0 auto" }}
      />
  
      <Button onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
        Toggle Theme
      </Button>
  
      <Button disabled={isSorting} onClick={startSorting}>
        {isSorting ? "Sorting..." : "Start Sorting"}
      </Button>
  
      <Button onClick={exportData}>Export Data</Button>
  
      <div id="visualization" style={{ marginTop: "20px" }}></div>

<Button onClick={goToPreviousStep} disabled={currentStepIndex === 0 || isSorting}>
  Previous Step
</Button>
<Button
  onClick={goToNextStep}
  disabled={currentStepIndex === sortingSteps.length - 1 || isSorting}
>
  Next Step
</Button>

<Card
  sx={{
    marginTop: "20px",
    padding: "10px",
    backgroundColor: theme === "light" ? "#f0f0f0" : "#222",
    color: theme === "light" ? "#000" : "#fff",
  }}
>
  <Typography variant="h6">Sorting Step:</Typography>
  <Typography>
    {sortingSteps.length > 0 ? sortingSteps[currentStepIndex].action : "Not Started"}
  </Typography>
</Card>

<Card
  sx={{
    marginTop: "20px",
    padding: "10px",
    backgroundColor: theme === "light" ? "#f0f0f0" : "#222",
    color: theme === "light" ? "#000" : "#fff",
  }}
>
  <Typography variant="h6">Current Array State:</Typography>
  <Typography>{currentArrayState.join(", ")}</Typography>
</Card>

<Typography variant="h6" marginTop="20px">Merge Sort Algorithm Explained</Typography> {/* Explanation section */}
      <Typography>
        Merge Sort is a divide-and-conquer algorithm that sorts an array by recursively dividing it into two halves, sorting each half, and then merging the sorted halves back together.
      </Typography>
      <Typography>
        <b>Time Complexity:</b> O(n log n) in all cases (best, average, worst).
      </Typography>
      <Typography>
        <b>Space Complexity:</b> O(n) due to the need for temporary arrays during the merge process.
      </Typography>
      <Typography>
        <b>Steps:</b>
        <ol>
          <li><b>Divide:</b> The array is split into two halves.</li>
          <li><b>Conquer:</b> Each half is recursively sorted.</li>
          <li><b>Combine:</b> The sorted halves are merged.</li>
        </ol>
      </Typography>
      <Typography>
        This visualization demonstrates the steps involved in sorting an array using Merge Sort. Use the "Previous Step" and "Next Step" buttons to walk through the sorting process.
      </Typography>

      <Typography variant="h6" marginTop="20px">Legend:</Typography>
      <Box display="flex" alignItems="center">
        <Box width="20px" height="20px" bgcolor="#ff6b6b" marginRight="5px"></Box>
        Left Element (Being Compared)
        <Box
          width="20px"
          height="20px"
          bgcolor="#4ecdc4"
          marginLeft="20px"
          marginRight="5px"
        ></Box>
        Right Element (Being Compared)
        <Box width="20px" height="20px" bgcolor={theme === "light" ? "steelblue" : "#4f8eb3"} marginLeft="20px" marginRight="5px"></Box>
        Unsorted/Merged Element
      </Box>

    </div>
  );
};

export default MergeSort;