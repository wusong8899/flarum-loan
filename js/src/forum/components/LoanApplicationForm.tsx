// js/src/forum/components/LoanApplicationForm.tsx
import Component from 'flarum/common/Component';
import Button from 'flarum/common/components/Button';
import Select from 'flarum/common/components/Select';
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
        <div className="MyApplications">
          <h3>我的申请记录</h3>
          {this.listLoading ? (
            <div>加载中...</div>
          ) : (
            <table className="ApplicationTable">
              <thead>
                <tr>
                  <th>平台</th>
                  <th>赞助账号</th>
                  <th>申请账号</th>
                  <th>状态</th>
                  <th>批准额度</th>
                </tr>
              </thead>
              <tbody>
                {this.myApplications.length === 0 ? (
                  <tr><td colspan="5">暂无记录</td></tr>
                ) : (
                  this.myApplications.map((appModel: LoanApplication) => (
                    <tr key={appModel.id()}>
                      <td>{(appModel.platform() && (appModel.platform() as any).name) ? (appModel.platform() as any).name() : '-'}</td>
                      <td>{appModel.sponsorAccount?.() || '-'}</td>
                      <td>{appModel.applicantAccount?.() || '-'}</td>
                      <td>{appModel.status()}</td>
                      <td>{appModel.approvedAmount() || '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
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
}
