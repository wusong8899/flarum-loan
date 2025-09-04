// js/src/forum/components/LoanApplicationForm.tsx
import Component from 'flarum/common/Component';
import Button from 'flarum/common/components/Button';
import PlatformSelect from './PlatformSelect';
import Stream from 'flarum/common/utils/Stream';
import m, { Vnode } from 'mithril';
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
    console.log('[LoanApplicationForm] 组件初始化开始', vnode);
    super.oninit(vnode);

    this.platformId = Stream('');
    this.sponsorAccount = Stream('');
    this.applicantAccount = Stream('');
    this.loading = false;
    this.listLoading = true;
    this.myApplications = [];

    console.log('[LoanApplicationForm] 属性设置完成，开始加载我的申请记录');
    this.loadMyApplications();
  }

  view() {
    console.log('[LoanApplicationForm] 渲染view，状态:', {
      loading: this.loading,
      listLoading: this.listLoading,
      myApplicationsCount: this.myApplications.length,
      platformId: this.platformId(),
      sponsorAccount: this.sponsorAccount(),
      applicantAccount: this.applicantAccount()
    });

    const platforms = (this.attrs as LoanApplicationFormAttrs).platforms || [];
    console.log('[LoanApplicationForm] 传入的平台数据:', platforms);

    const selectedPlatform = platforms.find((p: LoanPlatform) => String(p.id()) === this.platformId());
    console.log('[LoanApplicationForm] 选中的平台:', selectedPlatform);

    return (
      <div className="LoanApplicationForm">
        <div className="Form-group">
          <label>选择平台</label>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <PlatformSelect
              platforms={platforms}
              value={this.platformId()}
              onchange={this.platformId}
            />
            {(!selectedPlatform || selectedPlatform.sponsorLinkUrl?.()) && (
              <Button
                className="Button"
                onclick={this.openSponsorLink.bind(this)}
              >
                打开赞助平台链接
              </Button>
            )}
          </div>
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
          <h3>
            {app.forum.attribute('loanLogoUrl') ? (
              <img
                src={app.forum.attribute('loanLogoUrl')}
                alt="logo"
                style={{ height: '24px', verticalAlign: 'middle', marginRight: '8px' }}
              />
            ) : null}
            您的申请订单
          </h3>
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
                    .filter((row) => row !== null) // 过滤掉renderOrderRow返回的null值
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
    console.log('[LoanApplicationForm] 开始加载我的申请记录...');
    try {
      const result = await app.store.find('loan-applications', { include: 'user,platform' }) as any;
      console.log('[LoanApplicationForm] API返回结果:', result);
      console.log('[LoanApplicationForm] 结果类型:', typeof result, '是否为数组:', Array.isArray(result));

      // 确保结果是数组，过滤掉任何null/undefined值
      if (Array.isArray(result)) {
        console.log('[LoanApplicationForm] 原始数组长度:', result.length);
        const filteredApps = result.filter(app => {
          const isValid = app != null;
          if (!isValid) {
            console.warn('[LoanApplicationForm] 发现null/undefined应用记录:', app);
          }
          return isValid;
        });
        this.myApplications = filteredApps;
        console.log('[LoanApplicationForm] 过滤后数组长度:', filteredApps.length);

        // 检查每个应用记录的详细信息
        filteredApps.forEach((app, index) => {
          console.log(`[LoanApplicationForm] 应用记录 ${index}:`, {
            id: app.id?.(),
            platform: app.platform?.(),
            platformMethod: typeof app.platform,
            sponsorAccount: app.sponsorAccount?.(),
            applicantAccount: app.applicantAccount?.(),
            status: app.status?.(),
            approvedAmount: app.approvedAmount?.()
          });
        });
      } else {
        console.warn('[LoanApplicationForm] API返回的不是数组，设置为空数组');
        this.myApplications = [];
      }
    } catch (error) {
      console.error('[LoanApplicationForm] 加载申请记录失败:', error);
      this.myApplications = [];
    } finally {
      console.log('[LoanApplicationForm] 最终设置的应用记录数量:', this.myApplications.length);
      this.listLoading = false;
      m.redraw();
    }
  }

  private renderOrderRow(appModel: LoanApplication) {
    console.log('[LoanApplicationForm] 渲染订单行，应用模型:', appModel);

    // 添加null检查防止TypeError
    if (!appModel) {
      console.warn('[LoanApplicationForm] 应用模型为null，跳过渲染');
      return null;
    }

    console.log('[LoanApplicationForm] 应用模型详情:', {
      id: appModel.id?.(),
      hasId: typeof appModel.id,
      hasPlatform: typeof appModel.platform,
      hasSponsorAccount: typeof appModel.sponsorAccount,
      hasApplicantAccount: typeof appModel.applicantAccount,
      hasStatus: typeof appModel.status,
      hasApprovedAmount: typeof appModel.approvedAmount
    });

    const platform = appModel.platform ? appModel.platform() : null;
    console.log('[LoanApplicationForm] 平台信息:', platform);

    if (platform) {
      console.log('[LoanApplicationForm] 平台详情:', {
        hasName: typeof platform.name,
        hasLogoUrl: typeof platform.logoUrl,
        hasCurrencyImageUrl: typeof platform.currencyImageUrl,
        name: platform.name?.(),
        logoUrl: platform.logoUrl?.(),
        currencyImageUrl: platform.currencyImageUrl?.()
      });
    }

    const platformName = platform && platform.name ? platform.name() : '-';
    const platformLogo = platform && platform.logoUrl ? platform.logoUrl() : '';
    const currencyImg = platform && platform.currencyImageUrl ? platform.currencyImageUrl() : '';

    const sponsor = appModel.sponsorAccount?.() || '-';
    const applicant = appModel.applicantAccount?.() || '-';
    const statusText = this.statusText(appModel.status ? appModel.status() : undefined);
    const amount = appModel.approvedAmount?.();

    console.log('[LoanApplicationForm] 渲染数据:', {
      platformName,
      platformLogo,
      currencyImg,
      sponsor,
      applicant,
      statusText,
      amount
    });

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
