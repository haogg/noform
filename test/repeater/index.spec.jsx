import * as Antd from 'antd';
import { mount } from 'enzyme';
import React from 'react';
import ReactTestUtils from 'react-dom/test-utils';
import Form, { FormItem, Item } from '../../src';
import repeaterWrapper from '../../src/repeater';
import wrapper from '../../src/wrapper/antd';
import dialogWrapper from '../../src/dialog/antd';

const { TableRepeater } = repeaterWrapper({ ...Antd, Dialog: dialogWrapper(Antd) });

const { Input } = wrapper(Antd);
function filter(value, key) {
    return value.filter(item => item.drawerName.startsWith(key));
}

function sleep(timer) {
    return new Promise((resolve) => {
        setTimeout(resolve, timer);
    });
}

const testValues = {
    drawerName: '开票人',
    taxpayerNumber: '税号',
    branchName: '子公司',
    checkResultName: '核查结果',
    denyReason: '拒绝原因',
    creatorName: '创建人',
};

describe('Repeater', () => {
    let form = null;
    let formCore = null;
    function formmount(core) {
        formCore = core;
    }
    beforeEach(() => {
        form = mount(<Form onMount={formmount}>
            <Item name="repeat">
                <TableRepeater filter={filter}>
                    <FormItem label="开票人" name="drawerName"><Input /></FormItem>
                    <FormItem label="税号" name="taxpayerNumber"><Input /></FormItem>
                    <FormItem label="子公司" name="branchName"><Input /></FormItem>
                    <FormItem label="核查结果" name="checkResultName"><Input /></FormItem>
                    <FormItem label="拒绝原因" name="denyReason"><Input /></FormItem>
                    <FormItem label="创建人" name="creatorName"><Input /></FormItem>
                </TableRepeater>
            </Item>
        </Form>);
    });
    it('should render', () => {
        formCore.setValue('repeat', [{}]);
    });
    it('should add', async () => {
        // console.log(form.find(TableRepeater).instance().doAdd);
        await form.find(TableRepeater).instance().doAdd(testValues);
        expect(JSON.stringify(formCore.getValue('repeat'))).toEqual(JSON.stringify([testValues]));
    });
    it('max length', async () => {
        form = mount(<Form onMount={formmount}>
            <Item name="repeat">
                <TableRepeater maxLength={1}>
                    <FormItem label="开票人" name="drawerName"><Input /></FormItem>
                </TableRepeater>
            </Item>
        </Form>);
        expect(form.find('button.repeater-add').length).toEqual(1);
        await form.find(TableRepeater).instance().doAdd(testValues);
        form.mount();
        expect(form.find('button.repeater-add').length).toEqual(0);
        expect(JSON.stringify(formCore.getValue('repeat'))).toEqual(JSON.stringify([testValues]));
    });
    it('should add with validation', async () => {
        const validateConfig = {
            drawerName: { type: 'string', required: true },
        };

        const formConfig = {
            validateConfig,
            autoValidate: true,
        };

        let validateCore = null;
        function validateMount(core) {
            validateCore = core;
        }
        const validateForm = mount(<Form onMount={validateMount}>
            <Item name="repeat">
                <TableRepeater filter={filter} formConfig={formConfig}>
                    <FormItem label="开票人" name="drawerName"><Input /></FormItem>
                    <FormItem label="税号" name="taxpayerNumber"><Input /></FormItem>
                    <FormItem label="子公司" name="branchName"><Input /></FormItem>
                    <FormItem label="核查结果" name="checkResultName"><Input /></FormItem>
                    <FormItem label="拒绝原因" name="denyReason"><Input /></FormItem>
                    <FormItem label="创建人" name="creatorName"><Input /></FormItem>
                </TableRepeater>
            </Item>
        </Form>);

        expect(validateCore.getValue('repeat')).toEqual(null);
        expect(validateForm.find('button.repeater-save').length).toEqual(0);
        expect(validateForm.find('button.repeater-cancel').length).toEqual(0);
        expect(document.querySelectorAll('.ant-modal-body .ant-btn').length).toEqual(0);
        validateForm.find('button.repeater-add').simulate('click');
        await sleep(500);
        validateForm.mount();
        expect(document.querySelectorAll('.ant-modal-body .ant-confirm-content .ant-btn').length).toEqual(1);
        ReactTestUtils.Simulate.click(document.querySelectorAll('.ant-modal-body .ant-confirm-content .ant-btn')[0]);
        await sleep(500);
        expect(document.querySelectorAll('.ant-modal-body .ant-confirm-content .no-form-item-error').length).toEqual(1);
        expect(validateCore.getValue('repeat')).toEqual(null);
        ReactTestUtils.Simulate.change(document.querySelectorAll('.ant-modal-body input[name="drawerName"]')[0], {
            target: {
                value: 'hello world',
            },
        });
        ReactTestUtils.Simulate.click(document.querySelectorAll('.ant-modal-body .ant-confirm-content .ant-btn')[0]);

        await sleep(500);
        expect(validateCore.getValue('repeat').length).toEqual(1);
    });
    it('should update', async () => {
        await form.find(TableRepeater).instance().doAdd(testValues);
        expect(JSON.stringify(formCore.getValue('repeat'))).toEqual(JSON.stringify([testValues]));

        const core = form.find(TableRepeater).instance().repeaterCore.formList[0];
        core.setValueSilent({
            ...testValues,
            drawerName: 'xxxxx',
        });
        await form.find(TableRepeater).instance().doUpdate(core, core.id);

        expect(JSON.stringify(formCore.getValue('repeat'))).toEqual(JSON.stringify([{
            ...testValues,
            drawerName: 'xxxxx',
        }]));
    });
    it('should delete', async () => {
        await form.find(TableRepeater).instance().doAdd(testValues);
        expect(JSON.stringify(formCore.getValue('repeat'))).toEqual(JSON.stringify([testValues]));

        const core = form.find(TableRepeater).instance().repeaterCore.formList[0];
        const { id } = core;
        await form.find(TableRepeater).instance().doDelete(core, id);
        expect(document.querySelectorAll('.ant-modal-body .ant-confirm-content .ant-btn').length).toEqual(1);
        ReactTestUtils.Simulate.click(document.querySelectorAll('.ant-modal-body .ant-confirm-content .ant-btn')[0]);

        await sleep(500);

        expect(JSON.stringify(formCore.getValue('repeat'))).toEqual(JSON.stringify([]));
    });

    it('should add by click add button', async () => {
        expect(formCore.getValue('repeat')).toEqual(null);
        expect(document.querySelectorAll('.ant-modal-body .ant-confirm-content .ant-btn').length).toEqual(0);
        form.find('button.repeater-add').simulate('click');
        await sleep(500);
        expect(document.querySelectorAll('.ant-modal-body .ant-confirm-content .ant-btn').length).toEqual(1);
        ReactTestUtils.Simulate.click(document.querySelectorAll('.ant-modal-body .ant-confirm-content .ant-btn')[0]);

        await sleep(500);
        expect(formCore.getValue('repeat').length).toEqual(1);
    });

    it('should update by click update', async () => {
        await form.find(TableRepeater).instance().doAdd(testValues);
        expect(JSON.stringify(formCore.getValue('repeat'))).toEqual(JSON.stringify([testValues]));
        expect(formCore.getValue('repeat').length).toEqual(1);
        expect(document.querySelectorAll('.ant-modal-body .ant-btn').length).toEqual(0);
        form.mount();
        await sleep(500);
        form.find('button.repeater-update').simulate('click');

        await sleep(500);
        expect(document.querySelectorAll('.ant-modal-body .ant-confirm-content .ant-btn').length).toEqual(1);
        ReactTestUtils.Simulate.change(document.querySelectorAll('.ant-modal-body input[name="drawerName"]')[0], {
            target: {
                value: 'hello world',
            },
        });

        ReactTestUtils.Simulate.click(document.querySelectorAll('.ant-modal-body .ant-confirm-content .ant-btn')[0]);
        await sleep(500);
        expect(JSON.stringify(formCore.getValue('repeat'))).toEqual(JSON.stringify([{
            ...testValues,
            drawerName: 'hello world',
        }]));
    });

    it('should delete by click delete', async () => {
        await form.find(TableRepeater).instance().doAdd({
            drawerName: '开票人',
            taxpayerNumber: '税号',
            branchName: '子公司',
            checkResultName: '核查结果',
            denyReason: '拒绝原因',
            creatorName: '创建人',
        });
        form.mount();
        await sleep(500);
        form.find('.repeater-delete').simulate('click');
        await sleep(500);
        form.mount();

        expect(document.querySelectorAll('.ant-modal-body .ant-confirm-content .ant-btn').length).toEqual(1);
        ReactTestUtils.Simulate.click(document.querySelectorAll('.ant-modal-body .ant-confirm-content .ant-btn')[0]);

        await sleep(500);

        expect(JSON.stringify(formCore.getValue())).toEqual(JSON.stringify({
            repeat: [],
        }));
    });

    it('should delete by click delete without confirm', async () => {
        form = mount(<Form onMount={formmount}>
            <Item name="repeat">
                <TableRepeater hasDeleteConfirm={false} >
                    <FormItem label="开票人" name="drawerName"><Input /></FormItem>
                </TableRepeater>
            </Item>
        </Form>);

        await form.find(TableRepeater).instance().doAdd({
            drawerName: '开票人',
        });
        form.mount();
        await sleep(500);
        form.find('.repeater-delete').simulate('click');
        await sleep(500);
        form.mount();

        expect(JSON.stringify(formCore.getValue())).toEqual(JSON.stringify({
            repeat: [],
        }));
    });

    it('custom render(order)', async () => {
        form = mount(<Form onMount={formmount}>
            <Item name="repeat">
                <TableRepeater>
                    <FormItem label="order" status="hidden" renderCell={(_, { index: order }) => <div>{order + 1}</div>} />
                    <FormItem label="开票人" name="drawerName"><Input /></FormItem>
                </TableRepeater>
            </Item>
        </Form>);

        const valuesArr = [
            { drawerName: '开票人' },
            { drawerName: '客户' },
            { drawerName: '拍档' },
            { drawerName: '销售' },
        ];

        await form.find(TableRepeater).instance().doAdd(valuesArr[0]);
        await form.find(TableRepeater).instance().doAdd(valuesArr[1]);
        await form.find(TableRepeater).instance().doAdd(valuesArr[2]);
        await form.find(TableRepeater).instance().doAdd(valuesArr[3]);
        form.mount();

        expect(form.find('tr.table-repeater-row').at(0).find('.repeater-table-cell-wrapper .repeater-table-cell-wrapper-inner-content div').prop('children')).toEqual(1);
        expect(form.find('tr.table-repeater-row').at(1).find('.repeater-table-cell-wrapper .repeater-table-cell-wrapper-inner-content div').prop('children')).toEqual(2);
        expect(form.find('tr.table-repeater-row').at(2).find('.repeater-table-cell-wrapper .repeater-table-cell-wrapper-inner-content div').prop('children')).toEqual(3);
        expect(form.find('tr.table-repeater-row').at(3).find('.repeater-table-cell-wrapper .repeater-table-cell-wrapper-inner-content div').prop('children')).toEqual(4);

        form.find('button.repeater-update').at(0).simulate('click');
        await sleep(500);
        expect(document.querySelectorAll('.ant-modal-body .ant-confirm-content .no-form-item-label').length).toEqual(1);
    });

    it('filter works', async () => {
        const valuesArr = [
            { drawerName: '开票人' },
            { drawerName: '客户' },
            { drawerName: '拍档' },
            { drawerName: '销售' },
        ];

        await form.find(TableRepeater).instance().doAdd(valuesArr[0]);
        await form.find(TableRepeater).instance().doAdd(valuesArr[1]);
        await form.find(TableRepeater).instance().doAdd(valuesArr[2]);
        await form.find(TableRepeater).instance().doAdd(valuesArr[3]);
        form.mount();

        expect(JSON.stringify(formCore.getValue('repeat'))).toEqual(JSON.stringify(valuesArr));
        expect(form.find('Input.repeater-search').length).toEqual(1);
        expect(form.find('tr.table-repeater-row').length).toEqual(4);
        ReactTestUtils.Simulate.change(form.find('Input.repeater-search').getDOMNode(), {
            target: { value: 'hello world' },
        });
        await sleep(500);
        form.mount();
        expect(form.find('tr.table-repeater-row').length).toEqual(0);

        ReactTestUtils.Simulate.change(form.find('Input.repeater-search').getDOMNode(), {
            target: { value: '客户' },
        });
        await sleep(500);
        form.mount();

        expect(form.find('tr.table-repeater-row').length).toEqual(1);
        expect(form.find('tr.table-repeater-row .repeater-table-cell-wrapper').at(0).find('.repeater-table-cell-wrapper-inner-content').prop('children')).toEqual('客户');

        ReactTestUtils.Simulate.change(form.find('Input.repeater-search').getDOMNode(), {
            target: { value: '' },
        });
        await sleep(500);
        form.mount();
        expect(form.find('tr.table-repeater-row').length).toEqual(4);
    });
});
