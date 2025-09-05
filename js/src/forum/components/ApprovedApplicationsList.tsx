// js/src/forum/components/ApprovedApplicationsList.tsx
import Component from 'flarum/common/Component';
import avatar from 'flarum/common/helpers/avatar';
import username from 'flarum/common/helpers/username';
import LoanApplication from '../../common/models/LoanApplication';
import LoanVirtualApproval from '../../common/models/LoanVirtualApproval';

type ApprovedApplicationsListAttrs = {
  applications: LoanApplication[];
  virtualApprovals: LoanVirtualApproval[];
};

export default class ApprovedApplicationsList extends Component<ApprovedApplicationsListAttrs> {
  private scrollTimer: number | undefined;

  view() {
    const { applications = [], virtualApprovals = [] } = this.attrs as ApprovedApplicationsListAttrs;

    console.log('[ApprovedApplicationsList] 渲染开始，输入数据:', {
      applicationsCount: applications.length,
      virtualApprovalsCount: virtualApprovals.length,
      applications: applications,
      virtualApprovals: virtualApprovals
    });

    // 合并真实和虚拟数据，添加null检查
    const realApprovals = applications
      .filter((app: LoanApplication) => {
        const isValid = app != null && app.id() && app.approvedAmount;
        if (!isValid) {
          console.warn('[ApprovedApplicationsList] 过滤掉无效的真实申请:', {
            app,
            hasApp: app != null,
            hasId: app?.id,
            hasApprovedAmount: app?.approvedAmount
          });
        }
        return isValid;
      })
      .map((app: LoanApplication, index) => {
        console.log(`[ApprovedApplicationsList] 处理真实申请 ${index}:`, app);

        const user = app.user ? app.user() : null;
        const platform = app.platform ? app.platform() : null;

        console.log(`[ApprovedApplicationsList] 真实申请 ${index} 详情:`, {
          id: app.id?.(),
          user: user,
          platform: platform,
          username: user ? username(user as any) : null,
          avatar: user ? avatar(user as any) : null,
          approvedAmount: app.approvedAmount?.()
        });

        const displayName = (user && (user as any).displayName && typeof (user as any).displayName === 'function')
          ? (user as any).displayName()
          : (user && (user as any).username && typeof (user as any).username === 'function')
            ? (user as any).username()
            : '';

        return {
          type: 'real',
          id: app.id(),
          displayName: displayName,
          avatar: (avatar(user as any) as any) || null,
          platformName: platform && (platform as any).name && typeof (platform as any).name === 'function' ? (platform as any).name() : '',
          platformLogoUrl: platform && (platform as any).logoUrl && typeof (platform as any).logoUrl === 'function' ? (platform as any).logoUrl() : '',
          currencyImageUrl: platform && (platform as any).currencyImageUrl && typeof (platform as any).currencyImageUrl === 'function' ? (platform as any).currencyImageUrl() : '',
          amount: app.approvedAmount()
        };
      });

    const virtualApprovalsProcessed = virtualApprovals
      .filter((va: LoanVirtualApproval) => {
        const isValid = va != null && va.id() && va.amount;
        if (!isValid) {
          console.warn('[ApprovedApplicationsList] 过滤掉无效的虚拟申请:', {
            va,
            hasVa: va != null,
            hasId: va?.id,
            hasAmount: va?.amount
          });
        }
        return isValid;
      })
      .map((va: LoanVirtualApproval, index) => {
        console.log(`[ApprovedApplicationsList] 处理虚拟申请 ${index}:`, va);

        const platform = va.platform ? va.platform() : null;
        const result = {
          type: 'virtual',
          id: va.id(),
          displayName: va.fakeUsername ? va.fakeUsername() : '',
          avatar: va.fakeAvatarUrl ? <img src={va.fakeAvatarUrl()} className="Avatar" /> : null,
          platformName: platform && (platform as any).name && typeof (platform as any).name === 'function' ? (platform as any).name() : '',
          platformLogoUrl: platform && (platform as any).logoUrl && typeof (platform as any).logoUrl === 'function' ? (platform as any).logoUrl() : '',
          currencyImageUrl: platform && (platform as any).currencyImageUrl && typeof (platform as any).currencyImageUrl === 'function' ? (platform as any).currencyImageUrl() : '',
          amount: va.amount()
        };

        console.log(`[ApprovedApplicationsList] 虚拟申请 ${index} 处理结果:`, result);
        return result;
      });

    const allApprovals = [...realApprovals, ...virtualApprovalsProcessed];

    console.log('[ApprovedApplicationsList] 合并后的数据:', {
      realCount: realApprovals.length,
      virtualCount: virtualApprovalsProcessed.length,
      totalCount: allApprovals.length,
      allApprovals: allApprovals
    });

    // 随机排序
    allApprovals.sort(() => Math.random() - 0.5);

    return (
      <div className="ApprovedApplicationsList Leaderboard">
        <div className="Leaderboard-header">
          <table className="Leaderboard-table Leaderboard-table--header">
            <colgroup>
              <col className="colw-avatar" />
              <col className="colw-nickname" />
              <col className="colw-platform" />
              <col className="colw-amount" />
            </colgroup>
            <thead>
              <tr>
                <th className="col-avatar">用户</th>
                <th className="col-nickname">昵称</th>
                <th className="col-platform">贷款平台</th>
                <th className="col-amount">获批额度</th>
              </tr>
            </thead>
          </table>
        </div>
        <div className="Leaderboard-body" oncreate={this.startAutoScroll.bind(this)} onremove={this.stopAutoScroll.bind(this)}>
          <div className="Leaderboard-scroll">
            <table className="Leaderboard-table Leaderboard-table--body">
              <colgroup>
                <col className="colw-avatar" />
                <col className="colw-nickname" />
                <col className="colw-platform" />
                <col className="colw-amount" />
              </colgroup>
              <tbody>
                {allApprovals.map((item, index) => this.renderRow(item, index))}
                {allApprovals.map((item, index) => this.renderRow(item, index, true))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  renderRow(approval: any, index: number, clone: boolean = false) {
    const userName = typeof approval.displayName === 'string' ? approval.displayName : '';
    const avatarNode = approval.avatar ? approval.avatar : <span className="Avatar Avatar--placeholder"></span>;
    return (
      <tr className={`LeaderRow${clone ? ' clone' : ''}`} key={`${approval.id}-${clone ? 'c' : 'o'}`}>
        <td className="col-avatar">{avatarNode}</td>
        <td className="col-nickname">{userName || '隐藏'}</td>
        <td className="col-platform">
          {approval.platformLogoUrl ? (
            <span className="platform-badge"><img src={approval.platformLogoUrl} alt="" /></span>
          ) : (
            <span className="platform-badge platform-badge--placeholder" />
          )}
          <span className="platform-name">{approval.platformName || '-'}</span>
        </td>
        <td className="col-amount">
          {approval.currencyImageUrl ? (
            <img className="coin" src={approval.currencyImageUrl} alt="coin" />
          ) : (
            <span className="coin">¥</span>
          )}
          <span className="value">{this.formatAmount(approval.amount, 2)}</span>
        </td>
      </tr>
    );
  }

  startAutoScroll(vnode: any) {
    const container: HTMLElement = vnode.dom as HTMLElement;
    const inner = container.querySelector('.Leaderboard-scroll') as HTMLElement;
    if (!container || !inner) return;

    let offset = 0;
    const step = () => {
      offset += 0.5; // speed
      if (offset >= inner.scrollHeight / 2) {
        offset = 0;
      }
      inner.style.transform = `translateY(-${offset}px)`;
      this.scrollTimer = window.requestAnimationFrame(step) as any;
    };
    this.scrollTimer = window.requestAnimationFrame(step) as any;
  }

  stopAutoScroll() {
    if (this.scrollTimer) cancelAnimationFrame(this.scrollTimer);
  }

  formatAmount(num: number, fixed?: number) {
    if (fixed !== undefined) return Number(num).toLocaleString(undefined, { minimumFractionDigits: fixed, maximumFractionDigits: fixed });
    return Number(num).toLocaleString();
  }
}
