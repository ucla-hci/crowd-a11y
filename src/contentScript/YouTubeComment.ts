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

export default YouTubeComment;



 
  
  