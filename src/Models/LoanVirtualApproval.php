<?php

namespace Wusong8899\Loan\Models;

use Flarum\Database\AbstractModel;

class LoanVirtualApproval extends AbstractModel
{
    protected $table = 'loan_virtual_approvals';

    protected $fillable = ['platform_id', 'fake_username', 'fake_avatar_url', 'amount'];

    protected $dates = ['created_at', 'updated_at'];

    public function platform()
    {
        return $this->belongsTo(LoanPlatform::class, 'platform_id');
    }
}
