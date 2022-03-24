const keyword_extractor = require("keyword-extractor");
import YouTubeComment from "./YouTubeComment";
var nextPageToken = "";

// Extract the transcript of a Youtube video
export async function sendRequest(video_id) {
    const Http = new XMLHttpRequest();
    const url=`https://video.google.com/timedtext?lang=en&v=${video_id}`;
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

// Create captions array from the transcript
export async function scrapeCaptions(video_id, captions) {
    var caption_string = "";
    const response = await sendRequest(video_id);
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

    return caption_string;
}

export async function scrapeComments(video_id) {

    var xhr = new XMLHttpRequest();
    xhr.responseType = 'json';

    var url = `https://youtube.googleapis.com/youtube/v3/commentThreads?part=snippet&videoId=${video_id}&key=AIzaSyCmf7846pO6TJVkCF5tyvDAhKf4oVTNdQg&maxResults=100`;

    if (nextPageToken != "") {
      url = `https://youtube.googleapis.com/youtube/v3/commentThreads?part=snippet&videoId=${video_id}&key=AIzaSyCmf7846pO6TJVkCF5tyvDAhKf4oVTNdQg&maxResults=100&pageToken=${nextPageToken}`;
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
}

export async function scrapeAllComments(commentObjects, video_id) {

    while (typeof(nextPageToken) != "undefined") {
      const xhr = await scrapeComments(video_id);
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

// Extract timestamps from a comment
// Assume the videos do not exceed 1 hour
export function extractTimestamp(comment) {
    return comment.match(/[0-5]?[0-9]:[0-5][0-9]/g);
}
  
// Extract all comments with timestamps
export function getCommentsWithTimestamps(commentObjects) {
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

export async function postData(url = '', data = {}) {
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

