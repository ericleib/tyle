


registerView({
  name : "drawing",
  dependencies : {
    javascript: ["views/drawing2D/d3.min.js"],
    css: [],
  },
  render : function(scope, element, data){

    var svg = d3.select($(element)[0])
      .append("svg")
      .attr("width", "100%")
      .attr("height", "100%")
      .call(d3.behavior.zoom().on("zoom", function () {
        svg.attr("transform", "translate(" + d3.event.translate + ")" + " scale(" + d3.event.scale + ")");
      }).translate([20,20]).scale(17))
      .append("g")
      .attr("transform", "translate(" + 20 + "," + 20 + ")"+" scale(" + 17 + ")");

    data.shapes.forEach(function(shape){
      shape.trapezoid.forEach(function(t){
        var xIn = t.node.get("x-in").value;
        var xOut = t.node.get("x-out").value;
        var yIn = t.node.get("y-in").value;
        var yOut = t.node.get("y-out").value;
        var cIn = t.node.get("chord-in").value;
        var cOut = t.node.get("chord-out").value;
        drawTrapezoid(svg, xIn, xOut, yIn, yOut, cIn, cOut);
      });
    });


    function drawTrapezoid(svg, xIn, xOut, yIn, yOut, cIn, cOut){
      svg.append("polygon")
      .attr("points", [xIn+','+yIn,  (xIn+cIn)+','+yIn,  (xOut+cOut)+','+yOut,  xOut+','+yOut].join(" "))
      .attr("fill","#EFF")
      .attr("shape-rendering", "crispEdges")
      .attr("vector-effect", "non-scaling-stroke");
      drawLine(svg,  xIn,yIn,  (xIn+cIn),yIn);
      drawLine(svg,  (xIn+cIn),yIn,  (xOut+cOut),yOut);
      drawLine(svg,  (xOut+cOut),yOut,  xOut,yOut);
      drawLine(svg,  xOut,yOut,  xIn,yIn);
    }

    function drawLine(svg, x1, y1, x2, y2){
      svg.append("line")
      .attr("x1", x1)
      .attr("y1", y1)
      .attr("x2", x2)
      .attr("y2", y2)
      .attr("stroke", "#AAA")
      .attr("shape-rendering", "crispEdges")
      .attr("vector-effect", "non-scaling-stroke");
    }

  }

});
