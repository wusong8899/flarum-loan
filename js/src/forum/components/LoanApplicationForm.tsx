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
  onSubmit: (payload: { platform_id: string; sponsor_account?: string; repayment_date?: string }) => Promise<void> | void;
};

export default class LoanApplicationForm extends Component<LoanApplicationFormAttrs> {
  private platformId: any;
  private sponsorAccount: any;
  private repaymentDate: any;
  private loading: boolean = false;
  private listLoading: boolean = false;
  private myApplications: LoanApplication[] = [];

  oninit(vnode: Vnode) {
    console.log('[LoanApplicationForm] 组件初始化开始', vnode);
    super.oninit(vnode);

    this.platformId = Stream('');
    this.sponsorAccount = Stream('');
    this.repaymentDate = Stream('');
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
      repaymentDate: this.repaymentDate()
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
            {selectedPlatform?.sponsorLinkUrl?.() && (
              <button
                className="LoanRegisterButton"
                type="button"
                onclick={this.openSponsorLink.bind(this)}
              >
                <span className="register-icon" aria-hidden="true">
                  <svg width="17" height="17" viewBox="0 0 17 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10.3259 3.91873C12.6748 5.25805 13.8493 5.92772 14.2435 6.802C14.5872 7.56458 14.5873 8.43542 14.2435 9.198C13.8493 10.0723 12.6748 10.7419 10.3259 12.0813C7.9769 13.4206 6.80242 14.0903 5.83867 13.9902C4.99805 13.903 4.2344 13.4675 3.73757 12.7922C3.16797 12.018 3.16797 10.6786 3.16797 8C3.16797 5.32135 3.16797 3.98203 3.73757 3.20778C4.2344 2.53245 4.99805 2.09703 5.83867 2.00978C6.80242 1.90974 7.9769 2.57941 10.3259 3.91873Z" stroke="#FFFFFF" />
                  </svg>
                </span>
                注册
              </button>
            )}
          </div>
        </div>

        <div className="Form-twoInputs">
          <div className="Form-group">
            <label>注册账号</label>
            <input
              className="FormControl"
              value={this.sponsorAccount()}
              oninput={(e: InputEvent) => this.sponsorAccount((e.target as HTMLInputElement).value)}
              placeholder="请输入贷款账号ID"
            />
          </div>
          <div className="Form-group">
            <label>还款日期</label>
            <input
              className="FormControl"
              type="date"
              value={this.repaymentDate()}
              oninput={(e: InputEvent) => this.repaymentDate((e.target as HTMLInputElement).value)}
              placeholder="请选择还款日期"
            />
            <Button
              className="Button Button--primary"
              loading={this.loading}
              disabled={!this.platformId() || !this.sponsorAccount() || !this.repaymentDate()}
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
                <span>还款日期</span>
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
        repayment_date: this.repaymentDate()
      });

      // 重置表单
      this.platformId('');
      this.sponsorAccount('');
      this.repaymentDate('');

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
        const filteredApps = result.filter(applicationModel => {
          const isValid = applicationModel != null;
          if (!isValid) {
            console.warn('[LoanApplicationForm] 发现null/undefined应用记录:', applicationModel);
          }
          return isValid;
        });

        // 仅显示当前登录用户的申请（管理员在此区域也只显示自己的）
        const currentUser = app.session.user;
        const currentUserId = currentUser ? currentUser.id() : null;
        const mineOnly = currentUserId
          ? filteredApps.filter((applicationModel: LoanApplication) => {
            try {
              const userModel = applicationModel.user ? applicationModel.user() : null;
              const userIdOfApplication = userModel && typeof (userModel as any).id === 'function' ? (userModel as any).id() : null;
              return userIdOfApplication === currentUserId;
            } catch (e) {
              console.warn('[LoanApplicationForm] 读取应用用户失败:', e, applicationModel);
              return false;
            }
          })
          : [];

        this.myApplications = mineOnly as any;
        console.log('[LoanApplicationForm] 过滤为当前用户后的数组长度:', mineOnly.length);

        // 检查每个应用记录的详细信息
        filteredApps.forEach((app, index) => {
          console.log(`[LoanApplicationForm] 应用记录 ${index}:`, {
            id: app.id?.(),
            platform: app.platform?.(),
            platformMethod: typeof app.platform,
            sponsorAccount: app.sponsorAccount?.(),
            repaymentDate: app.repaymentDate?.(),
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
      hasRepaymentDate: typeof (appModel as any).repaymentDate,
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
    const repayment = appModel.repaymentDate?.() || '';
    const statusText = this.statusText(appModel.status ? appModel.status() : undefined);
    const amount = appModel.approvedAmount?.();

    console.log('[LoanApplicationForm] 渲染数据:', {
      platformName,
      platformLogo,
      currencyImg,
      sponsor,
      repayment,
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
        <div className="col-repayment">{this.renderRepaymentCell(repayment)}</div>
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

  private renderRepaymentCell(dateStr?: string) {
    const maxMonths = parseInt((app.forum.attribute('loanRepaymentMaxMonths') as any) || '6', 10);
    const isOver = this.isOverdueLong(dateStr, maxMonths);
    if (!dateStr) return <span>-</span>;
    return isOver ? <span className="overdue">未还款</span> : <span>{dateStr}</span>;
  }

  private isOverdueLong(dateStr?: string, maxMonths?: number): boolean {
    if (!dateStr) return false;
    const parsed = new Date(dateStr);
    if (isNaN(parsed.getTime())) return false;
    const now = new Date();
    if (!maxMonths || maxMonths <= 0) return now > parsed; // fallback
    const threshold = this.addMonths(parsed, maxMonths);
    return now > threshold;
  }

  private addMonths(date: Date, months: number): Date {
    const d = new Date(date.getTime());
    const day = d.getDate();
    d.setMonth(d.getMonth() + months);
    if (d.getDate() < day) d.setDate(0);
    return d;
  }
}
