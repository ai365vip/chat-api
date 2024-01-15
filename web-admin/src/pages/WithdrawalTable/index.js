import React from 'react';
import {Layout} from "@douyinfe/semi-ui";
import WithdrawalTable from '../../components/WithdrawalTable';

const Withdrawal = () => (
  <>
    <Layout>
        <Layout.Header>
            <h3>提现工单</h3>
        </Layout.Header>
        <Layout.Content>
          <WithdrawalTable />
        </Layout.Content>
      </Layout>
  </>
);

export default Withdrawal;
