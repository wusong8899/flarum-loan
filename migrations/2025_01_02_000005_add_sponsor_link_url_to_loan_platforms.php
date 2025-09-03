<?php

use Illuminate\Database\Schema\Blueprint;
use Flarum\Database\Migration;

return Migration::addColumns('loan_platforms', [
    'sponsor_link_url' => ['string', 500, 'nullable' => true],
]);
