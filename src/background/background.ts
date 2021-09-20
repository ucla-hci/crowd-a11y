// // TODO: background script
// // const NaturalLanguageUnderstandingV1 = require('ibm-watson/natural-language-understanding/v1');
// // const { IamAuthenticator } = require('ibm-watson/auth');

// // Example POST method implementation:
// async function postData(url = '', data = {}) {
//   // Default options are marked with *
//   const response = await fetch(url, {
//     method: 'POST', // *GET, POST, PUT, DELETE, etc.
//     mode: 'cors', // no-cors, *cors, same-origin
//     cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
//     credentials: 'same-origin', // include, *same-origin, omit
//     headers: {
//       'Content-Type': 'application/json',
//       'Authorization': 'Basic YXBpa2V5OndLOUFXTG9hRTFkODdtRTRDSGVfdXBsTlN1Smtqa1BpTUJXOU5vdVJlbng1'
//       // 'Content-Type': 'application/x-www-form-urlencoded',
//     },
//     redirect: 'follow', // manual, *follow, error
//     referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
//     body: JSON.stringify(data) // body data type must match "Content-Type" header
//   });
//   return response.json(); // parses JSON response into native JavaScript objects
// }

// chrome.runtime.onInstalled.addListener(async () => {
//   postData('https://api.us-east.natural-language-understanding.watson.cloud.ibm.com/instances/db9da5ba-bf8c-444e-b64a-ffdc988b0407/v1/analyze?version=2021-08-01', {
//   text: 'This morning was a typical morning for me.',
//   features: {
//     keywords: {
//       emotion: true,
//       sentiment: true,
//       limit: 2
//     }
//   }
// })
//   .then(data => {
//     console.log(data); // JSON data parsed by `data.json()` call
//   });
// })
