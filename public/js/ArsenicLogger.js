/**
 * Main class for app
 */

// If console.log doesn't exist, then just create an empty function for it
if (typeof console === "undefined"){
    console={};
    console.log = function(){return;};
    console.info = function(){return;};
    console.warn = function(){return;};
    console.error = function(){return;};
}
/**
 * Main Hub Class
 */
var ArsenicLogger = {

    currentVideoKey : '',

    currentGroupKey : '',

    // ////////////////////////////////////////////////////////////////////////////////

    init : function(){

        $(document).ready(function() {

        });

    },

    // ////////////////////////////////////////////////////////////////////////////////

    onSelectPage : function(page){

        var menu_div = '';
        var contents_div = '';
        var html_fragment = '';

        $('.logi-page-content').hide();

        switch(page){

            case 'home_page':
                contents_div = '#HomePage';
                menu_div = '#HomeMenuItem';
                html_fragment = 'html/home-fragment.html';
                break;

            case 'apps_page':
                contents_div = '#AppsPage';
                menu_div = '#AppsMenuItem';
                html_fragment = 'html/apps-fragment.html';
                break;

            case 'canvas_page':
                contents_div = '#CanvasPage';
                menu_div = '#CanvasMenuItem';
                html_fragment = 'html/canvas-fragment.html';
                break;

            case 'master_widget_page':
                contents_div = '#MasterWidgetPage';
                menu_div = '#MasterWidgetMenuItem';
                html_fragment = 'html/master-widget-fragment.html';
                break;

            case 'manage_users_page':
                contents_div = '#ManageUsersPage';
                menu_div = '#ManageUsersMenuItem';
                html_fragment = 'html/manage-users-fragment.html';
                break;

            case 'view_page':
                contents_div = '#ViewPage';
                menu_div = '#ViewMenuItem';
                html_fragment = 'html/view-fragment.html';
                break;

        }

        $('#MenuItems li').removeClass('active');
        $(menu_div).addClass('active');

        //alert('[' + $(contents_div).html() + ']');
        var scope = angular.element(document.getElementById('ArsenicLoggerContainer')).scope();

        if ($(contents_div).html() == ''){
            scope.loadHTMLFragment(contents_div, html_fragment);
        }
        else {
            scope.$apply();
        }

        $(contents_div).show();
    },

    // ////////////////////////////////////////////////////////////////////////////////

    msgTO : null,

    /**
     * Show a message to the user
     * @param msg
     * @param level error, info, success (defaults to info)
     */
    showMessage : function(msg, level){

        if (ArsenicLogger.msgTO) {
            clearTimeout(ArsenicLogger.msgTO);
        }

        $('.logMessageContents').html(msg);

        // Send to log as well
        if (level == 'error'){console.error(msg);}
        if (level == 'info'){console.log(msg);}

        // alert-block
        // alert-error, alert-success, alert-info
        $('.logMessage').removeClass('alert-danger alert-success alert-info hidden');
        if (level == 'error') $('.logMessage').addClass('alert-danger');
        if (level == 'info') $('.logMessage').addClass('alert-info');
        if (level == 'success') $('.logMessage').addClass('alert-success');

        $('.logMessage').show();

        ArsenicLogger.msgTO = setTimeout(ArsenicLogger.hideMessage, 6000);
    },

    hideMessage : function(){
        $('.logMessage').fadeOut('fast');
    }
}

ArsenicLogger.init();