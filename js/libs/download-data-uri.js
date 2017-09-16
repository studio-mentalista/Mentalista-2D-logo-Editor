/* dependency: jquery */
var downloadDataURI = function(options) {
  if(!options) {
    return;
  }
  $.isPlainObject(options) || (options = {data: options});
  if(!$.browser.webkit) {
    location.href = options.data;
  }
  options.filename || (options.filename = "download." + options.data.split(",")[0].split(";")[0].substring(5).split("/")[1]);
  options.url || (options.url = "http://download-data-uri.appspot.com/");
  $('<form method="post" action="'+options.url+'" style="display:none"><input type="hidden" name="filename" value="'+options.filename+'"/><input type="hidden" name="data" value="'+options.data+'"/></form>').submit().remove();
}