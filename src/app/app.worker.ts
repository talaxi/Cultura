/// <reference lib="webworker" />
declare var LZString: any;


addEventListener('message', ({ data }) => {
  //const response = `worker response to ${data}`;
  importScripts("assets/js/lz-string.js");  
  if (data.eventRaceData !== undefined && data.eventRaceData !== null &&
    data.eventRaceData.currentRaceSegmentResult !== undefined && data.eventRaceData.currentRaceSegmentResult !== null &&
    data.eventRaceData.currentRaceSegmentResult.totalFramesPassed > 400000)
    {
      data.eventRaceData.currentRaceSegment.raceUI = undefined;
    }


  var globalData = JSON.stringify(data);
  var compressedData = LZString.compressToBase64(globalData);    

  postMessage(compressedData);
});
