// jQuery File Tree Plugin
//
// Version 1.01
//
// Cory S.N. LaViska
// A Beautiful Site (http://abeautifulsite.net/)
// 24 March 2008
//
// Visit http://abeautifulsite.net/notebook.php?article=58 for more information
//
// Usage: $('.fileTreeDemo').fileTree( options, callback )
//
// Options:  root           - root folder to display; default = /
//           script         - location of the serverside AJAX file to use; default = jqueryFileTree.php
//           folderEvent    - event to trigger expand/collapse; default = click
//           expandSpeed    - default = 500 (ms); use -1 for no animation
//           collapseSpeed  - default = 500 (ms); use -1 for no animation
//           expandEasing   - easing function to use on expand (optional)
//           collapseEasing - easing function to use on collapse (optional)
//           multiFolder    - whether or not to limit the browser to one subfolder at a time
//           loadMessage    - Message to display while initial tree loads (can be HTML)
//
// History:
//
// 1.01 - updated to work with foreign characters in directory/file names (12 April 2008)
// 1.00 - released (24 March 2008)
//
// TERMS OF USE
//
// This plugin is dual-licensed under the GNU General Public License and the MIT License and
// is copyright 2008 A Beautiful Site, LLC.
//


if(jQuery) (function($){

	$.extend($.fn, {
		fileTree: function(opt, open, getDirList) {
			// Defaults
			if( !opt ) var opt = {};
			if( opt.root === undefined ) opt.root = '/';
			if( opt.script === undefined ) opt.script = 'jqueryFileTree.php';
			if( opt.folderEvent === undefined ) opt.folderEvent = 'click';
			if( opt.expandSpeed === undefined ) opt.expandSpeed= 500;
			if( opt.collapseSpeed === undefined ) opt.collapseSpeed= 500;
			if( opt.expandEasing === undefined ) opt.expandEasing = null;
			if( opt.collapseEasing === undefined ) opt.collapseEasing = null;
			if( opt.multiFolder === undefined ) opt.multiFolder = true;
			if( opt.loadMessage === undefined ) opt.loadMessage = 'Loading...';

			$(this).each( function() {

				function showTree(c, dir) {
					$(c).addClass('wait');
					$(".jqueryFileTree.start").remove();
					var data = getDirList(dir);
					$(c).find('.start').html('');
					$(c).removeClass('wait').append(makeHTML(data));
					if( opt.root == dir ) $(c).find('UL:hidden').show(); else $(c).find('UL:hidden').slideDown({ duration: opt.expandSpeed, easing: opt.expandEasing });
					bindTree(c);
				}

				function makeHTML(data){
					var r = '<ul class="jqueryFileTree" style="display: none;">';
					data.forEach(function(item){
						switch(item.type){
							case "dir":
							case "file":
							r += '<li class="' + item.class + '"><a href="#" rel="'+ item.path + '">' + item.text + '</a></li>';
							break;
							case "error":
		          r += item.msg; break;
						}
					});
					r += '</ul>';
					return r;
				}

				function bindTree(t) {
					$(t).find('LI A').bind(opt.folderEvent, function() {	// Response to click
						if( $(this).parent().hasClass('directory') ) {			// If folder, open the folder
							if( $(this).parent().hasClass('collapsed') ) {
								// Expand
								if( !opt.multiFolder ) {
									$(this).parent().parent().find('UL').slideUp({ duration: opt.collapseSpeed, easing: opt.collapseEasing });
									$(this).parent().parent().find('LI.directory').removeClass('expanded').addClass('collapsed');
								}
								$(this).parent().find('UL').remove(); // cleanup
								showTree( $(this).parent(), escape($(this).attr('rel').match( /.*\// )) );
								$(this).parent().removeClass('collapsed').addClass('expanded');
							} else {
								// Collapse
								$(this).parent().find('UL').slideUp({ duration: opt.collapseSpeed, easing: opt.collapseEasing });
								$(this).parent().removeClass('expanded').addClass('collapsed');
							}
						} else {																						// If file, use open() function
							open($(this).attr('rel'));
						}
						return false;
					});
					// Prevent A from triggering the # on non-click events
					if( opt.folderEvent.toLowerCase != 'click' ) $(t).find('LI A').bind('click', function() { return false; });
				}

				// Loading message
				$(this).html('<ul class="jqueryFileTree start"><li class="wait">' + opt.loadMessage + '<li></ul>');
				// Get the initial file list
				//console.log("dir: "+opt.root);
				//console.log("dir-escaped: "+escape(opt.root));
				showTree( $(this), escape(opt.root) );
			});
		}
	});

})(jQuery);
