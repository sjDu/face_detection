import { core } from '../import/tracking/tracking-min'

var tracking = core;


function stop11() {
    // tracking.track('#abc', tracker, {camera: false});

    fdrInstance.tracker.task.stop();
    console.log("stop face detection");
}

function openFdr() {

}


function closeVS() {
    tracking.stopUserMedia();
    fdrInstance.tracker = null;

}

var sss = "aaa1278";





class FDRControl {
    constructor() {
        this.core = core;
        this.video = document.createElement('video');
        this.canvas = document.createElement('canvas');
    }

    initFdrDiv(divId, width, height){
        console.log("initFdrDiv..");
        // var video = document.createElement('video');
        // var canvas = document.createElement('canvas');        
        var fdrDiv = document.getElementById(divId);
        var video = this.video;
        var canvas = this.canvas;
        fdrDiv.style.width = width+"px";
        fdrDiv.style.height = height+"px";

        video.width = width;
        video.height = height;
        canvas.width = width;
        canvas.height = height;


        // video.style = style;  
        video.style.position = "absolute";
        // video.style.marginTop = "120px";
        canvas.style.position = "absolute";
        // canvas.style.marginTop = "120px";
        // video.style.position = "relative";
        // canvas.style.position = "relative";

        this.fdrDiv = fdrDiv;

        fdrDiv.appendChild(video);
        fdrDiv.appendChild(canvas);

    }

    startTrack(onTrack) {
        console.log("startTrack ");
        var canvas = this.canvas;
        var context = canvas.getContext('2d');

        var tracker = new tracking.ObjectTracker('face');
        tracker.setInitialScale(4);
        tracker.setStepSize(2);
        tracker.setEdgesDensity(0.1);


        // task = tracking.track('#video', tracker, { camera: true });
        var task = tracking.track(this.video, tracker, { camera: true });

        this.tracker = {
            tracker: tracker,
            task: task,
        };

        tracker.on('track', function(event) {
            if(event.data.length == 0){
                return;
            }
            context.clearRect(0, 0, canvas.width, canvas.height);

            console.log("face detected:  \n" + JSON.stringify(event));

            onTrack(event, this.canvas, this.video);

            // event.data.forEach(function(rect) {
            //     getImageObj(rect, canvas, video);
            //     drawSomething(rect, canvas, context, video);
            // });
        }.bind(this));

    }

    stopTrack(){
        console.log("stopTrack");
        this.tracker.task.stop();        
        tracking.stopUserMedia();
        this.tracker = null;
        this.video.width = 0;
        this.video.height = 0;
        var context = this.canvas.getContext('2d');
        context.fillStyle = '#000000'; 
        context.fillRect(0, 0, this.canvas.width, this.canvas.height);
        context.lineWidth= 0.5;               
        context.font="20px Helvetica";
        context.fillStyle = '#FFFFFF'; 
        context.fillText("Camera Closed", this.canvas.width/4, this.canvas.height/2);
    }

    deinitFdrDiv(){
        this.fdrDiv = null;
    }

    test() {
        testa();
    }

    //samplingMode (ByTime or ByQuality)
    //samplingTime in milliseconds
    startCaptureFaceImage(samplingNum, samplingTime, samplingMode, onReady) {
        console.log("startCaptureFaceImage..")
        
        var imageObjList = [];
        var scoreList = [];

        var samplingInterval;
        switch(samplingMode){
            case "ByTime":
                samplingInterval = setInterval(samplingTimerByTime, samplingTime);
            break;
            case "ByQuality":
                samplingInterval = setInterval(samplingTimerByQuality, samplingTime);
            break;
            default:
                samplingInterval = setInterval(samplingTimerByTime, samplingTime);
            break;
        }

        var captureTask = {
            samplingInterval: samplingInterval,
            samplingNum: samplingNum,
            samplingTime: samplingTime,
            samplingMode: samplingMode,
            isReady: false,
            imageObjList: imageObjList,
            scoreList: scoreList,
        };
        this.captureTask = captureTask;

        var sampleCount = 1;
        var currentScore = 0;
        var currentImageObj = {};
        var currentIndex = 0;


        // synchronize problem?
        this.startTrack( function(event, canvas, video){
            event.data.forEach(function(rectangle){
                drawRectangle(rectangle, canvas, video);
                var score = getImageScore(rectangle, canvas);// toDo
                if(currentScore < score){
                    currentImageObj = getImageObj(rectangle, this.canvas, this.video);
                    currentScore = score;
                }
                console.log("sampleCount = " + sampleCount +"\ncurrentScore = " + currentScore + "\ncurrentIndex = " + currentIndex)
            }.bind(this));
        }.bind(this));


        function samplingTimerByQuality(){
            if(captureTask.isReady){
                var isBetter = currentScore > scoreList[0].score;
                if(isBetter){
                    scoreList.splice(0, 1);
                    add();
                }
            }else{
                add();
            }

            prepareForNext();


            function findOrder(score, list){
                var i = 0;
                while(i < list.length ){

                    var isFindOrder = score < list[i].score;
                    if(isFindOrder){
                        break;
                    }
                    i++;
                }
                return i;
            }

            function add(){
                var scoreOrder = findOrder(currentScore, scoreList);
                // insert at scoreOrder
                scoreList.splice(scoreOrder, 0, {
                    score: currentScore,
                    imageIndex: currentIndex,
                });
                imageObjList[currentIndex] = currentImageObj;
            }

            function prepareForNext(){
                currentScore = 0;
                currentImageObj = {};
                sampleCount++;
                captureTask.isReady = sampleCount > samplingNum;
                if(captureTask.isReady){
                    onReady();
                    currentIndex = scoreList[0].imageIndex;
                }else{
                    currentIndex = sampleCount - 1;
                }
            }

        }

        function samplingTimerByTime(){
            scoreList[currentIndex] = currentScore;
            imageObjList[currentIndex] = currentImageObj;

            prepareForNext();

            function prepareForNext(){
                currentScore = 0;
                currentImageObj = {};
                sampleCount++;
                captureTask.isReady = sampleCount > samplingNum;
                if(captureTask.isReady){
                    onReady();
                    currentIndex = samplingNum - 1;
                    imageObjList.splice(0, 1);
                    scoreList.splice(0, 1);
                }else{
                    currentIndex = sampleCount - 1;
                }
            }
        }

        function drawRectangle(rectangle, canvas, video){
            var context = canvas.getContext('2d');
            context.lineWidth=5;
            if(captureTask.isReady){
                context.strokeStyle = '#1F1';                
            }else{
                context.strokeStyle = '#FF0000';                
            }
            context.strokeRect(rectangle.x, rectangle.y, rectangle.width, rectangle.height);
            context.font = '11px Helvetica';
            context.fillStyle = "#fff";
            context.fillText('x: ' + rectangle.x + 'px', rectangle.x + rectangle.width + 5, rectangle.y + 11);
            context.fillText('y: ' + rectangle.y + 'px', rectangle.x + rectangle.width + 5, rectangle.y + 22);
            context.fillText('x: ' + rectangle.x + 'px', rectangle.x + rectangle.width + 5, rectangle.y + 11);

        }
    }

    stopCaptureFaceImage(){
        this.stopTrack();
        clearInterval(this.captureTask.samplingInterval);
        this.captureTask = null;
    }

    getFaceImageList(){

        return this.captureTask.imageObjList;
    }


}

function testa() {
    alert("testa");
}

function getImageScore(rectangle, canvas){


    var sizeScore = getSizeScore(rectangle, canvas);

    var positionScore = getPositionScore(rectangle, canvas);


    return sizeScore + positionScore;
    // return Math.random();



    function getSizeScore(rectangle, canvas){
        var roiArea = rectangle.width * rectangle.height;
        var canvasArea = canvas.width * canvas.height;

        var ratio = roiArea/canvasArea;
        var score;
        var ratioTooBig = 0.9;
        var ratioTooSmall = 0.1;
        var maxScore = 10;
        if(ratio > ratioTooBig || ratio < ratioTooSmall ){
            score = 0;
        } else {
            var range = (ratioTooBig - ratioTooSmall);
            score = ((ratio - ratioTooSmall)/range) * maxScore;
        }
        // }else if(ratio < 0.3){
        //     score = 1;
        // }else if(ratio < 0.5){
        //     score = 2;
        // }else if(ratio < 0.7){
        //     score = 3;
        // }
        return score;
    }

    function getPositionScore(rectangle, canvas){
        var roiCentral = {};
        roiCentral.x = rectangle.x + (rectangle.width/2);
        roiCentral.y = rectangle.y + (rectangle.height/2);

        var vectorCentralToRoiCentral = {
            x: roiCentral.x - canvas.width/2,
            y: roiCentral.y - canvas.height/2,
        }
        var distSqrt = Math.pow(vectorCentralToRoiCentral.x, 2) + Math.pow(vectorCentralToRoiCentral.y, 2);
        var maxDistSqrt = Math.pow(canvas.width/2, 2) + Math.pow(canvas.height/2, 2);

        var maxScore = 10;
        var score = ((maxDistSqrt - distSqrt)/maxDistSqrt) * maxScore;
        return score;
    }
}

function getImageObj(rectangle, canvas, video){

    var width = canvas.width;
    var height = canvas.height;

    var backupCanvas = document.createElement('canvas');
    backupCanvas.width = width;
    backupCanvas.height = height;
    var context = backupCanvas.getContext('2d');
    context.drawImage(video, 0, 0, width, height);
    context.strokeStyle = '#a64ceb';
    context.strokeRect(rectangle.x, rectangle.y, rectangle.width, rectangle.height);
    var rectEx = enlargeRect(rectangle, 0.75, { width: width, height: height });

    // context.drawImage(backupCanvas, rectEx.x, rectEx.y, rectEx.width, rectEx.height, 0, 0, rectEx.width, rectEx.height);


    // context.strokeStyle = '#a64ceb';
    // context.strokeRect(rectEx.original.x, rectEx.original.y, rectEx.original.width, rectEx.original.height);

    var imageData = context.getImageData(rectEx.x, rectEx.y, rectEx.width, rectEx.height);

    var newCanvas = document.createElement("canvas");
    newCanvas.width = rectEx.width;
    newCanvas.height = rectEx.height;
    newCanvas.getContext("2d").putImageData(imageData, 0, 0);

    // var image = document.getElementById('image');
    // image.width = rectEx.width;
    // image.height = rectEx.height;
    // image.src = newCanvas.toDataURL('image/png');

    return {
        roi: {
            x: rectEx.original.x,
            y: rectEx.original.y,
            width: rectEx.original.width,
            height: rectEx.original.height,
        },
        dataURL: newCanvas.toDataURL('image/png')
    };
}

function drawSomething(rect, canvas, video) {
    var context = canvas.getContext('2d');
    context.strokeStyle = '#a64ceb';
    context.strokeRect(rect.x, rect.y, rect.width, rect.height);
    context.font = '11px Helvetica';
    context.fillStyle = "#fff";
    context.fillText('x: ' + rect.x + 'px', rect.x + rect.width + 5, rect.y + 11);
    context.fillText('y: ' + rect.y + 'px', rect.x + rect.width + 5, rect.y + 22);
    context.fillText('x: ' + rect.x + 'px', rect.x + rect.width + 5, rect.y + 11);



    var canvas3 = document.createElement('canvas');
    canvas3.width = 320;
    canvas3.height = 240;
    var context3 = canvas3.getContext('2d');
    context3.drawImage(video, 0, 0, canvas.width, canvas.height);

    var ratio = video.width / canvas.width;
    // context2.drawImage(video, ratio * rect.x, ratio * rect.y, ratio * rect.width, ratio * rect.height, 0, 0, rect.width, rect.height);
    document.getElementById("rect_info").innerHTML = "x: " + rect.x + "y: " + rect.y + "width: " + rect.width + "height: " + rect.height + "<br>video.width:" + video.width + " video.height:" + video.height;

    var rectEx = enlargeRect(rect, 0.75, { width: 320, height: 240 });


    var canvas2 = document.getElementById('canvas2');
    var context2 = canvas2.getContext('2d');
    // context2.fillStyle = "red";
    // context2.fillRect(10, 10, 50, 50);

    // this one work
    context2.drawImage(canvas3, rectEx.x, rectEx.y, rectEx.width, rectEx.height, 0, 0, rectEx.width, rectEx.height);


    context2.strokeStyle = '#a64ceb';
    context2.strokeRect(rectEx.original.x, rectEx.original.y, rectEx.original.width, rectEx.original.height);


    var image = document.getElementById('image');
    image.src = canvas2.toDataURL('image/png');

}

//ratio = 0.75
// all x, y are relative to canvas
function enlargeRect(rectangle, ratio, canvas) {

    var newX = rectangle.x - rectangle.width * ratio;

    var newY = rectangle.y - rectangle.height * ratio;

    var newWidth = rectangle.width * (1 + 2 * ratio);
    var newHeight = rectangle.height * (1 + 2 * ratio);

    var originalPosition = {};
    originalPosition.x = rectangle.width * ratio;
    originalPosition.y = rectangle.height * ratio;
    originalPosition.width = rectangle.width;
    originalPosition.height = rectangle.height;

    if (newX < 0) {
        newWidth += newX;
        originalPosition.x += newX;
        newX = 0;

    }
    if (newY < 0) {
        newHeight += newY;
        originalPosition.y += newY;
        newY = 0;
    }
    if (newX + newWidth > canvas.width) {
        newWidth = canvas.width - newX;
    }
    if (newY + newHeight > canvas.height) {
        newHeight = canvas.height - newY;
    }

    return {
        x: newX,
        y: newY,
        width: newWidth,
        height: newHeight,
        original: originalPosition,
    };


}

function openTrack(){
   var video = document.createElement('video');
    var canvas = document.createElement('canvas');
    var fdrDiv = document.getElementById('fdrControl');
    fdrDiv.width = 320;
    fdrDiv.height = 240;

    video.width = fdrDiv.width;
    video.height = fdrDiv.height;
    canvas.width = fdrDiv.width;
    canvas.height = fdrDiv.height;


    // video.style = style;  
    video.style.position = "absolute";
    canvas.style.position = "absolute";

    console.log("video.width = " + video.width);
    console.log("canvas.width = " + canvas.width);
    console.log("video.nodeName.toLowerCase() = " + video.nodeName.toLowerCase())

    var context = canvas.getContext('2d');

    fdrDiv.appendChild(video);
    fdrDiv.appendChild(canvas);


    var canvas2 = document.getElementById('canvas2');
    var context2 = canvas2.getContext('2d');
    // context2.fillStyle = "red";
    // context2.fillRect(10, 10, 50, 50);


    tracker = new tracking.ObjectTracker('face');
    tracker.setInitialScale(4);
    tracker.setStepSize(2);
    tracker.setEdgesDensity(0.1);



    // task = tracking.track('#video', tracker, { camera: true });
    task = tracking.track(video, tracker, { camera: true });

    tracker.on('track', function(event) {
        context.clearRect(0, 0, canvas.width, canvas.height);

        console.log("event = \n" + JSON.stringify(event));

        event.data.forEach(function(rect) {
            drawSomething(rect, canvas, video);
        });
    });    
}

var fdrInstance = new FDRControl();
window.onload = function() {

    // fdrInstance.openFdrDiv('fdrControl', 320, 240);

    // var video = document.getElementById('video');
    // var canvas = document.getElementById('canvas');


    // openTrack();
};

module.exports = {
    sss: sss,
    stop11: stop11,
    closeVS: closeVS,
    fdr: fdrInstance,
    a: "sad"

};