import { Credential, CredentialId, Embedded } from '@beyondidentity/bi-sdk-js';

class WrappedEmbedded {
  embedded: Embedded | null = null;

  init = async () => {
    if (!this.embedded) {
      const { Embedded } = await import('@beyondidentity/bi-sdk-js');
      const embedded = await Embedded.initialize({
        allowedDomains: ['beyondidentity.com'],
      });
      this.embedded = embedded;
    }
    return this.embedded as Embedded;
  };

  bindCredential = async (url: string) => {
    const embedded = await this.init();

    return embedded.bindCredential(url);
  };

  getCredentials = async () => {
    const embedded = await this.init();

    return embedded.getCredentials();
  };

  deleteCredential = async (id: CredentialId) => {
    const embedded = await this.init();

    return embedded.deleteCredential(id);
  };

  isAuthenticateUrl = async (url: string) => {
    const embedded = await this.init();

    return embedded.isAuthenticateUrl(url);
  };

  isBindCredentialUrl = async (url: string) => {
    const embedded = await this.init();

    return embedded.isBindCredentialUrl(url);
  };

  authenticate = async (
    url: string,
    onSelectCredential: (
      credentials: Credential[]
    ) => Promise<string | undefined>
  ) => {
    const embedded = await this.init();
    return embedded.authenticate(url, onSelectCredential);
  };
}

export const embeddedSdk = new WrappedEmbedded();
