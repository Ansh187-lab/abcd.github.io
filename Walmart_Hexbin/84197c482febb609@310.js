import define1 from "./a33468b95d0b15b0@817.js";

function _1(md) {
  return md`
<div class="center-align">
  <h1>Geographical Distribution of Walmart Stores:</h1>
  <p>
    This map shows approximately 3,100 locations of Walmart stores. The hexbin map complements the growth animation by showing the spatial distribution and age of Walmart stores. The concentration of stores in certain areas and the color-coded age information provide insights into Walmart’s strategic expansion patterns and market saturation over time. The hexagon area represents the number of stores in the vicinity, while the color represents the median age of these stores. Older stores are red, and newer stores are blue.
  </p>
  <p>
    <a href="http://users.econ.umn.edu/~holmes/data/WalMart/index.html" target="_blank">This dataset</a> from 2006 includes about 3,100 Walmart locations in the contiguous United States.
  </p>
</div>
  `;
}


function _chart(d3,walmarts,legend,stateMesh)
{

  // Specify the map’s dimensions and projection.
  const width = 928;
  const height = 581;
  const projection = d3.geoAlbersUsa().scale(4 / 3 * width).translate([width / 2, height / 2]);

    
  // Create the container SVG.
  const svg = d3.create("svg")
      .attr("viewBox", [-150,0, 1100, height])
      .attr("width", width)
      .attr("height", height)
      .attr("style", "max-width: 100%; height: auto;");

  // Create the bins.
  const hexbin = d3.hexbin()
      .extent([[0, 0], [width, height]])
      .radius(10)
      .x(d => d.xy[0])
      .y(d => d.xy[1]);

  const bins = hexbin(walmarts.map(d => ({xy: projection([d.longitude, d.latitude]), date: d.date})))
     .map(d => (d.date = new Date(d3.median(d, d => d.date)), d))
     .sort((a, b) => b.length - a.length)

  // Create the color and radius scales.
  const color = d3.scaleSequential(d3.extent(bins, d => d.date), d3.interpolateSpectral);
  const radius = d3.scaleSqrt([0, d3.max(bins, d => d.length)], [0, hexbin.radius() * Math.SQRT2]);

  // Append the color legend.
  svg.append("g")
      .attr("transform", "translate(580,20)")
      .append(() => legend({
        color, 
        title: "Median opening year", 
        width: 260, 
        tickValues: d3.utcYear.every(5).range(...color.domain()),
        tickFormat: d3.utcFormat("%Y")
      }));

  // Append the state mesh.
  svg.append("path")
      .datum(stateMesh)
      .attr("fill", "none")
      .attr("stroke", "#777")
      .attr("stroke-width", 0.5)
      .attr("stroke-linejoin", "round")
      .attr("d", d3.geoPath(projection));

  // Append the hexagons.
  svg.append("g")
    .selectAll("path")
    .data(bins)
    .join("path")
      .attr("transform", d => `translate(${d.x},${d.y})`)
      .attr("d", d => hexbin.hexagon(radius(d.length)))
      .attr("fill", d => color(d.date))
      .attr("stroke", d => d3.lab(color(d.date)).darker())
    .append("title")
      .text(d => `${d.length.toLocaleString()} stores\n${d.date.getFullYear()} median opening`);

  return svg.node();
}



async function _walmarts(d3, FileAttachment) {
  const parseDate = d3.utcParse("%m/%d/%Y");
  const data = await FileAttachment("walmart.tsv").tsv();
  return data.map(d => ({
    longitude: +d[0],
    latitude: +d[1],
    date: parseDate(d.date)
  }));
}


async function _stateMesh(FileAttachment, topojson) {
  const us = await FileAttachment("us-counties-10m.json").json();
  return topojson.mesh(us, us.objects.states);
}

function _d3(require){
  return require("d3@7", "d3-hexbin@0.2")
}

export default function define(runtime, observer) {
  const main = runtime.module();
  const fileAttachments = new Map([
    ["us-counties-10m.json", { url: new URL("./files/ff73290f3fccc5db55f09031bb845e639a07e444ca9fbcf83f2dbb4600a38bf4baccb2a85df3c24dba57a4ed64c230dcf1a87604453969495db835c5f3cbebf2.json", import.meta.url), mimeType: "application/json" }],
    ["walmart.tsv", { url: new URL("./files/584765eba3dde077d5e14795a23179b06f32e3d8acdb624972812fffb82c232b3222dd85724740394d9f76a73b4fc340ccc4db8015b7995b7562e5d2fa9577ca.tsv", import.meta.url), mimeType: "text/tab-separated-values" }]
  ]);
  main.builtin("FileAttachment", runtime.fileAttachments(name => fileAttachments.get(name)));
  main.variable(observer()).define(["md"], _1);
  main.variable(observer("chart")).define("chart", ["d3", "walmarts", "legend", "stateMesh"], _chart);
  main.define("walmarts", ["d3", "FileAttachment"], _walmarts);
  main.define("stateMesh", ["FileAttachment", "topojson"], _stateMesh);
  main.define("d3", ["require"], _d3);
  const child1 = runtime.module(define1);
  main.import("legend", child1);
  return main;
}
