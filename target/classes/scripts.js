function searchRequest() {
    var searchText = document.getElementById("searchText");
    $.getJSON("search", {searchText: searchText.value}, function (data) {
        // drawTable(data);

        var obj, source;

        obj = document.createElement('video');
        $(obj).attr('id', 'vid1');
        $(obj).attr('class', 'video-js vjs-default-skin video');
        $(obj).attr('width', '640');
        $(obj).attr('data-height', '264');
        $(obj).attr('controls', ' ');
        $(obj).attr('data-setup', '{"techOrder": ["youtube"], "sources": [{"type": "video/youtube", "src":"' + data[0].url + '"}] }');

        // source = document.createElement('source');
        // $(source).attr('type', 'video/mp4');
        // $(source).attr('src', 'http://video-js.zencoder.com/oceans-clip.mp4');

        $("#content").append(obj);
        // $(obj).append(source);

        // video.setAttribute("id", "vid1");
        // video.setAttribute("class", "video-js vjs-default-skin video");
        // video.setAttribute("controls", "controls");
        // video.setAttribute("autoplay", "autoplay");
        // video.setAttribute("width", "640");
        // video.setAttribute("height", "264");
        // video.setAttribute("data-setup", '{ "techOrder": ["youtube"], "sources": [{ "type": "video/youtube", "src":' + data[0].url + '}], "youtube": { "ytControls": 2 } }');

        // videojs("vid1", {
        //     "techOrder": ["youtube"],
        //     "sources": [{"type": "video/youtube", "src": data[0].url}]
        // }, function () {
        //
        // });

    });
}

function showVideos(data) {
    for (var i = 0; i < data.length; i++) {
        showVideo(data[i], i);
    }
}

function showVideo(videoInfo, num) {
    var video = document.createElement('video');
    var id = "vid" + num + "";
    video.setAttribute("id", id);
    video.setAttribute("class", "video-js vjs-default-skin video");
    video.setAttribute("controls", "controls");
    video.setAttribute("autoplay", "autoplay");
    video.setAttribute("width", "640");
    video.setAttribute("height", "264");


    videojs(id, {
        "techOrder": ["youtube"],
        "sources": [{"type": "video/youtube", "src": videoInfo.url}]
    }, function () {

    });
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