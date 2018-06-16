import auth0 from 'auth0-js';

export default class Auth {
  constructor() {
    const rootUrl = location.protocol+'//'+location.hostname+(location.port ? ':'+location.port: '');
    this.auth0 = new auth0.WebAuth({
      domain: 'trilita.eu.auth0.com',
      clientID: 'B8PZTFcd5LDXiYkaDiruHemnOp25QhOV',
      redirectUri: `${rootUrl}/callback`,
      audience: 'https://trilita.eu.auth0.com/userinfo',
      responseType: 'token id_token',
      scope: 'openid profile'
    });
  }

  login() {
    this.auth0.authorize();
  }

  handleAuthentication() {
    return new Promise(resolve => {
      this.auth0.parseHash((err, authResult) => {
        if (authResult && authResult.accessToken && authResult.idToken) {
          this.setSession(authResult);
          resolve();
        }
      });
    });

  }

  setSession(authResult) {
    const expiresAt = JSON.stringify((authResult.expiresIn * 1000) + new Date().getTime());
    localStorage.setItem('access_token', authResult.accessToken);
    localStorage.setItem('id_token', authResult.idToken);
    localStorage.setItem('expires_at', expiresAt);
  }

  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('id_token');
    localStorage.removeItem('expires_at');
  }

  isAuthenticated() {
    const expiresAt = JSON.parse(localStorage.getItem('expires_at'));
    return new Date().getTime() < expiresAt;
  }

  getProfile() {
    return new Promise((resolve, reject) => {
      const accessToken = localStorage.getItem('access_token');
      if (!accessToken) {
        reject('no access token');
        return;
      }

      this.auth0.client.userInfo(accessToken, (err, profile) => {
        if (err) {
          reject(error);
          return;
        }

        resolve(profile);
      });
    });
  }

  getUserId() {
    return this.getProfile().then(profile => profile.sub);
  }

  isAdmin() {
    return this.getProfile()
      .then(profile => {
        const isAdmin = profile['https://trilita.com/roles'].some(x => x == 'Admin');
        return isAdmin;
      })
      .catch(() => false);
  }
}
