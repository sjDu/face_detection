- initFdrDiv(divId, width, height)
- deinitFdrDiv()
- startCaptureFaceImage(samplingNum, samplingTime, samplingMode, onReady) // samplingMode: ByTime or ByQuality
- stopCaptureFaceImage()
- getFaceImageList()

// startTrack(onTrack)  not expose
// stopTrack()  not expose

callbacks: //implement by user
onImageReady(imageList)

imageList = [
    {
        roi:{
            x: number,
            y: number,
            width: number,
            height: number
        },
        dataURL: string // png image in base64 
    },
    ...
]

onTrack(event, canvas)

event = {
    data:[
        {
            x: number,
            y: number,
            width: number,
            height: number
        },
        ...
    ]
}

// stopCaptureFaceImage()  -- not necessary
