<?php

namespace Wusong8899\Loan\Api\Controllers;

use Flarum\Api\Controller\AbstractDeleteController;
use Illuminate\Support\Facades\DB;
use Psr\Http\Message\ServerRequestInterface;
use Tobscure\JsonApi\Document;

class ClearLoanDataController extends AbstractDeleteController
{
    protected function delete(ServerRequestInterface $request)
    {
        $actor = $request->getAttribute('actor');
        $actor->assertAdmin();

        DB::transaction(function () {
            // Disable FK checks for TRUNCATE compatibility across drivers where needed
            $driver = DB::getDriverName();
            if ($driver === 'mysql') {
                DB::statement('SET FOREIGN_KEY_CHECKS=0');
            }

            // Truncate child tables first
            DB::table('loan_virtual_approvals')->truncate();
            DB::table('loan_applications')->truncate();

            if ($driver === 'mysql') {
                DB::statement('SET FOREIGN_KEY_CHECKS=1');
            }
        });
    }
}
