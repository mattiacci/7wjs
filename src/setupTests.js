const localStorage = (function() {
  var store = {};
  return {
    setItem: function(key, value) {
      store[key] = value || '';
    },
    getItem: function(key) {
      return store[key] || null;
    },
    removeItem: function(key) {
      delete store[key];
    },
    get length() {
      return Object.keys(store).length;
    },
    key: function(i) {
      var keys = Object.keys(store);
      return keys[i] || null;
    }
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorage });
