<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Schema\Builder;

return [
    'up' => function (Builder $schema) {
        $schema->table('loan_applications', function (Blueprint $table) use ($schema) {
            if ($schema->hasColumn('loan_applications', 'applicant_account')) {
                $table->dropColumn('applicant_account');
            }
            if (!$schema->hasColumn('loan_applications', 'repayment_date')) {
                $table->date('repayment_date')->nullable();
            }
        });
    },
    'down' => function (Builder $schema) {
        $schema->table('loan_applications', function (Blueprint $table) use ($schema) {
            if ($schema->hasColumn('loan_applications', 'repayment_date')) {
                $table->dropColumn('repayment_date');
            }
            if (!$schema->hasColumn('loan_applications', 'applicant_account')) {
                $table->string('applicant_account', 191)->nullable();
            }
        });
    }
];
