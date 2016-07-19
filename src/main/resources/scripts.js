var resLim = 10, numberOfVideos = 0, globalData, globalI;

function searchRequest() {
    var searchText = document.getElementById("searchText");
    $.getJSON("search", {searchText: searchText.value}, function (data) {
        var main = document.getElementById("content");
        main.innerHTML = "";
        numberOfVideos = 0;
        resLim = 10;
        // main.appendChild(document.createElement("p").appendChild(document.createTextNode("About " + data.length + " results")));
        var numberOfResultsDiv = document.createElement("div");
        numberOfResultsDiv.style = "margin-left:13px;margin-top:10px";
        var resultsTxt = document.createTextNode("About " + data.length + " results");
        var par = document.createElement("p");
        par.style.fontSize = "11px";
        par.appendChild(resultsTxt);
        numberOfResultsDiv.appendChild(par);
        $("#content").append(numberOfResultsDiv);
        // main.appendChild(numberOfResultsDiv);

        // drawTable(data);
        showYouTubeVideos(data);
    });
}

function showYouTubeVideos(data) {

    globalData = data;
    globalI = 0;
    var resultsPerPage;
    if (data.length - resLim <= 0) {
        resultsPerPage = data.length;
    } else {
        resultsPerPage = resLim;
    }
    for (var i = globalI; i < resultsPerPage; i++) {
        var timeSegments = [];
        timeSegments = data[i].segments[0];
        var url = data[i].url.toString();
        var id = url.split("https://www.youtube.com/watch?v=");
        var embedUrl = "https://www.youtube.com/embed/" + id[1];

        var iframeVid = document.createElement("iframe");
        iframeVid.src = embedUrl;
        iframeVid.setAttribute("allowfullscreen", "true");
        iframeVid.frameborder = "0";
        iframeVid.width = "400";
        iframeVid.height = "180";
        // iframeVid.align = "middle";
        iframeVid.style.margin = "10px 10px 10px 10px";

        var videoDiv = document.createElement("div");
        videoDiv.className = "sideDiv";
        videoDiv.appendChild(iframeVid);

        //BEGIN get DURATION
        var duration = "";
        var length = 0;
        $.ajax({
            async: false,
            type: 'GET',
            url: "https://www.googleapis.com/youtube/v3/videos?id=" + id[1] + "&key=AIzaSyDYwPzLevXauI-kTSVXTLroLyHEONuF9Rw&part=snippet,contentDetails",
            success: function (succeedResponse) {
                duration += succeedResponse.items[0]['contentDetails']['duration'];
                length = convert_time_to_ss(duration);
                duration = convert_time_to_mm_ss(duration);
            }
        });
        //END

        var matchScore = 0;
        var firstTimeSegment = true;
        var timeSegmentsString = "";
        for (var j = 0; j < timeSegments.length; j += 2) {
            var start = Math.round(timeSegments[j]);
            var end = Math.round(timeSegments[j + 1]);
            if (start != end) {
                if (firstTimeSegment) {
                    timeSegmentsString += start + "-" + end;
                    firstTimeSegment = false;
                } else {
                    timeSegmentsString += ", " + start + "-" + end;
                }
            }
            matchScore += (end - start);
        }
        var matchScorePercentage = Math.round((matchScore * 100) / length);
        var timeSegmentsInfo = document.createElement("h4");
        timeSegmentsInfo.appendChild(document.createTextNode("Time segments: " + timeSegmentsString + " (sec)"));
        var matchScoreInfo = document.createElement("p");
        matchScoreInfo.appendChild(document.createTextNode("Match score: "
            + matchScore + " seconds in total (" + matchScorePercentage + "%)"));
        var durationInfo = document.createElement("p");
        durationInfo.appendChild(document.createTextNode("Duration: " + duration));

        var annotationDiv = document.createElement("div");
        annotationDiv.className = "sideDiv annotationDiv";
        annotationDiv.appendChild(timeSegmentsInfo);
        annotationDiv.appendChild(matchScoreInfo);
        annotationDiv.appendChild(durationInfo);

        var resultDiv = document.createElement("div");
        resultDiv.className = "resultDiv";
        var childResultDiv = document.createElement("div");
        childResultDiv.appendChild(videoDiv);
        childResultDiv.appendChild(annotationDiv);
        resultDiv.appendChild(childResultDiv);
        $("#content").append(resultDiv);
        numberOfVideos++;
    }
    globalI = resLim;
    resLim += 10;
}

$(document).ready(function () {
    var win = $(window);

    // Each time the user scrolls
    win.scroll(function () {
        // End of the document reached?
        if ($(document).height() - win.height() == win.scrollTop()) {
            var resultsPerPage;
            if (globalData.length - resLim <= 0) {
                resultsPerPage = globalData.length;
            } else {
                resultsPerPage = resLim;
            }
            for (var i = globalI; i < resultsPerPage; i++) {
                var timeSegments = [];
                timeSegments = globalData[i].segments[0];
                var url = globalData[i].url.toString();
                var id = url.split("https://www.youtube.com/watch?v=");
                var embedUrl = "https://www.youtube.com/embed/" + id[1];

                var iframeVid = document.createElement("iframe");
                iframeVid.src = embedUrl;
                iframeVid.setAttribute("allowfullscreen", "true");
                iframeVid.frameborder = "0";
                iframeVid.width = "400";
                iframeVid.height = "180";
                // iframeVid.align = "middle";
                iframeVid.style.margin = "10px 10px 10px 10px";

                var videoDiv = document.createElement("div");
                videoDiv.className = "sideDiv";
                videoDiv.appendChild(iframeVid);

                var annotationInfo = document.createElement("p");
                annotationInfo.appendChild(document.createTextNode("#" + (numberOfVideos + 1)));

                var annotationDiv = document.createElement("div");
                annotationDiv.className = "sideDiv annotationDiv";
                annotationDiv.appendChild(annotationInfo);

                var resultDiv = document.createElement("div");
                resultDiv.className = "resultDiv";
                var childResultDiv = document.createElement("div");
                childResultDiv.appendChild(videoDiv);
                childResultDiv.appendChild(annotationDiv);
                resultDiv.appendChild(childResultDiv);
                $("#content").append(resultDiv);
                numberOfVideos++;
            }
            globalI = resLim;
            resLim += 10;
        }
    });
});

function convert_time_to_mm_ss(duration) {
    var a = duration.match(/\d+/g);

    if (duration.indexOf('M') >= 0 && duration.indexOf('H') == -1 && duration.indexOf('S') == -1) {
        a = [0, a[0], 0];
    }

    if (duration.indexOf('H') >= 0 && duration.indexOf('M') == -1) {
        a = [a[0], 0, a[1]];
    }
    if (duration.indexOf('H') >= 0 && duration.indexOf('M') == -1 && duration.indexOf('S') == -1) {
        a = [a[0], 0, 0];
    }

    duration = 0;

    if (a.length == 3) {
        duration = duration + parseInt(a[0]) * 3600;
        duration = duration + parseInt(a[1]) * 60;
        duration = duration + parseInt(a[2]);
    }

    if (a.length == 2) {
        duration = duration + parseInt(a[0]) * 60;
        duration = duration + parseInt(a[1]);
    }

    if (a.length == 1) {
        duration = duration + parseInt(a[0]);
    }
    var h = Math.floor(duration / 3600);
    var m = Math.floor(duration % 3600 / 60);
    var s = Math.floor(duration % 3600 % 60);
    return ((h > 0 ? h + ":" + (m < 10 ? "0" : "") : "") + m + ":" + (s < 10 ? "0" : "") + s);
}

function convert_time_to_ss(duration) {
    var a = duration.match(/\d+/g);

    if (duration.indexOf('M') >= 0 && duration.indexOf('H') == -1 && duration.indexOf('S') == -1) {
        a = [0, a[0], 0];
    }

    if (duration.indexOf('H') >= 0 && duration.indexOf('M') == -1) {
        a = [a[0], 0, a[1]];
    }
    if (duration.indexOf('H') >= 0 && duration.indexOf('M') == -1 && duration.indexOf('S') == -1) {
        a = [a[0], 0, 0];
    }

    duration = 0;

    if (a.length == 3) {
        duration = duration + parseInt(a[0]) * 3600;
        duration = duration + parseInt(a[1]) * 60;
        duration = duration + parseInt(a[2]);
    }

    if (a.length == 2) {
        duration = duration + parseInt(a[0]) * 60;
        duration = duration + parseInt(a[1]);
    }

    if (a.length == 1) {
        duration = duration + parseInt(a[0]);
    }
    return duration
}

function drawTable(data) {
    for (var i = 0; i < data.length; i++) {
        drawRow(data[i]);
    }
}

function drawRow(rowData) {
    var row = $("<tr />")
    $("#dataTable").append(row); //this will append tr element to table... keep its reference for a while since we will add cels into it
    row.append($("<td>" + rowData.url + "</td>"));
    row.append($("<td>" + rowData.segments + "</td>"));
}