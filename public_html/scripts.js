function searchRequest() {
    var searchText = document.getElementById("searchText");

    // $.ajax({
    //     type: "GET",
    //     url: "search",
    //     dataType: 'json',
    //     data: {searchText: searchText.value},
    //     success: function (data) {
    //         alert(data);
    //     }
    // })
    //     .done(function () {
    //         alert("sdm");
    //     })
    //     .fail(function () {
    //         alert("Sorry. Server unavailable. ");
    //     });

    $.getJSON("search", {searchText: searchText.value}, function (data) {
        drawTable(data);
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