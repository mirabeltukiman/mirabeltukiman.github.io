function plotGraph() {
  // set global variables
  const limit = 10000; // How many points can be on the graph before sliding occurs
  const refreshInterval = 100; // Time between refresh intervals

  // set functions to retrieve
  function getData1() {
  	return statistics[0].count;
  	}
  function getData2() {
  	return statistics[1].count;
  	}

  // set chart layout
  const layout1 = {
  	paper_bgcolor: 'rgba(0,0,0,0)',
  	plot_bgcolor: 'rgba(0,0,0,0)',
  	height: 300
  };


  // plot all charts
  Plotly.newPlot('chart1',[{
  	y:[0],
  	mode:'lines',
    name:'Cost',
  	line: {
  		color: 'rgb(255,0,255)',
  		width: 3 }
  	}, {
  		y:[0],
  		mode:'lines',
      name:'Revenue',
  		line: {
  			color: 'rgb(255,0,0)',
  			width: 3 }
  	}], layout1);

  // set refresh interval and graph limit
  var cnt = 0;
  setInterval(function(){
  	if (isRunning == true) {
  		Plotly.extendTraces('chart1',{ y:[[getData1()], [getData2()]]}, [0,1]);
  		cnt++;
  		if(cnt > limit) {
  			Plotly.relayout("chart1", {
  				xaxis: {
  					range: [cnt-limit,cnt]
  					}
  				});
  			}
  }}, refreshInterval);
}
