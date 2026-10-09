import { useEffect, useState } from "react";
import { Modal, Spin, Empty } from "antd";
import { fetchContent } from "../../utils/api";
import { renderContent } from "../../utils/content";
import "./index.css";

interface Props {
  id: number | null;
  onClose: () => void;
}

const ContentModal = ({ id, onClose }: Props) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [title, setTitle] = useState("");
  const [updatedAt, setUpdatedAt] = useState("");
  const [html, setHtml] = useState("");

  useEffect(() => {
    if (id === null) return;
    let cancelled = false;
    setLoading(true);
    setError(false);
    setHtml("");
    fetchContent(id)
      .then((c) => {
        if (cancelled) return;
        setTitle(c.title);
        setUpdatedAt(c.updatedAt);
        setHtml(renderContent(c.format, c.body));
      })
      .catch(() => !cancelled && setError(true))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [id]);

  return (
    <Modal
      open={id !== null}
      onCancel={onClose}
      footer={null}
      title={title || "内容"}
      width={780}
      centered
      destroyOnClose
      className="content-modal"
    >
      {loading ? (
        <div style={{ textAlign: "center", padding: 40 }}>
          <Spin />
        </div>
      ) : error ? (
        <Empty description="内容加载失败或已被删除" />
      ) : (
        <>
          {updatedAt && <div className="content-modal-time">更新于 {updatedAt}</div>}
          <div className="md-body" dangerouslySetInnerHTML={{ __html: html }} />
        </>
      )}
    </Modal>
  );
};

export default ContentModal;
