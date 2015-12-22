/* global $:false Handlebars:false marked:false */
$.fn.serializeJson = function() {
  var obj = {};
  $.each(this.serializeArray(), function() {
    obj[this.name] = this.value;
  });
  return obj;
};
$.fn.isVisible = function() {
  return $.expr.filters.visible(this[0]);
};

$(function(){
  var storageKey = 'yehd2015-ctf';

  var questionList = [];
  var userInfo = {};

  loadQuestionList()
    .then(filterQuestionList)
    .then(formSettings)
    .then(loadUserInfo);

  function loadQuestionList() {
    return fetch('./questionList.json')
      .then(function(res) { return res.json(); })
      .then(function(json) {
        questionList = json.map(function(f) { return f.split('-'); })
          .map(function(a) { return a.concat(a.splice(2).join('-')); })
          .map(function(a) { return {
            category: a[0],
            point: parseInt(a[1], 10),
            name: a[2],
            question: a.join('-')
          }; });
        return questionList;
      })
      .then(function(list) {
        var $category = $('#category');
        var source = $('template', $category).html();
        var template = Handlebars.compile(source);

        var categoryList =
          list.map(function(i) { return i.category; })
            .filter(function (x, i, self) { return self.indexOf(x) === i; })
            .sort();
        categoryList.forEach(function(category) {
          var $button = $(template({ category: category }));
          $category.append($button);
        });
        $('a', $category).on('click', filterQuestionList);
        return list;
      })
      .then(function(list) {
        var $qListContainer = $('main#qList');
        var source = $('template', $qListContainer).html();
        var template = Handlebars.compile(source);
        list.forEach(function(qInfo) {
          var $panel = $(template(qInfo));
          $('a.toggle-details', $panel).on('click', toggleDetails);
          $qListContainer.append($panel);
        });
      });
  }

  function filterQuestionList(ev) {
    var category = '';
    if (!ev) category = location.hash.substr(1);
    else category = ev.currentTarget.href.split('#')[1];
    category = category.replace(/(^\s*|\s*$)/g, '');

    if (!category.match(/^[\w\d]+$/)) {
      $('#qList .panel').show(500);
      $('#category li').removeClass('active');
      $('#category li[data-category="All"]').addClass('active');
    } else {
      $('#qList .panel[data-category="' + category + '"]').show(500);
      $('#qList .panel[data-category!="' + category + '"]').hide(500);
      $('#category li').removeClass('active');
      $('#category li[data-category="' + category + '"]').addClass('active');
    }
  }

  function formSettings() {
    $('form').on('submit', function(ev) {
      ev.preventDefault();
    });
    $('#qList .panel form').on('submit', submitFlag);
    $('#login button').on('click', login);
    $('#logout button').on('click', logout);
  }

  function submitFlag(ev) {
    var $target = $(ev.currentTarget);
    var $parent = $target.parent();
    $('.alert', $parent).hide(250);

    var flag = $('input', $target).val().replace(/(^\s*|\s*$)/g, '');
    $('input', $target).val('');

    var question = $target.data('question');
    return fetch('./' + question + '/flag.sha3-512')
    .then(function(res) {
      if (res.ok) {
        return res.text();
      } else {
        $('.alert-warning', $parent).text(res.status).show(250);
      }
    })
    .then(function(hash) {
      hash = hash.replace(/(^\s*|\s*$)/g, '');
      var submitted = sha3_512(flag).replace(/(^\s*|\s*$)/g, '');
      if (hash !== submitted) {
        $('.alert-warning', $parent).text('Flag is invalid.').show(250);
      } else {
        var message;
        if (userInfo.submit.filter(function(s) { return s.question === question; }).length) {
          message = 'Already submitted.';
        } else {
          message = 'Success!!';
          var score = parseInt(question.split('-')[1], 10);
          userInfo.score = parseInt(userInfo.score, 10) + score;
          userInfo.submit.push({ question: question, score: score });
        }
        $('.alert-info', $parent).text(message).show(250);
      }
    })
    .then(loadSubmitted);
  }

  function loadUserInfo() {
    try {
      userInfo = JSON.parse(localStorage.getItem(storageKey));
    } catch (_e) {
      userInfo = {};
    }
    if (
      !userInfo || userInfo.constructor.name !== 'Object' ||
      !userInfo.submit || userInfo.submit.constructor.name !== 'Array' ||
      !userInfo.score || userInfo.score.constructor.name !== 'Number'
    ) {
      userInfo = { score: 0, submit: [] };
    }

    loadSubmitted();
  }

  function loadSubmitted() {
    var score = parseInt(userInfo.score || 0, 10);
    $('#userStatus').text('Your Score: ' + score + ' pts');
    $('#login').hide(0);
    
    $('.panel .label-info').hide(0);
    (userInfo.submit || []).forEach(function(sInfo) {
      $('.panel[data-question="' + sInfo.question + '"]')
        .find('.label-info').show(0);
    });
    localStorage.setItem(storageKey, JSON.stringify(userInfo))
  }

  function toggleDetails(ev) {
    ev.preventDefault();

    var $target = $(ev.currentTarget);
    var question = $target.data('question');
    var $details = $('.panel[data-question="' + question + '"] .details');
    if (!$details.isVisible()) {
      fetch('/' + question + '/README.md')
        .then(function(res) { return res.text(); })
        .then(function(md) {
          var renderer = new marked.Renderer();
          (function() {
            var link = renderer.link.bind(renderer);
            renderer.link = function(href, title, text) {
              if (!href.match(/^http/)) href = '/' + question + '/' + href;
              return link(href, title, text);
            };
            var image = renderer.image.bind(renderer);
            renderer.image = function(href, title, text) {
              if (!href.match(/^http/)) href = '/' + question + '/' + href;
              return image(href, title, text);
            };
          })();
          $details.html(marked(md + '\n\n----', { renderer: renderer }));
          $('a', $details).attr({ target: '_blank' });
          $details.show(500);
        });
    } else {
      $details.hide(500);
    }
  }

});
