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
var index = location.href.indexOf('=');
const current_url = location.href.substr(index+1, 11);

// chrome.runtime.onMessage.addListener(
//   function(request, sender, sendResponse) {
//     // console.log(sender.tab ?
//     //             "from a content script:" + sender.tab.url :
//     //             "from the extension");
//     // if (request.greeting === "hello")
//     //   sendResponse({farewell: "goodbye"});
//     current_url = request.current_url;
//     console.log("URL!!!");
//     console.log(current_url);
//   }
// );


async function sendRequest() {
    const Http = new XMLHttpRequest();
    const url=`https://video.google.com/timedtext?lang=en&v=${current_url}`;
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

class YouTubeComment {
  private _text: string;
  private _likeCount: number;
  private _timestamps: Array<string>;
  private _keywords: Array<string>;

  constructor(text, likeCount, timestamps = [], keywords) {
    this._text = text;
    this._likeCount = likeCount;
    this._timestamps = timestamps;
    this._keywords = keywords;
  }

  get text() {
    return this._text;
  }

  get likeCount() {
    return this._likeCount;
  }

  get timestamps() {
    return this._timestamps;
  }

  set timestamps(value) {
    this._timestamps = value;
  }

  get keywords() {
    return this._keywords;
  }

  set keywords(value) {
    this._keywords = value;
  }
}

var url = `https://youtube.googleapis.com/youtube/v3/commentThreads?part=snippet&videoId=${current_url}&key=AIzaSyCmf7846pO6TJVkCF5tyvDAhKf4oVTNdQg&maxResults=100`;
var xhr = new XMLHttpRequest();
xhr.responseType = 'json';
var commentObjects = [];
var nextPageToken = "";

async function scrapeComments() {

  if (nextPageToken != "") {
    url = `https://youtube.googleapis.com/youtube/v3/commentThreads?part=snippet&videoId=${current_url}&key=AIzaSyCmf7846pO6TJVkCF5tyvDAhKf4oVTNdQg&maxResults=100&pageToken=${nextPageToken}`;
  }

  xhr.open("GET", url);
  xhr.setRequestHeader("Accept", "application/json");
  xhr.send();

  if (xhr.readyState === XMLHttpRequest.DONE) {
    return xhr;
  }

  let res;
  const p = new Promise((r) => res = r);
  xhr.onreadystatechange = () => {
      if (xhr.readyState === XMLHttpRequest.DONE) {
          res(xhr);
      }
  }
  return p;

  // xhr.onreadystatechange = function () {
  //   if (xhr.readyState === 4) {
  //       console.log(xhr.status);
  //       const public_comments = xhr.response;
  //       nextPageToken = public_comments["nextPageToken"];
  //       console.log(public_comments);
  //       for (let i in public_comments["items"]) {
  //         commentTexts.push(public_comments["items"][i]["snippet"]["topLevelComment"]["snippet"]["textOriginal"]);
  //       }
  //       scrapeComments(nextPageToken);
  //   }};

  // xhr.send();
  // setTimeout(() => {  console.log("World!"); }, 2000);
}

async function scrapeAllComments() {
  while (typeof(nextPageToken) != "undefined") {
    const xhr = await scrapeComments();
    const public_comments = xhr["response"];
    nextPageToken = public_comments["nextPageToken"];
    console.log(public_comments);
    for (let i in public_comments["items"]) {
      const originalText = public_comments["items"][i]["snippet"]["topLevelComment"]["snippet"]["textOriginal"];
      const likeCount = public_comments["items"][i]["snippet"]["topLevelComment"]["snippet"]["likeCount"];
      const commentKeywords = keyword_extractor.extract(originalText, {
        language:"english",
        remove_digits: false,
        return_changed_case: false,
        remove_duplicates: true,
        return_chained_words: true
      });

      var comment = new YouTubeComment(originalText, likeCount, [], commentKeywords);
      commentObjects.push(comment);
    }
  }
}

// assume the videos do not exceed 1 hour
function extractTimestamp(comment) {
  return comment.match(/[0-5]?[0-9]:[0-5][0-9]/g);
}

function getCommentsWithTimestamps() {
  var commentObjectsWithTimestamps = [];
  for (let i in commentObjects) {
    var timestamps = extractTimestamp(commentObjects[i].text);
    if (timestamps != null) {
      commentObjects[i].timestamps = timestamps;
      commentObjectsWithTimestamps.push(commentObjects[i]);
    }
  }
  commentObjectsWithTimestamps.sort((a, b) => (a.likeCount > b.likeCount) ? -1 : 1);

  console.log("HEYYYY");
  console.log(commentObjectsWithTimestamps);
  return commentObjectsWithTimestamps;
}

var commentsToDisplay;
var commentsWithTimestamps;
scrapeAllComments().then(() => {
  console.log("Comments Scraped!!!");
  console.log(commentObjects);
  commentsWithTimestamps = getCommentsWithTimestamps();
  commentsToDisplay = commentsWithTimestamps.slice(0, 5);
})

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
// const progressBar = document.getElementsByClassName("ytp-play-progress ytp-swatch-background-color")[0];
const progressBar = document.getElementsByClassName('ytp-progress-bar')[0];

// Options for the observer (which mutations to observe)
const config = { attributes: true, childList: true, subtree: true };

// Callback function to execute when mutations are observed
var videoContainer = document.getElementsByClassName("html5-video-container")[0];
var floatCard;
floatCard = document.createElement("DIV"); 
floatCard.id = "float-card";
floatCard.setAttribute('style', 'position: absolute; z-index: 2; height: 12em; width: 15%; margin-top: 45%; margin-left: 3%; padding-right: 1%; padding-left: 1%; background-color: #E5E5E5; border-radius: 0.5em;');
// floatCard.class = 'overlay';             
floatCard.innerHTML = `<p style="color: #000000; margin-left: 8%; margin-top: 10%;">Write a quick comment on <br> what you see to help people!</p>
<p style="color: #000000; margin-left: 8%; margin-top: 8%;" id="source-text"></p>
<button style="font-size: 12px; margin-left: 78%; margin-top: 2%" id="go-button">Go</button>`; 

function calculatePercentage(timeStamp, totalTime) {
  // CHANGE LATER
  console.log(timeStamp / totalTime);
  return timeStamp / totalTime;
}

enum timeRangeType {
  NonDialouge,
  NoText,
}

class timeRange {
  private _start: number;
  private _end: number;
  private _type: timeRangeType;

  constructor(start, end, type) {
    this._start = start;
    this._end = end;
    this._type = type;
  }

  get start() {
    return this._start;
  }

  get end() {
    return this._end;
  }

  get type() {
    return this._type;
  }

  // set timestamps(value) {
  //   this._timestamps = value;
  // }
}

// Video qPix_X-9t7E
// const timeRangeArr = [
//   new timeRange(68.76, 78.83, timeRangeType.NonDialouge),
//   new timeRange(390.56, 391.71, timeRangeType.NonDialouge),
//   new timeRange(625.23, 635, timeRangeType.NonDialouge),
//   new timeRange(68.0, 78.0, timeRangeType.NoText),
//   new timeRange(247.0, 254.0, timeRangeType.NoText),
//   new timeRange(249.0, 254.0, timeRangeType.NoText),
//   new timeRange(488.0, 511.0, timeRangeType.NoText),
//   new timeRange(623.0, 634.0, timeRangeType.NoText),
//   new timeRange(625.0, 634.0, timeRangeType.NoText),
// ]

// Video W0TM4LQmoZY
// const timeRangeArr = [
//   new timeRange(1.5, 6.37, timeRangeType.NonDialouge),
//   new timeRange(259.88, 277, timeRangeType.NonDialouge),
//   new timeRange(4.0, 24.0, timeRangeType.NoText),
//   new timeRange(46.0, 102.0, timeRangeType.NoText),
//   new timeRange(176.0, 200.0, timeRangeType.NoText),
//   new timeRange(227.0, 261.0, timeRangeType.NoText),
// ]

// Video rNjPI84sApQ
// const timeRangeArr = [
//   new timeRange(209.4, 210.89, timeRangeType.NonDialouge),
//   new timeRange(216.24, 217.27, timeRangeType.NonDialouge),
//   new timeRange(303.88, 304.96, timeRangeType.NonDialouge),
//   new timeRange(387.99, 409, timeRangeType.NonDialouge),
//   new timeRange(6.0, 24.0, timeRangeType.NoText),
//   new timeRange(59.0, 91.0, timeRangeType.NoText),
//   new timeRange(162.0, 180.0, timeRangeType.NoText),
//   new timeRange(322.0, 388.0, timeRangeType.NoText),
// ]

// Video QVCjdNxJreE
const timeRangeArr = [
  new timeRange(332.81, 333.91, timeRangeType.NonDialouge),
  new timeRange(399.16, 400.20, timeRangeType.NonDialouge),
  new timeRange(483.24, 485.18, timeRangeType.NonDialouge),
  new timeRange(542.57, 559.00, timeRangeType.NonDialouge),
  new timeRange(234.0, 263.0, timeRangeType.NoText),
  new timeRange(280.0, 335.0, timeRangeType.NoText),
  new timeRange(333.0, 361.0, timeRangeType.NoText),
]

// const timeStampArr1 = [
//   // low lexical density
//   [calculatePercentage(45.5, 635), calculatePercentage(57, 635)],
//   // non-dialouge
//   [calculatePercentage(68.76, 635), calculatePercentage(78.83, 635)],
//   // text on screen
//   [calculatePercentage(247, 635), calculatePercentage(254, 635)],
//   [calculatePercentage(567, 635), calculatePercentage(571, 635)],
//   [calculatePercentage(625.23, 635), calculatePercentage(635, 635)],
// ];

// const timeStampArr2 = [
//   // non-dialouge
//   [calculatePercentage(1.5, 277), calculatePercentage(6.37, 277)],
//   [calculatePercentage(259.88, 277), calculatePercentage(277, 277)],
//   // low lexical density
//   // text on screen
//   [calculatePercentage(4, 277), calculatePercentage(24, 277)],
//   [calculatePercentage(46, 277), calculatePercentage(102, 277)],
//   [calculatePercentage(104, 277), calculatePercentage(120, 277)],
//   [calculatePercentage(176, 277), calculatePercentage(200, 277)],
//   [calculatePercentage(227, 277), calculatePercentage(276, 277)],
// ];

const callback = function(mutationsList, observer) {
    // Use traditional 'for loops' for IE 11
    for(const mutation of mutationsList) {
        if (mutation.type === 'childList') {
            console.log('A child node has been added or removed.');
        }
        else if (mutation.type === 'attributes') {
            console.log('The ' + mutation.attributeName + ' attribute was modified.');
            // console.log(progressBar["style"].transform);
            var showFloatCard = false;
            // var timeStampArr;

            // if (current_url == 'qPix_X-9t7E') {
            //   timeStampArr = timeStampArr1;
            // }

            // if (current_url == 'W0TM4LQmoZY') {
            //   timeStampArr = timeStampArr2;
            // }
            // console.log(timeStampArr);
            for (let i in timeRangeArr) {
              // EDGE CASE: one segment follows another but they have different types
              // progressBar["style"].transform.substring(7)
              if (parseInt(progressBar['ariaValueNow']) > timeRangeArr[i].start &&
                parseInt(progressBar['ariaValueNow']) < timeRangeArr[i].end) {
                  showFloatCard = true;
                  if (document.getElementById("float-card") != null) {
                    if (timeRangeArr[i].type == timeRangeType.NonDialouge) {
                      document.getElementById("source-text").innerHTML = "Reason for showing: this video segment has no dialouge";
                    }
                    else if (timeRangeArr[i].type == timeRangeType.NoText) {
                      document.getElementById("source-text").innerHTML = "Reason for showing: text on screen not mentioned";
                    }
                  }
                  // videoContainer.childElementCount == 1
                  if (document.getElementById("float-card") == null) {
                    videoContainer.appendChild(floatCard);   
                    const goButton = document.getElementById("go-button");
                    goButton.onclick = function(e) {
                      window.scrollTo(0, 1150);
                    }
                    if (timeRangeArr[i].type == timeRangeType.NonDialouge) {
                      document.getElementById("source-text").innerHTML = "Reason for showing: this video segment has no dialouge";
                    }
                    else if (timeRangeArr[i].type == timeRangeType.NoText) {
                      document.getElementById("source-text").innerHTML = "Reason for showing: text on screen not mentioned";
                    }
                  }
                  break;
              }
            }

            if (!showFloatCard && document.getElementById("float-card") != null) {
              videoContainer.removeChild(floatCard);
            }


            // if (parseFloat(progressBar["style"].transform.substring(7)) > 0.1084 &&
            //     parseFloat(progressBar["style"].transform.substring(7)) < 0.123 && videoContainer.childElementCount == 1) {
            //       videoContainer.appendChild(floatCard);   
            //       const goButton = document.getElementById("go-button");
            //       goButton.onclick = function(e) {
            //         window.scrollTo(0, 1150);
            //       }
            // }
            // if ((parseFloat(progressBar["style"].transform.substring(7)) <= 0.1084 ||
            //     parseFloat(progressBar["style"].transform.substring(7)) >= 0.123) && videoContainer.childElementCount == 2) {
            //       videoContainer.removeChild(floatCard);
            // }
            // if (parseFloat(progressBar["style"].transform.substring(7)) > calculatePercentage(45.5) &&
            //     parseFloat(progressBar["style"].transform.substring(7)) < calculatePercentage(57) && videoContainer.childElementCount == 1) {
            //       videoContainer.appendChild(floatCard);   
            //       const goButton = document.getElementById("go-button");
            //       goButton.onclick = function(e) {
            //         window.scrollTo(0, 1150);
            //       }
            // }
            // if ((parseFloat(progressBar["style"].transform.substring(7)) <= calculatePercentage(45.5) ||
            //     parseFloat(progressBar["style"].transform.substring(7)) >= calculatePercentage(57)) && videoContainer.childElementCount == 2) {
            //       videoContainer.removeChild(floatCard);
            // }
        }
    }
};

// Create an observer instance linked to the callback function
const new_observer = new MutationObserver(callback);

// Start observing the target node for configured mutations
new_observer.observe(progressBar, config);

// end

function convertToSecond(timestamp_string) {
  const min_second_arr = timestamp_string.split(":");
  return parseInt(min_second_arr[0]) * 60 + parseInt(min_second_arr[1]);   
}

function convertToMinSecond(timestamp_string) {
  console.log(timestamp_string);
  var timestamp_float = parseFloat(timestamp_string);
  var minutes = Math.floor(timestamp_float / 60);
  var seconds = Math.round(timestamp_float - minutes * 60);
  return String(minutes) + ":" + String(seconds);   
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
                <div style="margin-top: 3%;margin-left: 3%;margin-right: 3%;" id="othersComments">
                </div>`; 
              
                /*
                <div><span style="color: blue;text-decoration: underline;" id="timestamp_3">01:36</span>&nbsp;&nbsp;the graphical representation ...</div>
                    <div><span style="color: blue;text-decoration: underline;" id="timestamp_4">04:47</span>&nbsp;&nbsp;that cartoon of cells ...</div>
                    <div><span style="color: blue;text-decoration: underline;" id="timestamp_5">06:01</span>&nbsp;&nbsp;the man looks like ...</div>
                */
                comments.childNodes[1].appendChild(box);

                const othersComments = document.getElementById("othersComments");
                for (let i in commentsToDisplay) {
                  var singleComment = document.createElement("DIV");
                  var singleTimestamp = document.createElement("SPAN");
                  singleTimestamp.setAttribute('style', 'color: blue;text-decoration: underline;');
                  singleTimestamp.innerHTML = commentsToDisplay[i].timestamps[0];

                  singleTimestamp.onclick = function(e) {
                    const youtubeVideo = <HTMLVideoElement>document.getElementsByTagName("Video")[0];
                    window.scrollTo(0, 0);
                    // Special situation: what if there is multiple timestamps
                    console.log("ATTENSION!!");
                    console.log(convertToSecond(commentsToDisplay[i].timestamps[0]));
                    youtubeVideo.currentTime = convertToSecond(commentsToDisplay[i].timestamps[0]);
                    youtubeVideo.play();
                  }
                  singleComment.appendChild(singleTimestamp);
                  singleTimestamp.insertAdjacentHTML('afterend', '&nbsp;&nbsp;' + commentsToDisplay[i].text);

                  othersComments.appendChild(singleComment);
                }

                // const timestamp_3 = document.getElementById("timestamp_3");
                // const timestamp_4 = document.getElementById("timestamp_4");
                // const timestamp_5 = document.getElementById("timestamp_5");
              
                // timestamp_3.onclick = function(e) {
                //   const youtubeVideo = <HTMLVideoElement>document.getElementsByTagName("Video")[0];
                //   window.scrollTo(0, 0);
                //   youtubeVideo.currentTime = 96;
                //   youtubeVideo.play();
                // }
                // timestamp_4.onclick = function(e) {
                //   const youtubeVideo = <HTMLVideoElement>document.getElementsByTagName("Video")[0];
                //   window.scrollTo(0, 0);
                //   youtubeVideo.currentTime = 287;
                //   youtubeVideo.play();
                // }
                // timestamp_5.onclick = function(e) {
                //   const youtubeVideo = <HTMLVideoElement>document.getElementsByTagName("Video")[0];
                //   window.scrollTo(0, 0);
                //   youtubeVideo.currentTime = 361;
                //   youtubeVideo.play();
                // }
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

              var matched_comments = [];
              for (let i in commentsWithTimestamps) {
                for (let j in commentsWithTimestamps[i].keywords) {
                  if (comment.textContent.includes(commentsWithTimestamps[i].keywords[j])) {
                    matched_comments.push(commentsWithTimestamps[i]);
                  }
                }
              }
              console.log(matched_comments);
              if (matched_comments.length != 0) {
                box.innerHTML = `<div style="font-size: 130%">Add a time stamp ...</div>
                <div style="margin-top: 3%;margin-left: 3%;margin-right: 3%;">
                    <div style="margin-bottom: 2%;">suggested: Are you talking about&nbsp;&nbsp;<div id="timestamps"></div>?</div>
                    <div id="sources"></div>
                </div>`;

                for (let i in matched_comments) {
                  var timestamp = document.createElement("SPAN");
                  timestamp.setAttribute("style", "color: blue;");
                  timestamp.innerHTML = matched_comments[i].timestamps[0] + " ";
                  timestamp.onclick = function(e) {
                    comment.textContent = matched_comments[i].timestamps[0] + " " + comment.textContent;
                    const youtubeVideo = <HTMLVideoElement>document.getElementsByTagName("Video")[0];
                    window.scrollTo(0, 0);
                    youtubeVideo.currentTime = convertToSecond(matched_comments[i].timestamps[0]);
                    youtubeVideo.play();
                  }
                  document.getElementById("timestamps").appendChild(timestamp);

                  var sourceComment = document.createElement("DIV");
                  sourceComment.innerHTML = matched_comments[i].text;
                  document.getElementById("sources").appendChild(sourceComment);
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


