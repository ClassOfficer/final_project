function _population(FileAttachment) {
    return (
        FileAttachment(d3.select("input[type=radio][name=x-encoding]:checked").property("value")+".csv").csv({ typed: true })
    )
  }
  
  function _PieChart(d3) {
    return (
      function PieChart(data, {
        name = ([x]) => x,  // given d in data, returns the (ordinal) label
        value = ([, y]) => y, // given d in data, returns the (quantitative) value
        title, // given d in data, returns the title text
        width = 640, // outer width, in pixels
        height = 400, // outer height, in pixels
        innerRadius = 0, // inner radius of pie, in pixels (non-zero for donut)
        outerRadius = Math.min(width, height) / 2, // outer radius of pie, in pixels
        labelRadius = (innerRadius * 0.2 + outerRadius * 0.8), // center radius of labels
        format = ",", // a format specifier for values (in the label)
        names, // array of names (the domain of the color scale)
        colors, // array of colors for names
        stroke = innerRadius > 0 ? "none" : "white", // stroke separating widths
        strokeWidth = 1, // width of stroke separating wedges
        strokeLinejoin = "round", // line join of stroke separating wedges
        padAngle = stroke === "none" ? 1 / outerRadius : 0, // angular separation between wedges
      } = {}) {
        const N = d3.map(data, name);
        const V = d3.map(data, value);
        const I = d3.range(N.length).filter(i => !isNaN(V[i]));
  
        if (names === undefined) names = N;
        names = new d3.InternSet(names);
  
        if (colors === undefined) colors = d3.schemeSpectral[names.size];
        if (colors === undefined) colors = d3.quantize(t => d3.interpolateSpectral(t * 0.8 + 0.1), names.size);
  
        const color = d3.scaleOrdinal(names, colors);
  
        if (title === undefined) {
          const formatValue = d3.format(format);
          title = i => `${N[i]}\n${formatValue(V[i])}`;
        } else {
          const O = d3.map(data, d => d);
          const T = title;
          title = i => T(O[i], i, data);
        }
  
        const arcs = d3.pie().padAngle(padAngle).sort(null).value(i => V[i])(I);
        const arc = d3.arc().innerRadius(innerRadius).outerRadius(outerRadius);
        const arcLabel = d3.arc().innerRadius(labelRadius).outerRadius(labelRadius);
  
        const svg = d3.create("svg")
          .attr("width", width)
          .attr("height", height)
          .attr("viewBox", [-width / 2, -height / 2, width, height])
          .attr("style", "max-width: 100%; height: 400px; height: intrinsic; padding: 20px 0px 20px 0px; background: #ffffff; border-width: 2px; border-style: solid;");
          
        svg.append("text")
          .attr("x", -720) // 텍스트의 x 좌표
          .attr("y", -180) // 텍스트의 y 좌표
          .text("Number of maneuver") // 텍스트 내용
          .attr("style", "font-size:45px;");

        svg.append("text")
          .attr("x", 270) // 텍스트의 x 좌표
          .attr("y", -180) // 텍스트의 y 좌표
          .text("2016.01.01 - 2020.12.30") // 텍스트 내용
          .attr("style", "font-size:45px;");

  
        svg.append("g")
          .attr("stroke", stroke)
          .attr("stroke-width", strokeWidth)
          .attr("stroke-linejoin", strokeLinejoin)
          .selectAll("path")
          .data(arcs)
          .join("path")
          .attr("fill", d => color(N[d.data]))
          .attr("d", arc)
          .append("title")
          .text(d => title(d.data));
  
        svg.append("g")
          .attr("font-family", "sans-serif")
          .attr("font-size", 30)
          .attr("text-anchor", "middle")
          .selectAll("text")
          .data(arcs)
          .join("text")
          .attr("transform", d => `translate(${arcLabel.centroid(d)})`)
          .selectAll("tspan")
          .data(d => {
            const lines = `${title(d.data)}`.split(/\n/);
            return (d.endAngle - d.startAngle) > 0.25 ? lines : lines.slice(0, 1);
          })
          .join("tspan")
          .attr("x", 0)
          .attr("y", (_, i) => `${i * 1.1}em`)
          .attr("font-weight", (_, i) => i ? null : "bold")
          .text(d => d);
  
        return Object.assign(svg.node(), { scales: { color } });
      }
    )
  }
  
  function _chart(PieChart, population, width) {
    return (
      PieChart(population, {
        name: d => d.year,
        value: d => d.maneuver,
        width,
        height: 500
      })
    )
  }
  
  export default function define2(runtime, observer) {
    const main = runtime.module();
    function toString() { return this.url; }
    const fileAttachments = new Map([
        // ["k3.csv", { url: new URL("https://raw.githubusercontent.com/ClassOfficer/infovis/main/k3_maneuver.csv", import.meta.url), mimeType: "text/csv", toString }],
        // ["k3a.csv", { url: new URL("https://raw.githubusercontent.com/ClassOfficer/infovis/main/k3a_maneuver.csv", import.meta.url), mimeType: "text/csv", toString }],
        // ["k5.csv", { url: new URL("https://raw.githubusercontent.com/ClassOfficer/infovis/main/k5_maneuver.csv", import.meta.url), mimeType: "text/csv", toString }]
        ["k3.csv", { url: new URL("../data/k3_maneuver.csv", import.meta.url), mimeType: "text/csv", toString }],
        ["k3a.csv", { url: new URL("../data/k3a_maneuver.csv", import.meta.url), mimeType: "text/csv", toString }],
        ["k5.csv", { url: new URL("../data/k5_maneuver.csv", import.meta.url), mimeType: "text/csv", toString }]
    ]);
    main.builtin("FileAttachment", runtime.fileAttachments(name => fileAttachments.get(name)));
    main.variable(observer("chart")).define("chart", ["PieChart", "population", "width"], _chart);
    main.variable(observer("population")).define("population", ["FileAttachment"], _population);
    main.variable(observer("PieChart")).define("PieChart", ["d3"], _PieChart);
    return main;
  }
  