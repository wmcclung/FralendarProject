//extra values of 00 at the end of YYYYMMDD
var eventfulDateString = "2018102500-2018103100";
var eventfulRadius = 1;
var eventfulCall = [];
var CORS = "https://cors-anywhere.herokuapp.com/";

//Api url - includes zip and date. date is set as a range to then get time of day we need to leverage the data in the pull. heroku to get around CORS permissions
// https://cors-anywhere.herokuapp.com/
var eventfulUrl = "https://api.eventful.com/json/events/search?";
var eventfulKey = "app_key=SbhFzbfzfXwhtkTg";
var eventfulApiCall =
  CORS +
  eventfulUrl +
  "location=" +
  zip +
  "&" +
  eventfulKey +
  "&date=" +
  eventfulDateString +
  "&" +
  "within=" +
  eventfulRadius +
  "&page_size=5&sort_order=popularity";

function getEventfulEvents() {
  eventfulApiCall =
    CORS +
    eventfulUrl +
    "location=" +
    zip +
    "&" +
    eventfulKey +
    "&date=" +
    eventfulDateString +
    "&" +
    "within=" +
    eventfulRadius +
    "&page_size=5&sort_order=popularity";
  //create an Ajax call
  $.ajax({
    type: "GET",
    url: eventfulApiCall
  }).then(function(response) {
    //log the result and specific paramters

    //log the object response. This feeds as an XML thus we need to JSON. PARSE
    //NEED TO PARSE RESPONSES BECAUSE ITS COMING IN AS XML
    eventfulCall = JSON.parse(response);
    for (let i = 0; i < eventfulCall.events.event.length; i++) {
      // variable holds the title of the events
      var eventTitle = eventfulCall.events.event[i].title;
      console.log(eventfulCall.events);
      //variable holds the name of venue
      var eventVenueName = eventfulCall.events.event[i].venue_name;

      //variable holds address of venue some events have a null postal code need to hide
      eventfulVenueAddress =
        eventfulCall.events.event[i].venue_address +
        " " +
        eventfulCall.events.event[i].city_name +
        "," +
        eventfulCall.events.event[i].region_abbr +
        " " +
        eventfulCall.events.event[i].postal_code;

      //Variable holds booking url

      eventfulBookingUrl = eventfulCall.events.event[i].venue_url;

      //variable holds venue location latitude
      eventfulLatitude = eventfulCall.events.event[i].latitude;

      //variable holds venue location longitude
      eventfulLongitude = eventfulCall.events.event[i].longitude;

      //variable holds venue start date and time

      eventfulStartTime = eventfulCall.events.event[i].start_time;

      //convert start date and time to Unix for weather api

      //convert eventfulStartTime to Unix
      var weatherTime = eventfulStartTime;
      weatherTime = eventfulStartTime
        .split(" - ")
        .map(function(date) {
          return Date.parse(date + "-0500") / 1000;
        })
        .join(" - ");

      //Dark Sky Api Format
      //Needs to be lat , long , Unix time (this includes both date and time in its value)
      // https://cors-anywhere.herokuapp.com/
      var apiKey = "1408b38a9701141fa75c8f041fca27e8",
        url = "https://api.darksky.net/forecast/",
        lati = eventfulLatitude,
        longi = eventfulLongitude,
        unixTime = weatherTime,
        dark_Sky_api_call =
          CORS + url + apiKey + "/" + lati + "," + longi + "," + unixTime;

      //Run the Weather Api

      $.ajax({
        type: "GET",
        url: dark_Sky_api_call
      }).then(function(response) {
        //log the queryURL

        //log the result and specific paramters

        var temp = response.currently.temperature + "°F";

        var weatherSummary = response.currently.summary;

        var precipProbability =
          response.currently.precipProbability * 100 + "%";

        // creates div to append all info of event along with needed attributes
        var parentEvent = $("<div>");
        parentEvent.attr({ id: "event #" + (i + 1) });
        parentEvent.addClass(["eventDiv", "row"]);

        // creates an img element along with needed attributes
        var imgEvent = $("<img>");
        imgEvent.attr({
          src:
            //  eventfulCall.events.event[i].image.medium.url
            "https://peopledotcom.files.wordpress.com/2017/09/surf-dog-6.jpg?w=768"
        });
        imgEvent.addClass("col-md-4 eventImg");

        //creating a div for the remaining 8 columns needed per bootstrap
        var divColumn = $("<div>");
        divColumn.addClass(["col-md-8", "info"]);

        //creaing a new row to insert Name of event
        var divRowName = $("<div>");
        divRowName.addClass(["row", "info"]);
        divColumn.append(divRowName);

        //creating a new row to insert time and date
        var divRowTime = $("<div>");
        divRowTime.addClass(["row", "info"]);
        divColumn.append(divRowTime);

        //creaing a new row to insert Venue Address
        var divRowAddress = $("<div>");
        divRowAddress.addClass(["row", "info"]);
        divColumn.append(divRowAddress);

        //creating a new row to insert book url
        var divRowBook = $("<div>");
        divRowBook.addClass(["row", "info"]);
        divColumn.append(divRowBook);

        //creating a new row to insert Weather Summary
        var divRowSummary = $("<div>");
        divRowSummary.addClass(["row", "info"]);
        divColumn.append(divRowSummary);

        //creating a new row to insert temp
        var divRowTemp = $("<div>");
        divRowTemp.addClass(["row", "info"]);
        divColumn.append(divRowTemp);

        //creating a new row to insert Chance of Rain
        var divRowPrecip = $("<div>");
        divRowPrecip.addClass(["row", "info"]);
        divColumn.append(divRowPrecip);

        //adding picture plus a new div to insert all other info
        parentEvent.append([imgEvent, divColumn]);

        $(".eventImg").css({ height: "200px" });

        // create span to append event name to from array
        var namespan = $("<div>");
        namespan.addClass("col-md-12");
        namespan.text("Event: " + eventfulCall.events.event[i].title);

        // append name to row
        $(divRowName).append(namespan);

        // span for date and time
        var timespan = $("<div>");
        timespan.addClass("col-md-12");
        timespan.text(
          "When: " + getTimeAndDate(eventfulCall.events.event[i].start_time)
        );

        //append to row
        $(divRowTime).append(timespan);

        // create span to append event address to from array
        var addressspan = $("<div>");
        addressspan.addClass("col-md-12");
        addressspan.text(
          eventfulCall.events.event[i].venue_address +
            " " +
            eventfulCall.events.event[i].city_name +
            "," +
            eventfulCall.events.event[i].region_abbr +
            " " +
            eventfulCall.events.event[i].postal_code
        );

        // append name to row
        $(divRowAddress).append(addressspan);

        // create span to append book value to from array
        var bookspan = $("<a>");
        bookspan.addClass("col-md-12");
        var bookBtn = $("<button>");
        bookspan.attr({
          href: eventfulCall.events.event[i].venue_url,
          target: "_blank"
        });
        bookBtn.html("Click here to buy tickets");
        bookspan.append(bookBtn);
        // append name to row
        $(divRowBook).append(bookspan);
        // append name to row
        $(divRowBook).append(bookspan);

        // create span to append weather summary value to from array
        var summaryspan = $("<div>");
        summaryspan.addClass("col-md-12");
        summaryspan.html("The Weather Will Be " + weatherSummary);
        // append name to row
        $(divRowSummary).append(summaryspan);

        // create span to append Temperature value to from array
        var tempspan = $("<div>");
        tempspan.addClass("col-md-12");
        tempspan.text("Temperature: " + temp);
        // append name to row
        $(divRowTemp).append(tempspan);

        // create span to append chance of rain value to from array
        var rainspan = $("<div>");
        rainspan.addClass("col-md-12");
        rainspan.text("There is a " + precipProbability + " chance of rain");
        // append name to row
        $(divRowPrecip).append(rainspan);

        $(".eventDisplay").append(parentEvent);

        $(".eventDiv").css({ border: "2px solid black", "margin-top": "5px" });

        //weather close tag
      });

      //for loop close tag
    }

    //format date and time to be front facing
    function getTimeAndDate(eventDate) {
      // variable will hold the year the event takes place
      var eventYear = eventDate.slice(0, 4);

      // variable will hold the month the event takes place
      var eventMonth = eventDate.slice(5, 7);

      // variable will hold the day the event takes place
      var eventDay = eventDate.slice(8, 10);

      //New date with US format
      eventDate = eventMonth + "/" + eventDay + "/" + eventYear;

      // this will get our hour the event takes place
      var sliceNum = eventDate.slice(11, 16);

      //variable to represent Am or Pm
      var am_pm = "";

      if (+eventDate.slice(11, 16) < 12) {
        am_pm = "am";
      } else {
        // reassign variable to 12hr format for hour
        sliceNum = +eventDate.slice(11, 16) - 12;
        am_pm = "pm";
      }

      // get the correct time format HH:MM
      var correctTimeFormat = sliceNum + eventDate.slice(11, 16);

      //Variable for correct date format MM/DD/YYYY at HH:MM
      var correctDateFormat = eventDate + " at " + correctTimeFormat + am_pm;
      return correctDateFormat;
    }

    //document close tag
  });
}
