var a_idx = 0;
$("body").click(function(e) {
    var a = new Array(
        "YT搜尋劉昕",
		"Spotify搜尋劉昕",
		"KKbox搜尋劉昕"
        );
    const col = [
	//"#5f0f40","#9a031e","#fb8b24","#e36414","#0f4c5c"
	"#8e9aaf","#cbc0d3","#efd3d7","#feeafa","#dee2ff"
    ];
    var $i = $("<span/>").text(a[a_idx]);
    a_idx = (a_idx + 1) % a.length;
    var x = e.pageX,
    y = e.pageY;
    $i.css({
        "z-index": 144469,
        "top": y - 20,
        "left": x,
        "position": "absolute",
        "font-weight": "600",
		"font-family": "Noto Sans TC",
        "color": col[Math.floor((Math.random()*col.length))]
    });
    $("body").append($i);
    $i.animate({
        "top": y - 180,
        "opacity": 0
    },
    1500,
    function() {
        $i.remove()
    })
});
