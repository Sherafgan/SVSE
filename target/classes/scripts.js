var resLim = 10, numberOfVideos = 0;

var globalData, globalI, globalJ;

function searchRequest() {
    var searchText = document.getElementById("searchText");
    $.getJSON("search", {searchText: searchText.value}, function (data) {
        var main = document.getElementById("content");
        main.innerHTML = "";
        main.appendChild(document.createElement("p").appendChild(document.createTextNode("About " + data.length + " results")));
        // drawTable(data);
        // showVideos(data);

        showYouTubeVideos(data);
    });
}

function showYouTubeVideos(data) {
    globalData = data;
    for (var i = 0; i < data.length; i++) {
        var timeSegments = [];
        timeSegments = data[i].segments[0];
        if (numberOfVideos < resLim) {
            var videoScope = document.createElement("div");
            var par = document.createElement("p");
            par.appendChild(document.createTextNode("sd"));
            videoScope.align = "left";

            var url = data[i].url.toString();
            var id = url.split("https://www.youtube.com/watch?v=");
            var embedUrl = "https://www.youtube.com/embed/" + id[1];

            var iframeVid = document.createElement("iframe");
            iframeVid.src = embedUrl;
            iframeVid.setAttribute("allowfullscreen", "true");
            iframeVid.frameborder = "0";
            iframeVid.width = "420";
            iframeVid.height = "200";
            iframeVid.align = "middle";
            iframeVid.style.margin = "10px 10px 10px 10px";

            videoScope.appendChild(iframeVid);
            videoScope.appendChild(par);
            $("#content").append(videoScope);
            numberOfVideos++;
        } else {
            globalI = i;
            i = data.length;
            resLim += 10;
            var moreButton = '<button id="moreBtn" type="button" class="btn btn btn-default center-block center-button" onclick="moreYouTubeVideos();">More</button>';
            $("#content").append(moreButton);
        }

    }
}

function moreYouTubeVideos() {
    var btnToRemove = document.getElementById('moreBtn');
    btnToRemove.parentNode.removeChild(btnToRemove);
    var data = globalData;
    for (var i = globalI; i < data.length; i++) { //NOTE: i < data.length
        var timeSegments = [];
        timeSegments = data[i].segments[0];
        if (numberOfVideos < resLim) {
            var videoScope = document.createElement("div");

            var url = data[i].url.toString();
            var id = url.split("https://www.youtube.com/watch?v=");
            var embedUrl = "https://www.youtube.com/embed/" + id[1];

            var iframeVid = document.createElement("iframe");
            iframeVid.src = embedUrl;
            iframeVid.setAttribute("allowfullscreen", "true");
            iframeVid.frameborder = "0";
            iframeVid.width = "420";
            iframeVid.height = "200";
            iframeVid.align = "middle";
            iframeVid.style.margin = "10px 10px 10px 10px";

            videoScope.appendChild(iframeVid)
            $("#content").append(videoScope);
            numberOfVideos++;
        } else {
            globalI = i;
            i = data.length;
            resLim += 10;
            var moreButton = '<button id="moreBtn" type="button" class="btn btn btn-default center-block center-button" onclick="moreVideos();">More</button>';
            $("#content").append(moreButton);
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