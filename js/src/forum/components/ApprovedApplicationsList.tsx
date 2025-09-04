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

    // 合并真实和虚拟数据
    const allApprovals = [
      ...applications.map((app: LoanApplication) => ({
        type: 'real',
        id: app.id(),
        username: username((app.user() || null) as any) || '',
        avatar: (avatar((app.user() || null) as any) as any) || null,
        platform: app.platform() as any,
        amount: app.approvedAmount()
      })),
      ...virtualApprovals.map((va: LoanVirtualApproval) => ({
        type: 'virtual',
        id: va.id(),
        username: va.fakeUsername() || '',
        avatar: <img src={va.fakeAvatarUrl()} className="Avatar" />,
        platform: va.platform(),
        amount: va.amount()
      }))
    ];

    // 随机排序
    allApprovals.sort(() => Math.random() - 0.5);

    return (
      <div className="ApprovedApplicationsList Leaderboard">
        <div className="Leaderboard-header">
          <span className="col-rank">段位</span>
          <span className="col-user">用户</span>
          <span className="col-bet">下注额</span>
          <span className="col-reward">奖励</span>
        </div>
        <div className="Leaderboard-body" oncreate={this.startAutoScroll.bind(this)} onremove={this.stopAutoScroll.bind(this)}>
          <div className="Leaderboard-scroll">
            {allApprovals.map((item, index) => this.renderRow(item, index))}
            {allApprovals.map((item, index) => this.renderRow(item, index, true))}
          </div>
        </div>
      </div>
    );
  }

  renderRow(approval: any, index: number, clone: boolean = false) {
    const rank = index + 1;
    const reward = this.calculateReward(approval.amount);
    const userName = typeof approval.username === 'string' ? approval.username : '';
    const avatarNode = approval.avatar ? approval.avatar : <span className="Avatar Avatar--placeholder"></span>;
    return (
      <div className={`LeaderRow${clone ? ' clone' : ''}`} key={`${approval.id}-${clone ? 'c' : 'o'}`}>
        <div className="col-rank">第{rank}名</div>
        <div className="col-user">
          <span className="user-avatar">{avatarNode}</span>
          <span className="user-name">{userName || '隐藏'}</span>
        </div>
        <div className="col-bet">
          <span className="currency">$</span>
          <span className="value">{this.formatAmount(approval.amount)}</span>
        </div>
        <div className="col-reward">
          <span className="btc">฿</span>
          <span className="value">{this.formatAmount(reward, 2)}</span>
        </div>
      </div>
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

  calculateReward(amount: number) {
    // 简化：示例按金额的 0.2% 计算奖励
    return Math.max(3500, Math.round(amount * 0.002));
  }

  formatAmount(num: number, fixed?: number) {
    if (fixed !== undefined) return Number(num).toLocaleString(undefined, { minimumFractionDigits: fixed, maximumFractionDigits: fixed });
    return Number(num).toLocaleString();
  }
}
