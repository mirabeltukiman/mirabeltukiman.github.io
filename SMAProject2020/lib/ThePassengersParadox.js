var WINDOWBORDERSIZE = 10;
var HUGE = 999999; // Sometimes useful when testing for big or small numbers
var animationDelay = 500; // Controls simulation and transition speed
var isRunning = false; // Used in simStep and toggleSimStep
var surface; // Set in the redrawWindow function. It is the D3 selection of the svg drawing.
var simTimer; // Set in the initialization function

// The drawing surface will be devided into logical cells
var maxCols = 40;
var cellWidth; // cellWidth is calculated in the redrawWindow function
var cellHeight; // cellHeight is calculated in the redrawWindow function

// Images
const urlPlaneAfricas = "images/Africas.png";
const urlPlaneAPAC = "images/APAC.png";
const urlPlaneAmericas = "images/Americas.png";
const urlPlaneEurope = "images/Europe.png";
const urlAfricas = "images/Africas Continent.png";
const urlAmericas = "images/Americas Continent.png";
const urlAPAC = "images/APAC Continent.png";
const urlEurope = "images/Europe Continent.png";
const urlHomeIsland = "images/Home Island.png";
const urlCitizenInfected = "images/Infected Person.png";
const urlCitizenNotInfected = "images/Not Infected Person.png";

// Dynamic lists, initally empty
planes = [];
citizens = [];

// Initialize other constants
const planeCapacity = 50;
const planeCapacityMin = 15;
const numberCitizens = 10;

// States of the planes
const ARRIVED = 0;
const PLANNEDHOMING = 1;
const HOMING = 2;
const HOMED = 3;

// States of the passengers/citizens
const ARRIVING = 4;
const COMMUTING = 5;
const LEAVING = 6;
const LEFT = 7;

var nrow = 7;
var srow = 7;
var ncol = 12;
var scol = 4;

var areas = [
  {"label": "Island", "startRow": srow-1, "numRows": nrow+2, "startCol": scol-1, "numCols": ncol+2},
  {"label": "Africas", "startRow": 2, "numRows": 3, "startCol": 1, "numCols": 3},
  {"label": "APAC", "startRow": 2, "numRows": 3, "startCol": 16, "numCols": 3},
  {"label": "Europe", "startRow": 16, "numRows": 3, "startCol": 1, "numCols": 3},
  {"label": "Americas", "startRow": 16, "numRows": 3, "startCol": 16, "numCols": 3}
];

var currentTime = 0;

var statistics = [
  {"name": "Cost", "count": 0},
  {"name": "Revenue", "count": 0}
];

// Initialize variables
var gdpAfricas = 4950;
var gdpAPAC = 13380;
var gdpAmericas = 50290;
var gdpEurope = 38210;

var probArrivalAfricas = 0.000008604694236;
var probArrivalAPAC = 0.00004028712181;
var probArrivalAmericas = 0.0003159177884;
var probArrivalEurope = 0.00009332073393;

var probInfectedCitizens = 0;
var probInfectedAfricas = 0.009157994159;
var probInfectedAPAC = 0.01704577167;
var probInfectedAmericas = 0.482413534;
var probInfectedEurope = 0.09253520108;

var probDepartureAfricas = 0.5;
var probDepartureAPAC = 0.5;
var probDepartureAmericas = 0.5;
var probDepartureEurope = 0.5;

var planeFrequencyAfricas = 1;
var planeFrequencyAPAC = 1;
var planeFrequencyAmericas = 1;
var planeFrequencyEurope = 1;

var revenueWeightAfricas = 1;
var revenueWeightAPAC = 1;
var revenueWeightAmericas = 1;
var revenueWeightEurope = 1;

var costWeightCitizens = 1;
var costWeightTourists = 1;

var InfectionRate = 0.8;
var DistTransmission = 1;
var probRecovered = 0.2;

var departingcitizensAfricas = 0;
var departedcitizensAfricas = 0;
var departingcitizensAPAC = 0;
var departedcitizensAPAC = 0;
var departingcitizensAmericas = 0;
var departedcitizensAmericas = 0;
var departingcitizensEurope = 0;
var departedcitizensEurope = 0;

// This function is executed when the script is loaded. It contains the page initialization code.
(function() {
  window.addEventListener("resize", redrawWindow); // Redraw whenever the window is resized
  simTimer = window.setInterval(simStep, animationDelay); // Call the function simStep every animationDelay milliseconds
  redrawWindow();
})();

// Function to start and pause the simulation
function toggleSimStep() {
  // This function is called by a click event on the html page
  isRunning = !isRunning;
  console.log("isRunning: " + isRunning);
}

function redrawWindow() {
  isRunning = false; // Used by simStep
  window.clearInterval(simTimer); // Clear the timer

  // Recall the graphing function
  plotGraph();

  probInfectedAfricas = document.getElementById("slider1").value;
  probInfectedAPAC = document.getElementById("slider4").value;
  probInfectedAmericas = document.getElementById("slider8").value;
  probInfectedEurope = document.getElementById("slider11").value;

  revenueWeightAfricas = document.getElementById("slider2").value;
  revenueWeightAPAC = document.getElementById("slider5").value;
  revenueWeightAmericas = document.getElementById("slider9").value;
  revenueWeightEurope = document.getElementById("slider12").value;

  costWeightCitizens = document.getElementById("slider7").value;
  costWeightTourists = document.getElementById("slider14").value;

  if (document.getElementById("slider3").value == 0) {
    planeFrequencyAfricas = 0;
  } else {
    planeFrequencyAfricas = Math.floor(100 / document.getElementById("slider3").value);
  }
  if (document.getElementById("slider6").value == 0) {
    planeFrequencyAPAC = 0;
  } else {
    planeFrequencyAPAC = Math.floor(100 / document.getElementById("slider6").value);
  }
  if (document.getElementById("slider10").value == 0) {
    planeFrequencyAmericas = 0;
  } else {
    planeFrequencyAmericas = Math.floor(100 / document.getElementById("slider10").value);
  }
  if (document.getElementById("slider13").value == 0) {
    planeFrequencyEurope = 0;
  } else {
    planeFrequencyEurope = Math.floor(100 / document.getElementById("slider13").value);
  }

  simTimer = window.setInterval(simStep, animationDelay); // Call the function simStep every animationDelay milliseconds

  // Re-initialize simulation variables
  currentTime = 0;
  planes = [];
  citizens = [];
  statistics[0].count = 0;
  statistics[1].count = 0;

  // Resize the drawing surface and remove all its contents
  var drawsurface = document.getElementById("surface");
  var creditselement = document.getElementById("credits");
  var w = window.innerWidth;
  var h = window.innerHeight;
  var surfaceWidth = (w - 3*WINDOWBORDERSIZE);
  var surfaceHeight = (h - creditselement.offsetHeight - 3*WINDOWBORDERSIZE);
  drawsurface.style.width = surfaceWidth+"px";
	drawsurface.style.height = surfaceHeight+"px";
	drawsurface.style.left = WINDOWBORDERSIZE/2+"px";
	drawsurface.style.top = WINDOWBORDERSIZE/2+"px";
  drawsurface.innerHTML = "";

  // Compute the cellWidth and cellHeight, given the size of the drawing surface
  numCols = maxCols;
  cellWidth = surfaceWidth/numCols;
  numRows = Math.ceil(surfaceHeight/cellWidth);
  cellHeight = surfaceHeight/numRows;

  surface = d3.select("#surface");
  surface.selectAll("*").remove();
  surface.style("font-size", "100%");
  updateSurface();
}

// The window is resizable, so we need to translate row and column coordinates into screen coordinates x and y
function getLocationCell(location){
	var row = location.row;
	var col = location.col;
	var x = (col-1)*cellWidth; // cellWidth is set in the redrawWindow function
	var y = (row-1)*cellHeight; // cellHeight is set in the redrawWindow function
	return {"x":x,"y":y};
}

function updateSurface() {
  // PLANES
  var allplanes = surface.selectAll(".planes").data(planes);
  allplanes.exit().remove();
  var newplanes = allplanes.enter().append("g").attr("class", "planes");
  newplanes.append("svg:image")
    .attr("x", function(d){var cell=getLocationCell(d.location); return cell.x+"px";})
    .attr("y", function(d){var cell=getLocationCell(d.location); return cell.y+"px";})
    .attr("width", Math.min(cellWidth,cellHeight)+"px")
    .attr("height", Math.min(cellWidth,cellHeight)+"px")
    .attr("xlink:href", function(d){
      if (d.type == "Africas") return urlPlaneAfricas;
      if (d.type == "APAC") return urlPlaneAPAC;
      if (d.type == "Americas") return urlPlaneAmericas;
      if (d.type == "Europe") return urlPlaneEurope;
    });
  var planeimages = allplanes.selectAll("image");
  planeimages.transition()
    .attr("x",function(d){var cell=getLocationCell(d.location); return cell.x+"px";})
    .attr("y", function(d){var cell=getLocationCell(d.location); return cell.y+"px";})
    .attr("xlink:href", function(d){
      if (d.type == "Africas") return urlPlaneAfricas;
      if (d.type == "APAC") return urlPlaneAPAC;
      if (d.type == "Americas") return urlPlaneAmericas;
      if (d.type == "Europe") return urlPlaneEurope;
    })
    .duration(animationDelay).ease("linear"); // This specifies the speed and type of transition we want

  // CITIZENS
  var allcitizens = surface.selectAll(".citizens").data(citizens);
  allcitizens.exit().remove();
  var newcitizens = allcitizens.enter().append("g").attr("class", "citizens");
  newcitizens.append("svg:image")
  .attr("x", function(d){var cell=getLocationCell(d.location); return cell.x+"px";})
  .attr("y", function(d){var cell=getLocationCell(d.location); return cell.y+"px";})
  .attr("width", Math.min(0.5*cellWidth,0.5*cellHeight)+"px")
  .attr("height", Math.min(0.5*cellWidth,0.5*cellHeight)+"px")
  .attr("xlink:href", function(d){
    if (d.infected == 1 && d.state == COMMUTING) return urlCitizenInfected;
    if (d.infected == 0 && d.state == COMMUTING) return urlCitizenNotInfected;
  });
  var citizenimages = allcitizens.selectAll("image");
  citizenimages.transition()
  .attr("x",function(d){var cell=getLocationCell(d.location); return cell.x+"px";})
  .attr("y", function(d){var cell=getLocationCell(d.location); return cell.y+"px";})
  .attr("xlink:href", function(d){
    if (d.infected == 1 && (d.state == COMMUTING || d.state == LEAVING)) return urlCitizenInfected;
    if (d.infected == 0 && (d.state == COMMUTING || d.state == LEAVING)) return urlCitizenNotInfected;
  })
  .duration(animationDelay).ease("linear"); // This specifies the speed and type of transition we want

  // AREAS
  var allareas = surface.selectAll(".areas").data(areas);
  var newareas = allareas.enter().append("g").attr("class", "areas");
  newareas.append("svg:image")
    .attr("x", function(d){
      if (d.label == "Island") {
        return (d.startCol-1)*cellWidth;
      } else {
        return (d.startCol-1)*cellWidth;
      }
    })
    .attr("y", function(d){return (d.startRow-1)*cellHeight;})
    .attr("width", function(d){
      if (d.label == "Island") {
        return d.numCols*cellWidth;
      } else {
        return d.numCols*cellWidth;
      }
    })
    .attr("height", function(d){return d.numRows*cellWidth;})
    .attr("xlink:href", function(d){
      if (d.label == "Africas") return urlAfricas;
      if (d.label == "APAC") return urlAPAC;
      if (d.label == "Americas") return urlAmericas;
      if (d.label == "Europe") return urlEurope;
      if (d.label == "Island") return urlHomeIsland;
    });
}

function addDynamicAgents() {
  while (citizens.length < numberCitizens) {
    var nrow = 7;
    var srow = 7;
    var ncol = 12;
    var scol = 4;
    var homerow = Math.floor(Math.random()*((nrow+srow)-srow)+srow);
    var homecol = Math.floor(Math.random()*((ncol+scol)-scol)+scol);
    var targetrow = Math.floor(Math.random()*((nrow+srow)-srow)+srow);
    var targetcol = Math.floor(Math.random()*((ncol+scol)-scol)+scol);
    if (Math.random() < probInfectedCitizens) {
      var newcitizen = {"origin": "Island", "infected": 1, "location": {"row": homerow, "col": homecol}, "target": {"row": targetrow, "col": targetcol}, "state": COMMUTING, "timeAdmitted": currentTime, "timeInfected": currentTime};
    } else {
      var newcitizen = {"origin": "Island", "infected": 0, "location": {"row": homerow, "col": homecol}, "target": {"row": targetrow, "col": targetcol}, "state": COMMUTING, "timeAdmitted": currentTime, "timeInfected": 0};
    }
    citizens.push(newcitizen);
  }

  if (currentTime % planeFrequencyAfricas == 0) {
    var existingAfricas = false;
    for (var plane of planes) {
      if (plane.type == "Africas") {
        existingAfricas = true;
      }
    }
    if (!existingAfricas) {
      var newplane = {"type": "Africas", "location": {"row": 2, "col": 1}, "target": {"row": 9, "col": 8.5}, "state": ARRIVED};
      planes.push(newplane);
      for (var i = 0; i < planeCapacity; i++) {
        if (i < planeCapacityMin) {
          if (Math.random() < probInfectedAfricas) {
            var newpassenger = {"origin": "Africas", "infected": 1, "location": {"row": 2, "col": 1}, "target": {"row": 9, "col": 8}, "state": ARRIVING, "timeAdmitted": currentTime, "timeInfected": currentTime};
            citizens.push(newpassenger);
          } else {
            var newpassenger = {"origin": "Africas", "infected": 0, "location": {"row": 2, "col": 1}, "target": {"row": 9, "col": 8}, "state": ARRIVING, "timeAdmitted": currentTime, "timeInfected": 0};
            citizens.push(newpassenger);
          }
        } else {
          if (Math.random() < probArrivalAfricas) {
            if (Math.random() < probInfectedAfricas) {
              var newpassenger = {"origin": "Africas", "infected": 1, "location": {"row": 2, "col": 1}, "target": {"row": 9, "col": 8}, "state": ARRIVING, "timeAdmitted": currentTime, "timeInfected": currentTime};
              citizens.push(newpassenger);
            } else {
              var newpassenger = {"origin": "Africas", "infected": 0, "location": {"row": 2, "col": 1}, "target": {"row": 9, "col": 8}, "state": ARRIVING, "timeAdmitted": currentTime, "timeInfected": 0};
              citizens.push(newpassenger);
            }
          }
        }
      }
    }
  }

  if (currentTime % planeFrequencyAPAC == 0) {
    var existingAPAC = false;
    for (var plane of planes) {
      if (plane.type == "APAC") {
        existingAPAC = true;
      }
    }
    if (!existingAPAC) {
      var newplane = {"type": "APAC", "location": {"row": 2, "col": 18}, "target": {"row": 9, "col": 10}, "state": ARRIVED};
      planes.push(newplane);
      for (var i = 0; i < planeCapacity; i++) {
        if (i < planeCapacityMin) {
          if (Math.random() < probInfectedAPAC) {
            var newpassenger = {"origin": "APAC", "infected": 1, "location": {"row": 2, "col": 18}, "target": {"row": 9, "col": 10}, "state": ARRIVING, "timeAdmitted": currentTime, "timeInfected": currentTime};
            citizens.push(newpassenger);
          } else {
            var newpassenger = {"origin": "APAC", "infected": 0, "location": {"row": 2, "col": 18}, "target": {"row": 9, "col": 10}, "state": ARRIVING, "timeAdmitted": currentTime, "timeInfected": 0};
            citizens.push(newpassenger);
          }
        } else {
          if (Math.random() < probArrivalAPAC) {
            if (Math.random() < probInfectedAPAC) {
              var newpassenger = {"origin": "APAC", "infected": 1, "location": {"row": 2, "col": 18}, "target": {"row": 9, "col": 10}, "state": ARRIVING, "timeAdmitted": currentTime, "timeInfected": currentTime};
              citizens.push(newpassenger);
            } else {
              var newpassenger = {"origin": "APAC", "infected": 0, "location": {"row": 2, "col": 18}, "target": {"row": 9, "col": 10}, "state": ARRIVING, "timeAdmitted": currentTime, "timeInfected": 0};
              citizens.push(newpassenger);
            }
          }
        }
      }
    }
  }

  if (currentTime % planeFrequencyAmericas == 0) {
    var existingAmericas = false;
    for (var plane of planes) {
      if (plane.type == "Americas") {
        existingAmericas = true;
      }
    }
    if (!existingAmericas) {
      var newplane = {"type": "Americas", "location": {"row": 18, "col": 18}, "target": {"row": 10, "col": 10}, "state": ARRIVED};
      planes.push(newplane);
      for (var i = 0; i < planeCapacity; i++) {
        if (i < planeCapacityMin) {
          if (Math.random() < probInfectedAmericas) {
            var newpassenger = {"origin": "Americas", "infected": 1, "location": {"row": 18, "col": 18}, "target": {"row": 10, "col": 10}, "state": ARRIVING, "timeAdmitted": currentTime, "timeInfected": currentTime};
            citizens.push(newpassenger);
          } else {
            var newpassenger = {"origin": "Americas", "infected": 0, "location": {"row": 18, "col": 18}, "target": {"row": 10, "col": 10}, "state": ARRIVING, "timeAdmitted": currentTime, "timeInfected": 0};
            citizens.push(newpassenger);
          }
        } else {
          if (Math.random() < probArrivalAmericas) {
            if (Math.random() < probInfectedAmericas) {
              var newpassenger = {"origin": "Americas", "infected": 1, "location": {"row": 18, "col": 18}, "target": {"row": 10, "col": 10}, "state": ARRIVING, "timeAdmitted": currentTime, "timeInfected": currentTime};
              citizens.push(newpassenger);
            } else {
              var newpassenger = {"origin": "Americas", "infected": 0, "location": {"row": 18, "col": 18}, "target": {"row": 10, "col": 10}, "state": ARRIVING, "timeAdmitted": currentTime, "timeInfected": 0};
              citizens.push(newpassenger);
            }
          }
        }
      }
    }
  }

  if (currentTime % planeFrequencyEurope == 0) {
    var existingEurope = false;
    for (var plane of planes) {
      if (plane.type == "Europe") {
        existingEurope = true;
      }
    }
    if (!existingEurope) {
      var newplane = {"type": "Europe", "location": {"row": 18, "col": 1}, "target": {"row": 10, "col": 8.5}, "state": ARRIVED};
      planes.push(newplane);
      for (var i = 0; i < planeCapacity; i++) {
        if (i < planeCapacityMin) {
          if (Math.random() < probInfectedEurope) {
            var newpassenger = {"origin": "Europe", "infected": 1, "location": {"row": 18, "col": 1}, "target": {"row": 10, "col": 8}, "state": ARRIVING, "timeAdmitted": currentTime, "timeInfected": currentTime};
            citizens.push(newpassenger);
          } else {
            var newpassenger = {"origin": "Europe", "infected": 0, "location": {"row": 18, "col": 1}, "target": {"row": 10, "col": 8}, "state": ARRIVING, "timeAdmitted": currentTime, "timeInfected": 0};
            citizens.push(newpassenger);
          }
        } else {
          if (Math.random() < probArrivalEurope) {
            if (Math.random() < probInfectedEurope) {
              var newpassenger = {"origin": "Europe", "infected": 1, "location": {"row": 18, "col": 1}, "target": {"row": 10, "col": 8}, "state": ARRIVING, "timeAdmitted": currentTime, "timeInfected": currentTime};
              citizens.push(newpassenger);
            } else {
              var newpassenger = {"origin": "Europe", "infected": 0, "location": {"row": 18, "col": 1}, "target": {"row": 10, "col": 8}, "state": ARRIVING, "timeAdmitted": currentTime, "timeInfected": 0};
              citizens.push(newpassenger);
            }
          }
        }
      }
    }
  }
}

function updatePlane(planeIndex) {
  planeIndex = Number(planeIndex);
  var plane = planes[planeIndex];
  var row = plane.location.row;
  var col = plane.location.col;
  var type = plane.type;
  var state = plane.state;

  // Determine if plane has arrived at destination
  var hasArrived = (Math.abs(plane.target.row-row)+Math.abs(plane.target.col-col))==0;
  if (state == ARRIVED) {
    if (hasArrived) {
      if (type == "Africas") {
        if (currentTime % planeFrequencyAfricas == 0) {
          plane.state = PLANNEDHOMING;
          for (citizen of citizens) {
            if (citizen.origin == "Africas") {
              if (Math.random() < probDepartureAfricas && departingcitizensAfricas < 50) {
                citizen.state = LEAVING;
                citizen.target.row = 9;
                citizen.target.col = 8;
                departingcitizensAfricas = departingcitizensAfricas + 1;
              }
            }
          }
        }
      }
      if (type == "APAC") {
        if (currentTime % planeFrequencyAPAC == 0) {
          plane.state = PLANNEDHOMING;
          for (citizen of citizens) {
            if (citizen.origin == "APAC") {
              if (Math.random() < probDepartureAPAC && departingcitizensAPAC < 50) {
                citizen.state = LEAVING;
                citizen.target.row = 9;
                citizen.target.col = 10;
                departingcitizensAPAC = departingcitizensAPAC + 1;
              }
            }
          }
        }
      }
      if (type == "Americas") {
        if (currentTime % planeFrequencyAmericas == 0) {
          plane.state = PLANNEDHOMING;
          for (citizen of citizens) {
            if (citizen.origin == "Americas") {
              if (Math.random() < probDepartureAmericas && departingcitizensAmericas < 50) {
                citizen.state = LEAVING;
                citizen.target.row = 10;
                citizen.target.col = 10;
                departingcitizensAmericas = departingcitizensAmericas + 1;
              }
            }
          }
        }
      }
      if (type == "Europe") {
        if (currentTime % planeFrequencyEurope == 0) {
          plane.state = PLANNEDHOMING;
          for (citizen of citizens) {
            if (citizen.origin == "Europe") {
              if (Math.random() < probDepartureEurope && departingcitizensEurope < 50) {
                citizen.state = LEAVING;
                citizen.target.row = 10;
                citizen.target.col = 8;
                departingcitizensEurope = departingcitizensEurope + 1;
              }
            }
          }
        }
      }
    }
  }
  if (state == PLANNEDHOMING) {
    if (plane.type == "Africas") {
      if (departingcitizensAfricas == departedcitizensAfricas) {
        plane.state = HOMING;
        plane.target.row = 2;
        plane.target.col = 1;
        departingcitizensAfricas = 0;
        departedcitizensAfricas = 0;
      }
    }
    if (plane.type == "APAC") {
      if (departingcitizensAPAC == departedcitizensAPAC) {
        plane.state = HOMING;
        plane.target.row = 2;
        plane.target.col = 18;
        departingcitizensAPAC = 0;
        departedcitizensAPAC = 0;
      }
    }
    if (plane.type == "Americas") {
      if (departingcitizensAmericas == departedcitizensAmericas) {
        plane.state = HOMING;
        plane.target.row = 18;
        plane.target.col = 18;
        departingcitizensAmericas = 0;
        departedcitizensAmericas = 0;
      }
    }
    if (plane.type == "Europe") {
      if (departingcitizensEurope == departedcitizensEurope) {
        plane.state = HOMING;
        plane.target.row = 18;
        plane.target.col = 1;
        departingcitizensEurope = 0;
        departedcitizensEurope = 0;
      }
    }
  }
  if (state == HOMING) {
    if (hasArrived) {
      plane.state = HOMED;
    }
  }

  // Move the plane
  var targetRow = plane.target.row;
  var targetCol = plane.target.col;
  var rowsToGo = targetRow - row;
  var colsToGo = targetCol - col;
  var cellsPerStep = 1;
  var newRow = row+Math.min(Math.abs(rowsToGo),cellsPerStep)*Math.sign(rowsToGo);
  var newCol = col+Math.min(Math.abs(colsToGo),cellsPerStep)*Math.sign(colsToGo);
  plane.location.row = newRow;
  plane.location.col = newCol;
}

function updateCitizen(citizenIndex) {
  citizenIndex = Number(citizenIndex);
  var citizen = citizens[citizenIndex];
  var row = citizen.location.row;
  var col = citizen.location.col;
  var state = citizen.state;

  var hasArrived = (Math.abs(citizen.target.row-row)+Math.abs(citizen.target.col-col))==0;

  // Identify the citizens infected
  var infectedcitizens = citizens.filter(function(d){return d.infected==1;});
  // Determine if any citizen infected is nearby
  var i = 0;
  if (infectedcitizens.length > 0 && citizen.infected == 0) {
    while (citizen.infected == 0 && i < infectedcitizens.length){
      var infected = infectedcitizens[i];
      var infectedrow = infected.location.row;
      var infectedcol = infected.location.col;
      var distance = Math.sqrt((infectedrow-row)*(infectedrow-row)+(infectedcol-col)*(infectedcol-col));
      if (distance < DistTransmission){
        if (Math.random() < InfectionRate) {
          citizen.infected = 1;
          citizen.timeInfected = currentTime;
        };
      }
      i=i+1;
    }
  }

  if (Math.random() < probRecovered) {
    citizen.infected = 0;
  }

  if (state == ARRIVING) {
      if (hasArrived) {
        citizen.timeAdmitted = currentTime;
        citizen.state = COMMUTING;
        var nrow = 7;
        var srow = 7;
        var ncol = 12;
        var scol = 4;
        var targetrow = Math.floor(Math.random() * ((nrow+srow)-srow)+srow);
        var targetcol = Math.floor(Math.random() * ((ncol+scol)-scol)+scol);
        citizen.target.row = targetrow;
        citizen.target.col = targetcol;
      }
  }
  if (state == COMMUTING) {
    if (hasArrived) {
      var nrow = 7;
      var srow = 7;
      var ncol = 12;
      var scol = 4;
      var targetrow = Math.floor(Math.random() * ((nrow+srow)-srow)+srow);
      var targetcol = Math.floor(Math.random() * ((ncol+scol)-scol)+scol);
      citizen.target.row = targetrow;
      citizen.target.col = targetcol;
    }
  }
  if (state == LEAVING) {
    if (hasArrived) {
      citizen.state = LEFT;
      if (citizen.origin == "Africas") {departedcitizensAfricas = departedcitizensAfricas + 1;};
      if (citizen.origin == "APAC") {departedcitizensAPAC = departedcitizensAPAC + 1;};
      if (citizen.origin == "Americas") {departedcitizensAmericas = departedcitizensAmericas + 1;};
      if (citizen.origin == "Europe") {departedcitizensEurope = departedcitizensEurope + 1;};
    }
  }

  var currentrow = citizen.location.row;
  var currentcol = citizen.location.col;
  var targetRow = citizen.target.row;
  var targetCol = citizen.target.col;

  // Compute all possible directions of a citizen
  nextsteps = [];
  for (const dx of [-1, 0, 1]) {
    for (const dy of [-1, 0, 1]) {
      if (dx == 0 && dy == 0) continue;
      nextsteps.push({"row": currentrow+dx, "col": currentcol+dy});
    }
  }

  // Compute distance of each possible step to the destination
  stepdistance = [];
  for (var i = 0; i < nextsteps.length-1; i++) {
    var nextstep = nextsteps[i];
    var nextrow = nextstep.row;
    var nextcol = nextstep.col;
    stepdistance[i] = Math.sqrt((nextrow-targetRow)*(nextrow-targetRow)+(nextcol-targetCol)*(nextcol-targetCol));
  }

  var indexMin = stepdistance.indexOf(Math.min(...stepdistance));
  var minnextstep = nextsteps[indexMin];
  var newRow = minnextstep.row;
  var newCol = minnextstep.col;
  citizen.location.row = newRow;
  citizen.location.col = newCol;

  // Update statistics
  var timeOnIsland = currentTime - citizen.timeAdmitted;
  if (citizen.infected == 1 && citizen.state == COMMUTING) {
    var timeSpentInfected = currentTime - citizen.timeInfected;
    if (citizen.origin == "Island") {
      statistics[0].count += costWeightCitizens * timeSpentInfected * 30000 * 1.7;
    } else {
      statistics[0].count += costWeightTourists * timeSpentInfected * 30000 * 1.7;
    }
  }

  if (citizen.origin == "Africas" && citizen.state == COMMUTING) {
    if (timeOnIsland > 0) {
      statistics[1].count += revenueWeightAfricas * timeOnIsland * gdpAfricas / (timeOnIsland+1);
    }
  }
  if (citizen.origin == "APAC" && citizen.state == COMMUTING) {
    if (timeOnIsland > 0) {
      statistics[1].count += revenueWeightAPAC * timeOnIsland * gdpAPAC / (timeOnIsland+1);
    }
  }
  if (citizen.origin == "Americas" && citizen.state == COMMUTING) {
    if (timeOnIsland > 0) {
      statistics[1].count += revenueWeightAmericas * timeOnIsland * gdpAmericas / (timeOnIsland+1);
    }
  }
  if (citizen.origin == "Europe" && citizen.state == COMMUTING) {
    if (timeOnIsland > 0) {
      statistics[1].count += revenueWeightEurope * timeOnIsland * gdpEurope / (timeOnIsland+1);
    }
  }
}

function removeDynamicAgents() {
  var allplanes = surface.selectAll(".planes").data(planes);
  var returnedplanes = allplanes.filter(function(d,i){return d.state == HOMED;});
  returnedplanes.remove();
  planes = planes.filter(function(d){return d.state != HOMED;});

  var allcitizens = surface.selectAll(".citizens").data(citizens);
  var returnedcitizens = allcitizens.filter(function(d,i){return d.state == LEFT;});
  returnedcitizens.remove();
  citizens = citizens.filter(function(d){return d.state != LEFT;});
}

function updateDynamicAgents() {
  for (var planeIndex in planes) {
    updatePlane(planeIndex);
  }
  for (var citizenIndex in citizens) {
    updateCitizen(citizenIndex);
  }
  updateSurface();
}

function simStep() {
    if (isRunning) {
      currentTime++;
      addDynamicAgents();
      updateDynamicAgents();
      removeDynamicAgents();
    }
}
