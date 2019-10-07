const CLIENT_ID = '91848949074-ak770p82b4f5f47dblvhrjufk1s520a4.apps.googleusercontent.com';
// const API_KEY = 'AIzaSyCGZe93pgC6w1uTmdeKym2qfw9jV8oHZmE';
const spreadsheetId = '1WgXsP-wa3Q2dj84R827QIh0-kElP-2_u6_vkPkkR8Cc';

const DISCOVERY_DOCS = ["https://sheets.googleapis.com/$discovery/rest?version=v4"];
const SCOPES = "https://www.googleapis.com/auth/spreadsheets";

const authorizeButton = document.getElementById('authorize_button');
const signoutButton = document.getElementById('signout_button');
const lottery = document.getElementById('lottery')

function handleClientLoad() {
    gapi.load('client:auth2', initClient);
}

function initClient() {
    gapi.client.init({
        // apiKey: API_KEY,
        clientId: CLIENT_ID,
        discoveryDocs: DISCOVERY_DOCS,
        scope: SCOPES
    }).then(function () {
        // Listen for sign-in state changes.
        gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);

        // Handle the initial sign-in state.
        updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
        authorizeButton.onclick = handleAuthClick;
        // signoutButton.onclick = handleSignoutClick;
    }, function (error) {
        console.log(JSON.stringify(error, null, 2));
    });
}

/**
 *  Called when the signed in status changes, to update the UI
 *  appropriately. After a sign-in, the API is called.
 */
function updateSigninStatus(isSignedIn) {
    if (isSignedIn) {
        authorizeButton.style.display = 'none';
        // signoutButton.style.display = 'block';
        lottery.style.display = 'block';
    } else {
        authorizeButton.style.display = 'block';
        // signoutButton.style.display = 'none';
        lottery.style.display = 'none';
    }
}

/**
 *  Sign in the user upon button click.
 */
function handleAuthClick(event) {
    gapi.auth2.getAuthInstance().signIn();
}

/**
 *  Sign out the user upon button click.
 */
function handleSignoutClick(event) {
  gapi.auth2.getAuthInstance().signOut();
}

function saveToGoogleSheets(userData) {
  try {
  console.log('saving: ', userData)
  var values = [
    [
      userData.id,
      userData.name,
      userData.phone,
      userData.telegram,
      userData.role,
      new Date(),
      userData.gift
    ],
  ];
  var body = {
    values: values
  };
  console.log(values)

    gapi.client.sheets.spreadsheets.values.append({
      spreadsheetId: spreadsheetId,
      range: 'Sheet1',
      valueInputOption: 'RAW',
      insertDataOption: 'INSERT_ROWS',
      resource: body
    }).then((response) => {
      var result = response.result;
      console.log(`${result.updates.updatedCells} cells appended.`)
    }).catch(error => {
      console.error(error);
    });
  } catch (e) {
    console.error(e);
  }
}