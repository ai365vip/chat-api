import React from 'react';
import SystemSetting from '../../components/SystemSetting';
import {isRoot} from '../../helpers';
import OtherSetting from '../../components/OtherSetting';
import PersonalSetting from '../../components/PersonalSetting';
import OperationSetting from '../../components/OperationSetting';
import PaymentSetting from '../../components/PaymentSettings';
import {Layout, TabPane, Tabs} from "@douyinfe/semi-ui";

const Setting = () => {
    let panes = [
        {
            tab: '个人设置',
            content: <PersonalSetting/>,
            itemKey: '1'
        }
    ];

    if (isRoot()) {
        panes.push({
            tab: '运营设置',
            content: <OperationSetting/>,
            itemKey: '2'
        });
        panes.push({
            tab: '支付设置',
            content: <PaymentSetting/>,
            itemKey: '3'
        });
        panes.push({
            tab: '系统设置',
            content: <SystemSetting/>,
            itemKey: '4'
        });
        panes.push({
            tab: '其他设置',
            content: <OtherSetting/>,
            itemKey: '5'
        });
    }

    return (
        <div>
            <Layout style={{marginTop: 60}}>
                <Layout.Content>
                    <Tabs type="line" defaultActiveKey="1">
                        {panes.map(pane => (
                            <TabPane itemKey={pane.itemKey} tab={pane.tab}>
                                {pane.content}
                            </TabPane>
                        ))}
                    </Tabs>
                </Layout.Content>
            </Layout>
        </div>
    );
};

export default Setting;
