# videojs-time-offset
This repo is forked from https://github.com/cladera/videojs-time-offset, ported to es6, fixed somebugs

## Installation

```sh
npm install --save videojs-time-offset
```

The npm installation is preferred, but Bower works, too.

```sh
bower install  --save videojs-time-offset
```

## Usage

To include videojs-time-offset on your website or web application, use any of the following methods.

### `<script>` Tag

This is the simplest case. Get the script in whatever way you prefer and include the plugin _after_ you include [video.js][videojs], so that the `videojs` global is available.

```html
<script src="//path/to/video.min.js"></script>
<script src="//path/to/videojs-time-offset.min.js"></script>
<script>
  var player = videojs('my-video');

  player.timeOffset({
    start: 5, // in seconds
    end: 10
  });
</script>
```
Also you can use pagination params,

```html
<script>
var player = videojs('my-video');

player.timeOffset({
  page: 1, // starts from 1
  perPageInMinutes: 10
});
</script>
```

### Browserify

When using with Browserify, install videojs-time-offset via npm and `require` the plugin as you would any other module.

```js
var videojs = require('video.js');

// The actual plugin function is exported by this module, but it is also
// attached to the `Player.prototype`; so, there is no need to assign it
// to a variable.
require('videojs-time-offset');

var player = videojs('my-video');

player.time-offset();
```

### RequireJS/AMD

When using with RequireJS (or another AMD library), get the script in whatever way you prefer and `require` the plugin as you normally would:

```js
require(['video.js', 'videojs-time-offset'], function(videojs) {
  var player = videojs('my-video');

  player.time-offset();
});
```

## License

MIT.


[videojs]: http://videojs.com/
