const fakeAuth = {
  isAuthenticated: !!window.localStorage.getItem('username'),
  name: window.localStorage.getItem('username') || '',
  logIn(name, cb) {
    this.isAuthenticated = true;
    name = name.trim();
    this.name = name;
    window.localStorage.setItem('username', name);
    setTimeout(cb, 0);
  },
  logOut(cb) {
    this.isAuthenticated = false;
    this.name = '';
    window.localStorage.removeItem('username');
    setTimeout(cb, 0);
  }
};

export default fakeAuth;
