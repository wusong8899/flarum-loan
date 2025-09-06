<?php

use Illuminate\Database\Schema\Blueprint;
use Flarum\Database\Migration;

return Migration::addColumns('loan_applications', [
    'sponsor_account' => ['string', 'length' => 191, 'nullable' => true],
    // applicant_account 已废弃，改为 repayment_date
    // 此迁移文件已存在于历史中，保持原样避免回滚冲突
]);
