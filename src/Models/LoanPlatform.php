<?php

namespace Wusong8899\Loan\Models;

use Flarum\Database\AbstractModel;

class LoanPlatform extends AbstractModel
{
    protected $table = 'loan_platforms';

    protected $fillable = ['name', 'logo_url', 'sponsor_link_url', 'sort_order'];

    protected $dates = ['created_at', 'updated_at'];

    public function applications()
    {
        return $this->hasMany(LoanApplication::class, 'platform_id');
    }

    public function virtualApprovals()
    {
        return $this->hasMany(LoanVirtualApproval::class, 'platform_id');
    }
}
