// Set to true if you want to save the data even if you reload the page.
window.saveDataAcrossSessions = false;


// 54d82841.json
const task_image = [[0, 5, 5, 5, 0, 0, 0, 0, 0, 0, 0], [0, 5, 0, 5, 0, 8, 8, 8, 0, 0, 0], [0, 0, 0, 0, 0, 8, 0, 8, 3, 3, 3], [0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 3], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 4, 0, 0, 0, 4, 0, 0, 4, 0]];

const color_palette = [
  "#000000", // 0 = black
  "#0074d9", // 1 = blue
  "#ff4136", // 2 = red
  "#2ecc40", // 3 = green
  "#ffdc00", // 4 = yellow
  "#aaaaaa", // 5 = gray
  "#f012be", // 6 = fuchsia
  "#ff851b", // 7 = orange
  "#7fdbff", // 8 = teal
  "#870c25", // 9 = brown
  "#282828", // 10 = dark gray
  "#ffffff", // 11 = white
];

const gridSize = 25;
const offsetx = 480;
const offsety = 100;

const collisionSVG = "collisionSVG";
var force = [];
var nodes = [];
const showCollisions = false;

var paintColor = 0;
var isPainting = false;

window.onload = async function() {

    if (!window.saveDataAcrossSessions) {
        var localstorageDataLabel = 'webgazerGlobalData';
        localforage.setItem(localstorageDataLabel, null);
        var localstorageSettingsLabel = 'webgazerGlobalSettings';
        localforage.setItem(localstorageSettingsLabel, null);
    }
    const webgazerInstance = await webgazer.setRegression('ridge') /* currently must set regression and tracker */
      .setTracker('TFFacemesh')
      .begin();
    webgazerInstance.showVideoPreview(true) /* shows all video previews */
      .showPredictionPoints(false) /* shows a square every 100 milliseconds where current prediction is */
      .applyKalmanFilter(true); // Kalman Filter defaults to on.
      // Add the SVG component on the top of everything.
    setupCollisionSystem();
    webgazer.setGazeListener( collisionEyeListener );

    // Listen for the keydown event
    window.addEventListener('keydown', function(event) {
      if (event.code === 'Space') {
        isPainting = true;
      }
    });
    
    // Listen for the keyup event
    window.addEventListener('keyup', function(event) {
      if (event.code === 'Space') {
        isPainting = false;
      }
      if (event.code === 'KeyM') {
        paintColor = (paintColor + 1) % 10;
      }
      if (event.code === 'KeyN') {
        paintColor = (paintColor + 9) % 10;
      }
      // console.log(event.code);
    });
};

  window.onbeforeunload = function() {
    if (window.saveDataAcrossSessions) {
        webgazer.end();
    } else {
        localforage.clear();
    }
  }

  function setupCollisionSystem() {
    var width = window.innerWidth;
    var height = window.innerHeight;

    var numberOfNodes = 200;

    if(showCollisions) {
      nodes = d3.range(numberOfNodes).map(function() { return {radius: Math.random() * 12 + 4}; }),
      nodes[0].radius = 0;
      nodes[0].fixed = true;
  
      force = d3.layout.force()
      .gravity(0.05)
      .charge(function(d, i) { return i ? 0 : -2000; })
      .nodes(nodes)
      .size([width, height])
      .start();
    }

    var svg = d3.select("body").append("svg")
    .attr("id", collisionSVG)
    .attr("width", width)
    .attr("height", height)
    .style("top", "0px")
    .style("left","0px")
    .style("margin","0px")
    .style("position","absolute")
    .style("z-index", 100000);

    // svg.append("image")
    // .attr("xlink:href", "arc1.jpg")
    // .attr("width", 1280)
    // .attr("height", 1278)
    // .attr("x", 320)
    // .attr("y", 0) 
    // .style("z-index", 90000)
    // .attr("pointer-events", "none");  // Disabling drag-and-drop

    var cellCount = 100;
    for(var y=0; y<cellCount; y++) {
      for(var x=0; x<cellCount; x++) {
        var fill = "none";
        if(x < 30 && y < 30) {
          fill = "#cccccc";
        }

        var row = task_image[y];
        if (row !== undefined && row !== null) {
          var value = row[x];
          if (value !== null && value !== undefined) {
            fill = color_palette[value];    
          }
        }

        svg.append("rect")
        .attr("id", `cell${x}_${y}`)
        .attr("width", gridSize - 0.5)
        .attr("height", gridSize - 0.5)
        .attr("x", gridSize * x + offsetx)
        .attr("y", gridSize * y + offsety)
        .attr("fill", fill)
        .style("z-index", 90050);
      }
    }

    for(var color=0; color<10; color++) {
      var fill = color_palette[color];
      svg.append("rect")
      .attr("id", `inactiveColor${color}`)
      .attr("width", gridSize * 2)
      .attr("height", gridSize * 1)
      .attr("x", gridSize * color * 3 + offsetx + Math.floor(gridSize / 2))
      .attr("y", height - gridSize * 1)
      .attr("fill", fill)
      .attr("visibility", "hidden")
      .style("z-index", 90025);
    }

    for(var color=0; color<10; color++) {
      var fill = color_palette[color];
      svg.append("rect")
      .attr("id", `activeColor${color}`)
      .attr("width", gridSize * 2)
      .attr("height", gridSize * 3)
      .attr("x", gridSize * color * 3 + offsetx + Math.floor(gridSize / 2))
      .attr("y", height - gridSize * 3)
      .attr("fill", fill)
      .style("z-index", 90035);
    }

    for(var y=0; y<cellCount; y++) {
      for(var x=0; x<cellCount; x++) {
        var fill = "black";
        if ((x + y) % 2 == 0) {
          continue;
          fill = "grey";
        }
        svg.append("rect")
        .attr("id", `marker${x}_${y}`)
        .attr("width", 2)
        .attr("height", 2)
        .attr("x", gridSize * x + gridSize/2 - 1)
        .attr("y", gridSize * y + gridSize/2 - 1)
        .attr("fill", fill)
        .style("z-index", 90050);
      }
    }

    if(showCollisions) {
      var color = d3.scale.category10();
      var colors = [];
      for(var i=0; i<numberOfNodes-2; i++){
        //colors[i] = color(i%3);
        colors[i] = color(0);
      }
      colors.push("orange");

      svg.selectAll("circle")
      .data(nodes.slice(1))
      .enter().append("circle")
      .attr("r", function(d) { return d.radius; })
      .style("fill", function(d, i) { return colors[i]; });


      force.on("tick", function(e) {
        var q = d3.geom.quadtree(nodes),
        i = 0,
        n = nodes.length;

        while (++i < n) q.visit(collide(nodes[i]));

        svg.selectAll("circle")
        .attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; });
      });
    }

    svg.append("line")
    .attr("id", "eyeline1" )
    .attr("stroke-width",2)
    .attr("stroke","red");

    svg.append("line")
    .attr("id", "eyeline2" )
    .attr("stroke-width",2)
    .attr("stroke","red");

    svg.append("rect")
    .attr("id","predictionSquare")
    .attr("width",10)
    .attr("height",10)
    .attr("fill","green");

    // svg.append("rect")
    // .attr("id","drawMe")
    // .attr("width",45)
    // .attr("height",45)
    // .attr("x",565)
    // .attr("y",565)
    // .attr("fill","red")
    // .style("z-index", 90050);

    svg.append("rect")
    .attr("id","predictionCenter")
    .attr("width",10)
    .attr("height",10)
    .attr("fill","gray");

    var size0 = 5;
    var size1 = 5;

    svg.append("rect")
    .attr("id","predictionTop")
    .attr("width",size0)
    .attr("height",size0)
    .attr("fill","gray");

    svg.append("rect")
    .attr("id","predictionDown")
    .attr("width",size0)
    .attr("height",size0)
    .attr("fill","gray");

    svg.append("rect")
    .attr("id","predictionLeft")
    .attr("width",size0)
    .attr("height",size0)
    .attr("fill","gray");

    svg.append("rect")
    .attr("id","predictionRight")
    .attr("width",size0)
    .attr("height",size0)
    .attr("fill","gray");

    svg.append("rect")
    .attr("id","predictionTopLeft")
    .attr("width",size1)
    .attr("height",size1)
    .attr("fill","gray");

    svg.append("rect")
    .attr("id","predictionTopRight")
    .attr("width",size1)
    .attr("height",size1)
    .attr("fill","gray");

    svg.append("rect")
    .attr("id","predictionDownLeft")
    .attr("width",size1)
    .attr("height",size1)
    .attr("fill","gray");

    svg.append("rect")
    .attr("id","predictionDownRight")
    .attr("width",size1)
    .attr("height",size1)
    .attr("fill","gray");


    if(showCollisions) {
        svg.on("mousemove", function() {
        var p1 = d3.mouse(this);
        nodes[0].px = p1[0];
        nodes[0].py = p1[1];
        force.resume();
      });
    }

    function collide(node) {
      var r = node.radius + 16,
      nx1 = node.x - r,
      nx2 = node.x + r,
      ny1 = node.y - r,
      ny2 = node.y + r;
      return function(quad, x1, y1, x2, y2) {
        if (quad.point && (quad.point !== node)) {
          var x = node.x - quad.point.x,
          y = node.y - quad.point.y,
          l = Math.sqrt(x * x + y * y),
          r = node.radius + quad.point.radius;
          if (l < r) {
            l = (l - r) / l * .5;
            node.x -= x *= l;
            node.y -= y *= l;
            quad.point.x += x;
            quad.point.y += y;
          }
        }
        return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
      };
    }
  }

  var webgazerCanvas = null;

  var previewWidth = webgazer.params.videoViewerWidth;

  var previous_x = 0;
  var previous_y = 0;

  var collisionEyeListener = async function(data, clock) {
    if(!data)
      return;

    if(showCollisions) {
      nodes[0].px = data.x;
      nodes[0].py = data.y;
      force.resume();
    }

    if (!webgazerCanvas) {
      webgazerCanvas = webgazer.getVideoElementCanvas();
    }

    var cellx = Math.floor((data.x-offsetx)/gridSize + 0.5);
    var celly = Math.floor((data.y-offsety)/gridSize + 0.5);
    var alignedx = Math.floor(data.x/gridSize + 0.5);
    var alignedy = Math.floor(data.y/gridSize + 0.5);

    if(isPainting && cellx >= 0 && cellx < 30 && celly >= 0 && celly < 30) {
      var id = `#cell${cellx}_${celly}`;
      var area = d3.select(id);
      if(area) {
        fill = color_palette[paintColor];
        area.attr("fill", fill);
      }
      // if(clear_x == cellx && clear_y == celly) {
      //   should_clear = false;
      // }
      // previous_x = cellx;
      // previous_y = celly;
    }

    // var clear_x = previous_x;
    // var clear_y = previous_y;
    // var should_clear = true;
    // {
    //   var id = `#cell${cellx}_${celly}`;
    //   var area = d3.select(id);
    //   if(area) {
    //     area.attr("fill","gray");
    //   }
    //   if(clear_x == cellx && clear_y == celly) {
    //     should_clear = false;
    //   }
    //   previous_x = cellx;
    //   previous_y = celly;
    // }
    // if(should_clear) {
    //   var x = clear_x;
    //   var y = clear_y;
    //   var id = `#cell${x}_${y}`;
    //   var area = d3.select(id);
    //   if(area) {
    //     area.attr("fill","none");
    //   }
    // }

    let offset = Math.floor((gridSize - 5) / 2);
    let distance = 2 * gridSize;
    // let distanceDiagonal = gridSize + Math.floor(gridSize / 2);
    let distanceDiagonal = 2 * gridSize;
    {
      var area = d3.select("#predictionCenter");
      area.attr("x",alignedx * gridSize + offset);
      area.attr("y",alignedy * gridSize + offset);
    }
    {
      var area = d3.select("#predictionTop");
      area.attr("x",alignedx * gridSize + offset);
      area.attr("y",alignedy * gridSize + offset - distance);
    }
    {
      var area = d3.select("#predictionDown");
      area.attr("x",alignedx * gridSize + offset);
      area.attr("y",alignedy * gridSize + offset + distance);
    }
    {
      var area = d3.select("#predictionLeft");
      area.attr("x",alignedx * gridSize + offset - distance);
      area.attr("y",alignedy * gridSize + offset);
    }
    {
      var area = d3.select("#predictionRight");
      area.attr("x",alignedx * gridSize + offset + distance);
      area.attr("y",alignedy * gridSize + offset);
    }

    {
      var area = d3.select("#predictionTopLeft");
      area.attr("x",alignedx * gridSize + offset - distanceDiagonal);
      area.attr("y",alignedy * gridSize + offset - distanceDiagonal);
    }
    {
      var area = d3.select("#predictionTopRight");
      area.attr("x",alignedx * gridSize + offset + distanceDiagonal);
      area.attr("y",alignedy * gridSize + offset - distanceDiagonal);
    }
    {
      var area = d3.select("#predictionDownLeft");
      area.attr("x",alignedx * gridSize + offset - distanceDiagonal);
      area.attr("y",alignedy * gridSize + offset + distanceDiagonal);
    }
    {
      var area = d3.select("#predictionDownRight");
      area.attr("x",alignedx * gridSize + offset + distanceDiagonal);
      area.attr("y",alignedy * gridSize + offset + distanceDiagonal);
    }

    if (false) {
      var area = d3.select("#drawMe");
      var x1 = area.attr("x");
      var y1 = area.attr("y");
      var x2 = area.attr("x") + area.attr("width");
      var y2 = area.attr("y") + area.attr("height");
  
      if(data.x >= x1 && data.x <= x2 && data.y >= y1 && data.y <= y2) {
        area.attr("fill","green");
      } else {
        area.attr("fill","red");
      }
    }

    for(var color=0; color<10; color++) {
      let id = `#inactiveColor${color}`;
      let visibility = "hidden";
      if(color != paintColor) {
        visibility = "visible";
      }
      var area = d3.select(id);
      area.attr("visibility", visibility);
    }

    for(var color=0; color<10; color++) {
      let id = `#activeColor${color}`;
      let visibility = "hidden";
      if(color == paintColor) {
        visibility = "visible";
      }
      var area = d3.select(id);
      area.attr("visibility", visibility);
    }

    var fmPositions = await webgazer.getTracker().getPositions();

    var whr = webgazer.getVideoPreviewToCameraResolutionRatio();

    if (true) {
      var line = d3.select('#eyeline1')
              .attr("x1",data.x)
              .attr("y1",data.y)
              .attr("x2",previewWidth - fmPositions[145][0] * whr[0])
              .attr("y2",fmPositions[145][1] * whr[1]);

      var line = d3.select("#eyeline2")
              .attr("x1",data.x)
              .attr("y1",data.y)
              .attr("x2",previewWidth - fmPositions[374][0] * whr[0])
              .attr("y2",fmPositions[374][1] * whr[1]);

      var dot = d3.select("#predictionSquare")
              .attr("x",data.x)
              .attr("y",data.y);

    }
}