export enum timeRangeType {
    NonDialouge,
    NoText,
}

class timeRange {
    private _start: number;
    private _end: number;
    private _type: timeRangeType;
    private _hasVisited: boolean;
  
    constructor(start, end, type, hasVisited = false) {
      this._start = start;
      this._end = end;
      this._type = type;
      this._hasVisited = hasVisited;
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
  
    get hasVisited() {
      return this._hasVisited;
    }
  
    set hasVisited(value) {
      this._hasVisited = value;
    }
}

export default timeRange;