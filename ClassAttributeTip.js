$(document).ready(function () {
    $(document).on('click', function(event){
        $(".signature-container .description span").filter(function (index) {
            var content = $(this).text();
            return content.substr(content.length - 1) == "}";
        }).each(function (index, element) {
                var content = $(element).text();
                var index = content.indexOf("{");
                var tip = content.substring(index + 1, content.length - 1);
                var attribute = content.substring(0, index - 1);
                if (tip.substring(0, 2) == "必填" || tip.substring(0, 2) == "**") {
                    attribute = "<font color='red'>" + attribute + "</font>"
                }
                $(element).replaceWith('<a href="#" title="' + tip + '">' + attribute + '</a>');
            });
        $('a[title]').qtip({
            style: {
                tip: true,
                classes: 'ui-tooltip-dark'
            }
        });
    });
});