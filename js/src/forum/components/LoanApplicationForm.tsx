// js/src/forum/components/LoanApplicationForm.tsx
import Component from 'flarum/common/Component';
import Button from 'flarum/common/components/Button';
import PlatformSelect from './PlatformSelect';
import Stream from 'flarum/common/utils/Stream';
import m,{Vnode} from 'mithril';
import app from 'flarum/forum/app';
import LoanApplication from '../../common/models/LoanApplication';
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
  private listLoading: boolean = false;
  private myApplications: LoanApplication[] = [];

  oninit(vnode: Vnode) {
    super.oninit(vnode);

    this.platformId = Stream('');
    this.sponsorAccount = Stream('');
    this.applicantAccount = Stream('');
    this.loading = false;
    this.listLoading = true;
    this.myApplications = [];

    this.loadMyApplications();
  }

  view() {
    const platforms = (this.attrs as LoanApplicationFormAttrs).platforms || [];
    const selectedPlatform = platforms.find((p: LoanPlatform) => String(p.id()) === this.platformId());

    return (
      <div className="LoanApplicationForm">
        <div className="Form-group">
          <label>选择平台</label>
          <PlatformSelect
            platforms={platforms}
            value={this.platformId()}
            onchange={this.platformId}
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
        <div className="MyApplications">
          <h3>您的申请订单</h3>
          {this.listLoading ? (
            <div>加载中...</div>
          ) : (
            <div className="OrderList">
              <div className="OrderList-header">
                <span>平台</span>
                <span>赞助账号</span>
                <span>申请账号</span>
                <span>状态</span>
                <span>批准额度</span>
              </div>
              <div className="OrderList-body">
                {Array.isArray(this.myApplications) && this.myApplications.length > 0 ? (
                  (this.myApplications as LoanApplication[])
                    .filter((a) => !!a)
                    .map((appModel: LoanApplication) => this.renderOrderRow(appModel))
                ) : (
                  <div className="OrderList-empty">暂无记录</div>
                )}
              </div>
            </div>
          )}
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

      // 重新加载我的申请记录
      await this.loadMyApplications();
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

  async loadMyApplications(): Promise<void> {
    try {
      this.myApplications = await app.store.find('loan-applications') as any;
    } finally {
      this.listLoading = false;
      m.redraw();
    }
  }

  private renderOrderRow(appModel: LoanApplication) {
    const platform = appModel.platform() as any;
    const platformName = platform && platform.name ? platform.name() : '-';
    const platformLogo = platform && platform.logoUrl ? platform.logoUrl() : '';
    const currencyImg = platform && platform.currencyImageUrl ? platform.currencyImageUrl() : '';

    const sponsor = appModel.sponsorAccount?.() || '-';
    const applicant = appModel.applicantAccount?.() || '-';
    const statusText = this.statusText(appModel.status());
    const amount = appModel.approvedAmount?.();

    return (
      <div className="OrderList-row">
        <div className="col-platform">
          <span className="platform-logo-wrap">
            {platformLogo ? <img className="platform-logo" src={platformLogo} alt={platformName} /> : <span className="platform-logo placeholder"></span>}
          </span>
          <span className="platform-name">{platformName}</span>
        </div>
        <div className="col-sponsor">{sponsor || '-'}</div>
        <div className="col-applicant">{applicant || '-'}</div>
        <div className="col-status">{statusText || '-'}</div>
        <div className="col-amount">
          {typeof amount === 'number' ? (
            <span className="amount">
              {currencyImg ? (
                <img className="currency" src={currencyImg} alt="currency" />
              ) : (
                <span className="currency-text">¥</span>
              )}
              <span className="value">{this.formatAmount(amount)}</span>
            </span>
          ) : (
            <span>-</span>
          )}
        </div>
      </div>
    );
  }

  private statusText(status?: string) {
    switch (status) {
      case 'approved':
        return '已通过';
      case 'rejected':
        return '已拒绝';
      case 'pending':
      default:
        return '审核中';
    }
  }

  private formatAmount(num: number) {
    return Number(num).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
}
