jQuery(document).ready(function($) {
    featuredSliderDefaults = $.parseJSON(featuredSliderDefaults);

    /* Featured slider navigation */
    $('#carousel').flexslider({
        animation: "slide",
        controlNav: true,
        directionNav: true,
        animationLoop: true,
        useCSS: false,
        slideshow: false,
        pauseOnAction: true,
        pauseOnHover: true,
        itemWidth: 180,
        asNavFor: '#slider'
    });

    /* Featured slider */
    featuredSlider = $("#slider").flexslider({
        controlNav: false,
        directionNav:true,
        animationLoop: true,
        sync: "#carousel",
        video:true,
        animation: featuredSliderDefaults.animation,
        useCSS: false,
        smoothHeight: true,
        slideshow: featuredSliderDefaults.slideshow,
        slideshowSpeed: featuredSliderDefaults.slideshowSpeed,
        pauseOnAction: true,
        pauseOnHover: featuredSliderDefaults.pauseOnHover,
        animationSpeed: 600,
        start: loadDynamicSlideContent,
        before: loadDynamicSlideContent
    });

    function loadDynamicSlideContent(slider) {
        /* Remove active video from previuous dynamic slide */
        slider.find('.cover--dynamic').removeClass('cover--dynamic').empty();

        /* Insert new video */
        var index = slider.animatingTo;
        var slide = slider.slides.get(index);

        /* Embed code strategy */
        var videoEmbed = $(slide).find('.video-embed').data('embed');

        if (videoEmbed) {
            var vzmejsSettings = {};
            var cover = $(slide).find('.video-cover');
            cover.html(videoEmbed);
            cover.addClass('cover--dynamic');

            /* Enable Video API if autoplay is enabled */
            if (featuredSliderDefaults.slideshow) {
                var youtubeSelectors = [
                    "iframe[src*='youtube.com']",
                    "iframe[src*='youtube-nocookie.com']",
                ];

                var vimeoSelectors = [
                    "iframe[src*='player.vimeo.com']"
                ];

                var mejsSelectors = [
                    ".wp-video-shortcode"
                ];

                var ytVideo    = cover.find(youtubeSelectors.join(','));
                var vimeoVideo = cover.find(vimeoSelectors.join(','));
                var meJsVideo  = cover.find(mejsSelectors.join(','));

                var src;

                if (ytVideo.length) {
                    src = ytVideo.prop('src');
                    if (src.indexOf("?") > -1) {
                        ytVideo.prop('src', src + '&enablejsapi=1');
                    } else {
                        ytVideo.prop('src', src + '?enablejsapi=1');
                    }

                    new YT.Player(ytVideo.get(0), {
                        events: {
                            'onStateChange' : onYoutubeStateChange
                        }
                    })
                } else if (vimeoVideo.length) {
                    src = vimeoVideo.prop('src');
                    vimeoVideo.prop('src', src + '&api=1&player_id=' + $(vimeoVideo).prop('id'));

                    var player = $f(vimeoVideo.get(0));
                    player.addEvent('ready', function() {
                        player.addEvent('play', stopFeaturedSlider);
                    });
                } else if (meJsVideo.length) {
                    vzmejsSettings.success = function(mejs) {
                        mejs.addEventListener('playing', stopFeaturedSlider);
                    }
                }
            }

            /* MediaElement.js */
            if (cover.find('.wp-video-shortcode').length) {
                cover.find('.wp-video-shortcode').mediaelementplayer(vzmejsSettings);
            }
        }


    }
});
