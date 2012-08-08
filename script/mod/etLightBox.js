ET.namespace('ET.module');
ET.module.lightBox = function () {
    this.defConfig = {
        wH: {
            width: 400,
            height: 400
        },
        isMask: true,
        opacity: 0.56,
        url: '',
        zIndex: 1000,
        marginParam: '',
        bgRound: '#000000',
        html: '',
        lT: {
            l: 0,
            t: 0
        },
        position: 'absolute',
        title:'',
        closeCallBack:null,
        scroll:'no',
        isIfr:true
    }
}
ET.module.lightBox.prototype = {
    init: function (oConfig) {
        var self = this;
        self.config = $.extend({}, self.defConfig, oConfig || {});
        $(parent.document).keydown(function (event) {
            if (event.keyCode == 27) {
                self.close();
            }
        });

        $(window).resize(function () {
            var lTo = self.adjustCenter();
            self.ltboxAreaObj.css(lTo);
        });
    },
    loadIframe: function () {
        this.createBgDiv();
        this.createContent();
    },
    createBgDiv: function () {
        var time = this.time = new Date().getTime();
        var docScrHeight = document.documentElement.scrollHeight || document.body.scrollHeight;
        var docCltHeight = document.documentElement.clientHeight || document.body.clientHeight;
        var height = Math.max(docScrHeight, docCltHeight);
        var con = this.config, cssp = { position: 'absolute',
            'z-index': con.zIndex - 1,
            'background-color': con.bgRound,
            opacity: con.opacity,
            width: '100%',
            height: height,
            top: 0,
            left: 0
        };
        if ($.browser.msie && $.browser.version - 0 === 7) {
            cssp = $.extend(true, cssp, { position: 'fixed', height: height });
        }
        $('<div id="ltboxMasklay' + time + '"></div>').css(cssp).appendTo((document.body));
    },
    createContent: function () {
        var time = this.time;
        var self = this, con = self.config, cssp = { position: 'relative',
            'background-color': '#ffffff',
            width: con.wH.width,
            height: 'auto',
            top: '24px',
            left: '0'
        }, ifrp, WTH = 12, ltboxCloseObj = $('<div id="ltBoxClose' + time + '" class="lt-box-close" style="z-index:' + con.zIndex + ';bottom:-35px;"></div>'),
        ltboxContentObj = $('<div id="ltboxContent' + time + '"></div>'),
        ltboxOuterObj = $('<div id="ltboxOuter' + time + '"></div>'),
        ltboxAreaObj = $('<div id="ltboxArea' + time + '" style="position:' + con.position + ';left:-3000px;z-index:' + con.zIndex + ';"></div>');

        self.ltboxCloseObj = ltboxCloseObj;
        self.ltboxAreaObj = ltboxAreaObj;

        if (con.isIfr) {
            var ltboxIfrObj = $('<iframe id="ltbLoadUrl' + time + '" class="ltb-load-frame" margintop="0" scrolling="' + con.scroll + '" marginwidth="0" marginheight="0" frameborder="0"></iframe>');
            ltboxContentObj.css(cssp);
            ifrp = { width: con.wH.width,
                height: con.wH.height,
                border: 0
            };
            ltboxContentObj.append(ltboxIfrObj);
            ltboxIfrObj.css(ifrp);
            ltboxIfrObj[0].src = con.url;
        } else {
            var ltboxIfrObj = con.htmlContent;
            ltboxContentObj.append(ltboxIfrObj);
        }
        ltboxOuterObj.css({ position: 'relative', width: '100%', height: '100%' });
        ltboxOuterObj.append('<div class="lt-box-bg lt-box-topl" style="z-index:1000;"></div>' + '<div class="lt-box-topm" style="z-index:1000;text-align:center;font-weight:bold;line-height:26px;width:' + parseInt(con.wH.width - WTH * 2) + 'px">' + con.title + '</div>' + '<div class="lt-box-bg lt-box-topr" style="z-index:1000;"></div>' + '<div class="lt-box-midr" style="z-index:1000;background:#F6F6F6;"></div>' + '<div class="lt-box-midl" style="z-index:1000;background:#F6F6F6;"></div>').append(ltboxContentObj).append('<div class="lt-box-bg lt-box-bomr" style="z-index:1000;bottom:-35px;"></div>' + '<div class="lt-box-bomm" style="z-index:1000;bottom:-35px;width:' + parseInt(con.wH.width - WTH * 2) + 'px"></div>' + '<div class="lt-box-bg lt-box-boml" style="z-index:1000;bottom:-35px;"></div>').append(ltboxCloseObj);
        ltboxCloseObj.click(function () {
            self.config.closeCallBack && self.config.closeCallBack();
            self.close();
        });
        ltboxOuterObj.append('<div class="lt-box-shadow-l"></div><div class="lt-box-shadow-r"></div>');
        ltboxAreaObj.append(ltboxOuterObj);

        ltboxAreaObj.appendTo($(document.body));
        var lTo = self.adjustCenter();
        ltboxAreaObj.css(lTo);
    },
    adjustCenter: function () {
        var self = this;
        var con = self.config;
        var docWidth = document.documentElement.clientWidth || document.body.clientWidth;
        var docHeight = document.documentElement.clientHeight || document.body.clientHeight;
        var docTop = document.documentElement.scrollTop || document.body.scrollTop;
        var tempTop = (docHeight - con.wH.height) / 2;  // vertical center
        var lTo = {
            left: (docWidth - (self.ltboxAreaObj.outerWidth() + 24)) / 2 + con.lT.l + 'px',
            top: (con.position == 'fixed' ? tempTop : (docTop + con.lT.t)) + 'px'
        };
        return lTo;
    },
    closeWithCallback: function () {
        this.ltboxCloseObj.click();
    },
    close: function () {
        $('#ltboxArea' + this.time).remove();
        $('#ltboxMasklay' + this.time).remove();
    }
}

