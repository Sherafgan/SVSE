function searchRequest() {
    var searchText = document.getElementById("searchText");
    $.getJSON("search", {searchText: searchText.value}, function (data) {
        document.getElementById("content").innerHTML = "";
        // drawTable(data);
        showVideos(data);
    });
}

function showVideos(data) {
    for (var i = 0; i < 3; i++) { //NOTE: i < data.length
        var timeSegments = [];
        timeSegments = data[i].segments[0];
        for (var j = 0; j < timeSegments.length; j += 2) {
            var videoElement = document.createElement("video");
            videoElement.id = "vid" + i + "" + j;
            videoElement.className = "video-js vjs-default-skin video";
            videoElement.autoplay = true;
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