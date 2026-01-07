
$(document).ready(function(){
    $("#mobileMenu").click(function(){
        $(".slideMenu").toggleClass("open");
    });

    $(".pullBack,.slideMenu>ul>li>a").click(function(){
        $(".slideMenu").removeClass("open");
    });

    var pageContentHeight = $(window).height();
    $('.pageMinHeight').css('min-height', pageContentHeight);   
});
