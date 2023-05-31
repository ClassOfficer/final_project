function _unemployment(FileAttachment) {
    return (
        FileAttachment(d3.select("input[type=radio][name=x-encoding]:checked").property("value")+".csv").csv({ typed: true })
    )
  }
  
  function _Histogram(d3) {
    return (
      function Histogram(data, {
        value = d => d, // convenience alias for x
        domain, // convenience alias for xDomain
        label, // convenience alias for xLabel
        format, // convenience alias for xFormat
        type = d3.scaleLinear, // convenience alias for xType
        x = value, // given d in data, returns the (quantitative) x-value
        y = () => 1, // given d in data, returns the (quantitative) weight
        thresholds = 40, // approximate number of bins to generate, or threshold function
        normalize, // whether to normalize values to a total of 100%
        marginTop = 20, // top margin, in pixels
        marginRight = 30, // right margin, in pixels
        marginBottom = 30, // bottom margin, in pixels
        marginLeft = 40, // left margin, in pixels
        width = 640, // outer width of chart, in pixels
        height = 400, // outer height of chart, in pixels
        insetLeft = 0.5, // inset left edge of bar
        insetRight = 0.5, // inset right edge of bar
        xType = type, // type of x-scale
        xDomain = domain, // [xmin, xmax]
        xRange = [marginLeft, width - marginRight], // [left, right]
        xLabel = label, // a label for the x-axis
        xFormat = format, // a format specifier string for the x-axis
        yType = d3.scaleLinear, // type of y-scale
        yDomain, // [ymin, ymax]
        yRange = [height - marginBottom, marginTop], // [bottom, top]
        yLabel = "↑ Frequency", // a label for the y-axis
        yFormat = normalize ? "%" : undefined, // a format specifier string for the y-axis
        color = "currentColor" // bar fill color
      } = {}) {
        // Compute values.
        const period_left = document.getElementById("slider-1").value
        const period_right = document.getElementById("slider-2").value
        const left_time = parseInt(data.length/100* period_left)
        const right_time = parseInt(data.length/100* period_right)
        const X = d3.map(data, x).slice(left_time,right_time);
        const Y0 = d3.map(data, y).slice(left_time,right_time);
        const I = d3.range(X.length);
  
        // Compute bins.
        const bins = d3.bin().thresholds(thresholds).value(i => X[i])(I);
        const Y = Array.from(bins, I => d3.sum(I, i => Y0[i]));
        if (normalize) {
          const total = d3.sum(Y);
          for (let i = 0; i < Y.length; ++i) Y[i] /= total;
        }
  
        // Compute default domains.
        if (xDomain === undefined) xDomain = [bins[0].x0, bins[bins.length - 1].x1];
        if (yDomain === undefined) yDomain = [0, d3.max(Y)];
  
        // Construct scales and axes.
        const xScale = xType(xDomain, xRange);
        const yScale = yType(yDomain, yRange);
        const xAxis = d3.axisBottom(xScale).ticks(width / 80, xFormat).tickSizeOuter(0);
        const yAxis = d3.axisLeft(yScale).ticks(height / 40, yFormat);
        yFormat = yScale.tickFormat(100, yFormat);
  
        const svg = d3.create("svg")
          .attr("width", width)
          .attr("height", height)
          .attr("viewBox", [0, 0, width, height])
          .attr("style", "max-width: 100%; height: auto; height: intrinsic;")
          .attr('class', 'histograms');
  
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
            .text(yLabel));
  
        svg.append("g")
          .attr("fill", color)
          .selectAll("rect")
          .data(bins)
          .join("rect")
          .attr("x", d => xScale(d.x0) + insetLeft)
          .attr("width", d => Math.max(0, xScale(d.x1) - xScale(d.x0) - insetLeft - insetRight))
          .attr("y", (d, i) => yScale(Y[i]))
          .attr("height", (d, i) => yScale(0) - yScale(Y[i]))
          .append("title")
          .text((d, i) => [`${d.x0} ≤ x < ${d.x1}`, yFormat(Y[i])].join("\n"));
  
        svg.append("g")
          .attr("transform", `translate(0,${height - marginBottom})`)
          .call(xAxis)
          .call(g => g.append("text")
            .attr("x", width - marginRight)
            .attr("y", 27)
            .attr("fill", "currentColor")
            .attr("text-anchor", "end")
            .text(xLabel));
  
        return svg.node();
      }
    )
  }
  const line_chart_width = 600
  const line_chart_height = 300
  function _semi_chart(Histogram, unemployment, width) {
    return (
      Histogram(unemployment, {
        value: d => d.semi_major_axis,
        label: "Semi-major axis →",
        width:line_chart_width,
        height: line_chart_height,
        color: d3.schemeCategory10[0]
      })
    )
  }
  function _ecce_chart(Histogram, unemployment, width) {
    return (
      Histogram(unemployment, {
        value: d => d.eccentricity,
        label: "Eccentricity →",
        width:line_chart_width,
        height: line_chart_height,
        color: d3.schemeCategory10[1]
      })
    )
  }
  function _incl_chart(Histogram, unemployment, width) {
    return (
      Histogram(unemployment, {
        value: d => d.inclination,
        label: "Inclination →",
        width:line_chart_width,
        height: line_chart_height,
        color: d3.schemeCategory10[2]
      })
    )
  }
  function _RAAN_chart(Histogram, unemployment, width) {
    return (
      Histogram(unemployment, {
        value: d => d.RAAN,
        label: "RAAN →",
        width:line_chart_width,
        height: line_chart_height,
        color: d3.schemeCategory10[3]
      })
    )
  }
  function _arg_chart(Histogram, unemployment, width) {
    return (
      Histogram(unemployment, {
        value: d => d.arg_perigee,
        label: "Argument of perigee →",
        width:line_chart_width,
        height: line_chart_height,
        color: d3.schemeCategory10[4]
      })
    )
  }
  function _mean_chart(Histogram, unemployment, width) {
    return (
      Histogram(unemployment, {
        value: d => d.mean_anomaly,
        label: "Mean anomaly →",
        width:line_chart_width,
        height: line_chart_height,
        color: d3.schemeCategory10[5]
      })
    )
  }
  function _alti_chart(Histogram, unemployment, width) {
    return (
      Histogram(unemployment, {
        value: d => d.altitude,
        label: "Altitude →",
        width:line_chart_width,
        height: line_chart_height,
        color: d3.schemeCategory10[6]
      })
    )
  }
  
  export default function define1(runtime, observer) {
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
        main.variable(observer("semiaapl")).define("semiaapl", ["FileAttachment"], _unemployment);
        // main.variable(observer("semifocus")).define("semifocus", ["Generators", "semichart"], _focus);
        main.variable(observer("semiLineChart")).define("semiLineChart", ["d3"], _Histogram);
      }
      if (d3.select("#ecce").property("checked")) {
        main.variable(observer("eccechart")).define("eccechart", ["ecceLineChart", "ecceaapl", "width"], _ecce_chart);
        main.variable(observer("ecceaapl")).define("ecceaapl", ["FileAttachment"], _unemployment);
        // main.variable(observer("eccefocus")).define("eccefocus", ["Generators", "eccechart"], _focus);
        main.variable(observer("ecceLineChart")).define("ecceLineChart", ["d3"], _Histogram);
      }
      if (d3.select("#incl").property("checked")) {
        main.variable(observer("inclchart")).define("inclchart", ["inclLineChart", "inclaapl", "width"], _incl_chart);
        main.variable(observer("inclaapl")).define("inclaapl", ["FileAttachment"], _unemployment);
        // main.variable(observer("inclfocus")).define("inclfocus", ["Generators", "inclchart"], _focus);
        main.variable(observer("inclLineChart")).define("inclLineChart", ["d3"], _Histogram);
      }
      if (d3.select("#raan").property("checked")) {
        main.variable(observer("RAANchart")).define("RAANchart", ["RAANLineChart", "RAANaapl", "width"], _RAAN_chart);
        main.variable(observer("RAANaapl")).define("RAANaapl", ["FileAttachment"], _unemployment);
        // main.variable(observer("RAANfocus")).define("RAANfocus", ["Generators", "RAANchart"], _focus);
        main.variable(observer("RAANLineChart")).define("RAANLineChart", ["d3"], _Histogram);
      }
      if (d3.select("#argu").property("checked")) {
        main.variable(observer("argchart")).define("argchart", ["argLineChart", "argaapl", "width"], _arg_chart);
        main.variable(observer("argaapl")).define("argaapl", ["FileAttachment"], _unemployment);
        // main.variable(observer("argfocus")).define("argfocus", ["Generators", "argchart"], _focus);
        main.variable(observer("argLineChart")).define("argLineChart", ["d3"], _Histogram);
      }
      if (d3.select("#mean").property("checked")) {
        main.variable(observer("meanchart")).define("meanchart", ["meanLineChart", "meanaapl", "width"], _mean_chart);
        main.variable(observer("meanaapl")).define("meanaapl", ["FileAttachment"], _unemployment);
        // main.variable(observer("meanfocus")).define("meanfocus", ["Generators", "meanchart"], _focus);
        main.variable(observer("meanLineChart")).define("meanLineChart", ["d3"], _Histogram);
      }
      if (d3.select("#alti").property("checked")) {
        main.variable(observer("altichart")).define("altichart", ["altiLineChart", "altiaapl", "width"], _alti_chart);
        main.variable(observer("altiaapl")).define("altiaapl", ["FileAttachment"], _unemployment);
        // main.variable(observer("altifocus")).define("altifocus", ["Generators", "altichart"], _focus);
        main.variable(observer("altiLineChart")).define("altiLineChart", ["d3"], _Histogram);
      }
    return main;
  }
  