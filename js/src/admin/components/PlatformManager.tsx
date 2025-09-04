// js/src/admin/components/PlatformManager.tsx
import Component from 'flarum/common/Component';
import Button from 'flarum/common/components/Button';
import Modal, { IInternalModalAttrs } from 'flarum/common/components/Modal';
import Stream from 'flarum/common/utils/Stream';
import { validators } from '../../common/utils/validators';
import m,{Vnode} from 'mithril';
import app from 'flarum/admin/app';
import LoanPlatform from '../../common/models/LoanPlatform';

type PlatformEditModalAttrs = IInternalModalAttrs & {
  platform?: LoanPlatform;
  onSave: () => void;
};

class PlatformEditModal extends Modal<PlatformEditModalAttrs> {
  private name: any;
  private logoUrl: any;
  private previewError: any;
  private linkUrl: any;
  private currencyImageUrl: any;
  oninit(vnode: Vnode) {
    super.oninit(vnode);

    const platform = this.attrs.platform;

    this.name = Stream(platform ? platform.name() : '');
    this.logoUrl = Stream(platform ? platform.logoUrl() : '');
    this.linkUrl = Stream(platform ? platform.sponsorLinkUrl() : '');
    this.currencyImageUrl = Stream(platform ? platform.currencyImageUrl?.() : '');
    this.previewError = Stream(false);
  }

  className() {
    return 'PlatformEditModal Modal--small';
  }

  title() {
    return this.attrs.platform ? '编辑平台' : '新增平台';
  }

  content() {
    return (
      <div className="Modal-body">
        <div className="Form-group">
          <label>平台名称</label>
          <input
            className="FormControl"
            value={this.name()}
            oninput={(e: InputEvent) => this.name((e.target as HTMLInputElement).value)}
            placeholder="例如：支付宝"
          />
        </div>

        <div className="Form-group">
          <label>Logo图片链接</label>
          <input
            className="FormControl"
            type="url"
            value={this.logoUrl()}
            oninput={(e: InputEvent) => this.handleUrlChange((e.target as HTMLInputElement).value)}
            placeholder="https://example.com/logo.png"
          />
          <div className="helpText">请输入图片的完整URL地址（支持jpg、png、gif、svg格式）</div>
        </div>

        <div className="Form-group">
          <label>赞助平台链接（可选）</label>
          <input
            className="FormControl"
            type="url"
            value={this.linkUrl()}
            oninput={(e: InputEvent) => this.linkUrl((e.target as HTMLInputElement).value)}
            placeholder="https://example.com/guide"
          />
        </div>

        <div className="Form-group">
          <label>货币图片链接（可选）</label>
          <input
            className="FormControl"
            type="url"
            value={this.currencyImageUrl()}
            oninput={(e: InputEvent) => this.currencyImageUrl((e.target as HTMLInputElement).value)}
            placeholder="https://example.com/currency.png"
          />
          <div className="helpText">用于在前台显示批准额度前的货币图标</div>
        </div>

        {this.logoUrl() && (
          <div className="Form-group">
            <label>图片预览</label>
            <div className="logo-preview">
              {!this.previewError() ? (
                <img
                  src={this.logoUrl()}
                  alt="Logo预览"
                  onload={() => { this.previewError(false); m.redraw(); }}
                  onerror={() => { this.previewError(true); m.redraw(); }}
                />
              ) : (
                <div className="preview-error">
                  <i className="fas fa-exclamation-triangle"></i>
                  <p>图片加载失败，请检查链接是否正确</p>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="Form-group">
          <Button
            className="Button Button--primary"
            loading={this.loading}
            disabled={!this.name() || !this.logoUrl() || this.previewError()}
            onclick={this.save.bind(this)}
          >
            保存
          </Button>
        </div>
      </div>
    );
  }

  handleUrlChange(url: string) {
    this.logoUrl(url);
    this.previewError(false);

    if (url && !this.isValidUrl(url)) {
      this.previewError(true);
    }
  }

  isValidUrl(string: string) {
    return validators.isValidUrl(string) && validators.isImageUrl(string);
  }

  async save(): Promise<void> {
    if (!this.isValidUrl(this.logoUrl())) {
      app.alerts.show({ type: 'error' }, '请输入有效的图片链接');
      return;
    }

    this.loading = true;

    try {
      const platform = this.attrs.platform || app.store.createRecord('loan-platforms');

      await platform.save({
        name: this.name(),
        logoUrl: this.logoUrl(),
        sponsorLinkUrl: this.linkUrl(),
        currencyImageUrl: this.currencyImageUrl()
      });

      this.attrs.onSave();
      this.hide();
      app.alerts.show({ type: 'success' }, '保存成功');
    } finally {
      this.loading = false;
    }
  }
}

export default class PlatformManager extends Component {
  private loading: boolean = false;
  private platforms: any[] = [];

  oninit(vnode: Vnode) {
    super.oninit(vnode);

    this.loading = true;
    this.platforms = [];

    this.loadPlatforms();
  }

  async loadPlatforms(): Promise<void> {
    try {
      this.platforms = await app.store.find('loan-platforms') as any;
    } finally {
      this.loading = false;
      m.redraw();
    }
  }

  view() {
    return (
      <div className="PlatformManager">
        <div className="PlatformManager-header">
          <h3>贷款平台管理</h3>
          <Button
            className="Button Button--primary"
            onclick={() => this.editPlatform()}
          >
            新增平台
          </Button>
        </div>

        {this.loading ? (
          <div>加载中...</div>
        ) : (
          <table className="PlatformTable">
            <thead>
              <tr>
                <th>Logo</th>
                <th>平台名称</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {this.platforms.map(platform => (
                <tr key={platform.id()}>
                  <td>
                    <img
                      src={platform.logoUrl()}
                      style="max-width: 50px;"
                    />
                  </td>
                  <td>{platform.name()}</td>
                  <td>
                    <Button
                      className="Button Button--link"
                      onclick={() => this.editPlatform(platform)}
                    >
                      编辑
                    </Button>
                    <Button
                      className="Button Button--link"
                      onclick={() => this.deletePlatform(platform)}
                    >
                      删除
                    </Button>
                    {platform.sponsorLinkUrl?.() && (
                      <Button
                        className="Button Button--link"
                        onclick={() => window.open(platform.sponsorLinkUrl(), '_blank')}
                      >
                        打开赞助链接
                      </Button>
                    )}
                    <Button
                      className="Button Button--link"
                      onclick={() => this.generateVirtual(platform)}
                    >
                      生成虚拟数据
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    );
  }

  editPlatform(platform: any = null) {
    app.modal.show(PlatformEditModal, {
      platform,
      onSave: () => this.loadPlatforms()
    });
  }

  async deletePlatform(platform: any) {
    if (!confirm('确定删除该平台吗？')) return;

    await platform.delete();
    this.loadPlatforms();
  }

  async generateVirtual(platform: any) {
    const count = prompt('请输入要生成的虚拟数据数量', '10');
    if (!count) return;

    await app.request({
      method: 'POST',
      url: app.forum.attribute('apiUrl') + '/loan-applications/generate-virtual',
      body: {
        data: {
          attributes: {
            platform_id: platform.id(),
            count: parseInt(count)
          }
        }
      }
    });

    app.alerts.show({ type: 'success' }, `成功生成${count}条虚拟数据`);
  }
}
