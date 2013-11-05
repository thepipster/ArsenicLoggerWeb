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

    /**
     * Show a confirmation dialog box
     * @param {object} settings Setting object with the following fields (all are optional);
     *     title - the dialog title
     *     message - the dialog contents
     *     onYes - the callback that is fired when the user clicks the 'yes' button
     *     onNo - the callback that is fired when the user clicks the 'no' button
     *     onYesTitle - if specified, set a custom message for the 'yes' button
     *     onNoTitle - if specified, set a custom message for the 'no' button
     */
    confirmDialog : function(settings){

        var title = settings.title || 'Confirm';
        var message = settings.message || '';
        var onYes = settings.onYes || '';
        var onNo = settings.onNo || '';
        var onYesTitle = settings.onYesTitle || 'Yes';
        var onNoTitle = settings.onYesTitle || 'No';

        $('#AsConfirmModal .modal-title').html(title);
        $('#AsConfirmModal .modal-body').html(message);

        $('#AsConfirmModalYesButton').unbind( "click" );
        $('#AsConfirmModalNoButton').unbind( "click" );

        $('#AsConfirmModalYesButton').html(onYesTitle);
        $('#AsConfirmModalNoButton').html(onNoTitle);

        if ($.isFunction(onYes)){
            $('#AsConfirmModalYesButton').click(onYes);
        }
        if ($.isFunction(onNo)){
            $('#AsConfirmModalNoButton').click(onNo);
        }

        $('#AsConfirmModal').modal('show');

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