// let placeholder = document.getElementById('simplebox-placeholder');

// console.log("1");

// while (!placeholder) {
//     placeholder = document.getElementById('simplebox-placeholder');
// }

// console.log("2");

// placeholder.innerHTML = "test";

// let counter = 0;

// let observer = new MutationObserver((mutations) => {
//     if (document.getElementById('simplebox-placeholder')) {
//         console.log("It's in the DOM!");
//         document.getElementById('simplebox-placeholder').innerHTML = "test";
//         counter += 1;
//     }

//     if (document.getElementById('contenteditable-root')) {
//         console.log("It's in the DOM!");
//         document.getElementById('contenteditable-root').innerHTML = "test";
//         counter += 1;
//     }

//     if (counter == 2) {
//         observer.disconnect();
//     }
//   })
  
//   observer.observe(document, {
//       childList: true
//     , subtree: true
//     , attributes: false
//     , characterData: false
//   })

//   // observer.disconnect();

// problem: navigation -> does not show up

// var video_id = window.location.search.split('v=')[1];
// var ampersandPosition = video_id.indexOf('&');
// if(ampersandPosition != -1) {
//   video_id = video_id.substring(0, ampersandPosition);
// }

// const { getSubtitles } = require('youtube-captions-scraper');
 
// //Get Subtitles for Video
// getSubtitles({
//   videoID: 'qPix_X-9t7E', // youtube video id
// }).then(captions => {
//   console.log(captions);
// });

// import { getSubtitles } from 'youtube-captions-scraper';
 
// getSubtitles({
//   videoID: 'qPix_X-9t7E', // youtube video id
//   lang: 'en' // default: `en`
// }).then(captions => {
//   console.log(captions);
// });

// const Http = new XMLHttpRequest();
// const url='https://video.google.com/timedtext?lang=en&v=qPix_X-9t7E';
// Http.open("GET", url);
// Http.send();

// var response;

// Http.onreadystatechange = function() {
//     if(this.readyState==4 && this.status==200) {
//         response = Http.responseXML;
//         console.log(response);
//     }
// }

async function sendRequest() {
    const Http = new XMLHttpRequest();
    const url='https://video.google.com/timedtext?lang=en&v=qPix_X-9t7E';
    Http.open("GET", url);
    Http.send();

    if (Http.readyState === XMLHttpRequest.DONE) {
        return Http;
    }

    let res;
    const p = new Promise((r) => res = r);
    Http.onreadystatechange = () => {
        if (Http.readyState === XMLHttpRequest.DONE) {
            res(Http);
        }
    }
    return p;
}

const keyword_extractor = require("keyword-extractor");

var captions = [];
var caption_string = "";

async function scrapeCaptions() {
    const response = await sendRequest();
    const transcript_children = response['responseXML'].children[0].children;

    for (let i = 0; i < transcript_children.length; i++) {
        const text = transcript_children[i].textContent;
        caption_string += (text + " ");
        const start = transcript_children[i].attributes[0].value;
        const dur = transcript_children[i].attributes[1].value;
        const keywords = keyword_extractor.extract(text, {
            language:"english",
            remove_digits: false,
            return_changed_case: false,
            remove_duplicates: true,
            return_chained_words: true
        });
        captions.push({start: start, dur: dur, text: text, keywords: keywords});
    }
}


/*********/
// Scrape YouTube Comments
import ytcm from 'yt-comment-scraper'

const payload = {
  videoId: "qPix_X-9t7E", // Required
  continuation: "",
  sortByNewest: false,
  mustSetCookie: false,
  httpsAgent: {},
}

ytcm.getComments(payload).then((data) =>{
    console.log("comments!!")
    console.log(data);
}).catch((error)=>{
    console.log(error);
});

/*********/
// scrapeCaptions();
// console.log(captions);
// console.log(caption_string);
// const NaturalLanguageUnderstandingV1 = require('ibm-watson/natural-language-understanding/v1');
// const { IamAuthenticator } = require('ibm-watson/auth');

// function extractKeywords(text) {
//   const naturalLanguageUnderstanding = new NaturalLanguageUnderstandingV1({
//     version: '2021-08-01',
//     authenticator: new IamAuthenticator({
//       apikey: 'wK9AWLoaE1d87mE4CHe_uplNSuJkjkPiMBW9NouRenx5',
//     }),
//     serviceUrl: 'https://api.us-east.natural-language-understanding.watson.cloud.ibm.com/instances/db9da5ba-bf8c-444e-b64a-ffdc988b0407',
//   });

//   const analyzeParams = {
//     'text': text,
//     'features': {
//       'keywords': {
//         'emotion': true,
//         'sentiment': true,
//         'limit': 10,
//       },
//     },
//   };

//   naturalLanguageUnderstanding.analyze(analyzeParams)
//     .then(analysisResults => {
//       console.log(JSON.stringify(analysisResults, null, 2));
//     })
//     .catch(err => {
//       console.log('error:', err);
//     });
// }

async function postData(url = '', data = {}) {
  // Default options are marked with *
  const response = await fetch(url, {
    method: 'POST', // *GET, POST, PUT, DELETE, etc.
    mode: 'cors', // no-cors, *cors, same-origin
    cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
    credentials: 'same-origin', // include, *same-origin, omit
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Basic YXBpa2V5OndLOUFXTG9hRTFkODdtRTRDSGVfdXBsTlN1Smtqa1BpTUJXOU5vdVJlbng1'
      // 'Content-Type': 'application/x-www-form-urlencoded',
    },
    redirect: 'follow', // manual, *follow, error
    referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
    body: JSON.stringify(data) // body data type must match "Content-Type" header
  });
  return response.json(); // parses JSON response into native JavaScript objects
}

var keywords;

scrapeCaptions().then(() => {
    console.log(captions);
    console.log(caption_string);

    postData('https://api.us-east.natural-language-understanding.watson.cloud.ibm.com/instances/db9da5ba-bf8c-444e-b64a-ffdc988b0407/v1/analyze?version=2021-08-01', {
      text: caption_string,
      features: {
        keywords: {
          emotion: true,
          sentiment: true,
          limit: 10
        }
      }
    })
    .then(data => {
      // JSON data parsed by `data.json()` call
      keywords = data["keywords"];
      for (let i in keywords) {
        keywords[i]["timestamps"] = [];
        for (let j in captions) {
          if (captions[j]["text"].includes(keywords[i]["text"])) {
            keywords[i]["timestamps"].push(captions[j]["start"]);
          }
        }
      }
      console.log('KEYWORDS!!');
      console.log(keywords);
    });

    // extractKeywords(caption_string);

    // const keywords = keyword_extractor.extract(caption_string, {
    //     language:"english",
    //     remove_digits: false,
    //     return_changed_case: false,
    //     remove_duplicates: true,
    //     return_chained_words: false
    // });

    // console.log(keywords);
})



// async function myFunc() {
//     //Get full transcription as one string
//   const subtitles = await getSubtitlesContent({ videoID: video_id });
  
//   let youtubeCaptions = new YoutubeCaptions(video_id /*youtube video id*/);
  
//   //retrieve caption tracks
//   let captionTracks = await youtubeCaptions.getCaptionTracks();

//   console.log(captionTracks);
  
//   // //retrieve subtitles by language
//   // let subtitles = await youtubeCaptions.getSubtitles('en' /*optional language*/);
// }

// myFunc();

// var progressBar = document.getElementsByClassName("ytp-play-progress ytp-swatch-background-color");
// console.log(progressBar[0]["style"].cssText);
// console.log("!!!!");
// console.log(progressBar);

// observe the progress bar

// Select the node that will be observed for mutations
const progressBar = document.getElementsByClassName("ytp-play-progress ytp-swatch-background-color")[0];

// Options for the observer (which mutations to observe)
const config = { attributes: true, childList: true, subtree: true };

// Callback function to execute when mutations are observed
var videoContainer = document.getElementsByClassName("html5-video-container")[0];
var floatCard;

const callback = function(mutationsList, observer) {
    // Use traditional 'for loops' for IE 11
    for(const mutation of mutationsList) {
        if (mutation.type === 'childList') {
            console.log('A child node has been added or removed.');
        }
        else if (mutation.type === 'attributes') {
            console.log('The ' + mutation.attributeName + ' attribute was modified.');
            console.log(progressBar["style"].transform);
            if (parseFloat(progressBar["style"].transform.substring(7)) > 0.1084 &&
                parseFloat(progressBar["style"].transform.substring(7)) < 0.123 && videoContainer.childElementCount == 1) {
                  floatCard = document.createElement("DIV"); 
                  floatCard.setAttribute('style', 'position: absolute; z-index: 2; height: 7em; width: 15%; margin-top: 45%; margin-left: 3%; background-color: #E5E5E5; border-radius: 0.5em;');
                  // floatCard.class = 'overlay';             
                  floatCard.innerHTML = `<p style="color: #000000; margin-left: 8%; margin-top: 10%;">Write a quick comment on <br> what you see to help people!</p>
                  <button style="font-size: 10px; margin-left: 78%; margin-top: 2%" id="go-button">Go</button>`; 
                  videoContainer.appendChild(floatCard);
                  const goButton = document.getElementById("go-button");
                  goButton.onclick = function(e) {
                    window.scrollTo(0, 1150);
                  }
            }
            if ((parseFloat(progressBar["style"].transform.substring(7)) <= 0.1084 ||
                parseFloat(progressBar["style"].transform.substring(7)) >= 0.123) && videoContainer.childElementCount == 2) {
                  videoContainer.removeChild(floatCard);
            }
        }
    }
};

// Create an observer instance linked to the callback function
const new_observer = new MutationObserver(callback);

// Start observing the target node for configured mutations
new_observer.observe(progressBar, config);

// end

function convertToMinSecond(timestamp_string) {
  console.log(timestamp_string);
  var timestamp_float = parseFloat(timestamp_string);
  var minutes = Math.floor(timestamp_float / 60);
  var seconds = Math.round(timestamp_float - minutes * 60);
  return String(minutes) + ":" + String(seconds);   // The function returns the product of p1 and p2
}

var comments;
var box;

let observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {

      // if (mutation.type === 'attributes' ) {
      //   if (mutation.target.id === 'contenteditable-root') {
      //     console.log(mutation.target);
      //     if (mutation.attributeName === 'textContent') {
      //       console.log(mutation.target);
      //       var box = document.getElementById('my-cool-node');
      //       box.innerHTML = `<div>TEST</div>`;
      //     }
      //   }
      // }

      if (!mutation.addedNodes) return;
  
      for (let i = 0; i < mutation.addedNodes.length; i++) {
        // do things to your newly added nodes here
        let node = mutation.addedNodes[i];

        // if (node.textContent === 'Add a public comment...') {
        //     console.log(node);
        //     node.textContent = 'test';
        // }
        // if (node.id === 'placeholder-area') {
        //   console.log(node);
        //   node.childNodes[1].textContent = 'test!!!';
        // }

        if (node['className'] === 'ytp-progress-list') {
          console.log('Progress Bar');
          console.log(node); 
        }        

        if (node['id'] === 'placeholder-area') {
            console.log(node);
            const placeholder = node.childNodes[1];
            placeholder['onfocus'] = function(e) { 
              if (comments.childNodes[1].childElementCount === 1) {
                console.log("clicked!");
                box = document.createElement("DIV"); 
                box.setAttribute('style', 'background-color: rgb(229, 229, 229); width: 35%; height: 80%; padding: 1.5%; margin-top: -2%; margin-bottom: 2%; border-radius: 5%;');
                box.id = 'my-cool-node';             
                box.innerHTML = `<div style="font-size: 130%;">Easy Start</div>
                <div style="margin: 3%;">
                    <span>__looks like__&nbsp;&nbsp;</span>
                    <span>The color of __ is __</span>
                    <br>
                    <span>The __ is __</span>
                </div>
              <div style="font-size: 130%">See what others are talking about ...</div>
                <div style="margin-top: 3%;margin-left: 3%;margin-right: 3%;">
                    <div><span style="color: blue;text-decoration: underline;" id="timestamp_3">01:36</span>&nbsp;&nbsp;the graphical representation ...</div>
                    <div><span style="color: blue;text-decoration: underline;" id="timestamp_4">04:47</span>&nbsp;&nbsp;that cartoon of cells ...</div>
                    <div><span style="color: blue;text-decoration: underline;" id="timestamp_5">06:01</span>&nbsp;&nbsp;the man looks like ...</div>
                </div>`; 
              
                comments.childNodes[1].appendChild(box);

                const timestamp_3 = document.getElementById("timestamp_3");
                const timestamp_4 = document.getElementById("timestamp_4");
                const timestamp_5 = document.getElementById("timestamp_5");
              
                timestamp_3.onclick = function(e) {
                  const youtubeVideo = <HTMLVideoElement>document.getElementsByTagName("Video")[0];
                  window.scrollTo(0, 0);
                  youtubeVideo.currentTime = 96;
                  youtubeVideo.play();
                }
                timestamp_4.onclick = function(e) {
                  const youtubeVideo = <HTMLVideoElement>document.getElementsByTagName("Video")[0];
                  window.scrollTo(0, 0);
                  youtubeVideo.currentTime = 287;
                  youtubeVideo.play();
                }
                timestamp_5.onclick = function(e) {
                  const youtubeVideo = <HTMLVideoElement>document.getElementsByTagName("Video")[0];
                  window.scrollTo(0, 0);
                  youtubeVideo.currentTime = 361;
                  youtubeVideo.play();
                }
              }
            }
        }

        if (node['id'] === 'contenteditable-root') {
            var comment = document.getElementById('contenteditable-root');

            console.log(node);
            node['ariaLabel'] = 'What images are the most significant to the understanding and appreciation of the video?';
            // node.classList.push()
            comment.onkeypress = function(e) {
              console.log('key pressed!');
              console.log(comment.textContent);

              // Many edge cases here
              // Just consider one keyword case for now
              // Assume the comment only contains one keyword
              for (let i in keywords) {
                if (comment.textContent.includes(keywords[i]["text"])) {
                  // var to_display = document.createElement("DIV");
                  // to_display.innerHTML = `<div style="font-size: 130%">Add a time stamp ...</div>
                  // <div style="margin-top: 3%;margin-left: 3%;margin-right: 3%;">
                  //     <div style="margin-bottom: 2%;">suggested: Are you talking about&nbsp;&nbsp;<span style="color: blue;text-decoration: underline;"> ${timestamp_string} </span>?</div>
                  // </div>`;
                  box.innerHTML = `<div style="font-size: 130%">Add a time stamp ...</div>
                <div style="margin-top: 3%;margin-left: 3%;margin-right: 3%;">
                    <div style="margin-bottom: 2%;">suggested: Are you talking about&nbsp;&nbsp;<div id="timestamps"></div>?</div>
                </div>`;
                  // var timestamp_string = "";
                  for (let j in keywords[i]["timestamps"]) {
                    // timestamp_string += (keywords[i]["timestamps"][j] + ", ");
                    var timestamp = document.createElement("SPAN");
                    timestamp.setAttribute("style", "color: blue;");
                    // timestamp.id = keywords[i]["timestamps"][j];
                    timestamp.innerHTML = convertToMinSecond(keywords[i]["timestamps"][j]) + " ";
                    timestamp.onclick = function(e) {
                      // if (comment.textContent.substring(0, 5) !== "7:27 ") {
                      //   comment.textContent = "7:27 " + comment.textContent;
                      // }
                      comment.textContent = convertToMinSecond(keywords[i]["timestamps"][j]) + " " + comment.textContent;
                      const youtubeVideo = <HTMLVideoElement>document.getElementsByTagName("Video")[0];
                      window.scrollTo(0, 0);
                      youtubeVideo.currentTime = keywords[i]["timestamps"][j];
                      youtubeVideo.play();
                    }
                    document.getElementById("timestamps").appendChild(timestamp);
                  }
                }
              }

              if (comment.textContent === "Why is the bipolar neuron upset") {
                box.innerHTML = `<div style="font-size: 130%">Add a time stamp ...</div>
                <div style="margin-top: 3%;margin-left: 3%;margin-right: 3%;">
                    <div style="margin-bottom: 2%;">suggested: Are you talking about&nbsp;&nbsp;<span id="timestamp_1" style="color: blue;text-decoration: underline;">7:27</span>?</div>
                </div>`;
              }
              if (comment.textContent === "The leg shake is") {
                box.innerHTML = `<div style="font-size: 130%">Add a time stamp ...</div>
                <div style="margin-top: 3%;margin-left: 3%;margin-right: 3%;">
                    <div style="margin-bottom: 2%;">suggested: Are you talking about&nbsp;&nbsp;<span id="timestamp_2" style="color: blue;text-decoration: underline;">3:18</span>?</div>
                    <div><span style="color: blue;text-decoration: underline;">3:18</span>&nbsp;&nbsp;that little leg shake ...</div>
                </div>`;
              }
              if (comment.textContent === "You make it so easy to learn") {
                box.innerHTML = `<div style="font-size: 130%">Your clarification does help ...</div>
                <div style="margin-top: 3%;margin-left: 3%;margin-right: 3%;">
                    <div style="margin-bottom: 2%;">suggested: use concrete words</div>
                    <div style="color: grey;">what is "it" in this part of the comment?</div>
                </div>`;
              }

              const timestamp_1 = document.getElementById("timestamp_1");
              if (timestamp_1) {
                timestamp_1.onclick = function(e) {
                  if (comment.textContent.substring(0, 5) !== "7:27 ") {
                    comment.textContent = "7:27 " + comment.textContent;
                  }
                  const youtubeVideo = <HTMLVideoElement>document.getElementsByTagName("Video")[0];
                  window.scrollTo(0, 0);
                  youtubeVideo.currentTime = 447;
                  youtubeVideo.play();
                }
              }

              const timestamp_2 = document.getElementById("timestamp_2");
              if (timestamp_2) {
                timestamp_2.onclick = function(e) {
                  if (comment.textContent.substring(0, 5) !== "3:18 ") {
                    comment.textContent = "3:18 " + comment.textContent;
                  }
                  const youtubeVideo = <HTMLVideoElement>document.getElementsByTagName("Video")[0];
                  window.scrollTo(0, 0);
                  youtubeVideo.currentTime = 198;
                  youtubeVideo.play();
                }
              }

              // if (!box.innerHTML) {
              //   box.innerHTML = `<div style="font-size: 130%">Add a time stamp ...</div>
              // <div style="margin-top: 3%;margin-left: 3%;margin-right: 3%;">
              //     <div style="margin-bottom: 2%;">suggested: Are you talking about&nbsp;&nbsp;<span style="color: blue;text-decoration: underline;">06:22</span>?</div>
              //     <div><span style="color: blue;text-decoration: underline;">06:22</span>&nbsp;&nbsp;that bottle looks like ...</div>
              // </div>`;
              // }
            }
        }

        // do we need id?
        if (node['id'] === 'sections' && node['className'] === 'style-scope ytd-comments') {
            comments = node;
            console.log(node);
          //   var box = document.createElement("DIV"); 
          //   box.style = "background-color:#E5E5E5;width:80%;height:50px;padding:10px;";
          //   box.id = 'my-cool-node';             
          //   box.innerHTML = `<div style="font-size: 130%;">Easy Start</div>
          //   <div style="margin: 5px;">
          //       <span>__looks like__&nbsp;&nbsp;</span>
          //       <span>The color of __ is __</span>
          //       <br>
          //       <span>The __ is __</span>
          //   </div>
          // <div style="font-size: 130%">See what others are talking about ...</div>
          //   <div style="margin: 5px;">
          //       <div><span style="color: blue;text-decoration: underline;">02:23</span>&nbsp;&nbsp;the graphical representation ...</div>
          //       <div><span style="color: blue;text-decoration: underline;">04:47</span>&nbsp;&nbsp;that cartoon of neuron ...</div>
          //       <div><span style="color: blue;text-decoration: underline;">06:01</span>&nbsp;&nbsp;the man looks like ...</div>
          //   </div>"`; 
          //   node.childNodes[1].appendChild(box);
            // console.log(box);
            // console.log(node);
            // node.appendChild(para);
        }

      //   if (!document.querySelector('#my-cool-node') && comments) {

      //     console.log(comments);
      //     var box = document.createElement("DIV"); 
      //     box.style = "background-color: rgb(229, 229, 229); width: 35%; height: 80%; padding: 1.5%; margin-top: -2%; margin-bottom: 2%; border-radius: 5%;";
      //     box.id = 'my-cool-node';             
      //     box.innerHTML = `<div style="font-size: 130%;">Easy Start</div>
      //     <div style="margin: 3%;">
      //         <span>__looks like__&nbsp;&nbsp;</span>
      //         <span>The color of __ is __</span>
      //         <br>
      //         <span>The __ is __</span>
      //     </div>
      //   <div style="font-size: 130%">See what others are talking about ...</div>
      //     <div style="margin-top: 3%;margin-left: 3%;margin-right: 3%;">
      //         <div><span style="color: blue;text-decoration: underline;">01:36</span>&nbsp;&nbsp;the graphical representation ...</div>
      //         <div><span style="color: blue;text-decoration: underline;">04:47</span>&nbsp;&nbsp;that cartoon of cells ...</div>
      //         <div><span style="color: blue;text-decoration: underline;">06:01</span>&nbsp;&nbsp;the man looks like ...</div>
      //     </div>`; 
      //     comments.childNodes[1].appendChild(box);
      //   }
      // }
    }})
  })
  
  observer.observe(document.body, {
      childList: true
    , subtree: true
    , attributes: true 
    , characterData: false
  })

