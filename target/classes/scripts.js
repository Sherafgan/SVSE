var resLim = 10;

function searchRequest() {
    var searchText = document.getElementById("searchText");
    $.getJSON("search", {searchText: searchText.value}, function (data) {
        document.getElementById("content").innerHTML = "";
        // drawTable(data);
        showVideos(data);
    });
}

var globalData, globalI, globalJ;

function showVideos(data) {
    globalData = data;
    for (var i = 0; i < data.length; i++) { //NOTE: i < data.length
        var timeSegments = [];
        timeSegments = data[i].segments[0];
        for (var j = 0; j < timeSegments.length; j += 2) {
            if ((((j + 2) / 2) + (i + 1) ) <= resLim) {
                // 0 2, 2 4, 4 6, 6 8,
                var videoElement = document.createElement("video");
                videoElement.id = "vid" + i + "" + j;
                videoElement.className = "video-js vjs-default-skin video";
                // videoElement.autoplay = true;
                videoElement.controls = true;
                videoElement.width = "640";
                videoElement.height = "264";
                $("#content").append(videoElement);

                videojs(document.getElementById("vid" + i + "" + j), {
                    techOrder: ["youtube"],
                    sources: [{
                        "type": "video/youtube",
                        "src": data[i].url.toString(),
                        "youtube": {"ytControls": 2}
                    }]
                }, function () {
                });


                var player = videojs("vid" + i + "" + j);
                player.timeOffset({
                    start: timeSegments[j],
                    end: timeSegments[j + 1]
                });
            } else {
                globalI = i;
                globalJ = j;
                i = data.length;
                j = timeSegments.length;
                resLim += 10;
                var moreButton = '<button id="moreBtn" type="button" class="btn btn btn-default center-block center-button" onclick="moreVideos();">More</button>';
                $("#content").append(moreButton);
            }
        }
    }
}

function moreVideos() {
    var btnToRemove = document.getElementById('moreBtn');
    btnToRemove.parentNode.removeChild(btnToRemove);
    var data = globalData;
    for (var i = globalI; i < data.length; i++) { //NOTE: i < data.length
        var timeSegments = [];
        timeSegments = data[i].segments[0];
        for (var j = globalJ; j < timeSegments.length; j += 2) {
            if ((((j + 2) / 2) + (i + 1) ) <= resLim) {
                var videoElement = document.createElement("video");
                videoElement.id = "vid" + i + "" + j;
                videoElement.className = "video-js vjs-default-skin video";
                // videoElement.autoplay = true;
                videoElement.controls = true;
                videoElement.width = "640";
                videoElement.height = "264";
                $("#content").append(videoElement);

                videojs(document.getElementById("vid" + i + "" + j), {
                    techOrder: ["youtube"],
                    sources: [{
                        "type": "video/youtube",
                        "src": data[i].url.toString(),
                        "youtube": {"ytControls": 2}
                    }]
                }, function () {
                });


                var player = videojs("vid" + i + "" + j);
                player.timeOffset({
                    start: timeSegments[j],
                    end: timeSegments[j + 1]
                });
            } else {
                globalI = i;
                globalJ = j;
                i = data.length;
                j = timeSegments.length;
                resLim += 10;
                var moreButton = '<button id="moreBtn" type="button" class="btn btn btn-default center-block center-button" onclick="moreVideos();">More</button>';
                $("#content").append(moreButton);
            }
        }
    }
}


function drawTable(data) {
    for (var i = 0; i < data.length; i++) {
        drawRow(data[i]);
    }
}

function drawRow(rowData) {
    var row = $("<tr />")
    $("#personDataTable").append(row); //this will append tr element to table... keep its reference for a while since we will add cels into it
    row.append($("<td>" + rowData.url + "</td>"));
    row.append($("<td>" + rowData.segments + "</td>"));
}