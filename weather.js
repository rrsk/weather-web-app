      var Data={};
      var pos;
      var marker;
      var list = {"clear-day":"CLEAR_DAY", "clear-night":"CLEAR_NIGHT", "partly-cloudy-day":"PARTLY_CLOUDY_DAY","partly-cloudy-night":"PARTLY_CLOUDY_NIGHT", "cloudy":"CLOUDY", "rain":"RAIN", "sleet":"SLEET", "snow":"SNOW", "wind":"WIND","fog":"FOG"}
      var skycons = new Skycons({"color": "black"});
      var ctx = document.getElementById("myChart").getContext('2d');
      var chart;
      var config;

      var app = new Vue({
          el: '#info',
          data: {
            temp: 'Current Temp.',
            date: 'Date',
            summary : 'Summary'
          }
        });  

      function initMap() {   

        var map = new google.maps.Map(document.getElementById('map'), {
          zoom: 5,
          center: {lat: 28.7041, lng: 77.1025}
        });


        

        map.addListener('click', function(e) {
          placeMarkerAndPanTo(e.latLng, map);
        });
      }



      function placeMarkerAndPanTo(latLng, map) {
        if(marker) marker.setMap(null);
        marker = new google.maps.Marker({
          position: latLng,
          map: map
        });

        attachLatLng(marker,latLng,map);
        map.panTo(latLng);
      }

      function attachLatLng(mark,l,m){
       var _lat = mark.getPosition().lat()
       var _lng = mark.getPosition().lng()
        var clientID= 'e9513f260b2bb4cfff509d2238e813fa';
        var endPoint= 'https://api.darksky.net/forecast/';
        var url = endPoint + clientID + '/' +_lat+',' +_lng;

        function AjaxRequest(url , callback) {
            $.ajax({url: url, dataType: 'jsonp', success: function (data){
                callback(data);
            }})
        };

        AjaxRequest(url, function (d) {
             Data = d;
             console.log(Data);
             type_temp = d.currently.icon;
             setContent();
             updateChart(d);
        });
        
      }


        function setContent(){
            skycons.set("icon1", Skycons[list[Data.currently.icon]]);
            skycons.play();
            app.summary = Data.currently.summary;
            app.temp = ((Data.currently.temperature-32)*5/9).toFixed(2) + ' '+String.fromCharCode(176)+'C';
            app.date = Date(Data.currently.time).slice(0,16)
        }


        function updateChart(response) {
    if (chart === undefined) {
        config = {
            type: 'line',
            data: {
                labels: getNextDays(),
                datasets: [ {
                    label: 'Temperature Max.',
                    backgroundColor: "rgba(255,0,0,0.6)",
                    borderColor: "rgba(255,0,0,0.6)",
                    data: getMaxTempData(response),
                    fill: false
                },
                {
                    label: 'Temperature Min',
                    backgroundColor: "rgba(0,0,255,0.6)",
                    borderColor: "rgba(0,0,255,0.6)",
                    data: getMinTempData(response),
                    fill: false
                }]
            },
            options: {
                responsive: true,
                title:{
                    display:false,
                    text:''
                },
                tooltips: {
                    mode: 'index',
                    intersect: false,
                },
                hover: {
                    mode: 'nearest',
                    intersect: true
                },
                scales: {
                    xAxes: [{
                        display: true,
                        scaleLabel: {
                            display: true,
                            labelString: 'Days'
                        }
                    }],
                    yAxes: [{
                        display: true,
                        scaleLabel: {
                            display: true,
                            labelString: 'Temperature (in Fahrenheit)'
                        }
                    }]
                }
            } 
        };
        chart = new Chart(ctx, config);
    } else {
        chart.destroy();
        config.data.datasets[0].data = getMaxTempData(response);
        config.data.datasets[1].data = getMinTempData(response);
        chart = new Chart(ctx,config);
    }
}

function getMaxTempData(response) {
    var tempArr = [];
    //console.log(response);
    for (let i=0; i < 7; ++i) {
        var day = response.daily.data[i];
        tempArr.push(day.temperatureHigh);
    }

    return tempArr;
}

function getMinTempData(response) {
    var tempArr = [];
    //console.log(response);
    for (let i=0; i < 7; ++i) {
        var day = response.daily.data[i];
        tempArr.push(day.temperatureLow);
    }

    return tempArr;
}

function getNextDays() {
    var today = new Date();
    var idx = today.getDay();

    var days = [];
    switch(idx) {
        case 1: days = ['Mon','Tue','Wed','Thurs','Fri','Sat','Sun'];
                break;
        case 2: days = ['Tue','Wed','Thurs','Fri','Sat','Sun','Mon'];
                break;
        case 3: days = ['Wed','Thurs','Fri','Sat','Sun','Mon','Tue'];
                break;
        case 4: days = ['Thurs','Fri','Sat','Sun','Mon','Tue','Wed'];
                break;
        case 5: days = ['Fri','Sat','Sun','Mon','Tue','Wed','Thurs'];
                break;
        case 6: days = ['Sat','Sun','Mon','Tue','Wed','Thurs','Fri'];
                break;
        case 7: days = ['Sun','Mon','Tue','Wed','Thurs','Fri','Sat'];
                break;
    }

    return days;
}