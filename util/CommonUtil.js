(function() {
  window.getUrlParams = function() {
    var hash, hashes, params, str, _i, _len;
    hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    params = [];
    for (_i = 0, _len = hashes.length; _i < _len; _i++) {
      str = hashes[_i];
      hash = str.split('=');
      params.push(hash[0]);
      params[hash[0]] = hash[1];
    }
    return params;
  };
  window.getAccessToken = function() {
    return getUrlParams()["access_token"];
  };
}).call(this);
