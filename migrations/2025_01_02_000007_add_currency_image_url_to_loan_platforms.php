<?php

use Illuminate\Database\Schema\Blueprint;
use Flarum\Database\Migration;

return Migration::addColumns('loan_platforms', [
    'currency_image_url' => ['string', 'length' => 500, 'nullable' => true],
]);
