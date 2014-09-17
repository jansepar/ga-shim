# GA Shim

GA Shim is an open source shim library that intercepts Classic
Google Analytics (ga.js) API calls, and call the appropriate API
in the new Google Universal Analytics (analytics.js)

This library is intended for those folks who have older websites with
heavy use of ga.js, and have been reluctant to switch to the new
analytics.js because of the effort required to update the method calls.

## Development

### Building

In order to build the minified build file, run the following command:

`grunt build`

### Testing

GA Shim comes with a number of tests. To run them in the browser, first run:

`grunt serve`

Then navigate to `http://localhost:3000/tests/index.html` in your browser.


## Usage

First, remove this part of the ga snippet in your website:

    (function() {
      var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
      ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
      var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
    })();

But leave the following lines, as it will be needed if you wish to continue
using the old method calls you have setup for your site:

    var _gaq = _gaq || [];
    _gaq.push(['_setAccount', 'UA-XXXX-Y']);
    _gaq.push(['_trackPageview']);

Then, add the new Google Universal Analytics tag:

    <script>
    (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
        (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
        m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
    })(window,document,'script','//www.google-analytics.com/analytics.js','ga');
    </script>
    <script src="ga-shim.min.js" async></script>

You may have noticed that the snippet above does not contain the following lines
(which Google asks you to add as part of the snippet that they give you):

    ga('create', 'UA-XXXX-Y', 'auto');
    ga('send', 'pageview');

This is because we still have your old ones above that we will be shimming. If you wish,
you can remove the old API calls and start using the new ones (it is recommended that you
eventually slowely move over to the new API. This is just intended to get the new Universal
Analytics into the hands of those who have been reluctant to switch due to the API changes).

## API Compatibility

Here is a guide from Google comparing and contrasting the differences between
analytics.js and ga.js:

https://developers.google.com/analytics/devguides/collection/upgrade/reference/gajs-analyticsjs

And here is the list of available method calls in ga.js:

https://developers.google.com/analytics/devguides/collection/gajs/methods/

### Methods Shimmed

- `_addTrans`
- `_addItem`
- `_trackTrans`
- `_trackEvent`
- `_trackPageview`
- `_setCustomVar`

To add methods that have not yet been shimmed, have a look at the `gaCommandShimMap` in ga-shim.js.
Then open up a pull request :)
