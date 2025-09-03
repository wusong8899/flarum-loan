// js/src/forum/components/LoanApplicationForm.tsx
import Component from 'flarum/common/Component';
import Button from 'flarum/common/components/Button';
import Select from 'flarum/common/components/Select';
import Stream from 'flarum/common/utils/Stream';
import {Vnode} from 'mithril';
import LoanPlatform from '../../common/models/LoanPlatform';

type LoanApplicationFormAttrs = {
  platforms: LoanPlatform[];
  onSubmit: (payload: { platform_id: string; message: string }) => Promise<void> | void;
};

export default class LoanApplicationForm extends Component<LoanApplicationFormAttrs> {
  private platformId: any;
  private message: any;
  private loading: boolean = false;

  oninit(vnode: Vnode) {
    super.oninit(vnode);

    this.platformId = Stream('');
    this.message = Stream('');
    this.loading = false;
  }

  view() {
    const platforms = (this.attrs as LoanApplicationFormAttrs).platforms || [];

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

        <div className="Form-group">
          <label>留言</label>
          <textarea
            className="FormControl"
            value={this.message()}
            oninput={(e: InputEvent) => this.message((e.target as HTMLTextAreaElement).value)}
            placeholder="请输入您的留言..."
            rows="4"
          />
        </div>

        <Button
          className="Button Button--primary"
          loading={this.loading}
          disabled={!this.platformId() || !this.message()}
          onclick={this.submit.bind(this)}
        >
          提交申请
        </Button>
      </div>
    );
  }

  async submit(): Promise<void> {
    if (this.loading) return;

    this.loading = true;

    try {
      await (this.attrs as LoanApplicationFormAttrs).onSubmit({
        platform_id: this.platformId(),
        message: this.message()
      });

      // 重置表单
      this.platformId('');
      this.message('');
    } finally {
      this.loading = false;
    }
  }
}
