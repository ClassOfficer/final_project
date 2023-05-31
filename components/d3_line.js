function _aapl(FileAttachment) {
  return (
    FileAttachment(d3.select("input[type=radio][name=x-encoding]:checked").property("value")+".csv").csv({ typed: true })
  )
}

function _LineChart(d3) {
  return (
    function LineChart(data, {
      x = ([x]) => x, // given d in data, returns the (temporal) x-value
      y = ([, y]) => y, // given d in data, returns the (quantitative) y-value
      title, // given d in data, returns the title text
      defined, // for gaps in data
      curve = d3.curveLinear, // method of interpolation between points
      marginTop = 20, // top margin, in pixels
      marginRight = 30, // right margin, in pixels
      marginBottom = 30, // bottom margin, in pixels
      marginLeft = 40, // left margin, in pixels
      width = 640, // outer width, in pixels
      height = 400, // outer height, in pixels
      xType = d3.scaleUtc, // type of x-scale
      xDomain, // [xmin, xmax]
      xRange = [marginLeft, width - marginRight], // [left, right]
      yType = d3.scaleLinear, // type of y-scale
      yDomain, // [ymin, ymax]
      yRange = [height - marginBottom, marginTop], // [bottom, top]
      color = "currentColor", // stroke color of line
      strokeWidth = 1.5, // stroke width of line, in pixels
      strokeLinejoin = "round", // stroke line join of line
      strokeLinecap = "round", // stroke line cap of line
      yFormat, // a format specifier string for the y-axis
      yLabel, // a label for the y-axis
    } = {}) {
      const period_left = document.getElementById("slider-1").value
      const period_right = document.getElementById("slider-2").value
      const left_time = parseInt(data.length/100* period_left)
      const right_time = parseInt(data.length/100* period_right)
      const X = d3.map(data, x).slice(left_time,right_time);
      const Y = d3.map(data, y).slice(left_time,right_time);
      const O = d3.map(data, d => d);
      const I = d3.map(data, (_, i) => i);

      if (defined === undefined) defined = (d, i) => !isNaN(X[i]) && !isNaN(Y[i]);
      const D = d3.map(data, defined);

      if (xDomain === undefined) xDomain = d3.extent(X);
      if (yDomain === undefined) yDomain = [d3.min(Y), d3.max(Y)];
      
      const xScale = xType(xDomain, xRange);
      const yScale = yType(yDomain, yRange);
      const xAxis = d3.axisBottom(xScale).ticks(width / 80).tickSizeOuter(0);
      const yAxis = d3.axisLeft(yScale).ticks(height / 40, yFormat);

      if (title === undefined) {
        const formatDate = xScale.tickFormat(null, "%Y-%m-%d %H:%M");
        const formatValue = yScale.tickFormat(100, yFormat);
        title = i => `${formatDate(X[i])}\n${formatValue(Y[i])}`;
      } else {
        const O = d3.map(data, d => d);
        const T = title;
        title = i => T(O[i], i, data);
      }
      
      const line = d3.line()
        .defined(i => D[i])
        .curve(curve)
        .x(i => xScale(X[i]))
        .y(i => yScale(Y[i]));

      const svg = d3.create("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", [0, 0, width, height])
        .attr("style", "max-width: 70%; height: auto; height: intrinsic;")
        .attr("font-family", "sans-serif")
        .attr("font-size", 13)
        .style("-webkit-tap-highlight-color", "transparent")
        .style("overflow", "visible")
        .on("pointerenter pointermove", pointermoved)
        .on("pointerleave", pointerleft)
        .on("touchstart", event => event.preventDefault())
        .attr('class', 'linecharts')
        .style("text-align", "center");

      svg.append("g")
        .attr("transform", `translate(0,${height - marginBottom})`)
        .call(xAxis);

      svg.append("g")
        .attr("transform", `translate(${marginLeft},0)`)
        .call(yAxis)
        .call(g => g.select(".domain").remove())
        .call(g => g.selectAll(".tick line").clone()
          .attr("x2", width - marginLeft - marginRight)
          .attr("stroke-opacity", 0.1))
        .call(g => g.append("text")
          .attr("x", -marginLeft)
          .attr("y", 10)
          .attr("fill", "currentColor")
          .attr("text-anchor", "start")
          .text(yLabel))
          .style("font-size", "15px");

      svg.append("path")
        .attr("fill", "none")
        .attr("stroke", color)
        .attr("stroke-width", strokeWidth)
        .attr("stroke-linejoin", strokeLinejoin)
        .attr("stroke-linecap", strokeLinecap)
        .attr("d", line(I));

      const tooltip = svg.append("g")
        .style("pointer-events", "none");

      function pointermoved(event) {
        const i = d3.bisectCenter(X, xScale.invert(d3.pointer(event)[0]));
        tooltip.style("display", null);
        tooltip.attr("transform", `translate(${xScale(X[i])},${yScale(Y[i])})`);

        const path = tooltip.selectAll("path")
          .data([,])
          .join("path")
          .attr("fill", "white")
          .attr("stroke", "black");

        const text = tooltip.selectAll("text")
          .data([,])
          .join("text")
          .call(text => text
            .selectAll("tspan")
            .data(`${title(i)}`.split(/\n/))
            .join("tspan")
            .attr("x", 0)
            .attr("y", (_, i) => `${i * 1.1}em`)
            .attr("font-weight", (_, i) => i ? null : "bold")
            .text(d => d))

        const { x, y, width: w, height: h } = text.node().getBBox();
        text.attr("transform", `translate(${-w / 2},${15 - y})`);
        path.attr("d", `M${-w / 2 - 10},5H-5l5,-5l5,5H${w / 2 + 10}v${h + 20}h-${w + 20}z`);
        svg.property("value", O[i]).dispatch("input", { bubbles: true });
      }

      function pointerleft() {
        tooltip.style("display", "none");
        svg.node().value = null;
        svg.dispatch("input", { bubbles: true });
      }

      return Object.assign(svg.node(), { value: null });
    }
  )
}
const line_chart_width = 750
const line_chart_height = 375 
const line_chart_marginLeft = 100
function _semi_chart(LineChart, aapl, width) {
  return (
    LineChart(aapl, {
      x: d => d3.timeParse("%Y-%m-%d %H:%M")(d.timestamp),
      y: d => d.semi_major_axis,
      yLabel: "Semi-major axis",
      width: line_chart_width,
      height: line_chart_height,
      marginLeft: line_chart_marginLeft,
      color: d3.schemeCategory10[0]
    })
  )
}
function _ecce_chart(LineChart, aapl, width) {
  return (
    LineChart(aapl, {
      x: d => d3.timeParse("%Y-%m-%d %H:%M")(d.timestamp),
      y: d => d.eccentricity,
      yLabel: "Eccentricity",
      width: line_chart_width,
      height: line_chart_height,
      marginLeft: line_chart_marginLeft,
      color: d3.schemeCategory10[1]
    })
  )
}
function _incl_chart(LineChart, aapl, width) {
  return (
    LineChart(aapl, {
      x: d => d3.timeParse("%Y-%m-%d %H:%M")(d.timestamp),
      y: d => d.inclination,
      yLabel: "Inclination",
      width: line_chart_width,
      height: line_chart_height,
      marginLeft: line_chart_marginLeft,
      color: d3.schemeCategory10[2]
    })
  )
}
function _RAAN_chart(LineChart, aapl, width) {
  return (
    LineChart(aapl, {
      x: d => d3.timeParse("%Y-%m-%d %H:%M")(d.timestamp),
      y: d => d.RAAN,
      yLabel: "RAAN",
      width: line_chart_width,
      height: line_chart_height,
      marginLeft: line_chart_marginLeft,
      color: d3.schemeCategory10[3]
    })
  )
}
function _arg_chart(LineChart, aapl, width) {
  return (
    LineChart(aapl, {
      x: d => d3.timeParse("%Y-%m-%d %H:%M")(d.timestamp),
      y: d => d.arg_perigee,
      yLabel: "Argument of perigee",
      width: line_chart_width,
      height: line_chart_height,
      marginLeft: line_chart_marginLeft,
      color: d3.schemeCategory10[4]
    })
  )
}
function _mean_chart(LineChart, aapl, width) {
  return (
    LineChart(aapl, {
      x: d => d3.timeParse("%Y-%m-%d %H:%M")(d.timestamp),
      y: d => d.mean_anomaly,
      yLabel: "Mean anomaly",
      width: line_chart_width,
      height: line_chart_height,
      marginLeft: line_chart_marginLeft,
      color: d3.schemeCategory10[5]
    })
  )
}
function _alti_chart(LineChart, aapl, width) {
  return (
    LineChart(aapl, {
      x: d => d3.timeParse("%Y-%m-%d %H:%M")(d.timestamp),
      y: d => d.altitude,
      yLabel: "Altitude",
      width: line_chart_width,
      height: line_chart_height,
      marginLeft: line_chart_marginLeft,
      color: d3.schemeCategory10[6]
    })
  )
}

export default function define(runtime, observer) {
  const main = runtime.module();
  function toString() { return this.url; }
  const fileAttachments = new Map([
    // ["k3.csv", { url: new URL("https://raw.githubusercontent.com/ClassOfficer/infovis/main/k3.csv", import.meta.url), mimeType: "text/csv", toString }],
    // ["k3a.csv", { url: new URL("https://raw.githubusercontent.com/ClassOfficer/infovis/main/k3a.csv", import.meta.url), mimeType: "text/csv", toString }],
    // ["k5.csv", { url: new URL("https://raw.githubusercontent.com/ClassOfficer/infovis/main/k5.csv", import.meta.url), mimeType: "text/csv", toString }]
    ["k3.csv", { url: new URL("../data/k3.csv", import.meta.url), mimeType: "text/csv", toString }],
    ["k3a.csv", { url: new URL("../data/k3a.csv", import.meta.url), mimeType: "text/csv", toString }],
    ["k5.csv", { url: new URL("../data/k5.csv", import.meta.url), mimeType: "text/csv", toString }]
    
  ]);
  main.builtin("FileAttachment", runtime.fileAttachments(name => fileAttachments.get(name)));
  
  if (d3.select("#semi").property("checked")) {
    main.variable(observer("semichart")).define("semichart", ["semiLineChart", "semiaapl", "width"], _semi_chart);
    main.variable(observer("semiaapl")).define("semiaapl", ["FileAttachment"], _aapl);
    // main.variable(observer("semifocus")).define("semifocus", ["Generators", "semichart"], _focus);
    main.variable(observer("semiLineChart")).define("semiLineChart", ["d3"], _LineChart);
  }
  if (d3.select("#ecce").property("checked")) {
    main.variable(observer("eccechart")).define("eccechart", ["ecceLineChart", "ecceaapl", "width"], _ecce_chart);
    main.variable(observer("ecceaapl")).define("ecceaapl", ["FileAttachment"], _aapl);
    // main.variable(observer("eccefocus")).define("eccefocus", ["Generators", "eccechart"], _focus);
    main.variable(observer("ecceLineChart")).define("ecceLineChart", ["d3"], _LineChart);
  }
  if (d3.select("#incl").property("checked")) {
    main.variable(observer("inclchart")).define("inclchart", ["inclLineChart", "inclaapl", "width"], _incl_chart);
    main.variable(observer("inclaapl")).define("inclaapl", ["FileAttachment"], _aapl);
    // main.variable(observer("inclfocus")).define("inclfocus", ["Generators", "inclchart"], _focus);
    main.variable(observer("inclLineChart")).define("inclLineChart", ["d3"], _LineChart);
  }
  if (d3.select("#raan").property("checked")) {
    main.variable(observer("RAANchart")).define("RAANchart", ["RAANLineChart", "RAANaapl", "width"], _RAAN_chart);
    main.variable(observer("RAANaapl")).define("RAANaapl", ["FileAttachment"], _aapl);
    // main.variable(observer("RAANfocus")).define("RAANfocus", ["Generators", "RAANchart"], _focus);
    main.variable(observer("RAANLineChart")).define("RAANLineChart", ["d3"], _LineChart);
  }
  if (d3.select("#argu").property("checked")) {
    main.variable(observer("argchart")).define("argchart", ["argLineChart", "argaapl", "width"], _arg_chart);
    main.variable(observer("argaapl")).define("argaapl", ["FileAttachment"], _aapl);
    // main.variable(observer("argfocus")).define("argfocus", ["Generators", "argchart"], _focus);
    main.variable(observer("argLineChart")).define("argLineChart", ["d3"], _LineChart);
  }
  if (d3.select("#mean").property("checked")) {
    main.variable(observer("meanchart")).define("meanchart", ["meanLineChart", "meanaapl", "width"], _mean_chart);
    main.variable(observer("meanaapl")).define("meanaapl", ["FileAttachment"], _aapl);
    // main.variable(observer("meanfocus")).define("meanfocus", ["Generators", "meanchart"], _focus);
    main.variable(observer("meanLineChart")).define("meanLineChart", ["d3"], _LineChart);
  }
  if (d3.select("#alti").property("checked")) {
    main.variable(observer("altichart")).define("altichart", ["altiLineChart", "altiaapl", "width"], _alti_chart);
    main.variable(observer("altiaapl")).define("altiaapl", ["FileAttachment"], _aapl);
    // main.variable(observer("altifocus")).define("altifocus", ["Generators", "altichart"], _focus);
    main.variable(observer("altiLineChart")).define("altiLineChart", ["d3"], _LineChart);
  }
  return main;
}