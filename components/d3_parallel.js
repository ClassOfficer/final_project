function _data(FileAttachment){return(
    FileAttachment(d3.select("input[type=radio][name=x-encoding]:checked").property("value")+".csv").csv({ typed: true })
)}

function _legend(Legend,z){
  return(Legend({color: z, title: ['semi_major_axis', 'eccentricity', 'inclination', 'RAAN', 'arg_perigee', 'mean_anomaly', 'altitude']})
)}

function _selection(d3,width,height,margin,brushHeight,data,z,line,keys,label,y,x,deselectedColor)
{
  const keyz = d3.select("input[type=radio][name=y-encoding]:checked").property("value")
  const svg = d3.create("svg")
      .attr("viewBox", [0, 0, width, height])
      .attr('class', 'paralle');

  const brush = d3.brushX()
      .extent([
        [margin.left, -(brushHeight / 2)],
        [width - margin.right, brushHeight / 2]
      ])
      .on("start brush end", brushed);

  const path = svg.append("g")
      .attr("fill", "none")
      .attr("stroke-width", 1.5)
      .attr("stroke-opacity", 0.4)
    .selectAll("path")
    .data(data.slice().sort((a, b) => d3.ascending(a[keyz], b[keyz])))
    .join("path")
      .attr("stroke", d => z(d[keyz]))
      .attr("d", d => line(d3.cross(keys, [d], (key, d) => [key, d[key]])));

  path.append("title")
      .text(label);

  svg.append("g")
    .selectAll("g")
    .data(keys)
    .join("g")
      .attr("transform", d => `translate(0,${y(d)})`)
      .each(function(d) { d3.select(this).call(d3.axisBottom(x.get(d))); })
      .call(g => g.append("text")
        .attr("x", margin.left)
        .attr("y", -6)
        .attr("text-anchor", "start")
        .attr("fill", "currentColor")
        .text(d => d))
        .attr("style", "font-size:15px;")
      .call(g => g.selectAll("text")
        .clone(true).lower()
        .attr("fill", "none")
        .attr("stroke-width", 5)
        .attr("stroke-linejoin", "round")
        .attr("stroke", "white"))
      .call(brush);

  const selections = new Map();

  function brushed({selection}, key) {
    if (selection === null) selections.delete(key);
    else selections.set(key, selection.map(x.get(key).invert));
    const selected = [];
    path.each(function(d) {
      const active = Array.from(selections).every(([key, [min, max]]) => d[key] >= min && d[key] <= max);
      d3.select(this).style("stroke", active ? z(d[keyz]) : deselectedColor);
      if (active) {
        d3.select(this).raise();
        selected.push(d);
      }
    });
    svg.property("value", selected).dispatch("input");
  }

  return svg.property("value", data).node();
}


function _keys(data){return(
data.columns.slice(1)
)}

function _x(keys,d3,data,margin,width){
    const b = [margin.left, width - margin.right]
    return (new Map(Array.from(keys, key => [key, d3.scaleLinear(d3.extent(data, d => d[key]), b)])))
}

function _y(d3,keys,margin,height){return(
d3.scalePoint(keys, [margin.top, height - margin.bottom])
)}

function _z(d3,x,colors){return(
d3.scaleSequential(x.get(d3.select("input[type=radio][name=y-encoding]:checked").property("value")).domain().reverse(), colors)
)}

function _line(d3,x,y){return(
d3.line()
    .defined(([, value]) => value != null)
    .x(([key, value]) => x.get(key)(value))
    .y(([key]) => y(key))
)}

function _label(){return(
d => d.name
)}

function _colors(d3){return(
d3.interpolateBrBG
)}

function _deselectedColor(){return(
"#ddd"
)}

function _brushHeight(){return(
50
)}

function _margin(){return(
{top: 30, right: 10, bottom: 30, left: 10}
)}

function _height(keys){return(
keys.length * 150
)}

export default function define3(runtime, observer) {
  const main = runtime.module();
  function toString() { return this.url; }
  const fileAttachments = new Map([
    // ["k3.csv", { url: new URL("https://raw.githubusercontent.com/ClassOfficer/infovis/main/k3_parallel.csv", import.meta.url), mimeType: "text/csv", toString }],
    // ["k3a.csv", { url: new URL("https://raw.githubusercontent.com/ClassOfficer/infovis/main/k3a_parallel.csv", import.meta.url), mimeType: "text/csv", toString }],
    // ["k5.csv", { url: new URL("https://raw.githubusercontent.com/ClassOfficer/infovis/main/k5_parallel.csv", import.meta.url), mimeType: "text/csv", toString }]
    ["k3.csv", { url: new URL("../data/k3_parallel.csv", import.meta.url), mimeType: "text/csv", toString }],
    ["k3a.csv", { url: new URL("../data/k3a_parallel.csv", import.meta.url), mimeType: "text/csv", toString }],
    ["k5.csv", { url: new URL("../data/k5_parallel.csv", import.meta.url), mimeType: "text/csv", toString }]
  ]);
  main.builtin("FileAttachment", runtime.fileAttachments(name => fileAttachments.get(name)));
  main.variable(observer("viewof selection")).define("viewof selection", ["d3","width","height","margin","brushHeight","data","z","line","keys","label","y","x","deselectedColor"], _selection);
  main.variable(observer("selection")).define("selection", ["Generators", "viewof selection"], (G, _) => G.input(_));
  main.variable(observer("data")).define("data", ["FileAttachment"], _data);
  main.variable(observer("keys")).define("keys", ["data"], _keys);
  main.variable(observer("x")).define("x", ["keys","d3","data","margin","width"], _x);
  main.variable(observer("y")).define("y", ["d3","keys","margin","height"], _y);
  main.variable(observer("z")).define("z", ["d3","x","colors"], _z);
  main.variable(observer("line")).define("line", ["d3","x","y"], _line);
  main.variable(observer("label")).define("label", _label);
  main.variable(observer("colors")).define("colors", ["d3"], _colors);
  main.variable(observer("deselectedColor")).define("deselectedColor", _deselectedColor);
  main.variable(observer("brushHeight")).define("brushHeight", _brushHeight);
  main.variable(observer("margin")).define("margin", _margin);
  main.variable(observer("height")).define("height", ["keys"], _height);
  return main;
}
