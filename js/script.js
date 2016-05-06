var map;
  var baseAPI = 'https://timothymartin76.cartodb.com/api/v2/sql?format=GeoJSON&q=SELECT * FROM zips_merge WHERE cartodb_id = '

  var layerGroup = new L.LayerGroup();

  var TopComplaintsChartData = [];
  TopComplaintsChartData[0]={};


  var TopComplaintsChart;


  function init(){
    // initiate leaflet map
    map = new L.Map('map', { 
      center: [40.7,-73.96],
      zoom: 11
    })
   var layer = L.tileLayer('http://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',{
  attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="http://cartodb.com/attributions">CartoDB</a>'




    }).addTo(map);
    var layerUrl = 'https://timothymartin76.cartodb.com/api/v2/viz/a32b1b30-139a-11e6-adeb-0ecfd53eb7d3/viz.json';
    var sublayers = [];




    var currentHover, newFeature = null;
    cartodb.createLayer(map, layerUrl)
      .addTo(map)
      .on('done', function(layer) {
        
        console.log("done");

        layer.getSubLayer(0).setInteraction(true);
        layer.on('featureOver', function(ev, pos, latlng, data){
          console.log("featureover");
          //check to see if it's the same feature so we don't waste an API call
          if(data.cartodb_id != currentHover) {
            layerGroup.clearLayers();
          
            $.getJSON(baseAPI + data.cartodb_id, function(res) {
          
              newFeature = L.geoJson(res,{
                style: {
                  "color": "#DCFF2E",
                  "weight": 3,
                  "opacity": 1
                }
              });
              layerGroup.addLayer(newFeature);
              layerGroup.addTo(map);
              updateSidebar(res.features[0].properties);
              updateChart(res.features[0].properties)

            })
            currentHover = data.cartodb_id;
          }
        })
        .on('featureOut', function(){
          layerGroup.clearLayers();
        })

        // // change the query for the first layer
        // var subLayerOptions = {
        //   sql: "SELECT * FROM ne_10m_populated_places_simple",
        //   cartocss: "#ne_10m_populated_places_simple{marker-fill: #F84F40; marker-width: 8; marker-line-color: white; marker-line-width: 2; marker-clip: false; marker-allow-overlap: true;}"
        // }
        // var sublayer = layer.getSubLayer(0);
        // sublayer.set(subLayerOptions);
        // sublayers.push(sublayer);


      })
      .on('error', function() {
        //log the error
      });
      }

      //from http://stackoverflow.com/questions/196972/convert-string-to-title-case-with-javascript
      // String.prototype.toProperCase = function () {
      //   return this.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
      // };

      function updateSidebar(f) {

        //first check if there is data
        if (f.zip == null) {
          $('.noData').show();
          $('.mainSidebar').hide();
        } else { 
          $('.noData').hide();
          $('.mainSidebar').show();
        }


        $('.zip').text(function(){
          return "Zip Code:  " + f.zip;
        });

       $('.borough').text(function(){
          return "Borough:  " + f.borough;
        });

		$('.total_jobs_filed').text(function(){
          return "Total Jobs Filed:  " + f.total_jobs_filed;
        });

       
        TopComplaintsChartData[0].key = "test";
        TopComplaintsChartData[0].values = 
          [
            { 
              "label" : "A1" ,
              "value" : f.a1
            } , 
            { 
              "label" : "A2" , 
              "value" : f.a2
            } , 
            { 
              "label" : "A3" , 
              "value" : f.a3
            } , 
            { 
              "label" : "NB" , 
              "value" : f.nb
            } 
          ]
        
       

       d3.select('#TopComplaintsChart svg')
      .datum(TopComplaintsChartData)
      .transition().duration(0)
      .call(TopComplaintsChart);

    

      }

//chart stuff
nv.addGraph(function() {
  TopComplaintsChart = nv.models.discreteBarChart()
      .x(function(d) { return d.label })    //Specify the data accessors.
      .y(function(d) { return d.value })
      //.staggerLabels(true)    //Too many bars and not enough room? Try staggering labels.
      .tooltips(false)        //Don't show tooltips
      .showValues(true)       //...instead, show the bar value right on top of each bar.
      .valueFormat(d3.format(".0f"))
      .width(222)
      .showYAxis(false)
      .margin({left:0,right:0})
      .color(['rgb(51,77,92)','rgb(69,178,157)','rgb(239,201,76)','rgb(226,112,63)']);
      ;

      TopComplaintsChart.xAxis
      .axisLabel('Job Types per Zip Code')

     

  // d3.select('#chart svg')
  //     .datum(exampleData)
  //     .transition().duration(500)
  //     .call(chart);

  nv.utils.windowResize( TopComplaintsChart.update);

  return TopComplaintsChart;
});


