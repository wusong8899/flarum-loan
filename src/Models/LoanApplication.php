<?php

namespace Wusong8899\Loan\Models;

use Flarum\Database\AbstractModel;
use Flarum\User\User;

class LoanApplication extends AbstractModel
{
    protected $table = 'loan_applications';

    protected $fillable = ['user_id', 'platform_id', 'sponsor_account', 'applicant_account', 'status', 'approved_amount'];

    protected $dates = ['created_at', 'updated_at', 'reviewed_at'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function platform()
    {
        return $this->belongsTo(LoanPlatform::class, 'platform_id');
    }

    public function reviewer()
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }
}
