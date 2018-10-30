//Create user object - Must be on global scope so it can be accessed by other script pages
var user = {};
var userList = {};
var newUser = false;

// Initialize Firebase
var config = {
    apiKey: "AIzaSyDO5T58hrlOuSJhKNvgOjeXnrvqWgT41MQ",
    authDomain: "fralendar.firebaseapp.com",
    databaseURL: "https://fralendar.firebaseio.com",
    projectId: "fralendar",
    storageBucket: "fralendar.appspot.com",
    messagingSenderId: "391251924818"
};
firebase.initializeApp(config);

//Login Event
$(".signin").on("click", e => {
    //Pulls the user input
    const email = $(".email").val();
    const pass = $(".password").val();
    const auth = firebase.auth();
    //If statement to validate user input
    if (email.includes("@") && email.includes(".") && pass.length > 5) {
        //Sign in
        const promise = auth.signInWithEmailAndPassword(email, pass);
        //If error, log it to the console
        promise.catch(e => console.log(e.message));
        //TODO: If error make it modolo instead of console logging it
        clearInputForms();
        //If the validation wasn't correct
    } else {
        showLoginModal();
        clearInputForms();
    }
});

//Signup Event
$(".register").on("click", e => {
    //Pulls the user input
    const email = $(".email").val();
    const pass = $(".password").val();
    //If statement to validate user input
    if (email.includes("@") && email.includes(".") && pass.length > 5) {
        //Sign in
        const promise = firebase.auth().createUserWithEmailAndPassword(email, pass);
        //If error, log it to the console
        promise.catch(e => console.log(e.message));
        //TODO: If error make it modolo instead of console logging it
        newUser = true;
        clearInputForms();

        //If the validation wasn't correct
    } else {
        showLoginModal();
        clearInputForms();
    }
});

$(".logout").on("click", e => {
    //Calls the signout function for firebase
    firebase.auth().signOut();
});

$(".submit-name-zip").on("click", e => {
    //Pulls the user input
    user.name = $(".name-input").val();
    user.zip = $(".zip-input").val();
    var zipCheck = user.zip;
    var zipNumCount = 0;
    addNewUserToCalendar();
    //Input validation for the zip code
    //First make an array with the zip code
    for (var i = 0; i < user.zip.length; i++) {
        //Get each number
        var zipChar = zipCheck.charAt(i);
        //Turn Into a Char Code for input validation
        if (zipChar >= 0 && zipChar <= 9) {
            zipNumCount++;
        }
    }
    //Checks if the value is 5 numbers long. If it is not it will not continue to firebase and it will stay at the current screen.
    //It needs to be exactly 5 numbers as that is what we are using to pull the API from
    if (zipNumCount === 5 && zipCheck.length === 5) {
        //Maybe not the best pratice having it set the whole user log again, but it's what I can think of now
        $.when(
            firebase
                .database()
                .ref("users/" + user.ID)
                .set({
                    name: user.name,
                    email: user.email,
                    ID: user.ID,
                    zip: user.zip
                })
        ).done(getNameAndZip());
        $(".calendarHTML").show();
    } else {
        showNameZipModal();
    }
});

$(".login-close").on("click", function () {
    closeModal();
});

$(".name-zip-close").on("click", function () {
    closeModal();
});

//Add authentication listener
//onAuthStateChanged listens for login or logout
firebase.auth().onAuthStateChanged(firebaseUser => {
    //If there is a user logged in then firebaseUser is true.
    //Need this if statement because the onAuthStateChanged also runs when a user logs out.
    if (firebaseUser) {
        //Important to grab this before doing things below so it can knows where to search in firebase for the user info
        user.ID = firebaseUser.uid;
        getUserData();
        getUserCalendar();
        //Checks if the user has a name or zip in firebase
        //If they do not then likely new users and writes the data to firebase and asks for name and zip
        //Needs undefined if they are a new user


        //If user account already has a name then populate the User List
        if (user.name !== undefined) {
            getUserList();
        }
        //Shows the div of the login success box
        $(".login-success").show();
        $(".login-form").hide();
        $(".eventDisplay").show();
        //shows calendar
        $(".calendarHTML").show();
        $("#calendar-card").show();
        $("#fralendar-welcome").hide();
        $("#fralendar-intro").hide();
        $(".Calendar").show();
        $(".eventbtn").show();
        //Displays the username on screen
        displayUserName();
        if (newUser === true) {
            //Needs to pull write the user data and return the values before moving to the name & zip
            //The Name and zip then go on to generate the user list. If the user data is not written before then it will cause the user list to wipe
            //This is because the object is while we are waiting for firebase to send back data for it to be written locally
            writeUserData(firebaseUser);
            getNameAndZip()
            $(".calendarHTML").hide();
        }
    } else {
        //This runs when no user is logged in
        console.log("Logged Out");
        $(".login-success").hide();
        $(".input-name-zip").hide();
        $(".login-form").show();
        //hide calendar on logout
        $(".calendarHTML").hide();
        $(".eventDisplay").hide();
        $(".eventDisplay").hide();
        $("#calendar-card").hide();
        $("#fralendar-welcome").show();
        $("#fralendar-intro").show();
        $(".Calendar").hide();
        $(".eventbtn").hide();
        //Clears the user object to show that they logged out
        user = {};
        //This updates the text fields so if the user logs out the registers again it shows null
        clearNameDisplay();
    }
});

function getNameAndZip() {
    if (user.name === null || user.zip === null || user.name === undefined) {
        $(".input-name-zip").show();
    } else {
        //This will run when there is both a user.name and a user.zip
        $(".input-name-zip").hide();
        getUserList();
    }
}

function getUserData() {
    //Gets the user info from firebase using the user ID
    return firebase
        .database()
        .ref(`users/${user.ID}`)
        .once("value")
        .then(function (snap) {
            user.email = snap.val().email;
            user.name = snap.val().name;
            user.zip = snap.val().zip;
            getNameAndZip();
        });
}

//Populates the user profile in the window & database when a new user registers
function writeUserData(firebaseUser) {
    //Updates the new user as they will be written into the database
    newUser = false;
    user.ID = firebaseUser.uid;
    user.email = firebaseUser.email;
    firebase
        .database()
        .ref(`users/${user.ID}`)
        .set({
            email: user.email,
            ID: user.ID
        });
}

function displayUserName() {
    firebase
        .database()
        .ref(`users/${user.ID}`)
        .on("value", function (snap) {
            $(".name-display").html(snap.val().name);
            $(".zip-display").html(snap.val().zip);
        });
}

function clearNameDisplay() {
    $(".name-display").html(``);
    $(".zip-display").html(``);
}

function clearInputForms() {
    //Clears the input forms
    $(".email").val(``);
    $(".password").val(``);
}

//Creates a list of all the users in the system
//The key: value pair is userID: name
function getUserList() {
    firebase
        .database()
        .ref("/userList/")
        .once("value", function (snap) {
            var currentID = user.ID;
            var currentName = user.name;
            var obj = snap.val();
            userList[currentID] = currentName;
            for (var key in obj) {
                if (key != currentID) {
                    var otherUserID = key;
                    userList[otherUserID] = obj[otherUserID];
                }
            }
            writeUserList(userList);
        });
}

//Writes the above userList to the database
function writeUserList(userList) {
    firebase
        .database()
        .ref("/userList/")
        .set(userList);
}

function showLoginModal() {
    $(".login-modal").show();
}

function showNameZipModal() {
    $(".name-zip-modal").show();
}

function closeModal() {
    $(".modal").hide();
}

$(".login-success").hide();
$(".input-name-zip").hide();
