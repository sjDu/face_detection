import { core } from '../import/tracking/tracking-min'

var tracking = core;


function stop11() {
    // tracking.track('#abc', tracker, {camera: false});

    task.stop();
    alert("s");
}

function openFdr() {

}


function closeVS() {
    tracking.stopUserMedia();

}

var sss = "aaa1278";
// function Foo() { return sss}
module.exports = {
    sss: sss,
    stop11: stop11,
    closeVS: closeVS,
    a: "sad"

};

// module.exports = function(parentRequire) {
//     return function(module) {
//         switch(module) {
//         case "through": return require("through");
//         case "duplexer": return require("duplexer");
//         }
//         return parentRequire(module);
//     };
// }(typeof __non_webpack_require__ === "function" ? __non_webpack_require__ : function() {
//     throw new Error("Module '" + module + "' not found")
// });

// module.exports = function(){
//     return sss;
// }

var tracker;
var task;

window.onload = function() {

    // var video = document.getElementById('video');
    // var canvas = document.getElementById('canvas');

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


            // context2.drawImage(video, 0, 0, canvas2.width, canvas2.height);
            // context2.drawImage(video, rect.x, rect.y, rect.width, rect.height, 0, 0, rect.width, rect.height);

            var rectEx = enlargeRect(rect, 0.75, { width: 320, height: 240 });

            // this one work
            context2.drawImage(canvas3, rectEx.x, rectEx.y, rectEx.width, rectEx.height, 0, 0, rectEx.width, rectEx.height);


            context2.strokeStyle = '#a64ceb';
            context2.strokeRect(rectEx.original.x, rectEx.original.y, rectEx.original.width, rectEx.original.height);
            // context2.font = '11px Helvetica';
            // context2.fillStyle = "#fff";
            // context2.fillText('x: ' + rectEx.original.x + 'px', rectEx.original.x + rectEx.original.width + 5, rectEx.original.y + 11);
            // context2.fillText('y: ' + rectEx.original.y + 'px', rectEx.original.x + rectEx.original.width + 5, rectEx.original.y + 22);


            // var w=window.open('about:blank','image from canvas');
            // w.document.write("<img src='"+context2.toDataURL("image/png")+"' alt='from canvas'/>");


            var image = document.getElementById('image');
            image.src = canvas2.toDataURL('image/png');




        });
    });


    function drawSomething(){
        
    }

    //ratio = 0.75
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

    // var gui = new dat.GUI();
    // gui.add(tracker, 'edgesDensity', 0.1, 0.5).step(0.01);
    // gui.add(tracker, 'initialScale', 1.0, 10.0).step(0.1);
    // gui.add(tracker, 'stepSize', 1, 5).step(0.1);
};

class FDRControl {
    constructor() {
        this.core = core;
    }

    //samplingMode (ByTime or ByQuality)
    startCaptureFaceImage(samplingNum, samplingTime, samplingMode) {

    }
}
