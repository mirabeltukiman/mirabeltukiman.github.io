var WINDOWBORDERSIZE = 10;
var HUGE = 999999; // Sometimes useful when testing for big or small numbers
var animationDelay = 300; // Controls simulation and transition speed
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
const urlCitizenInfected = "images/Americas Person.png";
const urlCitizenNotInfected = "images/Africas Person.png";

var automatedDataFetch;
var numberOfRuns;
var numberOfDataPoints;
var currentRun;

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

// States of the passengers
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

// Add this in later
var statistics = [
  {"name": "Cost", "count": 0},
  {"name": "Revenue", "count": 0}
];

// Probabilities
var probArrival1 = 0.8604694236; // Africas
var probArrival2 = 0.0004028712181; // APAC
var probArrival3 = 0.003159177884; // Americas
var probArrival4 = 0.0006272377198; // Europe
var probInfected1 = 0.009157994159; // Africas
var probInfected2 = 0.01704577167; // APAC
var probInfected3 = 0.482413534; // Americas
var probInfected4 = 0.09253520108; // Europe
var probDeparture1 = 0.5;
var probDeparture2 = 0.5;
var probDeparture3 = 0.5;
var probDeparture4 = 0.5;

var planeFrequency1 = 1;
var planeFrequency2 = 1;
var planeFrequency3 = 1;
var planeFrequency4 = 1;

var probInfected = 0;
var probRecovered = 0.2;
var departingcitizens1 = 0;
var departedcitizens1 = 0;
var departingcitizens2 = 0;
var departedcitizens2 = 0;
var departingcitizens3 = 0;
var departedcitizens3 = 0;
var departingcitizens4 = 0;
var departedcitizens4 = 0;

var mu = 1;
var mu1 = 1;
var mu2 = 1;
var mu3 = 1;
var mu4 = 1;
var lambda1 = 1;
var lambda2 = 1;
var lambda3 = 1;
var lambda4 = 1;
var gdp1 = 4950; // Africas
var gdp2 = 13380; // APAC
var gdp3 = 50290; // Americas
var gdp4 = 38210; // Europe

var costCount = 0;
var revCount = 0;

var InfectionRate = 0.8;
var DistTransmission = 1;

// Export data
var exportData = [];
var exportDataAutomated = [];

// var randomNumbersUsed = [];

// This function is executed when the script is loaded. It contains the page initialization code.
(function() {
  window.addEventListener("resize", redrawWindow); // Redraw whenever the window is resized
  simTimer = window.setInterval(simStep, animationDelay); // Call the function simStep every animationDelay milliseconds
  redrawWindow();
})();

// Function to start and pause the simulation
function toggleSimStep(automated, i) {
  // This function is called by a click event on the html page
  isRunning = !isRunning;
  console.log("isRunning: " + isRunning);
  automatedDataFetch = automated;
  currentRun = i;
}

function redrawWindow() {
  isRunning = false; // Used by simStep
  window.clearInterval(simTimer); // Clear the timer

  // Recall the graphing function
  plotGraph();

  // animationDelay = 550 - document.getElementById("slider1").value;
  probInfected1 = document.getElementById("slider1").value;
  probInfected2 = document.getElementById("slider5").value;
  probInfected3 = document.getElementById("slider9").value;
  probInfected4 = document.getElementById("slider13").value;

  lambda1 = document.getElementById("slider2").value;
  lambda2 = document.getElementById("slider6").value;
  lambda3 = document.getElementById("slider10").value;
  lambda4 = document.getElementById("slider14").value;

  mu = document.getElementById("slider0").value;
  mu1 = document.getElementById("slider3").value;
  mu2 = document.getElementById("slider7").value;
  mu3 = document.getElementById("slider11").value;
  mu4 = document.getElementById("slider15").value;

  if (document.getElementById("slider4").value == 0) {
    planeFrequency1 = 0;
  } else {
    planeFrequency1 = Math.floor(100 / document.getElementById("slider4").value);
  }
  if (document.getElementById("slider8").value == 0) {
    planeFrequency2 = 0;
  } else {
    planeFrequency2 = Math.floor(100 / document.getElementById("slider8").value);
  }
  if (document.getElementById("slider12").value == 0) {
    planeFrequency3 = 0;
  } else {
    planeFrequency3 = Math.floor(100 / document.getElementById("slider12").value);
  }
  if (document.getElementById("slider16").value == 0) {
    planeFrequency4 = 0;
  } else {
    planeFrequency4 = Math.floor(100 / document.getElementById("slider16").value);
  }

  simTimer = window.setInterval(simStep, animationDelay); // Call the function simStep every animationDelay milliseconds

  // Re-initialize simulation variables
  currentTime = 0;
  planes = [];
  citizens = [];
  statistics[0].count = 0;
  statistics[1].count = 0;
  exportData = [];

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
    // randomNumbersUsed.push(Math.random())
    var homecol = Math.floor(Math.random()*((ncol+scol)-scol)+scol);
    // randomNumbersUsed.push(Math.random())
    var targetrow = Math.floor(Math.random()*((nrow+srow)-srow)+srow);
    // randomNumbersUsed.push(Math.random())
    var targetcol = Math.floor(Math.random()*((ncol+scol)-scol)+scol);
    // randomNumbersUsed.push(Math.random())
    if (Math.random() < probInfected) {
      var newcitizen = {"origin": "Island", "infected": 1, "location": {"row": homerow, "col": homecol}, "target": {"row": targetrow, "col": targetcol}, "state": COMMUTING, "timeAdmitted": currentTime, "timeInfected": currentTime};
    } else {
      var newcitizen = {"origin": "Island", "infected": 0, "location": {"row": homerow, "col": homecol}, "target": {"row": targetrow, "col": targetcol}, "state": COMMUTING, "timeAdmitted": currentTime, "timeInfected": 0};
    }
    // randomNumbersUsed.push(Math.random())
    citizens.push(newcitizen);
  }

  // if (currentTime % planeFrequency1 == 0) {
    var existing1 = false;
    for (var plane of planes) {
      if (plane.type == "Africas") {
        existing1 = true;
      }
    }
    if (!existing1) {
      if (currentTime % planeFrequency1 == 0) {
        var newplane = {"type": "Africas", "location": {"row": 2, "col": 1}, "target": {"row": 9, "col": 8.5}, "state": ARRIVED};
        planes.push(newplane);
      }
      for (var i = 0; i < planeCapacity; i++) {
        if (i < planeCapacityMin) {
          if (Math.random() < probInfected1) {
            if (currentTime % planeFrequency1 == 0) {
              var newpassenger = {"origin": "Africas", "infected": 1, "location": {"row": 2, "col": 1}, "target": {"row": 9, "col": 8}, "state": ARRIVING, "timeAdmitted": currentTime, "timeInfected": currentTime};
              citizens.push(newpassenger);
            }
          } else {
            if (currentTime % planeFrequency1 == 0) {
              var newpassenger = {"origin": "Africas", "infected": 0, "location": {"row": 2, "col": 1}, "target": {"row": 9, "col": 8}, "state": ARRIVING, "timeAdmitted": currentTime, "timeInfected": 0};
              citizens.push(newpassenger);
            }
          }
          // randomNumbersUsed.push(Math.random())
        } else {
          if (Math.random() < probArrival1) {
            // randomNumbersUsed.push(Math.random())
            if (Math.random() < probInfected1) {
              // randomNumbersUsed.push(Math.random())
              if (currentTime % planeFrequency1 == 0) {
                var newpassenger = {"origin": "Africas", "infected": 1, "location": {"row": 2, "col": 1}, "target": {"row": 9, "col": 8}, "state": ARRIVING, "timeAdmitted": currentTime, "timeInfected": currentTime};
                citizens.push(newpassenger);
              }
            } else {
              // randomNumbersUsed.push(Math.random())
              if (currentTime % planeFrequency1 == 0) {
                var newpassenger = {"origin": "Africas", "infected": 0, "location": {"row": 2, "col": 1}, "target": {"row": 9, "col": 8}, "state": ARRIVING, "timeAdmitted": currentTime, "timeInfected": 0};
                citizens.push(newpassenger);
              }
            }
          } else {
            // randomNumbersUsed.push(Math.random())
          }
        }
      }
    }
  // }

  // if (currentTime % planeFrequency2 == 0) {
    var existing2 = false;
    for (var plane of planes) {
      if (plane.type == "APAC") {
        existing2 = true;
      }
    }
    if (!existing2) {
      if (currentTime % planeFrequency2 == 0) {
        var newplane = {"type": "APAC", "location": {"row": 2, "col": 18}, "target": {"row": 9, "col": 10}, "state": ARRIVED};
        planes.push(newplane);
      }
      for (var i = 0; i < planeCapacity; i++) {
        if (i < planeCapacityMin) {
          if (Math.random() < probInfected2) {
            if (currentTime % planeFrequency2 == 0) {
              var newpassenger = {"origin": "APAC", "infected": 1, "location": {"row": 2, "col": 18}, "target": {"row": 9, "col": 10}, "state": ARRIVING, "timeAdmitted": currentTime, "timeInfected": currentTime};
              citizens.push(newpassenger);
            }
          } else {
            if (currentTime % planeFrequency2 == 0) {
              var newpassenger = {"origin": "APAC", "infected": 0, "location": {"row": 2, "col": 18}, "target": {"row": 9, "col": 10}, "state": ARRIVING, "timeAdmitted": currentTime, "timeInfected": 0};
              citizens.push(newpassenger);
            }
          }
          // randomNumbersUsed.push(Math.random())
        } else {
          if (Math.random() < probArrival2) {
            // randomNumbersUsed.push(Math.random())
            if (Math.random() < probInfected2) {
              // randomNumbersUsed.push(Math.random())
              if (currentTime % planeFrequency2 == 0) {
                var newpassenger = {"origin": "APAC", "infected": 1, "location": {"row": 2, "col": 18}, "target": {"row": 9, "col": 10}, "state": ARRIVING, "timeAdmitted": currentTime, "timeInfected": currentTime};
                citizens.push(newpassenger);
              }
            } else {
              // randomNumbersUsed.push(Math.random())
              if (currentTime % planeFrequency2 == 0) {
                var newpassenger = {"origin": "APAC", "infected": 0, "location": {"row": 2, "col": 18}, "target": {"row": 9, "col": 10}, "state": ARRIVING, "timeAdmitted": currentTime, "timeInfected": 0};
                citizens.push(newpassenger);
              }
            }
          } else {
            // randomNumbersUsed.push(Math.random())
          }
        }
      }
    }
  // }

  // if (currentTime % planeFrequency3 == 0) {
    var existing3 = false;
    for (var plane of planes) {
      if (plane.type == "Americas") {
        existing3 = true;
      }
    }
    if (!existing3) {
      if (currentTime % planeFrequency3 == 0) {
        var newplane = {"type": "Americas", "location": {"row": 18, "col": 18}, "target": {"row": 10, "col": 10}, "state": ARRIVED};
        planes.push(newplane);
      }
      for (var i = 0; i < planeCapacity; i++) {
        if (i < planeCapacityMin) {
          if (Math.random() < probInfected3) {
            if (currentTime % planeFrequency3 == 0) {
              var newpassenger = {"origin": "Americas", "infected": 1, "location": {"row": 18, "col": 18}, "target": {"row": 10, "col": 10}, "state": ARRIVING, "timeAdmitted": currentTime, "timeInfected": currentTime};
              citizens.push(newpassenger);
            }
          } else {
            if (currentTime % planeFrequency3 == 0) {
              var newpassenger = {"origin": "Americas", "infected": 0, "location": {"row": 18, "col": 18}, "target": {"row": 10, "col": 10}, "state": ARRIVING, "timeAdmitted": currentTime, "timeInfected": 0};
              citizens.push(newpassenger);
            }
          }
          // randomNumbersUsed.push(Math.random())
        } else {
          if (Math.random() < probArrival3) {
            // randomNumbersUsed.push(Math.random())
            if (Math.random() < probInfected3) {
              // randomNumbersUsed.push(Math.random())
              if (currentTime % planeFrequency3 == 0) {
                var newpassenger = {"origin": "Americas", "infected": 1, "location": {"row": 18, "col": 18}, "target": {"row": 10, "col": 10}, "state": ARRIVING, "timeAdmitted": currentTime, "timeInfected": currentTime};
                citizens.push(newpassenger);
              }
            } else {
              // randomNumbersUsed.push(Math.random())
              if (currentTime % planeFrequency3 == 0) {
                var newpassenger = {"origin": "Americas", "infected": 0, "location": {"row": 18, "col": 18}, "target": {"row": 10, "col": 10}, "state": ARRIVING, "timeAdmitted": currentTime, "timeInfected": 0};
                citizens.push(newpassenger);
              }
            }
          } else {
            // randomNumbersUsed.push(Math.random())
          }
        }
      }
    }
  // }

  // if (currentTime % planeFrequency4 == 0) {
    var existing4 = false;
    for (var plane of planes) {
      if (plane.type == "Europe") {
        existing4 = true;
      }
    }
    if (!existing4) {
      if (currentTime % planeFrequency4 == 0) {
        var newplane = {"type": "Europe", "location": {"row": 18, "col": 1}, "target": {"row": 10, "col": 8.5}, "state": ARRIVED};
        planes.push(newplane);
      }
      for (var i = 0; i < planeCapacity; i++) {
        if (i < planeCapacityMin) {
          if (Math.random() < probInfected4) {
            if (currentTime % planeFrequency4 == 0) {
              var newpassenger = {"origin": "Europe", "infected": 1, "location": {"row": 18, "col": 1}, "target": {"row": 10, "col": 8}, "state": ARRIVING, "timeAdmitted": currentTime, "timeInfected": currentTime};
              citizens.push(newpassenger);
            }
          } else {
            if (currentTime % planeFrequency4 == 0) {
              var newpassenger = {"origin": "Europe", "infected": 0, "location": {"row": 18, "col": 1}, "target": {"row": 10, "col": 8}, "state": ARRIVING, "timeAdmitted": currentTime, "timeInfected": 0};
              citizens.push(newpassenger);
            }
          }
          // randomNumbersUsed.push(Math.random())
        } else {
          if (Math.random() < probArrival4) {
            // randomNumbersUsed.push(Math.random())
            if (Math.random() < probInfected4) {
              // randomNumbersUsed.push(Math.random())
              if (currentTime % planeFrequency4 == 0) {
                var newpassenger = {"origin": "Europe", "infected": 1, "location": {"row": 18, "col": 1}, "target": {"row": 10, "col": 8}, "state": ARRIVING, "timeAdmitted": currentTime, "timeInfected": currentTime};
                citizens.push(newpassenger);
              }
            } else {
              // randomNumbersUsed.push(Math.random())
              if (currentTime % planeFrequency4 == 0) {
                var newpassenger = {"origin": "Europe", "infected": 0, "location": {"row": 18, "col": 1}, "target": {"row": 10, "col": 8}, "state": ARRIVING, "timeAdmitted": currentTime, "timeInfected": 0};
                citizens.push(newpassenger);
              }
            }
          } else {
            // randomNumbersUsed.push(Math.random())
          }
        }
      }
    }
  // }
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
        // if (currentTime % planeFrequency1 == 0) {
          plane.state = PLANNEDHOMING;
          for (citizen of citizens) {
            if (citizen.origin == "Africas") {
              if (Math.random() < probDeparture1 && departingcitizens1 < 50) {
                if (currentTime % planeFrequency1 == 0) {
                  citizen.state = LEAVING;
                  citizen.target.row = 9;
                  citizen.target.col = 8;
                  departingcitizens1 = departingcitizens1 + 1;
                }
              }
              // randomNumbersUsed.push(Math.random())
            }
          }
        // }
      }
      if (type == "APAC") {
        // if (currentTime % planeFrequency2 == 0) {
          plane.state = PLANNEDHOMING;
          for (citizen of citizens) {
            if (citizen.origin == "APAC") {
              if (Math.random() < probDeparture2 && departingcitizens2 < 50) {
                if (currentTime % planeFrequency2 == 0) {
                  citizen.state = LEAVING;
                  citizen.target.row = 9;
                  citizen.target.col = 10;
                  departingcitizens2 = departingcitizens2 + 1;
                }
              }
              // randomNumbersUsed.push(Math.random())
            }
          }
        // }
      }
      if (type == "Americas") {
        // if (currentTime % planeFrequency3 == 0) {
          plane.state = PLANNEDHOMING;
          for (citizen of citizens) {
            if (citizen.origin == "Americas") {
              if (Math.random() < probDeparture3 && departingcitizens3 < 50) {
                if (currentTime % planeFrequency3 == 0) {
                  citizen.state = LEAVING;
                  citizen.target.row = 10;
                  citizen.target.col = 10;
                  departingcitizens3 = departingcitizens3 + 1;
                }
              }
              // randomNumbersUsed.push(Math.random())
            }
          }
        //}
      }
      if (type == "Europe") {
        // if (currentTime % planeFrequency4 == 0) {
          plane.state = PLANNEDHOMING;
          for (citizen of citizens) {
            if (citizen.origin == "Europe") {
              if (Math.random() < probDeparture4 && departingcitizens4 < 50) {
                // randomNumbersUsed.push(Math.random())
                if (currentTime % planeFrequency4 == 0) {
                  citizen.state = LEAVING;
                  citizen.target.row = 10;
                  citizen.target.col = 8;
                  departingcitizens4 = departingcitizens4 + 1;
                }
              }
              // randomNumbersUsed.push(Math.random())
            }
          }
        //}
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
        // randomNumbersUsed.push(Math.random())
      }
      i=i+1;
    }
  }

  if (Math.random() < probRecovered) {
    citizen.infected = 0;
  }
  // randomNumbersUsed.push(Math.random())

  if (state == ARRIVING) {
      if (hasArrived) {
        citizen.timeAdmitted = currentTime;
        citizen.state = COMMUTING;
        var nrow = 7;
        var srow = 7;
        var ncol = 12;
        var scol = 4;
        var targetrow = Math.floor(Math.random() * ((nrow+srow)-srow)+srow);
        // randomNumbersUsed.push(Math.random())
        var targetcol = Math.floor(Math.random() * ((ncol+scol)-scol)+scol);
        // randomNumbersUsed.push(Math.random())
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
      // randomNumbersUsed.push(Math.random())
      var targetcol = Math.floor(Math.random() * ((ncol+scol)-scol)+scol);
      // randomNumbersUsed.push(Math.random())
      citizen.target.row = targetrow;
      citizen.target.col = targetcol;
    }
  }
  if (state == LEAVING) {
    if (hasArrived) {
      citizen.state = LEFT;
      if (citizen.origin == "Africas") {departedcitizens1 = departedcitizens1 + 1;};
      if (citizen.origin == "APAC") {departedcitizens2 = departedcitizens2 + 1;};
      if (citizen.origin == "Americas") {departedcitizens3 = departedcitizens3 + 1;};
      if (citizen.origin == "Europe") {departedcitizens4 = departedcitizens4 + 1;};
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
  var costStats = statistics[0];
  var revStats = statistics[1];
  if (citizen.infected == 1) {
    var timeSpentInfected = currentTime - citizen.timeInfected;
    if (citizen.origin == "Island") {
      statistics[0].count += mu * timeSpentInfected * 30000 * 1.7;
      //costCount += mu * timeSpentInfected * 30000 * 1.7;
    }
    if (citizen.origin == "Africas") {
      statistics[0].count += mu1 * timeSpentInfected * 30000 * 1.7;
      // costCount += mu1 * timeSpentInfected * 30000 * 1.7;
    }
    if (citizen.origin == "APAC") {
      statistics[0].count += mu2 * timeSpentInfected * 30000 * 1.7;
      // costCount += mu2 * timeSpentInfected * 30000 * 1.7;
    }
    if (citizen.origin == "Americas") {
      statistics[0].count += mu3 * timeSpentInfected * 30000 * 1.7;
      // costCount += mu3 * timeSpentInfected * 30000 * 1.7;
    }
    if (citizen.origin == "Europe") {
      statistics[0].count += mu4 * timeSpentInfected * 30000 * 1.7;
      // costCount += mu4 * timeSpentInfected * 30000 * 1.7;
    }
  }

  if (citizen.origin == "Africas") {
    if (timeOnIsland > 0) {
      statistics[1].count += lambda1 * timeOnIsland * gdp1 / (timeOnIsland+1);
      // revCount += lambda1 * timeOnIsland * gdp1;
    }
  }
  if (citizen.origin == "APAC") {
    if (timeOnIsland > 0) {
      statistics[1].count += lambda2 * timeOnIsland * gdp2 / (timeOnIsland+1);
      // revCount += lambda2 * timeOnIsland * gdp2;
    }
  }
  if (citizen.origin == "Americas") {
    if (timeOnIsland > 0) {
      statistics[1].count += lambda3 * timeOnIsland * gdp3 / (timeOnIsland+1);
      // revCount += lambda3 * timeOnIsland * gdp3;
    }
  }
  if (citizen.origin == "Europe") {
    if (timeOnIsland > 0) {
      statistics[1].count += lambda4 * timeOnIsland * gdp4 / (timeOnIsland+1);
      // revCount += lambda4 * timeOnIsland * gdp4;
    }
  }
}

function removeDynamicAgents() {
  for (plane of planes) {
    if (plane.type == "Africas" && plane.state == PLANNEDHOMING) {
      if (departingcitizens1 == departedcitizens1) {
        plane.state = HOMING;
        plane.target.row = 2;
        plane.target.col = 1;
        departingcitizens1 = 0;
        departedcitizens1 = 0;
      }
    }
    if (plane.type == "APAC" && plane.state == PLANNEDHOMING) {
      if (departingcitizens2 == departedcitizens2) {
        plane.state = HOMING;
        plane.target.row = 2;
        plane.target.col = 18;
        departingcitizens2 = 0;
        departedcitizens2 = 0;
      }
    }
    if (plane.type == "Americas" && plane.state == PLANNEDHOMING) {
      if (departingcitizens3 == departedcitizens3) {
        plane.state = HOMING;
        plane.target.row = 18;
        plane.target.col = 18;
        departingcitizens3 = 0;
        departedcitizens3 = 0;
      }
    }
    if (plane.type == "Europe" && plane.state == PLANNEDHOMING) {
      if (departingcitizens4 == departedcitizens4) {
        plane.state = HOMING;
        plane.target.row = 18;
        plane.target.col = 1;
        departingcitizens4 = 0;
        departedcitizens4 = 0;
      }
    }
  }

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
  if (automatedDataFetch == 0) {
    if (isRunning) {
      currentTime++;
      addDynamicAgents();
      updateDynamicAgents();
      removeDynamicAgents();
      // statistics[0].count = costCount;
      // statistics[1].count = revCount;
      exportData.push([statistics[0].count, statistics[1].count])
      // costCount = 0;
      // revCount = 0;
    }
  }
}

function exportDataFunction() {
  let csvContent = "data:text/csv;charset=utf-8," + exportData.map(e => e.join(",")).join("\n");
  var encodedUri = encodeURI(csvContent);
  var link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "my_data.csv");
  document.body.appendChild(link); // Required for FF

  link.click(); // This will download the data file named "my_data.csv".
}

function exportDataFunctionAutomated() {
  console.log("Evaluating..")
  numberOfRuns = Number(document.getElementById("NumberOfRuns").value);
  numberOfDataPoints = Number(document.getElementById("NumberOfDataPoints").value);

  // Initialize the array for the data to be exported
  for (i=1; i <= numberOfRuns; i++) {
    exportDataAutomated.push(["Run " + i + " Cost"]);
    exportDataAutomated.push(["Run " + i + " Revenue"]);
  }

  var i = 0;
  Math.seedrandom('hello.');
  while (i < numberOfRuns) {
    while (currentTime < numberOfDataPoints) {
      currentTime++;
      addDynamicAgents();
      updateDynamicAgents();
      removeDynamicAgents();

      exportDataAutomated[2*(i)].push(statistics[0].count);
      exportDataAutomated[2*(i)+1].push(statistics[1].count);
    }
    i++;
    redrawWindow();
  }

  // console.log(randomNumbersUsed)
  // randomNumbersUsed = [];

  let csvContent = "data:text/csv;charset=utf-8," + exportDataAutomated.map(e => e.join(",")).join("\n");
  var encodedUri = encodeURI(csvContent);
  var link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "my_data.csv");
  document.body.appendChild(link); // Required for FF

  link.click(); // This will download the data file named "my_data.csv".

  exportDataAutomated = [];
}
