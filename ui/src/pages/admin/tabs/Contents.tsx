import '../../../components/ContentModal/index.css';
import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, Space, message, Switch, Select, Upload, Tag, Popconfirm, Tabs } from 'antd';
import { DeleteOutlined, EditOutlined, PlusOutlined, UploadOutlined } from '@ant-design/icons';
import {
  fetchGetAllContents,
  fetchContent,
  fetchAddContent,
  fetchUpdateContent,
  fetchDeleteContent,
} from '../../../utils/api';
import { readContentFile, renderContent } from '../../../utils/content';

interface ContentItem {
  id: number;
  title: string;
  desc: string;
  format: 'markdown' | 'html';
  body?: string;
  sort: number;
  hide: boolean;
  updatedAt: string;
}

const ContentManager: React.FC = () => {
  const [list, setList] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<ContentItem | null>(null);
  const [form] = Form.useForm();
  const watchFormat = Form.useWatch('format', form);
  const watchBody = Form.useWatch('body', form);

  const load = async () => {
    try {
      setLoading(true);
      setList(await fetchGetAllContents());
    } catch (e) {
      message.error('加载内容失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openAdd = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({ format: 'markdown', body: '', sort: list.length + 1, hide: false });
    setOpen(true);
  };

  const openEdit = async (record: ContentItem) => {
    try {
      const full = await fetchContent(record.id);
      setEditing(record);
      form.setFieldsValue(full);
      setOpen(true);
    } catch (e) {
      message.error('获取内容失败');
    }
  };

  const handleFile = async (file: File) => {
    try {
      const r = await readContentFile(file);
      form.setFieldsValue({ format: r.format, body: r.body });
      if (!form.getFieldValue('title')) form.setFieldsValue({ title: r.title });
      message.success(`已导入「${file.name}」，可在下方预览并修改`);
    } catch (e: any) {
      message.error(e?.message || '文件解析失败');
    }
    return false; // 阻止 antd 自动上传
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);
      if (editing) {
        await fetchUpdateContent({ ...values, id: editing.id });
      } else {
        await fetchAddContent(values);
      }
      message.success('保存成功');
      setOpen(false);
      load();
    } catch (e: any) {
      if (e?.errorFields) return;
      message.error(e?.response?.data?.errorMessage || '保存失败');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await fetchDeleteContent(id);
      message.success('已删除');
      load();
    } catch (e) {
      message.error('删除失败');
    }
  };

  const toggleHide = async (record: ContentItem, hide: boolean) => {
    try {
      const full = await fetchContent(record.id);
      await fetchUpdateContent({ ...full, hide });
      load();
    } catch (e) {
      message.error('更新失败');
    }
  };

  const columns = [
    { title: '排序', dataIndex: 'sort', width: 70 },
    { title: '标题', dataIndex: 'title' },
    { title: '简介', dataIndex: 'desc', ellipsis: true },
    {
      title: '格式',
      dataIndex: 'format',
      width: 90,
      render: (f: string) => (f === 'html' ? <Tag color="orange">HTML/Word</Tag> : <Tag color="blue">Markdown</Tag>),
    },
    { title: '更新时间', dataIndex: 'updatedAt', width: 170 },
    {
      title: '前台显示',
      dataIndex: 'hide',
      width: 90,
      render: (hide: boolean, r: ContentItem) => <Switch checked={!hide} onChange={(v) => toggleHide(r, !v)} />,
    },
    {
      title: '操作',
      width: 140,
      render: (_: any, r: ContentItem) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(r)} />
          <Popconfirm title="确定删除这条内容吗？" onConfirm={() => handleDelete(r.id)}>
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ color: '#888' }}>
          在这里发布公告、说明文档等。前台会在「公告」分类下显示卡片，点击后弹窗展示内容。
        </span>
        <Button type="primary" icon={<PlusOutlined />} onClick={openAdd}>
          新增内容
        </Button>
      </div>
      <Table rowKey="id" columns={columns} dataSource={list} loading={loading} pagination={false} />

      <Modal
        title={editing ? '编辑内容' : '新增内容'}
        open={open}
        onOk={handleOk}
        onCancel={() => setOpen(false)}
        confirmLoading={saving}
        width={860}
        destroyOnClose
        maskClosable={false}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="title" label="标题" rules={[{ required: true, message: '请输入标题' }]}>
            <Input maxLength={100} />
          </Form.Item>
          <Form.Item name="desc" label="简介（显示在卡片上，可选）">
            <Input maxLength={200} />
          </Form.Item>
          <Space size="large" wrap>
            <Form.Item name="format" label="内容格式">
              <Select
                style={{ width: 200 }}
                options={[
                  { value: 'markdown', label: 'Markdown' },
                  { value: 'html', label: 'HTML（Word 导入后为此格式）' },
                ]}
              />
            </Form.Item>
            <Form.Item name="sort" label="排序（越小越靠前）">
              <InputNumber />
            </Form.Item>
            <Form.Item name="hide" label="隐藏" valuePropName="checked">
              <Switch />
            </Form.Item>
            <Form.Item label="导入文件">
              <Upload accept=".md,.markdown,.txt,.html,.htm,.docx" showUploadList={false} beforeUpload={handleFile}>
                <Button icon={<UploadOutlined />}>上传 .md / .docx</Button>
              </Upload>
            </Form.Item>
          </Space>
          <Tabs
            items={[
              {
                key: 'edit',
                label: '编辑',
                children: (
                  <Form.Item name="body" noStyle>
                    <Input.TextArea rows={14} placeholder="在此输入 Markdown 或 HTML，或上传文件导入" style={{ fontFamily: 'monospace' }} />
                  </Form.Item>
                ),
              },
              {
                key: 'preview',
                label: '预览',
                children: (
                  <div
                    className="md-body"
                    style={{ minHeight: 280, maxHeight: 400, overflow: 'auto' }}
                    dangerouslySetInnerHTML={{ __html: renderContent(watchFormat, watchBody || '') }}
                  />
                ),
              },
            ]}
          />
        </Form>
      </Modal>
    </div>
  );
};

export default ContentManager;
