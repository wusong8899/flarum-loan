# Flarum 贷款申请插件 - 技术执行文档（更新版）

## 一、用户需求规格说明

### 1.1 核心需求

- **目标用户**：论坛用户申请贷款平台，管理员审核管理
- **核心功能**：用户在论坛前台申请贷款，管理员后台审核，展示申请通过列表

### 1.2 详细需求清单

#### 前台功能（Forum）

1. **申请页面** (`/loan`)

   - 显示贷款申请表单
   - 用户选择平台（下拉列表，显示 logo 和名称）
   - 输入留言信息
   - 提交申请按钮

2. **申请限制**

   - 仅注册用户可申请
   - 每个用户对每个平台只能申请一次
   - 重复申请时提示错误

3. **展示列表**

   - 显示所有审核通过的申请
   - 显示虚拟生成的申请数据
   - 数据随机混合排序
   - 卡片式布局展示（用户头像、昵称、平台 logo、平台名称、批准金额）

#### 后台功能（Admin）

1. **平台管理**

   - 添加新平台（名称、logo 图片链接）
   - 编辑现有平台（修改名称、修改 logo 链接）
   - 删除平台
   - 生成虚拟审批数据

2. **申请管理**

   - 查看所有申请列表
   - 审核申请（通过/拒绝）
   - 删除申请记录
   - 通过时自动生成 18-88888 范围的随机金额

### 1.3 非功能需求

- **性能**：页面加载时间 < 2 秒
- **兼容性**：支持 Flarum 1.2.0+
- **响应式**：适配移动端和 PC 端
- **安全性**：防止 SQL 注入、XSS 攻击、CSRF 攻击

## 二、开发任务清单（TODO List）

### Phase 1: 项目初始化与数据库设计 ✅

- [x] 创建插件基础结构
- [x] 设计数据库表结构
- [x] 创建数据迁移文件
  - [x] loan_platforms 表（包含 logo_url 字段）
  - [x] loan_applications 表
  - [x] loan_virtual_approvals 表

### Phase 2: 后端 API 开发 🔧

- [ ] **Models 层**
  - [ ] 创建 LoanPlatform 模型
  - [ ] 创建 LoanApplication 模型
  - [ ] 创建 LoanVirtualApproval 模型
  - [ ] 定义模型关系
- [ ] **Controllers 层**
  - [ ] 平台管理控制器
    - [ ] ListPlatformsController
    - [ ] CreatePlatformController（接收 logo_url）
    - [ ] UpdatePlatformController（更新 logo_url）
    - [ ] DeletePlatformController
  - [ ] 申请管理控制器
    - [ ] CreateApplicationController
    - [ ] ListApplicationsController
    - [ ] ReviewApplicationController
    - [ ] DeleteApplicationController
  - [ ] 虚拟数据控制器
    - [ ] GenerateVirtualController
    - [ ] ListVirtualApprovalsController
- [ ] **Serializers 层**
  - [ ] PlatformSerializer
  - [ ] ApplicationSerializer
  - [ ] VirtualApprovalSerializer
- [ ] **验证器**
  - [ ] URL 格式验证
  - [ ] 图片链接有效性验证

### Phase 3: 前端 Forum 开发 🎨

- [ ] **页面组件**
  - [ ] LoanApplicationPage 主页面
  - [ ] 路由注册
- [ ] **功能组件**
  - [ ] LoanApplicationForm 申请表单
  - [ ] ApprovedApplicationsList 通过列表
  - [ ] ApplicationCard 申请卡片组件
- [ ] **交互功能**
  - [ ] 表单验证
  - [ ] 提交处理
  - [ ] 错误提示
  - [ ] 成功反馈

### Phase 4: 前端 Admin 开发 ⚙️

- [ ] **设置页面**
  - [ ] LoanSettingsPage 主设置页
  - [ ] Tab 切换功能
- [ ] **平台管理**
  - [ ] PlatformManager 组件
  - [ ] PlatformEditModal 弹窗（URL 输入框）
  - [ ] 图片链接预览功能
- [ ] **申请管理**
  - [ ] ApplicationsManager 组件
  - [ ] 审核功能界面
  - [ ] 批量操作功能
- [ ] **虚拟数据生成**
  - [ ] VirtualDataGenerator 组件
  - [ ] 数量输入界面
  - [ ] 生成确认提示

### Phase 5: 样式与 UI 优化 🎨

- [ ] **Forum 样式**
  - [ ] 申请表单样式
  - [ ] 卡片渐变效果
  - [ ] 动画效果实现
  - [ ] 响应式布局
  - [ ] 图片加载失败处理
- [ ] **Admin 样式**
  - [ ] 表格样式
  - [ ] 按钮样式
  - [ ] 弹窗样式
  - [ ] URL 输入框样式
- [ ] **主题适配**
  - [ ] 深色模式支持
  - [ ] 浅色模式优化

### Phase 6: 国际化与本地化 🌍

不需要，直接硬编码中文

### Phase 7: 测试与优化 🧪

- [ ] **性能优化**
  - [ ] 查询优化
  - [ ] 图片懒加载
  - [ ] 缓存策略

## 四、核心代码实现更新

### 4.1 数据库迁移（更新）

```php
// migrations/2025_01_01_000000_create_loan_platforms_table.php
<?php

use Illuminate\Database\Schema\Blueprint;
use Flarum\Database\Migration;

return Migration::createTable('loan_platforms', function (Blueprint $table) {
    $table->increments('id');
    $table->string('name', 100);
    $table->string('logo_url', 500);  // 存储图片链接
    $table->integer('sort_order')->default(0);
    $table->timestamps();
});
```

### 4.2 平台编辑弹窗（简化版）

```tsx
// js/src/admin/components/PlatformEditModal.js
import Modal from "flarum/common/components/Modal";
import Button from "flarum/common/components/Button";
import Stream from "flarum/common/utils/Stream";

export default class PlatformEditModal extends Modal {
  oninit(vnode) {
    super.oninit(vnode);

    const platform = this.attrs.platform;

    this.name = Stream(platform ? platform.name() : "");
    this.logoUrl = Stream(platform ? platform.logoUrl() : "");
    this.previewError = Stream(false);
  }

  className() {
    return "PlatformEditModal Modal--small";
  }

  title() {
    return this.attrs.platform ? "编辑平台" : "新增平台";
  }

  content() {
    return (
      <div className="Modal-body">
        <div className="Form-group">
          <label>平台名称</label>
          <input
            className="FormControl"
            value={this.name()}
            oninput={(e) => this.name(e.target.value)}
            placeholder="例如：支付宝"
          />
        </div>

        <div className="Form-group">
          <label>Logo图片链接</label>
          <input
            className="FormControl"
            type="url"
            value={this.logoUrl()}
            oninput={(e) => this.handleUrlChange(e.target.value)}
            placeholder="https://example.com/logo.png"
          />
          <div className="helpText">
            请输入图片的完整URL地址（支持jpg、png、gif、svg格式）
          </div>
        </div>

        {this.logoUrl() && (
          <div className="Form-group">
            <label>图片预览</label>
            <div className="logo-preview">
              {!this.previewError() ? (
                <img
                  src={this.logoUrl()}
                  alt="Logo预览"
                  onload={() => {
                    this.previewError(false);
                    m.redraw();
                  }}
                  onerror={() => {
                    this.previewError(true);
                    m.redraw();
                  }}
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

  handleUrlChange(url) {
    this.logoUrl(url);
    this.previewError(false);

    // 验证URL格式
    if (url && !this.isValidUrl(url)) {
      this.previewError(true);
    }
  }

  isValidUrl(string) {
    try {
      const url = new URL(string);
      return url.protocol === "http:" || url.protocol === "https:";
    } catch (_) {
      return false;
    }
  }

  async save() {
    if (!this.isValidUrl(this.logoUrl())) {
      app.alerts.show({ type: "error" }, "请输入有效的图片链接");
      return;
    }

    this.loading = true;

    try {
      const platform =
        this.attrs.platform || app.store.createRecord("loan-platforms");

      await platform.save({
        name: this.name(),
        logoUrl: this.logoUrl(),
      });

      this.attrs.onSave();
      app.modal.close();
      app.alerts.show({ type: "success" }, "保存成功");
    } catch (error) {
      this.loading = false;
      throw error;
    }
  }
}
```

### 4.3 后端控制器（简化版）

```php
// src/Api/Controllers/CreatePlatformController.php
<?php

namespace Wusong8899\Loan\Api\Controllers;

use Flarum\Api\Controller\AbstractCreateController;
use Wusong8899\Loan\Api\Serializers\PlatformSerializer;
use Wusong8899\Loan\Models\LoanPlatform;
use Illuminate\Support\Arr;
use Psr\Http\Message\ServerRequestInterface;
use Tobscure\JsonApi\Document;

class CreatePlatformController extends AbstractCreateController
{
    public $serializer = PlatformSerializer::class;

    protected function data(ServerRequestInterface $request, Document $document)
    {
        $actor = $request->getAttribute('actor');
        $actor->assertAdmin();

        $data = Arr::get($request->getParsedBody(), 'data.attributes');

        // 验证URL格式
        $logoUrl = Arr::get($data, 'logoUrl');
        if (!filter_var($logoUrl, FILTER_VALIDATE_URL)) {
            throw new \Exception('无效的图片链接');
        }

        // 验证是否为图片URL（简单检查扩展名）
        $allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'];
        $extension = strtolower(pathinfo(parse_url($logoUrl, PHP_URL_PATH), PATHINFO_EXTENSION));

        if (!in_array($extension, $allowedExtensions)) {
            throw new \Exception('链接必须指向图片文件（支持jpg、png、gif、svg格式）');
        }

        return LoanPlatform::create([
            'name' => Arr::get($data, 'name'),
            'logo_url' => $logoUrl,
            'sort_order' => 0
        ]);
    }
}
```

### 4.4 样式更新

```less
// less/admin.less 添加
.PlatformEditModal {
  .logo-preview {
    border: 2px dashed var(--control-border);
    border-radius: 8px;
    padding: 20px;
    text-align: center;
    background: var(--control-bg);

    img {
      max-width: 200px;
      max-height: 150px;
      object-fit: contain;
      border-radius: 4px;
    }

    .preview-error {
      color: var(--error-color);
      padding: 20px;

      i {
        font-size: 48px;
        margin-bottom: 10px;
      }

      p {
        margin: 10px 0 0;
      }
    }
  }

  .helpText {
    font-size: 12px;
    color: var(--muted-more-color);
    margin-top: 5px;
  }
}

// less/forum.less 添加图片加载失败处理
.ApprovalCard {
  .platform-logo {
    width: 30px;
    height: 30px;
    object-fit: contain;
    background: white;
    padding: 4px;
    border-radius: 6px;

    // 图片加载失败时的占位
    &::before {
      content: "";
      display: block;
      width: 100%;
      height: 100%;
      background: linear-gradient(45deg, #f0f0f0 25%, transparent 25%),
        linear-gradient(-45deg, #f0f0f0 25%, transparent 25%), linear-gradient(
          45deg,
          transparent 75%,
          #f0f0f0 75%
        ), linear-gradient(-45deg, transparent 75%, #f0f0f0 75%);
      background-size: 10px 10px;
    }
  }
}
```

## 五、文件功能详细说明（更新）

### 5.1 核心变更说明

#### 数据存储方式

- **原方案**：上传图片文件到服务器
- **新方案**：直接存储图片 URL 链接
- **优势**：
  - 无需处理文件上传
  - 节省服务器存储空间
  - 支持使用 CDN 图片
  - 简化实现复杂度

#### URL 验证机制

**前端验证**：

- 使用 JavaScript 的`URL`构造函数验证格式
- 实时预览图片，通过`onerror`事件检测加载失败
- 禁用保存按钮当 URL 无效或图片加载失败

**后端验证**：

- 使用 PHP 的`filter_var`函数验证 URL 格式
- 检查文件扩展名确保是图片
- 返回明确的错误信息

### 5.2 主要组件功能

#### PlatformEditModal.js

**功能**：平台添加/编辑弹窗 **核心特性**：

- URL 输入框替代文件上传
- 实时图片预览
- 加载失败提示
- URL 格式验证
- 支持修改已有平台的图片链接

#### CreatePlatformController.php

**功能**：创建新平台 **核心逻辑**：

- 接收 name 和 logoUrl 参数
- 验证 URL 有效性
- 检查图片格式
- 保存到数据库

#### UpdatePlatformController.php

**功能**：更新平台信息 **核心逻辑**：

- 允许修改图片链接
- 重新验证新 URL
- 更新数据库记录

### 5.3 验证工具

```js
// js/src/common/utils/validators.js
export const validators = {
  /**
   * 验证URL格式
   */
  isValidUrl(string) {
    try {
      const url = new URL(string);
      return ["http:", "https:"].includes(url.protocol);
    } catch (_) {
      return false;
    }
  },

  /**
   * 验证是否为图片URL
   */
  isImageUrl(url) {
    if (!this.isValidUrl(url)) return false;

    const imageExtensions = ["jpg", "jpeg", "png", "gif", "svg", "webp"];
    const pathname = new URL(url).pathname.toLowerCase();
    const extension = pathname.split(".").pop();

    return imageExtensions.includes(extension);
  },

  /**
   * 检测图片是否可访问
   */
  async checkImageAccessible(url) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = url;
    });
  },
};
```

## 六、开发执行顺序建议（更新）

### Week 1: 基础搭建

1. 完成数据库设计（logo_url 字段）
2. 实现基础 Model 层
3. 搭建 API 控制器框架
4. **实现 URL 验证器**

### Week 2: 后端完成

1. 完成平台 CRUD 控制器
2. **添加 URL 格式验证**
3. 实现申请管理控制器
4. 完成虚拟数据生成

### Week 3: 前端开发

1. 完成 Forum 端页面
2. **实现 URL 输入和预览功能**
3. 完成 Admin 端管理界面
4. **添加图片加载失败处理**

### Week 4: 优化与测试

1. 完善样式和动画
2. **测试各类图片 URL**
3. 性能优化
4. 编写文档
