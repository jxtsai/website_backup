/* YRSS 1.0.7 */
/* Copyright (c) 2017 Mark Hillard - MIT License */

(function ($) {
    
    // use strict mode
    'use strict';
    
    $.fn.rssfeed = function (url, options, fn) {
        
        // plugin defaults
        var defaults = {
            ssl: true,
            limit: 10,
            showerror: true,
            errormsg: '',
            tags: true,
            date: true,
            dateformat: 'default',
            titletag: 'h4',
            content: true,
            image: true,
            snippet: true,
            snippetlimit: 120,
            linktarget: '_self'
        };
        
        // extend options
        options = $.extend(defaults, options);
        
        // return functions
        return this.each(function (i, e) {
            // check for ssl protocol
            var s = '';
            if (options.ssl) { s = 's'; }
            
            // add class to container
            if (!$(e).hasClass('rssFeed')) { $(e).addClass('rssFeed'); }
            
            // check for valid url
            if (url === null) { return false; }
            
            // create yql query
            var query = 'http' + s + '://query.yahooapis.com/v1/public/yql?q=' + encodeURIComponent('select * from feed where url="' + url + '"');
            if (options.limit !== null) { query += ' limit ' + options.limit; }
            query += '&format=json';
            
            // send request
            $.getJSON(query, function (data, status, errorThrown) {
                // if successful... *
                if (status === 'success') {
                    // * run function to create html result
                    process(e, data, options);
                    
                    // * optional callback function
                    if ($.isFunction(fn)) { fn.call(this, $(e)); }
                    
                // if there's an error... *
                } else if (status === 'error' || status === 'parsererror') {
                    // if showerror option is true... *
                    if (options.showerror) {
                        // variable scoping (error)
                        var msg;
                        
                        // if errormsg option is not empty... *
                        if (options.errormsg !== '') {
                            // * assign custom error message
                            msg = options.errormsg;
                            
                        // if errormsg option is empty... *
                        } else {
                            // * assign default error message
                            msg = errorThrown;
                        }
                        
                        // * display error message
                        $(e).html('<div class="rssError"><p>' + msg + '</p></div>');
                        
                    // if showerror option is false... *
                    } else {
                        // * abort
                        return false;
                    }
                }
            });
        });
    };
    
    // create html result
    var process = function (e, data, options) {
        // feed data (entries)
        var entries = data.query.results.item;
        
        // check if entries are not inside an array (only 1 entry)
        if (!$.isArray(entries)) { entries = [entries]; }
        
        // abort if no entries exist
        if (!entries) { return false; }
        
        // html variables
        var html = '';
        var htmlObject;
        
        // for each entry... *
        $.each(entries, function (i) {
            // * assign entry variable
            var entry = entries[i];
            
            // * variable scoping (tags)
            var tags;
            
            // if entry tags exist... *
            if (entry.category !== undefined) {
                // * arrange entry tags
                tags = entry.category.toString().toLowerCase().replace(/ /g, '-').replace(/,/g, ' ');
            }
            
            // * variable scoping (date)
            var pubDate;
            
            // if date option is true... *
            if (entry.pubDate) {
                // * create date object
                var entryDate = new Date(entry.pubDate);
                
                // * select date format
                if (options.dateformat === 'default') {
                    pubDate = (entryDate.getMonth() + 1).toString() + '/' + entryDate.getDate().toString() + '/' + entryDate.getFullYear();
                } else if (options.dateformat === 'spellmonth') {
                    var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
                    pubDate = months[entryDate.getMonth()] + ' ' + entryDate.getDate().toString() + ', ' + entryDate.getFullYear();
                } else if (options.dateformat === 'localedate') {
                    pubDate = entryDate.toLocaleDateString();
                } else if (options.dateformat === 'localedatetime') {
                    pubDate = entryDate.toLocaleDateString() + ' ' + entryDate.toLocaleTimeString();
                }
            }
            
            // * build entry
            html += '<div class="entryWrapper"';
            if (options.tags && entry.category !== undefined) { html += 'data-tag="' + tags + '"'; }
            html += '><div class="entryTitle"><' + options.titletag + '><a href="' + entry.link + '">' + entry.title + '</a></' + options.titletag + '></div>';
            if (options.date && pubDate) { html += '<div class="entryDate">' + pubDate + '</div>'; }
            
            // if content option is true... *
            if (options.content) {
                // * check for rss description/encoded value
                var content;
                if (entry.description !== undefined) {
                    content = entry.description;
                } else {
                    content = entry.encoded;
                }
                
                // * build content
                html += '<div class="entryContent">' + content + '</div>';
            }
            
            html += '</div>';
        });
        
        // provisional html result
        htmlObject = $(html);
        
        // if content option is true... *
        if (options.content) {
            // for each entry... *
            $.each(htmlObject, function () {
                // if image option is true... *
                if (options.image) {
                    // * check for first image
                    var image = $(this).find('img').first();
                    
                    // if image exists... *
                    if (image.length !== 0) {
                        // * create image wrapper
                        $(this).prepend('<div class="entryImage">');
                        
                        // * append first image in image wrapper and wrap all textual elements after it
                        $(this).find('.entryImage').append(image).nextAll().wrapAll('<div class="entryText"></div>');
                    }
                }
                
                // if snippet option is true... *
                if (options.snippet) {
                    // * set character limit
                    var content = $(this).find('.entryContent');
                    var contentLength = $(content).text().length;
                    content.text(function (i, v) {
                        if (contentLength <= options.snippetlimit) {
                            return v;
                        } else {
                            return v.substring(0, options.snippetlimit) + ' ...';
                        }
                    });
                }
            });
        }
        
        // append final html result
        $(e).append(htmlObject);
        
        // apply target to links
        $('a', e).attr('target', options.linktarget);
    };
    
})(jQuery);
