<?php

use Illuminate\Database\Schema\Blueprint;
use Flarum\Database\Migration;

return Migration::addColumns('loan_applications', [
    'sponsor_account' => ['string', 191, 'nullable' => true],
    'applicant_account' => ['string', 191, 'nullable' => true],
]);
