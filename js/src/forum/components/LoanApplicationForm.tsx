// js/src/forum/components/LoanApplicationForm.tsx
import Component from 'flarum/common/Component';
import Button from 'flarum/common/components/Button';
import Select from 'flarum/common/components/Select';
import Stream from 'flarum/common/utils/Stream';
import {Vnode} from 'mithril';
import LoanPlatform from '../../common/models/LoanPlatform';

type LoanApplicationFormAttrs = {
  platforms: LoanPlatform[];
  onSubmit: (payload: { platform_id: string; sponsor_account?: string; applicant_account?: string }) => Promise<void> | void;
};

export default class LoanApplicationForm extends Component<LoanApplicationFormAttrs> {
  private platformId: any;
  private sponsorAccount: any;
  private applicantAccount: any;
  private loading: boolean = false;

  oninit(vnode: Vnode) {
    super.oninit(vnode);

    this.platformId = Stream('');
    this.sponsorAccount = Stream('');
    this.applicantAccount = Stream('');
    this.loading = false;
  }

  view() {
    const platforms = (this.attrs as LoanApplicationFormAttrs).platforms || [];
    const selectedPlatform = platforms.find((p: LoanPlatform) => String(p.id()) === this.platformId());

    return (
      <div className="LoanApplicationForm">
        <div className="Form-group">
          <label>选择平台</label>
          <Select
            value={this.platformId()}
            onchange={this.platformId}
            options={platforms.reduce((options: Record<string, any>, platform: LoanPlatform) => {
              options[String(platform.id())] = (
                <div className="PlatformOption">
                  <img src={platform.logoUrl()} alt={platform.name()} />
                  <span>{platform.name()}</span>
                </div>
              );
              return options;
            }, {})}
          />
        </div>

        <div className="Form-twoInputs">
          <div className="Form-group">
            <label>赞助平台账号</label>
            <input
              className="FormControl"
              value={this.sponsorAccount()}
              oninput={(e: InputEvent) => this.sponsorAccount((e.target as HTMLInputElement).value)}
              placeholder="例如：平台用户名/ID"
            />
            <Button
              className="Button"
              disabled={!selectedPlatform || !selectedPlatform.sponsorLinkUrl?.()}
              onclick={this.openSponsorLink.bind(this)}
            >
              打开赞助平台链接
            </Button>
          </div>
          <div className="Form-group">
            <label>申请账号</label>
            <input
              className="FormControl"
              value={this.applicantAccount()}
              oninput={(e: InputEvent) => this.applicantAccount((e.target as HTMLInputElement).value)}
              placeholder="例如：论坛或应用内账号"
            />
            <Button
              className="Button Button--primary"
              loading={this.loading}
              disabled={!this.platformId() || !this.sponsorAccount() || !this.applicantAccount()}
              onclick={this.submit.bind(this)}
            >
              提交申请
            </Button>
          </div>
        </div>
      </div>
    );
  }

  async submit(): Promise<void> {
    if (this.loading) return;

    this.loading = true;

    try {
      await (this.attrs as LoanApplicationFormAttrs).onSubmit({
        platform_id: this.platformId(),
        sponsor_account: this.sponsorAccount(),
        applicant_account: this.applicantAccount()
      });

      // 重置表单
      this.platformId('');
      this.sponsorAccount('');
      this.applicantAccount('');
    } finally {
      this.loading = false;
    }
  }

  openSponsorLink() {
    const platforms = (this.attrs as LoanApplicationFormAttrs).platforms || [];
    const platform = platforms.find((p: LoanPlatform) => String(p.id()) === this.platformId());
    const url = platform && platform.sponsorLinkUrl ? platform.sponsorLinkUrl() : null;
    if (url) {
      window.open(url, '_blank');
    }
  }
}
