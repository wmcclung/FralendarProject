//Object which holds everyone's freetime
var freetime = {};
var userFreeTime = {};

// Array for getting current day and next 6 days
var daysOfWeek = [
    moment().format("dddd"),
    moment().add(1, "days").format("dddd"),
    moment().add(2, "days").format("dddd"),
    moment().add(3, "days").format("dddd"),
    moment().add(4, "days").format("dddd"),
];

//array for getting current date and next 6 dates
var dayNum = [
    moment().date(),
    moment().add(1, "days").date(),
    moment().add(2, "days").date(),
    moment().add(3, "days").date(),
    moment().add(4, "days").date(),
];

var timeStamps = [6, 12, 18]

// array for out button value names
var timeOfDay = ["Morning", "Afternoon", "Night"]


// creating a div to append all days to (Sunday-Saturday)
var firstRowDiv = $("<div>")
firstRowDiv.attr({ "id": "calanderWeek" })
firstRowDiv.addClass("row")

// we have this slot because bootstrap requires 12 column slots (7 days * 1 slot each ) = 4 remaing slots
firstRowDiv.prepend(`<div class="col-md-1"></div>`);

// for loop to dynamically create the days along with any added attr
for (var i = 0; i < daysOfWeek.length; i++) {
    var dayDiv = $("<div>")
    dayDiv.attr({ "id": daysOfWeek[i] })
    dayDiv.addClass(["week", "text-center", "col-md-2"])
    dayDiv.text(daysOfWeek[i])

    firstRowDiv.append(dayDiv);
}
// Same as other div added above, we now have 12 column required per bootstrap
firstRowDiv.append(`<div class="col-md-1"></div>`)

// append this row to html doc
$(".calendarHTML").append(firstRowDiv);

// creating second row for our dates/buttons along with attr
var secondRowDiv = $("<div>")
secondRowDiv.attr({ "id": "secondRow" })
secondRowDiv.addClass(["row", "text-center"])

// With 4 slot remaing in columns this div will be used for calendar purposes
secondRowDiv.prepend(`<div class="col-md-1"></div>`)

// Loop to dynamically create of dates

for (var j = 0; j < dayNum.length; j++) {

    var dayOfTheWeek = $("<div>");
    dayOfTheWeek.addClass(["day", "col-md-2"]);
    // this will dynamically give us text for current day + next 6 days
    dayOfTheWeek.text(dayNum[j]);

    //loop to generate the 3 buttons in our dates
    for (var k = 0; k < 3; k++) {
        var btn = $("<button>");
        btn.addClass(["btn", "btn-block", "calendar-btn"]);
        // Line will output
        // id : "Specific Day + Specific Time"
        // value: 0 initial starting value
        // data-unix: Specific date with specific time of day
        btn.attr({
            "id": daysOfWeek[j] + timeOfDay[k],
            "value": 0,
            "data-unix": moment().startOf("day").add(j, "days").add(timeStamps[k], "hours").format()
        });

        // will display the time of day (Morning, Afternoon, Night)
        btn.text(timeOfDay[k]);
        dayOfTheWeek.append(btn);
    }
    secondRowDiv.append(dayOfTheWeek);
}
var eventRow = $("<div>")
eventRow.addClass(["row", "eventDisplay"]);

// again extra 2 column can do whatever with this
secondRowDiv.append(`<div class="col-md-1"></div>`)

//append to html doc
$(".calendarHTML").append(secondRowDiv);

// listener event for buttons 
$(".calendar-btn").on("click", function () {
    var value = $(this).val();
    // changes value on button to "1" signifying they are available
    if (value === "0" || value === "2") {
        $(this).val("1")
        $(this).removeClass("btn-danger")
        $(this).addClass("btn-success");
    }
    // changes value on button to "2" signifying they are unavailables
    if (value === "1") {
        $(this).val("2")
        $(this).removeClass("btn-success")
        $(this).addClass("btn-danger")
    }
});

function updateCalendar() {
    for (var key in userFreeTime) {
        if (userFreeTime[key] == 1) {
            $(`.btn .btn-block .calendar-btn .` + key).val("1")
            $(`.` + key).removeClass("btn-danger")
            $(`.` + key).addClass("btn-success");
        }
    }
}

//Gets the User Calendar when authstatechanges from the login page
function getUserCalendar() {
    firebase.database().ref(`/freetime/${user.ID}`).once("value").then(function (snap) {
        userFreeTime = {};
        userFreeTime = snap.val();
        getUserFreeTimeArray();
        updateCalendar();
    });
};

//This sets a time to the first time available of the first day the user logs in so they then can write to the calendar in the future.
function addNewUserToCalendar() {
    var dummyTime = moment().startOf("day").add(0, "days").add(timeStamps[0], "hours").format()
    userFreeTime = { [dummyTime]: "0" }
    firebase.database().ref(`/freetime/${user.ID}`).set(userFreeTime);
};

//Adds a listener to freetime so when new freetime is selected it pulls to the object
firebase.database().ref("/freetime/").on("value", function (snap) {
    freetime = snap.val();
    getUserFreeTimeArray();
});

$(".calendar-btn").on("click", function () {
    //Pulls the value and the ID from each button to be used in firebase
    var buttonTime = $(this).val();
    //This adds the time as the key in firebase
    var attribute = $(this).attr(`data-unix`);
    freetime[user.ID] = {};
    userFreeTime[attribute] = buttonTime;
    freetime[user.ID] = userFreeTime;
    firebase.database().ref(`/freetime/`).set(freetime);
    $(".eventbtn").empty();
    getUserFreeTimeArray();
});

//Reads the freetime object and checks if there are any times which line up
function getUserFreeTimeArray() {
    $(".eventbtn").empty();
    var friendFreeTime = {};
    var friendFreeTimeArray = [];
    var writtenFreeTime = [];
    var userFreeTimeArray = [];

    //Creates a user array for the user's free time which then we compare to the other user's free time.
    for (var key in userFreeTime) {
        if (userFreeTime[key] === "1") {
            userFreeTimeArray.push(key);
        };
    };
    //Populates a list of other user's free time while making sure it doesn't select your user ID.
    for (var key in freetime) {
        if (key !== user.ID) {
            friendFreeTime = freetime[key];
        };
        for (var j in friendFreeTime) {
            if (friendFreeTime[j] === "1") {
                friendFreeTimeArray.push(j);
            };
        };

        for (var i = 0; i < friendFreeTimeArray.length; i++) {
            //This checks if the free time that you've selected lines up with any one of your friends free times
            //The and statment checks if that button has already been written to the dom
            if (userFreeTimeArray.includes(friendFreeTimeArray[i]) && !writtenFreeTime.includes(friendFreeTimeArray[i])) {
                writtenFreeTime.push(friendFreeTimeArray[i]);
                var eventBtn = $("<button>")
                eventBtn.addClass("SimilarFreeTime")
                eventBtn.attr({
                    value: friendFreeTimeArray[i].slice(0, 16)
                })

                // variable will hold the month the event takes place
                var eventMonth = friendFreeTimeArray[i].slice(5, 7);

                // variable will hold the day the event takes place
                var eventDay = friendFreeTimeArray[i].slice(8, 10);
                var eventHour = friendFreeTimeArray[i].slice(11, 13);
                var eventMin = friendFreeTimeArray[i].slice(14, 16);

                eventBtn.text(eventMonth + "/" + eventDay + " " + eventHour + ":" + eventMin)
                $(".eventbtn").append(eventBtn)
            };
        };
    };
};
