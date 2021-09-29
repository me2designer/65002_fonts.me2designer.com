$(function(){/*
■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■
*/(function(){



    var FONTS;
    var $family = $('.top .family');
    var $familyOption = $family.find('option').detach();
    var $size1 = $('.top .size input');
    var $size2 = $('.top .size select');
    var $color = $('.top .color input');
    var $weight = $('.top .weight');
    var $weightOption = $weight.find('option').detach();
    var $style = $('.top .style');
    var $spacing = $('.top .spacing input');

    $.ajax({
        url : '/json/fonts.json'+cache,
        async : false,
        success : function(data){
            FONTS = data
            FONTS.sort(function(a,b){
                return a.name - b.name;
            })
        }
    });

    function fontChange (){

        var $textarea = $('.contents textarea');

        var color = $color.val();
        var family =$family.val();
        var size = $size1.val()+$size2.val();
        var weight =$weight.val();
        var style =$style.val();
        var spacing =$spacing.val();
        

        var value = '{';

        if(color) value += (' color : '+color+';');
        if(family) {
            value += (' font-family : "'+family+'";');
        } else {
            value += (' font-family : "Dotum";');
        }
        if(size.replace(/px/,'')) value += (' font-size : '+size+';');
        if(weight) value += (' font-weight : '+weight+';');
        if(style) value += (' font-style : '+style+';');
        if(spacing) value += (' letter-spacing : '+spacing+'em;');
        value+='}';
        $textarea.val(value.replace(/\{ /, '{'));
        
        if(!$size1.val()){
            switch($size2.val()){
                case 'px':
                    $size1.attr('placeholder', 16);
                    size = '16px'
                break;
                case 'vw':
                    $size1.attr('placeholder', 4);
                    size = '4vw'
                break;
            }
        }

        $textarea.css({
            color : color,
            fontFamily : family||'dotum',
            fontSize : (size||'16px'),
            fontWeight : weight||400,
            fontStyle : style,
            'letter-spacing' : (spacing||0)+'em',
        });
    }

    FONTS.forEach(function(font){
        var head  = document.getElementsByTagName('head')[0];
        var tag  = document.createElement('link');
        tag.rel = 'stylesheet';
        tag.type = 'text/css';
        tag.href = SERVER.fonts+font.path+cache;
        head.appendChild(tag);
    });

    pushList({
        list : FONTS,
        ul : $family,
        li : $familyOption,
        afterLoad : function(){

            $family.prepend('<option value="" selected>폰트모양 (기본: Dotum)</option>')

            $family.off('change').on('change', function(){
                
                var fontName = $family.val();
                if(fontName) {
                    $('.tail button').show();
                } else {
                    $('.tail button').hide();
                }
                var fontInfo = filterList(FONTS, function(each){
                    if(each.name == fontName) return each;
                })[0];

                if(!fontInfo){
                    fontInfo = {
                        weights : {
                            default : 400,
                            list :  [400,700]
                        }
                    }
                }

                pushList({
                    list : fontInfo.weights.list,
                    ul : $weight,
                    li : $weightOption,
                    each : function(each){
                        var idx = each.index();
                        var value = fontInfo.weights.list[idx];
                        if(fontInfo.weights.default == value) each.attr('selected', true);
                        each.attr('data-value', value).text(value);
                    },
                    afterLoad : function(){
                        $weight.off('change').on('change', fontChange).trigger('change');
                    }
                })
            }).trigger('change');
        }
    })

    $size1.on('input', fontChange);
    $size2.on('change', function(){
        var size = $size1.val();
        var windowW = innerWidth;
        if(size){
            if($size2.val()=='px'){
                size =  Math.round(windowW/100 * size)
            } else {
                size = Number((size/(windowW/100)).toFixed(4))
            }
            $size1.val(size)
        }
        fontChange();
    });
    $color.on('input', fontChange);
    $style.on('change', fontChange);
    $spacing.on('input', fontChange);



})();/*
■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■
*/(function(){



    $(window).on('resize', function(){

        var DEVICE = getDevice();
        var $wrap = $('#wrap');
        isPC = $wrap.attr('data-target-device') == 'pc';
        if($wrap.attr('data-target-device') != DEVICE.type){

            if(isPC){
                $wrap.attr({
                    'data-target-device' : 'mo',
                    'data-grid-width' : 'auto',
                })
            } else {
                $wrap.attr({
                    'data-target-device' : 'pc',
                    'data-grid-width' : '1280',
                })
            }

        }
    }).trigger('resize');



})();/*
■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■
*/(function(){



    var fontFileType = ['.ttf', '.eot', '.woff', '.woff2', '.svg'];
    var fontWeightName = ['', 'Thin', 'Light', 'Regular', 'Medium', 'Bold', 'Black'];

    $('.tail button').on('click', function(){

        var family = $('.family').val();
        var zip = new JSZip()
        function loop (i){
            var I = Math.floor(i/2||0);
            var weight = (I?'-':'')+fontWeightName[I];
            var italic = i%2 ? '-Italic' : '';
            var fontFile = family+weight+italic+fontFileType[0];
            var fontPath = SERVER.fonts+'/fonts/'+family+'/'+fontFile;

            if( fontWeightName.length>I ) {

                JSZipUtils.getBinaryContent(fontPath , function (err, data) {
                    try {
                        if(err) throw err;
                        zip.file(fontFile, data, {binary:true});
                        loop(++i);
                    } catch (error) {
                        loop(++i);
                    }
                });
            } else {
                zip.generateAsync({type:'blob'}).then(function (blob) {
                    saveAs(blob, family+'.zip');
                });
            }
        }
        loop(0);

    });



})();/*
■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■
*/(function(){ 



    // var layerX , layerY;
    // $('textarea').on('mousemove', function(){
    //     console.log(event)
    // })


    function canvasParticle (x, y){
    
        $('canvas').particle({
            canvas : {
                // blockTop : 100,
                // blockBottom : 100,
                // blockLeft : 100,
                // blockRight : 100,
            },
            particles : {
                amount : randomNumber(-2,2),
                bornX : function(){
                    return randomNumber(x-30,x+30);
                },
                bornY : function(){
                    return randomNumber(y-30,y+30);
                },
                live : 800,
                fadeIn : 400,
                fadeOut : 400,
                gravity : -0.004,
                opacity : function(){
                    return randomNumber(0.05,0.5);
                },
                // friction : 0.25,
                width : function(){
                    return randomNumber(5,25);
                },
                directionX : function(){
                    return randomNumber(-0.2, 0.2);
                },
                directionY : function(){
                    return randomNumber(-0.2, 0.2);
                },
                backgroundColor : 'rgb(255,255,255)',
                borderWidth : 0,
                borderColor : 'rgba(0,0,0,0)',
                lineWidth : 0,
                lineRadius : 0,
                lineColor : 'rgba(0,0,0,0)',
            }
        })
    }
    var loop, x, y;
    $('.contents').on('mousemove', function(e){
        x = e.pageX - $(this).offset().left;
        y = e.pageY - $(this).offset().top;
    })

    $('.contents').on('mouseover', function(e){
        loop = setInterval(function(){
            canvasParticle(x, y)
        }, 100)
    })

    $('.contents').on('mouseleave',  function(){
        clearInterval(loop)
    })


})();/*
■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■
*/});