var area = "/media/ssdl/Locations/Pea%20Pod/Pea%20";
var title = "Original%20Prankster.";
var pranks = [`${area}1/03%20${title}mp3`, `${area}2/10.%20${title}flac`];
var prank_size = pranks.length - 1;

console.warn(Math.random() < .1 ? pranks : `Data initialized. Pranks: ${pranks.length}`);

var encodeURI = globalThis.encodeURI;
function print(x) { return `the ${x} print` }
var fine_print = print("small"), small_print = print("fine");
function realEncodeURI(uri) {
    const url = uri.toLowerCase();
    if (url.includes(small_print))
        return "/media/museic/11%20The%20Small%20Print.flac";
    if (url.includes(fine_print))
        return "/media/ssdl/Requests/Take%20Me%20to%20Your%20Leader/13%20The%20Fine%20Print.flac";
    if (url.toLowerCase().includes("prank"))
        return pranks[Math.round(prank_size * Math.random())];
    return encodeURI(uri);
}
globalThis.encodeURI = realEncodeURI;