function _1(basis, aapl, md) {
  return md`
<div class="center-align">
  <h1>Relative price change </h1>
  <p>
    The variant of a line chart shows the change in price of Apple stock relative to ${basis.toFixed(2) === aapl[0].Close.toFixed(2) ? `its ${aapl[0].Date.toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })}` : "the"} price of $${basis.toFixed(2)}. The relative price change chart further emphasizes Apple's impressive performance, especially from its reference price in May 2013.
  </p>
  <p>
    Data: <a href="https://finance.yahoo.com/lookup" target="_blank">Yahoo Finance</a>
  </p>
</div>
  `;
}


function _basis(Inputs,d3,aapl){return(
Inputs.range(d3.extent(aapl, d => d.Close), {label: "Basis", value: aapl[0].Close, step: 0.01, format: x => x.toFixed(2)})
)}

function _chart(d3,aapl,basis)
{

  // Specify the dimensions of the chart.
  const width = 928;
  const height = 600;
  const marginTop = 20;
  const marginRight = 30;
  const marginBottom = 30;
  const marginLeft = 50;

  // Specify the horizontal (time) axis.
  const x = d3.scaleUtc()
      .domain(d3.extent(aapl, d => d.Date))
      .range([marginLeft, width - marginRight])

  // Specify the vertical axis.
  const y = d3.scaleLog()
      .domain([d3.min(aapl, d => d.Close / basis * 0.9), d3.max(aapl, d => d.Close / basis / 0.9)])
      .rangeRound([height - marginBottom, marginTop])

  // A format function that transforms 1.2 into "+20%", etc.
  const f = d3.format("+.0%");
  const format = x => x === 1 ? "0%" : f(x - 1);

  // Create the SVG container.
  const svg = d3.create("svg").attr("viewBox", [0, 0, width, height]);

  // Create the horizontal (date) axis.
  svg.append("g")
      .attr("transform", `translate(0,${y(1)})`)
      .call(d3.axisBottom(x).ticks(width / 80).tickSizeOuter(0))
      .call(g => g.select(".domain").remove());

  // Create the vertical axis, with grid lines.
  svg.append("g")
      .attr("transform", `translate(${marginLeft},0)`)
      .call(d3.axisLeft(y)
          .tickValues(d3.ticks(...y.domain(), 10))
          .tickFormat(format))
      .call(g => g.selectAll(".tick line").clone()
          .attr("stroke-opacity", d => d === 1 ? null : 0.2)
          .attr("x2", width - marginLeft - marginRight))
      .call(g => g.select(".domain").remove());

  // Create a line path that normalizes the value with respect to the base.
  const line = d3.line()
      .x(d => x(d.Date))
      .y(d => y(d.Close / basis));

  svg.append("path")
      .datum(aapl)
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 1.5)
      .attr("stroke-linejoin", "round")
      .attr("stroke-linecap", "round")
      .attr("d", line);
  
  return svg.node();
}

function _5(Plot,aapl,basis){return(
Plot.plot({
  marginLeft: 45,
  y: {type: "log", tickFormat: d => `${d > 1 ? "+" : ""}${Math.round(100 * (d - 1))}%`, grid: true, ticks: 12},
  marks: [
    Plot.ruleY([1]),
    Plot.line(aapl, Plot.normalizeY(() => basis, {x: "Date", y: "Close", stroke: "steelblue"}))
  ]
})
)}

export default function define(runtime, observer) {
  const main = runtime.module();
  main.variable(observer()).define(["basis","aapl","md"], _1);
  main.variable(observer("viewof basis")).define("viewof basis", ["Inputs","d3","aapl"], _basis);
  main.variable(observer("basis")).define("basis", ["Generators", "viewof basis"], (G, _) => G.input(_));
  main.variable(observer("chart")).define("chart", ["d3","aapl","basis"], _chart);
  main.variable(observer()).define(["md"], _4);
  main.variable(observer()).define(["Plot","aapl","basis"], _5);
  return main;
}
