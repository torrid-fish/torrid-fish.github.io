/* global CONFIG */

(function() {
  // Modified from [hexo-generator-search](https://github.com/wzpan/hexo-generator-search)
  function localSearchFunc(path, searchSelector, resultSelector, lang) {
    'use strict';
    // 0x00. environment initialization
    var $input = jQuery(searchSelector);
    var $result = jQuery(resultSelector);

    if ($input.length === 0) {
      // eslint-disable-next-line no-console
      throw Error('No element selected by the searchSelector');
    }
    if ($result.length === 0) {
      // eslint-disable-next-line no-console
      throw Error('No element selected by the resultSelector');
    }

    if ($result.attr('class').indexOf('list-group-item') === -1) {
      $result.html('<div class="m-auto text-center"><div class="spinner-border" role="status"><span class="sr-only">Loading...</span></div><br/>Loading...</div>');
    }

    jQuery.ajax({
      // 0x01. load xml file
      url     : path,
      dataType: 'xml',
      success : function(xmlResponse) {
        // 0x02. parse xml file
        var dataList = jQuery('entry', xmlResponse).map(function() {
          return {
            title  : jQuery('title', this).text(),
            content: jQuery('content', this).text(),
            url    : jQuery('url', this).text(),
            lang   : jQuery('lang', this).text() // Get the language of the article
          };
        }).get();

        if ($result.html().indexOf('list-group-item') === -1) {
          $result.html('');
        }

        $input.on('input', function() {
          // 0x03. parse query to keywords list
          var content = $input.val();
          var resultHTML = '';
          var keywords = content.trim().toLowerCase().split(/[\s-]+/);
          $result.html('');
          if (content.trim().length <= 0) {
            return $input.removeClass('invalid').removeClass('valid');
          }
          // 0x04. perform local searching
          dataList.forEach(function(data) {
            var isMatch = true;
            if (!data.title || data.title.trim() === '') {
              data.title = 'Untitled';
            }
            var orig_data_title = data.title.trim();
            var data_title = orig_data_title.toLowerCase();
            var orig_data_content = data.content.trim().replace(/<[^>]+>/g, '');
            var data_content = orig_data_content.toLowerCase();
            var data_url = data.url;
            var index_title = -1;
            var index_content = -1;
            var first_occur = -1;
            // only match articles with not empty contents
            if (data_content !== '') {
              keywords.forEach(function(keyword, i) {
                index_title = data_title.indexOf(keyword);
                index_content = data_content.indexOf(keyword);

                if (index_title < 0 && index_content < 0) {
                  isMatch = false;
                } else {
                  if (index_content < 0) {
                    index_content = 0;
                  }
                  if (i === 0) {
                    first_occur = index_content;
                  }
                  //content_index.push({index_content:index_content, keyword_len:keyword_len});
                }
              });
            } else {
              isMatch = false;
            }

            // Language matching
            if (lang && lang !== data.lang) {
              isMatch = false;
            }

            // 0x05. show search results
            if (isMatch) {
              resultHTML += '<a href=\'' + data_url + '\' class=\'list-group-item list-group-item-action font-weight-bolder search-list-title\'>' + orig_data_title + '</a>';
              var content = orig_data_content;
              if (first_occur >= 0) {
                // cut out 100 characters
                var start = first_occur - 20;
                var end = first_occur + 80;

                if (start < 0) {
                  start = 0;
                }

                if (start === 0) {
                  end = 100;
                }

                if (end > content.length) {
                  end = content.length;
                }

                var match_content = content.substring(start, end);

                // highlight all keywords
                keywords.forEach(function(keyword) {
                  var regS = new RegExp(keyword, 'gi');
                  match_content = match_content.replace(regS, '<span class="search-word">' + keyword + '</span>');
                });

                resultHTML += '<p class=\'search-list-content\'>' + match_content + '...</p>';
              }
            }
          });
          if (resultHTML.indexOf('list-group-item') === -1) {
            return $input.addClass('invalid').removeClass('valid');
          }
          $input.addClass('valid').removeClass('invalid');
          $result.html(resultHTML);
        });
      }
    });
  }

  function localSearchReset(searchSelector, resultSelector) {
    'use strict';
    var $input = jQuery(searchSelector);
    var $result = jQuery(resultSelector);

    if ($input.length === 0) {
      // eslint-disable-next-line no-console
      throw Error('No element selected by the searchSelector');
    }
    if ($result.length === 0) {
      // eslint-disable-next-line no-console
      throw Error('No element selected by the resultSelector');
    }

    $input.val('').removeClass('invalid').removeClass('valid');
    $result.html('');
  }

  // English
  var modal_en = jQuery('#modalSearch-en');
  var searchSelector_en = '#local-search-input-en';
  var resultSelector_en = '#local-search-result-en';
  var path = CONFIG.search_path || '/local-search.xml';
  modal_en.on('show.bs.modal', function() {
    localSearchFunc(path, searchSelector_en, resultSelector_en, 'en');
  });
  modal_en.on('shown.bs.modal', function() {
    jQuery('#local-search-input-en').focus();
  });
  modal_en.on('hidden.bs.modal', function() {
    localSearchReset(searchSelector_en, resultSelector_en);
  });

  // Traditional Chinese
  var modal_zh_tw = jQuery('#modalSearch-zh-tw');
  var searchSelector_zh_tw = '#local-search-input-zh-tw';
  var resultSelector_zh_tw = '#local-search-result-zh-tw';
  modal_zh_tw.on('show.bs.modal', function() {
    localSearchFunc(path, searchSelector_zh_tw, resultSelector_zh_tw, 'zh-tw');
  });
  modal_zh_tw.on('shown.bs.modal', function() {
    jQuery('#local-search-input-zh-tw').focus();
  });
  modal_zh_tw.on('hidden.bs.modal', function() {
    localSearchReset(searchSelector_zh_tw, resultSelector_zh_tw);
  });

  // Japanese
  var modal_ja = jQuery('#modalSearch-ja');
  var searchSelector_ja = '#local-search-input-ja';
  var resultSelector_ja = '#local-search-result-ja';
  modal_ja.on('show.bs.modal', function() {
    localSearchFunc(path, searchSelector_ja, resultSelector_ja, 'ja');
  });
  modal_ja.on('shown.bs.modal', function() {
    jQuery('#local-search-input-ja').focus();
  });
  modal_ja.on('hidden.bs.modal', function() {
    localSearchReset(searchSelector_ja, resultSelector_ja);
  });
})();
