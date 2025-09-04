<?php

namespace Wusong8899\Loan\Api\Controllers;

use Flarum\Api\Controller\AbstractDeleteController;
use Illuminate\Database\ConnectionInterface;
use Psr\Http\Message\ServerRequestInterface;

class ClearLoanDataController extends AbstractDeleteController
{
    /**
     * @var ConnectionInterface
     */
    protected $db;

    public function __construct(ConnectionInterface $db)
    {
        $this->db = $db;
    }

    protected function delete(ServerRequestInterface $request)
    {
        $actor = $request->getAttribute('actor');
        $actor->assertAdmin();

        $this->db->transaction(function () {
            // Simply delete all records - cleaner approach for Flarum
            // Delete child tables first to respect foreign key constraints
            $this->db->table('loan_virtual_approvals')->delete();
            $this->db->table('loan_applications')->delete();
        });
    }
}
