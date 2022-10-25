import { Selector, t } from "testcafe";

export class ContactModal {
  constructor() {
    this.container = Selector('#idc-modal-container');

    this.closeBtn = this.container.find('button#idc-modal-exit-button');

    this.collection = this.container.find('#edit-field-collection-0-target-id');
    this.name = this.container.find('#edit-name');
    this.email = this.container.find('#edit-mail');
    this.subject = this.container.find('#edit-subject-0-value');
    this.message = this.container.find('#edit-message-0-value');
    this.captcha = this.container.find('#captcha');
    this.captchaResp = this.captcha.find('#edit-captcha-response');
    // Submit button is an <input> with an autogenerated ID
    this.submit = this.container.find('input[type="submit"]');
  }

  visibility() {
    return this.container.filterVisible();
  }

  async closeModal() {
    await t.click(this.closeBtn);
  }
}

export default new ContactModal();